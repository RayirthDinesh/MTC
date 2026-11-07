import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useStore, useMe } from '../lib/useStore.js'
import { campusById, requestJoin, respondJoin } from '../store.js'
import { spring } from '../lib/motion.js'
import GenderPill from './GenderPill.jsx'

const fmt = (ts) => new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })

/**
 * The co-hosting board. Top: MSAs asking to join my events. Bottom: everyone
 * else's events, which my MSA can ask to co-host.
 */
export default function NetworkEvents() {
  const s = useStore()
  const me = useMe()
  const [filter, setFilter] = useState('Open')
  const [asking, setAsking] = useState(null)
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)

  const inbox = s.inbox ?? []
  const network = useMemo(() => {
    const now = Date.now()
    return (s.network ?? [])
      .filter((e) => (filter === 'Open' ? e.open && e.date > now : filter === 'Requested' ? e.request : true))
      .sort((a, b) => a.date - b.date)
  }, [s.network, filter])

  const send = async (eventId) => {
    setBusy(true)
    await requestJoin(eventId, note)
    setBusy(false)
    setAsking(null)
    setNote('')
  }

  return (
    <div className="space-y-10">
      {/* ------------------------------------------------- incoming requests */}
      {inbox.length > 0 && (
        <section>
          <h3 className="text-xl">
            Requests to co-host <span className="text-mute">({inbox.length})</span>
          </h3>
          <ul className="mt-3 divide-y divide-white/[0.07] border-y border-white/[0.07]">
            {inbox.map((r) => {
              const ev = s.events.find((e) => e.id === r.eventId)
              return (
                <li key={r.id} className="flex flex-wrap items-center gap-3 py-3.5">
                  <div className="min-w-0 flex-1">
                    <p className="text-[15px]">
                      <b>{campusById(r.campusId)?.short}</b> wants to co-host{' '}
                      <span className="text-gold2">{ev?.title ?? 'an event'}</span>
                    </p>
                    {r.note && <p className="mt-0.5 text-[13px] text-mute">“{r.note}”</p>}
                  </div>
                  <div className="flex gap-2">
                    <button className="btn btn-gold" onClick={() => respondJoin(r.id, true)}>Accept</button>
                    <button className="btn btn-glass" onClick={() => respondJoin(r.id, false)}>Decline</button>
                  </div>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      {/* -------------------------------------------------- the open network */}
      <section>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-xl">Events across the network</h3>
          <div className="flex gap-1.5">
            {['Open', 'Requested', 'All'].map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                aria-pressed={filter === f}
                className={`rounded-full px-3 py-1 text-[13px] transition-colors ${
                  filter === f ? 'bg-sun text-[#2a1a05]' : 'border border-white/10 text-mute hover:text-cream'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <ul className="mt-3 divide-y divide-white/[0.07] border-y border-white/[0.07]">
          {network.map((e) => {
            const status = e.request?.status
            return (
              <li key={e.id} className="py-3.5">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-[16px] font-medium">{e.title}</h4>
                      <GenderPill value={e.audience} />
                    </div>
                    <p className="mt-0.5 text-[13px] text-mute">
                      {campusById(e.campusId)?.name} · {fmt(e.date)} · {e.track}
                      {e.coHostId && <> · co-hosted with {campusById(e.coHostId)?.short}</>}
                    </p>
                  </div>

                  {status === 'pending' && <span className="text-[13px] text-gold2">Requested</span>}
                  {status === 'accepted' && <span className="text-[13px] text-cc">Co-hosting ✓</span>}
                  {status === 'declined' && <span className="text-[13px] text-mute">Declined</span>}
                  {!status && e.open && (
                    <button className="btn btn-glass" onClick={() => { setAsking(asking === e.id ? null : e.id); setNote('') }}>
                      Request to join
                    </button>
                  )}
                  {!status && !e.open && <span className="text-[13px] text-mute">Has a co-host</span>}
                </div>

                <AnimatePresence>
                  {asking === e.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={spring.ui}
                      className="overflow-hidden"
                    >
                      <div className="flex gap-2 pt-3">
                        <input
                          className="input"
                          autoFocus
                          maxLength={200}
                          placeholder="Add a note for their board (optional)"
                          value={note}
                          onChange={(ev) => setNote(ev.target.value)}
                        />
                        <button className="btn btn-gold disabled:opacity-40" disabled={busy} onClick={() => send(e.id)}>
                          Send
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            )
          })}
        </ul>

        {!network.length && (
          <p className="py-10 text-center text-sm text-mute">
            {filter === 'Open' ? 'No open events right now.' : 'Nothing here yet.'}
          </p>
        )}
      </section>
    </div>
  )
}
