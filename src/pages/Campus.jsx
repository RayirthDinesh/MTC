// Campus leader dashboard: profile, create event, co-host invites, this campus's events + attendance.
import { motion } from 'framer-motion'
import { useStore, useMe } from '../lib/useStore.js'
import { campusById } from '../store.js'
import { stagger, item } from '../lib/motion.js'
import ProfileCard from '../components/ProfileCard.jsx'
import EventForm from '../components/EventForm.jsx'
import CoHostInvite from '../components/CoHostInvite.jsx'
import GenderPill from '../components/GenderPill.jsx'

const fmt = (ts) => new Date(ts).toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })

export default function Campus() {
  const s = useStore()
  const me = useMe()
  const events = [...s.events].sort((a, b) => b.date - a.date)
  const total = events.reduce((n, e) => n + e.attendanceCount, 0)
  return (
    <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
      <div className="space-y-6">
        <ProfileCard user={me} />
        <div className="card flex justify-around text-center"><div><p className="font-display text-4xl text-gold2">{events.length}</p><p className="text-sm text-mute">Events</p></div><div><p className="font-display text-4xl text-gold2">{total}</p><p className="text-sm text-mute">Check-ins</p></div><div><p className="font-display text-4xl text-gold2">{events.filter((e) => e.coHostId).length}</p><p className="text-sm text-mute">Co-hosted</p></div></div>
        <EventForm />
      </div>
      <section>
        <h2 className="mb-4 text-4xl">{campusById(me.campusId)?.name} events</h2>
        <motion.ul variants={stagger} initial="initial" animate="animate" className="space-y-4">
          {events.map((e) => {
            const mine = e.campusId === me.campusId
            return (
              <motion.li key={e.id} variants={item} className="card">
                <div className="flex flex-wrap items-start justify-between gap-2"><h3 className="text-2xl">{e.title}</h3><GenderPill value={e.audience} /></div>
                <p className="text-sm text-mute">{fmt(e.date)} · {e.location}</p>
                <p className="mt-1 text-sm">{mine ? <>Hosted by <b>{campusById(e.campusId).short}</b></> : <>Co-hosting for <b className="text-gold2">{campusById(e.campusId).name}</b></>}{e.coHostId && mine && <> · with <b className="text-gold2">{campusById(e.coHostId).name}</b></>}</p>
                <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
                  <span className="rounded-full bg-gold/10 px-2.5 py-0.5 text-gold2">{e.track} · {e.stamp}</span>
                  <span>Code <span className="font-mono tracking-widest text-gold2">{e.code}</span></span>
                  <span className="text-mute">{e.attendanceCount} checked in</span>
                </div>
                {mine && <CoHostInvite event={e} campusId={me.campusId} />}
              </motion.li>
            )
          })}
          {!events.length && <p className="text-mute">No events yet. Create the first one.</p>}
        </motion.ul>
      </section>
    </div>
  )
}
