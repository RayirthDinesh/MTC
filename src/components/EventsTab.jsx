import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useStore, useMe } from '../lib/useStore.js'
import { visibleEvents, campusById } from '../store.js'
import { stagger, item } from '../lib/motion.js'
import GenderPill from './GenderPill.jsx'

const FILTERS = ['Upcoming', 'Stamped', 'Past', 'All']
const day = (ts) => new Date(ts).toLocaleDateString(undefined, { day: 'numeric' })
const mon = (ts) => new Date(ts).toLocaleDateString(undefined, { month: 'short' }).toUpperCase()
const time = (ts) => new Date(ts).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })

/** Events open to my space. Codes are never shown to students. */
export default function EventsTab() {
  const s = useStore()
  const me = useMe()
  const [filter, setFilter] = useState('Upcoming')
  const now = Date.now()
  const mine = useMemo(() => new Set(me.stamps), [me.stamps])

  const all = useMemo(
    () => visibleEvents(me, s).sort((a, b) => (a.date < now) - (b.date < now) || a.date - b.date),
    [me, s, now],
  )
  const counts = {
    Upcoming: all.filter((e) => e.date > now).length,
    Stamped: all.filter((e) => mine.has(e.id)).length,
    Past: all.filter((e) => e.date <= now).length,
    All: all.length,
  }
  const list = all.filter((e) =>
    filter === 'Upcoming' ? e.date > now : filter === 'Past' ? e.date <= now : filter === 'Stamped' ? mine.has(e.id) : true,
  )

  return (
    <div>
      <div className="mb-5 flex flex-wrap gap-1.5">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            aria-pressed={filter === f}
            className={`rounded-full px-3.5 py-1.5 text-[13px] transition-colors ${
              filter === f ? 'bg-sun text-[#2a1a05]' : 'border border-white/10 text-mute hover:text-cream'
            }`}
          >
            {f} <span className="opacity-60">{counts[f]}</span>
          </button>
        ))}
      </div>

      <motion.ul variants={stagger} initial="initial" animate="animate" className="divide-y divide-white/[0.07] border-y border-white/[0.07]">
        {list.map((e) => {
          const stamped = mine.has(e.id)
          const upcoming = e.date > now
          return (
            <motion.li key={e.id} variants={item} className="flex gap-4 py-4 transition-colors hover:bg-white/[0.02]">
              {/* date block */}
              <div className="w-11 shrink-0 text-center">
                <div className="font-mono text-[10px] tracking-wider text-mute">{mon(e.date)}</div>
                <div className="text-[22px] leading-tight font-semibold">{day(e.date)}</div>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                  <h3 className="text-[17px] leading-snug font-medium">{e.title}</h3>
                  <GenderPill value={e.audience} />
                  {stamped && <span className="text-[12px] text-cc">✓ Stamped</span>}
                </div>
                <p className="mt-1 truncate text-[13px] text-mute">
                  {campusById(e.campusId)?.name}
                  {e.coHostId && <> × {campusById(e.coHostId)?.name}</>}
                  {' · '}{time(e.date)}{e.location && <> · {e.location}</>}
                </p>
              </div>

              <div className="hidden shrink-0 text-right sm:block">
                <div className="text-[12px] text-mute">{e.track}</div>
                <div className="text-[12px] text-gold2">{e.stamp}</div>
                {!upcoming && !stamped && <div className="mt-0.5 text-[11px] text-mute/60">Missed</div>}
              </div>
            </motion.li>
          )
        })}
      </motion.ul>

      {!list.length && <p className="py-10 text-center text-sm text-mute">Nothing here yet.</p>}

      <p className="mt-5 text-[13px] text-mute">
        Check-in codes are handed out at the event. Enter yours on the Passport tab.
      </p>
    </div>
  )
}
