import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useStore, useMe } from '../lib/useStore.js'
import { visibleUsers, connectionsOf, campusById, campusShort, connect, blockUser, reportUser, stampsOf } from '../store.js'
import { levelOf } from '../lib/rules.js'
import { stagger, item, spring } from '../lib/motion.js'
import GenderPill from './GenderPill.jsx'
import ProfileCard from './ProfileCard.jsx'

function Person({ u, children, onOpen }) {
  return (
    <motion.li variants={item} className="card flex items-center gap-4 !p-4">
      <button onClick={onOpen} className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gold font-display text-2xl text-[#2a1d00]" aria-label={`View ${u.name}'s profile`}>{u.name[0]}</button>
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-2"><span className="truncate font-medium">{u.name}</span><GenderPill value={u.gender} /></p>
        <p className="truncate text-sm text-mute">{campusShort(u)} · {u.major || u.position} · {levelOf(stampsOf(u))}{u.target ? ` · → ${campusById(u.target)?.short}` : ''}</p>
      </div>
      <div className="flex gap-2">{children}</div>
    </motion.li>
  )
}

/** Search + suggestions + my connections. Everything is same-space (server-filtered, then visibleUsers again). */
export default function ConnectList({ onMessage }) {
  const s = useStore()
  const me = useMe()
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState('all')
  const [viewing, setViewing] = useState(null)
  const [note, setNote] = useState('')
  const blocked = new Set(s.blocks.filter((b) => b.by === me.id).map((b) => b.target))
  const mine = new Set(connectionsOf(me.id, s))
  const people = useMemo(() => visibleUsers(me, s).filter((u) => !blocked.has(u.id)), [s, me]) // eslint-disable-line react-hooks/exhaustive-deps
  const score = (u) => (u.campusId === me.campusId) * 2 + (!!me.target && u.target === me.target) * 2 + (!!me.major && u.major === me.major)
  const why = (u) => [u.campusId === me.campusId && 'same campus', me.target && u.target === me.target && `also → ${campusById(me.target)?.short}`, me.major && u.major === me.major && 'same major'].filter(Boolean).join(' · ')
  const suggestions = people.filter((u) => !mine.has(u.id) && score(u) > 0).sort((a, b) => score(b) - score(a)).slice(0, 4)
  const needle = q.trim().toLowerCase()
  const results = people.filter((u) => !mine.has(u.id)).filter((u) => {
    if (filter === 'campus' && u.campusId !== me.campusId) return false
    if (filter === 'major' && u.major !== me.major) return false
    if (filter === 'transfer' && !(me.target && u.target === me.target)) return false
    if (filter === 'track' && u.track !== me.track) return false
    return !needle || `${u.name} ${campusById(u.campusId)?.name} ${u.major}`.toLowerCase().includes(needle)
  })
  const doConnect = async (u) => { const r = await connect(u.id); setNote(r.ok ? `Connected with ${u.name}` : r.reason) }
  const Btn = (u) => <button className="btn btn-gold !px-4 !py-2 text-sm" onClick={() => doConnect(u)}>Connect</button>
  const list = (arr, render) => <motion.ul variants={stagger} initial="initial" animate="animate" className="grid gap-3">{arr.map(render)}</motion.ul>

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-3">
        <input className="input !w-auto min-w-56 flex-1" placeholder="Search by name, campus or major" aria-label="Search people" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="input !w-auto" aria-label="Filter" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">Everyone in my space</option><option value="campus">My campus</option><option value="major">My major</option>
          <option value="transfer">My transfer path</option><option value="track">My track</option>
        </select>
      </div>
      {note && <p role="status" className="text-sm text-gold2">{note}</p>}

      {!needle && filter === 'all' && suggestions.length > 0 && <section><h3 className="mb-3 text-2xl">Suggested for you</h3>
        {list(suggestions, (u) => <Person key={u.id} u={u} onOpen={() => setViewing(u)}><div className="hidden text-right text-xs text-mute sm:block">{why(u)}</div>{Btn(u)}</Person>)}</section>}

      <section><h3 className="mb-3 text-2xl">{needle || filter !== 'all' ? 'Results' : 'People in your space'}</h3>
        {results.length ? list(results, (u) => <Person key={u.id} u={u} onOpen={() => setViewing(u)}>{Btn(u)}</Person>) : <p className="text-mute">No one matches.</p>}</section>

      <section><h3 className="mb-3 text-2xl">Your connections ({mine.size})</h3>
        {mine.size ? list(people.filter((u) => mine.has(u.id)), (u) =>
          <Person key={u.id} u={u} onOpen={() => setViewing(u)}>
            <button className="btn btn-glass !px-4 !py-2 text-sm" onClick={() => onMessage(u.id)}>Message</button>
            <button className="btn btn-glass !px-3 !py-2 text-sm" aria-label={`Report ${u.name}`} onClick={async () => { await reportUser(u.id, 'Reported from connections'); setNote(`Reported ${u.name} to moderators`) }}>⚑</button>
            <button className="btn btn-glass !px-3 !py-2 text-sm" aria-label={`Block ${u.name}`} onClick={() => blockUser(u.id)}>⛔</button>
          </Person>) : <p className="text-mute">Connect with someone above to start chatting.</p>}</section>

      <AnimatePresence>{viewing && (
        <motion.div className="fixed inset-0 z-[70] grid place-items-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setViewing(null)} role="dialog" aria-modal="true">
          <motion.div initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0 }} transition={spring.sheet} className="w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <ProfileCard user={viewing} /><button className="btn btn-glass mt-3" onClick={() => setViewing(null)} autoFocus>Close</button>
          </motion.div></motion.div>)}</AnimatePresence>
    </div>
  )
}
