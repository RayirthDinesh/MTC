import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { askRihla, aiAvailable } from '../store.js'
import { useMe } from '../lib/useStore.js'
import { spring } from '../lib/motion.js'

const STARTERS = [
  'What should I do first on my transfer?',
  'How do I find a mentor in my major?',
  'What is a good question to ask at a career mixer?',
  'How do I start an MSA committee?',
]

/** Ask Rihla: a plain question box wired to the Claude CLI on the server. */
export default function AskRihla() {
  const me = useMe()
  const [turns, setTurns] = useState([])
  const [q, setQ] = useState('')
  const [busy, setBusy] = useState(false)
  const [available, setAvailable] = useState(true)
  const endRef = useRef(null)

  useEffect(() => { aiAvailable().then(setAvailable) }, [])
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }) }, [turns, busy])

  const send = async (text) => {
    const question = (text ?? q).trim()
    if (!question || busy) return
    setQ('')
    setTurns((t) => [...t, { role: 'me', text: question }])
    setBusy(true)
    const r = await askRihla(question)
    setBusy(false)
    setTurns((t) => [...t, { role: 'ai', text: r.ok ? r.text : r.reason, failed: !r.ok }])
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col">
      <header className="mb-5">
        <h2 className="text-3xl">Ask Rihla</h2>
        <p className="mt-1 text-sm text-mute">
          Transfers, majors, events, finding people. It knows your passport.
        </p>
      </header>

      {!available && (
        <p className="mb-4 rounded-xl border border-fading/30 bg-fading/5 px-4 py-3 text-sm text-mute">
          The assistant is not configured on this machine.
        </p>
      )}

      <div className="min-h-[280px] space-y-3">
        {!turns.length && (
          <div className="grid gap-2 sm:grid-cols-2">
            {STARTERS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => send(s)}
                disabled={!available}
                className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-left text-sm text-mute transition-colors hover:border-white/20 hover:text-cream disabled:opacity-40"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <AnimatePresence initial={false}>
          {turns.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={spring.ui}
              className={t.role === 'me' ? 'flex justify-end' : 'flex justify-start'}
            >
              <p
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-[14.5px] leading-relaxed whitespace-pre-wrap ${
                  t.role === 'me'
                    ? 'bg-sun text-[#2a1a05]'
                    : t.failed
                      ? 'border border-fading/30 text-mute'
                      : 'border border-white/10 bg-white/[0.04]'
                }`}
              >
                {t.text}
              </p>
            </motion.div>
          ))}
        </AnimatePresence>

        {busy && (
          <div className="flex gap-1.5 px-1" aria-label="Thinking">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="size-1.5 rounded-full bg-mute"
                animate={{ opacity: [0.25, 1, 0.25] }}
                transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.18 }}
              />
            ))}
          </div>
        )}
        <div ref={endRef} />
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); send() }}
        className="mt-5 flex gap-2 border-t border-white/10 pt-4"
      >
        <input
          className="input"
          placeholder={me ? `Ask anything, ${me.name.split(' ')[0]}…` : 'Ask anything…'}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          disabled={!available || busy}
        />
        <button className="btn btn-gold disabled:opacity-40" disabled={!q.trim() || busy || !available}>
          {busy ? 'Thinking' : 'Ask'}
        </button>
      </form>
    </div>
  )
}
