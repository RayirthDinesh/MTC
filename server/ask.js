// "Ask Rihla" — a question box backed by the Claude CLI.
//
// The binary ships with the Claude Code VS Code extension, so CLAUDE_CODE_EXECPATH
// points at it on this machine. There is no API key involved: the CLI uses the
// signed-in account. On a machine without it the route degrades to a clear
// message instead of failing, so the demo never shows a broken tab.
import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'

const BIN = [process.env.CLAUDE_CODE_EXECPATH, '/usr/local/bin/claude', '/opt/homebrew/bin/claude']
  .find((p) => p && existsSync(p))

export const aiAvailable = () => Boolean(BIN)

const BRIEF = `You are Rihla, the assistant inside Manara Rihla — a passport and
professional network for Muslim students across the Manara West campuses.
Students collect a stamp at each MSA event they attend; stamps build levels
(Explorer, Traveler, Navigator, Manara Fellow) across four tracks: Career,
Leadership, Transfer and Deen. Brothers and sisters have separate spaces and
never see each other's profiles.

Answer in at most 120 words, plain sentences, no markdown headings and no
bullet lists unless you are genuinely listing steps. Be warm and direct. If
you are asked something outside student life, campuses, transfers, careers or
the app itself, say so briefly and steer back.`

/**
 * Runs one prompt through the CLI. Rejects on timeout so a hung process can
 * never pin an Express worker open.
 */
export function ask(question, context = '', { timeoutMs = 45000 } = {}) {
  return new Promise((resolve) => {
    if (!BIN) return resolve({ ok: false, reason: 'The assistant is not configured on this machine.' })

    const q = String(question ?? '').trim().slice(0, 1000)
    if (!q) return resolve({ ok: false, reason: 'Ask me something first.' })

    // Args array, never a shell string: the question is user input.
    const prompt = `${BRIEF}\n\n${context ? `About the student asking:\n${context}\n\n` : ''}Question: ${q}`
    const child = spawn(BIN, ['-p', prompt], { stdio: ['ignore', 'pipe', 'pipe'] })

    let out = '', err = '', done = false
    const finish = (r) => { if (!done) { done = true; clearTimeout(timer); resolve(r) } }
    const timer = setTimeout(() => { child.kill('SIGKILL'); finish({ ok: false, reason: 'That took too long. Try a shorter question.' }) }, timeoutMs)

    child.stdout.on('data', (d) => { out += d })
    child.stderr.on('data', (d) => { err += d })
    child.on('error', () => finish({ ok: false, reason: 'Could not reach the assistant.' }))
    child.on('close', (code) => {
      const text = out.trim()
      if (code === 0 && text) return finish({ ok: true, text })
      console.error('ask failed', code, err.slice(0, 300))
      finish({ ok: false, reason: 'The assistant could not answer that.' })
    })
  })
}
