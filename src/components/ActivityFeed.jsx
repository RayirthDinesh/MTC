import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '../lib/useStore.js'
import { campusById } from '../store.js'
import { spring } from '../lib/motion.js'

const ICON = { checkin: '✓', connect: '🤝', event: '📅', cohost: '🔗', link: '🧭', join: '✨' }
const ago = (ts) => { const m = Math.round((Date.now() - ts) / 60000); return m < 1 ? 'just now' : m < 60 ? `${m}m ago` : m < 1440 ? `${Math.round(m / 60)}h ago` : `${Math.round(m / 1440)}d ago` }

export default function ActivityFeed({ limit = 12 }) {
  const { activity } = useStore()
  // Seed rows are generic placeholders; show the real events (those that carry text about people/events).
  const rows = activity.filter((a) => !a.text.startsWith('Activity at')).slice(0, limit)
  return (
    <div className="card !p-4" aria-live="polite">
      <h3 className="mb-2 text-2xl">Live activity</h3>
      <ul className="space-y-1.5">
        <AnimatePresence initial={false}>
          {rows.map((a) => (
            <motion.li key={a.id} layout initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={spring.ui} className="flex gap-2 text-sm">
              <span aria-hidden>{ICON[a.type] ?? '•'}</span>
              <span className="min-w-0 flex-1"><span className="break-words">{a.text}</span> <span className="text-mute">· {campusById(a.campusId)?.short}</span></span>
              <span className="shrink-0 text-xs text-mute">{ago(a.ts)}</span>
            </motion.li>
          ))}
        </AnimatePresence>
        {!rows.length && <li className="text-mute">Waiting for activity… try “Simulate activity”.</li>}
      </ul>
    </div>
  )
}
