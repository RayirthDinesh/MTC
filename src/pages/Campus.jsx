// Campus leader dashboard: my MSA, my events, and the co-hosting board.
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useStore, useMe } from '../lib/useStore.js'
import { campusById } from '../store.js'
import { spring, stagger, item } from '../lib/motion.js'
import ProfileCard from '../components/ProfileCard.jsx'
import EventForm from '../components/EventForm.jsx'
import CoHostInvite from '../components/CoHostInvite.jsx'
import NetworkEvents from '../components/NetworkEvents.jsx'
import AskRihla from '../components/AskRihla.jsx'
import GenderPill from '../components/GenderPill.jsx'

const TABS = ['My events', 'Co-hosting', 'Ask']
const fmt = (ts) => new Date(ts).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })

export default function Campus() {
  const s = useStore()
  const me = useMe()
  const [tab, setTab] = useState('My events')
  const events = [...s.events].sort((a, b) => b.date - a.date)
  const total = events.reduce((n, e) => n + e.attendanceCount, 0)
  const pending = (s.inbox ?? []).length

  return (
    <div className="grid gap-8 lg:grid-cols-[340px_1fr]">
      <div className="space-y-5">
        <ProfileCard user={me} />
        <div className="flex divide-x divide-white/10 rounded-xl border border-white/10 text-center">
          {[['Events', events.length], ['Check-ins', total], ['Co-hosted', events.filter((e) => e.coHostId).length]].map(([l, n]) => (
            <div key={l} className="flex-1 py-3">
              <p className="text-2xl font-semibold text-gold2">{n}</p>
              <p className="text-[12px] text-mute">{l}</p>
            </div>
          ))}
        </div>
        <EventForm />
      </div>

      <section>
        <nav className="mb-6 flex gap-1 border-b border-white/[0.07]" role="tablist">
          {TABS.map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={`relative px-4 py-2.5 text-sm transition-colors ${tab === t ? 'text-gold2' : 'text-mute hover:text-cream'}`}
            >
              {t}
              {t === 'Co-hosting' && pending > 0 && (
                <span className="ml-1.5 rounded-full bg-sun px-1.5 text-[11px] text-[#2a1a05]">{pending}</span>
              )}
              {tab === t && <motion.span layoutId="campus-tab" transition={spring.ui} className="absolute inset-x-3 -bottom-px h-0.5 rounded bg-gold" />}
            </button>
          ))}
        </nav>

        {tab === 'My events' && (
          <>
            <h2 className="mb-4 text-2xl">{campusById(me.campusId)?.name}</h2>
            <motion.ul variants={stagger} initial="initial" animate="animate" className="divide-y divide-white/[0.07] border-y border-white/[0.07]">
              {events.map((e) => {
                const mine = e.campusId === me.campusId
                return (
                  <motion.li key={e.id} variants={item} className="py-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-[17px] font-medium">{e.title}</h3>
                      <GenderPill value={e.audience} />
                      {!mine && <span className="text-[12px] text-gold2">co-hosting</span>}
                    </div>
                    <p className="mt-1 text-[13px] text-mute">
                      {fmt(e.date)}{e.location && <> · {e.location}</>} · {e.track} · {e.stamp}
                      {e.coHostId && mine && <> · with {campusById(e.coHostId)?.short}</>}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-4 text-[13px]">
                      <span className="text-mute">Code <span className="font-mono tracking-widest text-gold2">{e.code}</span></span>
                      <span className="text-mute">{e.attendanceCount} checked in</span>
                    </div>
                    {mine && <CoHostInvite event={e} campusId={me.campusId} />}
                  </motion.li>
                )
              })}
            </motion.ul>
            {!events.length && <p className="py-10 text-center text-sm text-mute">No events yet. Create the first one.</p>}
          </>
        )}

        {tab === 'Co-hosting' && <NetworkEvents />}
        {tab === 'Ask' && <AskRihla />}
      </section>
    </div>
  )
}
