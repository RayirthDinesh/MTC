import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '../lib/useStore.js'
import { campusById } from '../store.js'
import { spring } from '../lib/motion.js'
import Crest from './Crest.jsx'

const KIND = { checkin: 'Check-in', connect: 'Connection', event: 'Event', cohost: 'Co-host', link: 'Link', join: 'New member' }
const ago = (ts) => { const m = Math.round((Date.now() - ts) / 60000); return m < 1 ? 'now' : m < 60 ? `${m}m` : m < 1440 ? `${Math.round(m / 60)}h` : `${Math.round(m / 1440)}d` }

/** Live activity as feed posts, newest first. */
export default function ActivityFeed({ limit = 12 }) {
  const { activity } = useStore()
  // Seed rows are generic placeholders; show the real events (those that carry text about people/events).
  const rows = activity.filter((a) => !a.text.startsWith('Activity at')).slice(0, limit)
  return (
    <div className="space-y-3" aria-live="polite">
      <AnimatePresence initial={false}>
        {rows.map((a) => (
          <motion.article key={a.id} layout initial={{ opacity: 0, y: -24, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }} transition={spring.sheet} className="card flex gap-3.5">
            <Crest id={a.campusId} size={44} />
            <div className="min-w-0 flex-1"><div className="flex justify-between gap-2"><b className="truncate">{campusById(a.campusId)?.name}</b><span className="shrink-0 text-xs text-mute">{ago(a.ts)}</span></div>
              <p className="text-xs text-mute">{KIND[a.type] ?? 'Activity'}</p><p className="mt-1.5 break-words">{a.text}</p></div>
          </motion.article>
        ))}
      </AnimatePresence>
      {!rows.length && <p className="card text-mute">Waiting for activity… try “Simulate activity”.</p>}
    </div>
  )
}
