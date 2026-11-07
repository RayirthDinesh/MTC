import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useStore, useMe } from '../lib/useStore.js'
import { visibleEvents, visibleUsers, connectionsOf, campusById, campusName, campusShort, connect, stampsOf, checkIn } from '../store.js'
import { LEVELS, levelIndex, levelOf } from '../lib/rules.js'
import { stagger, item, spring } from '../lib/motion.js'
import { fireConfetti, LevelUpModal } from './Celebrate.jsx'
import Stamp, { TRACK_INK } from './Stamp.jsx'
import { useNearby } from './NearbyEvents.jsx'
import Crest from './Crest.jsx'
import GenderPill from './GenderPill.jsx'

const fmt = (ts) => new Date(ts).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
const ago = (ts) => { const d = Math.round((Date.now() - ts) / 3600000); return d < 1 ? 'now' : d < 24 ? `${d}h` : `${Math.round(d / 24)}d` }

function CheckIn() {
  const [code, setCode] = useState('')
  const [msg, setMsg] = useState(null)
  const [levelUp, setLevelUp] = useState(null)
  const me = useMe()
  const submit = async (e) => {
    e.preventDefault()
    if (!code.trim()) return
    const r = await checkIn(code)
    if (r.ok) { setMsg({ ok: true, text: `Stamp earned: ${r.stamp} · ${r.title}` }); setCode(''); fireConfetti(); if (r.levelUp) setLevelUp(r.levelUp) } else setMsg({ ok: false, text: r.reason })
  }
  return (
    <form onSubmit={submit} className="card">
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gold text-lg font-bold text-[#1a1200]">{me.name[0]}</span>
        <input className="input !rounded-full font-mono uppercase tracking-widest" placeholder="Enter an event code to check in" aria-label="Event code" value={code} maxLength={6} onChange={(e) => { setCode(e.target.value); setMsg(null) }} autoComplete="off" />
        <button className="btn btn-gold" disabled={!code.trim()}>Check in</button>
      </div>
      {msg && <p role="status" className={`mt-2 pl-14 text-sm ${msg.ok ? 'text-gold2' : 'text-fading'}`}>{msg.text}</p>}
      <LevelUpModal level={levelUp} onClose={() => setLevelUp(null)} />
    </form>
  )
}

function Post({ e }) {
  const me = useMe()
  const [like, setLike] = useState(false)
  const [going, setGoing] = useState(false)
  const stamped = me.stamps.includes(e.id)
  const host = campusById(e.campusId)
  return (
    <motion.article variants={item} className="card !p-0">
      <div className="flex gap-3 px-4 pb-2 pt-4"><Crest id={e.campusId} size={48} />
        <div className="min-w-0 flex-1"><p className="truncate font-semibold">{host?.name} MSA</p><p className="text-sm text-mute">Organization · {fmt(e.date)}</p></div><GenderPill value={e.audience} /></div>
      <div className="px-4 pb-3"><p className="font-medium">{e.title}</p><p className="text-sm text-mute">{e.location}{e.coHostId ? ` · co-hosted with ${campusById(e.coHostId)?.name}` : ''}</p></div>
      <div className="mx-4 mb-3 flex items-center gap-4 rounded-xl bg-white/5 p-3">
        <Stamp className="w-12 shrink-0" campus={host?.short ?? ''} label={e.stamp} track={e.track} />
        <div className="min-w-0"><p className="truncate font-medium">{e.stamp}</p><p className="text-sm text-mute">{e.track} stamp{stamped ? ' · ✓ Earned' : ''}</p></div>
      </div>
      <div className="flex border-t border-white/10 px-1.5">
        {[['Celebrate', like, () => setLike(!like), '★'], [going ? "You're going" : "I'm going", going, () => setGoing(!going), '✓']].map(([l, on, fn, ic]) => (
          <button key={l} onClick={fn} className={`flex h-11 flex-1 items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-colors hover:bg-white/5 ${on ? 'text-bro' : 'text-mute'}`}>
            <motion.span animate={{ scale: on ? 1.3 : 1, rotate: on ? -8 : 0 }} transition={spring.pop}>{ic}</motion.span>{l}</button>))}
      </div>
    </motion.article>
  )
}

/** LinkedIn-style home: profile card | feed of events from MSAs | people + nearby events. */
export default function StudentHome() {
  const s = useStore()
  const me = useMe()
  const [, setSp] = useSearchParams()
  const [note, setNote] = useState('')
  const n = stampsOf(me)
  const mine = new Set(connectionsOf(me.id, s))
  const blocked = new Set(s.blocks.filter((b) => b.by === me.id).map((b) => b.target))
  const people = visibleUsers(me, s).filter((u) => !mine.has(u.id) && !blocked.has(u.id))
  const score = (u) => (u.campusId === me.campusId) * 2 + (!!me.target && u.target === me.target) * 2 + (!!me.major && u.major === me.major)
  const suggestions = [...people].sort((a, b) => score(b) - score(a)).slice(0, 3)
  const posts = [...visibleEvents(me, s)].sort((a, b) => b.date - a.date).slice(0, 6)
  const { shown } = useNearby(me, s, null)
  const doConnect = async (u) => { const r = await connect(u.id); setNote(r.ok ? `Connected with ${u.name}` : r.reason) }

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[225px_minmax(0,1fr)_300px]">
      <aside className="lg:sticky lg:top-20">
        <div className="card !p-0 text-center">
          <div className="h-16 rounded-t-[14px] bg-black/10" />
          <div className="px-4 pb-4"><span className="-mt-9 mx-auto grid h-[68px] w-[68px] place-items-center rounded-full border-[3px] border-white bg-gold text-3xl font-bold text-[#1a1200]">{me.name[0]}</span>
            <p className="mt-2 font-semibold">{me.name}</p><p className="text-sm text-mute">{me.major}</p>
            <p className="mt-2.5 flex items-center justify-center gap-2 text-sm text-mute"><Crest id={me.campusId} size={22} />{campusName(me)}</p></div>
          <dl className="space-y-2 border-t border-white/10 px-4 py-3 text-sm">
            {[['Stamps', n], ['Level', LEVELS[levelIndex(n)]], ['Connections', mine.size]].map(([k, v]) => <div key={k} className="flex justify-between"><dt className="text-mute">{k}</dt><dd className="font-semibold text-bro">{v}</dd></div>)}
          </dl>
        </div>
      </aside>

      <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-3">
        <CheckIn />
        {posts.map((e) => <Post key={e.id} e={e} />)}
        {!posts.length && <p className="card text-mute">No events in your space yet.</p>}
      </motion.div>

      <aside className="space-y-3 lg:sticky lg:top-20">
        <div className="card"><h3 className="text-xl">Add to your network</h3>
          {note && <p role="status" className="mt-1 text-sm text-gold2">{note}</p>}
          <ul className="mt-2">{suggestions.map((u) => (
            <li key={u.id} className="flex items-center gap-3 border-t border-white/10 py-3 first:border-0"><Crest id={u.campusId} size={44} />
              <div className="min-w-0 flex-1"><p className="truncate font-semibold">{u.name}</p><p className="truncate text-sm text-mute">{campusShort(u)} · {u.major}</p></div>
              <button className="btn btn-out !px-3 !py-1 text-sm" onClick={() => doConnect(u)}>Connect</button></li>))}
            {!suggestions.length && <li className="py-2 text-sm text-mute">You are connected with everyone in your space.</li>}</ul></div>
        <div className="card"><h3 className="text-xl">Events near you</h3>
          <ul className="mt-2">{shown.slice(0, 3).map((e) => (
            <li key={e.id} className="flex items-center gap-3 border-t border-white/10 py-3 first:border-0"><Crest id={e.campusId} size={40} />
              <div className="min-w-0 flex-1"><p className="truncate font-semibold">{e.title}</p><p className="truncate text-sm text-mute">{e.c.short}</p></div>
              <span className="rounded-full bg-[#1a73e8]/15 px-2 py-0.5 text-xs font-medium text-[#1a73e8]">{Math.max(1, Math.round(e.mi))} mi</span></li>))}
            {!shown.length && <li className="py-2 text-sm text-mute">No upcoming events yet.</li>}</ul>
          <button onClick={() => setSp({ tab: 'Events' })} className="mt-1 text-sm font-semibold text-bro">See map</button></div>
      </aside>
    </div>
  )
}
