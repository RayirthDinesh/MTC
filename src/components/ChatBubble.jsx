import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { askRihla, aiAvailable } from '../store.js'
import { useMe } from '../lib/useStore.js'

const SPRING = { type: 'spring', stiffness: 380, damping: 30 }
const STARTERS = ['How do I transfer?', 'Find me a mentor', 'What is a stamp?']

/**
 * Floating assistant. Same /api/ask behind it as the full Ask tab, but always
 * within reach — including on the landing page, where there is no account yet.
 */
export default function ChatBubble() {
  const me = useMe()
  const [open, setOpen] = useState(false)
  const [turns, setTurns] = useState([])
  const [q, setQ] = useState('')
  const [busy, setBusy] = useState(false)
  const [available, setAvailable] = useState(true)
  const endRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => { aiAvailable().then(setAvailable) }, [])
  useEffect(() => { if (open) inputRef.current?.focus() }, [open])
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }) }, [turns, busy, open])
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  const send = async (text) => {
    const question = (text ?? q).trim()
    if (!question || busy) return
    setQ('')
    setTurns((t) => [...t, { me: true, text: question }])
    setBusy(true)
    const r = await askRihla(question)
    setBusy(false)
    setTurns((t) => [...t, { me: false, text: r.ok ? r.text : r.reason, failed: !r.ok }])
  }

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={SPRING}
            role="dialog"
            aria-label="Ask Rihla"
            className="fixed right-4 bottom-20 z-50 flex max-h-[min(540px,calc(100dvh-7rem))] w-[min(370px,calc(100vw-2rem))] origin-bottom-right flex-col overflow-hidden rounded-2xl bg-navy2 shadow-[0_24px_60px_-12px_#000c] ring-1 ring-white/12"
          >
            <header className="flex items-center gap-2.5 border-b border-white/10 px-4 py-3">
              <Mark />
              <div className="flex-1 leading-tight">
                <p className="text-[14px] font-semibold">Ask Rihla</p>
                <p className="text-[11px] text-mute">{available ? 'Usually answers in a few seconds' : 'Unavailable here'}</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="rounded-lg p-1.5 text-mute transition-colors hover:bg-white/8 hover:text-cream">
                <svg width="15" height="15" viewBox="0 0 15 15" aria-hidden="true"><path d="M3.5 3.5l8 8m0-8l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
              </button>
            </header>

            <div className="flex-1 space-y-2.5 overflow-y-auto px-4 py-4">
              {!turns.length && (
                <>
                  <p className="text-[13.5px] text-mute">
                    {me ? `Salam ${me.name.split(' ')[0]} — ask me about` : 'Ask me about'} transfers, majors,
                    events, or finding people.
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {STARTERS.map((s) => (
                      <button key={s} type="button" onClick={() => send(s)} disabled={!available}
                        className="rounded-full px-3 py-1.5 text-[12.5px] text-mute ring-1 ring-white/12 transition-colors hover:text-cream disabled:opacity-40">
                        {s}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {turns.map((t, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={SPRING}
                  className={t.me ? 'flex justify-end' : 'flex justify-start'}>
                  <p className={`max-w-[88%] rounded-2xl px-3.5 py-2 text-[13.5px] leading-relaxed whitespace-pre-wrap ${
                    t.me ? 'bg-sun text-[#2a1a05]' : t.failed ? 'text-mute ring-1 ring-fading/30' : 'bg-white/6 ring-1 ring-white/10'
                  }`}>
                    {t.text}
                  </p>
                </motion.div>
              ))}

              {busy && (
                <div className="flex gap-1.5 py-1" aria-label="Thinking">
                  {[0, 1, 2].map((i) => (
                    <motion.span key={i} className="size-1.5 rounded-full bg-mute"
                      animate={{ opacity: [0.25, 1, 0.25] }} transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.18 }} />
                  ))}
                </div>
              )}
              <div ref={endRef} />
            </div>

            <form onSubmit={(e) => { e.preventDefault(); send() }} className="flex gap-2 border-t border-white/10 p-3">
              <input ref={inputRef} className="input" placeholder="Ask anything…" value={q}
                onChange={(e) => setQ(e.target.value)} disabled={!available || busy} />
              <button aria-label="Send" disabled={!q.trim() || busy || !available}
                className="grid size-[38px] shrink-0 place-items-center rounded-xl bg-sun text-[#2a1a05] transition-transform hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100">
                <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 13V3m0 0L3.5 7.5M8 3l4.5 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Close Rihla assistant' : 'Open Rihla assistant'}
        aria-expanded={open}
        whileTap={{ scale: 0.92 }}
        transition={SPRING}
        className="fixed right-4 bottom-4 z-50 grid size-[52px] place-items-center rounded-full bg-sun text-[#2a1a05] shadow-[0_10px_28px_-6px_#000b] transition-transform hover:scale-105"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span key={open ? 'x' : 'chat'} initial={{ opacity: 0, rotate: -45 }} animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: 45 }} transition={{ duration: 0.16 }} className="grid place-items-center">
            {open ? (
              <svg width="19" height="19" viewBox="0 0 15 15" aria-hidden="true"><path d="M3.5 3.5l8 8m0-8l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
            ) : (
              <Mark size={22} />
            )}
          </motion.span>
        </AnimatePresence>
      </motion.button>
    </>
  )
}

/** The lighthouse beam, reduced to a mark. */
function Mark({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 18.5V9.5l8-5.5 8 5.5v9" />
      <path d="M8.5 18.5v-4.2h7v4.2" />
      <path d="M12 4V2" />
    </svg>
  )
}
