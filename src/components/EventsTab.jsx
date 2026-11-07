import { motion } from 'framer-motion'
import { useStore, useMe } from '../lib/useStore.js'
import { visibleEvents, campusById } from '../store.js'
import { stagger, item } from '../lib/motion.js'
import GenderPill from './GenderPill.jsx'
import Crest from './Crest.jsx'

const fmt = (ts) => new Date(ts).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })

/** Events open to my space. Codes are never shown to students. */
export default function EventsTab() {
  const s = useStore()
  const me = useMe()
  const now = Date.now()
  const list = visibleEvents(me, s).sort((a, b) => (a.date < now) - (b.date < now) || a.date - b.date)
  const mine = new Set(me.stamps)
  return (
    <motion.ul variants={stagger} initial="initial" animate="animate" className="grid gap-3 sm:grid-cols-2">
      {list.map((e) => (
        <motion.li key={e.id} variants={item} className="card">
          <div className="flex items-start gap-3"><Crest id={e.campusId} size={44} />
            <div className="min-w-0 flex-1"><h3 className="truncate text-lg font-semibold">{e.title}</h3>
              <p className="truncate text-sm text-mute">{campusById(e.campusId)?.name}{e.coHostId && <> × <span className="text-gold2">{campusById(e.coHostId)?.name}</span></>}</p></div><GenderPill value={e.audience} /></div>
          <p className="mt-2 text-sm text-mute">{fmt(e.date)} · {e.location}</p>
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="rounded-full bg-gold/15 px-2.5 py-0.5 text-gold2">{e.track} · {e.stamp} stamp</span>
            <span className={mine.has(e.id) ? 'text-cc' : 'text-mute'}>{mine.has(e.id) ? '✓ Stamped' : e.date > now ? 'Upcoming' : 'Past'}</span>
          </div>
        </motion.li>
      ))}
    </motion.ul>
  )
}
