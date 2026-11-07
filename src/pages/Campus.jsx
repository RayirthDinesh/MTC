// Campus leader dashboard, organization-page style: header | analytics + composer/posts + co-host suggestions.
import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useStore, useMe } from '../lib/useStore.js'
import { campusById } from '../store.js'
import { stagger, item, spring } from '../lib/motion.js'
import { cohostOptions } from '../components/CoHostInvite.jsx'
import { miles } from '../lib/mapPins.js'
import EventForm from '../components/EventForm.jsx'
import CoHostInvite from '../components/CoHostInvite.jsx'
import GenderPill from '../components/GenderPill.jsx'
import Crest from '../components/Crest.jsx'
import Stamp from '../components/Stamp.jsx'

const fmt = (ts) => new Date(ts).toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })

export default function Campus() {
  const s = useStore()
  const me = useMe()
  const [open, setOpen] = useState(false)
  const [preset, setPreset] = useState('')
  const composer = useRef(null)
  const here = campusById(me.campusId)
  const events = [...s.events].sort((a, b) => b.date - a.date)
  const total = events.reduce((n, e) => n + e.attendanceCount, 0)
  const { suggested } = cohostOptions(me.campusId, s.links)
  const openForm = (co = '') => { setPreset(co); setOpen(true); setTimeout(() => composer.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100) }

  return (
    <div className="space-y-4 pt-5">
      <div className="card !p-0">
        <div className="h-36 rounded-t-[14px] bg-black/10" />
        <div className="px-6 pb-5">
          <Crest id={me.campusId} size={104} className="-mt-14 !ring-4 !ring-white" />
          <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
            <div><h1 className="text-3xl">{here?.name} Muslim Student Association</h1>
              <p className="text-mute">{here?.type === 'cc' ? 'Community college' : 'University'} · {events.length} events · 48 followers</p>
              <p className="mt-1 text-sm text-mute">{me.position} · {me.name}</p></div>
            <div className="flex gap-2"><button className="btn btn-gold" onClick={() => openForm()}>+ Create event</button><button className="btn btn-out" onClick={() => navigator.clipboard?.writeText(location.href)}>Share page</button></div>
          </div>
        </div>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[260px_minmax(0,1fr)_300px]">
        <aside className="card lg:sticky lg:top-20"><h3 className="text-xl">Page analytics</h3><p className="text-sm text-mute">Across your events</p>
          <ul className="mt-2">{[['Events', events.length], ['Check-ins', total], ['Co-hosted', events.filter((e) => e.coHostId).length]].map(([l, v]) => (
            <li key={l} className="flex items-center justify-between border-t border-white/10 py-3 first:border-0"><span className="font-semibold">{l}</span><span className="font-display text-2xl tabular-nums">{v}</span></li>))}</ul></aside>

        <section className="min-w-0 space-y-3">
          <div className="card" ref={composer}>
            <div className="flex items-center gap-3"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gold text-lg font-bold text-[#1a1200]">{me.name[0]}</span>
              <button onClick={() => (open ? setOpen(false) : openForm())} className="input !rounded-full text-left !text-mute">{open ? 'Close composer' : 'Start an event…'}</button></div>
            <AnimatePresence initial={false}>{open && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={spring.sheet} className="overflow-hidden">
                <div className="pt-4"><EventForm preset={preset} bare /></div></motion.div>)}</AnimatePresence>
          </div>

          <motion.ul variants={stagger} initial="initial" animate="animate" className="space-y-3">
            {events.map((e) => {
              const mine = e.campusId === me.campusId
              const host = campusById(e.campusId)
              return (
                <motion.li key={e.id} variants={item} className="card !p-0">
                  <div className="flex gap-3 px-4 pb-2 pt-4"><Crest id={e.campusId} size={48} />
                    <div className="min-w-0 flex-1"><p className="truncate font-semibold">{host?.name} MSA</p><p className="text-sm text-mute">{fmt(e.date)} · {e.location}</p></div><GenderPill value={e.audience} /></div>
                  <div className="px-4 pb-3"><p className="font-medium">{e.title}</p>
                    <p className="text-sm text-mute">{mine ? (e.coHostId ? `Co-hosted with ${campusById(e.coHostId).name}` : 'Hosted by your MSA') : <>Co-hosting for <b className="text-gold2">{host.name}</b></>}</p></div>
                  <div className="mx-4 mb-3 flex items-center gap-4 rounded-xl bg-white/5 p-3">
                    <Stamp className="w-11 shrink-0" campus={host?.short ?? ''} label={e.stamp} track={e.track} />
                    <div className="min-w-0 flex-1"><p className="text-xs text-mute">{e.track} stamp · check-in code</p><p className="font-mono text-lg font-semibold tracking-[.16em] text-gold2">{e.code}</p></div>
                    <div className="text-right"><p className="font-display text-2xl tabular-nums">{e.attendanceCount}</p><p className="text-xs text-mute">checked in</p></div></div>
                  {mine && <div className="border-t border-white/10 px-4 pb-4"><CoHostInvite event={e} campusId={me.campusId} /></div>}
                </motion.li>
              )
            })}
            {!events.length && <p className="card text-mute">No events yet. Create the first one.</p>}
          </motion.ul>
        </section>

        <aside className="card lg:sticky lg:top-20"><h3 className="text-xl">Co-host suggestions</h3>
          <ul className="mt-2">{suggested.slice(0, 4).map((c) => (
            <li key={c.id} className="flex items-center gap-3 border-t border-white/10 py-3 first:border-0"><Crest id={c.id} size={44} />
              <div className="min-w-0 flex-1"><p className="truncate font-semibold">{c.name.replace(' College', '')}</p><p className="text-sm text-mute">{Math.round(miles(here, c))} mi away</p></div>
              <button className="btn btn-out !px-3 !py-1 text-sm" onClick={() => openForm(c.id)}>Invite</button></li>))}</ul></aside>
      </div>
    </div>
  )
}
