// Admin dashboard, LinkedIn-style 3-column: profile + stats | map, link composer, live feed | MSAs to reconnect, strongest MSAs.
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useStore, useMe } from '../lib/useStore.js'
import { CAMPUSES } from '../data/seed.js'
import { linkCampuses, unlinkCampuses, simulate, campusById, strength, isFading, lastActivityTs } from '../store.js'
import { miles } from '../lib/mapPins.js'
import NetworkMap from '../components/NetworkMap.jsx'
import StatsCards from '../components/StatsCards.jsx'
import ActivityFeed from '../components/ActivityFeed.jsx'
import Crest from '../components/Crest.jsx'

const Pick = ({ label, value, onChange }) => (
  <label className="block min-w-40 flex-1"><span className="sr-only">{label}</span>
    <select className="input" aria-label={label} value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">{label}</option>
      {[...CAMPUSES].sort((x, y) => x.name.localeCompare(y.name)).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
    </select></label>
)
const Dot = ({ c, children }) => <span className="flex items-center gap-1.5"><i className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: c }} />{children}</span>

export default function Admin() {
  const s = useStore()
  const me = useMe()
  const [a, setA] = useState('')
  const [b, setB] = useState('')
  const [msg, setMsg] = useState('')
  const [sim, setSim] = useState(false)

  useEffect(() => { // simulate toggle: one random check-in / connection every 3s
    if (!sim) return
    const t = setInterval(simulate, 3000)
    return () => clearInterval(t)
  }, [sim])

  const pick = (id) => (!a || (a && b) ? (setA(id), setB('')) : id !== a && setB(id)) // click map: first A, then B
  const link = async (x = a, y = b) => { const r = await linkCampuses(x, y); setMsg(r.ok ? `Linked ${campusById(x).short} ↔ ${campusById(y).short}` : r.reason); if (r.ok) { setA(''); setB('') } }
  const now = Date.now()
  const ranked = CAMPUSES.map((c) => ({ c, str: strength(c.id, s), fading: isFading(c.id, s), idle: Math.floor((now - lastActivityTs(c.id, s)) / 86400000) })).sort((x, y) => y.str - x.str)
  const fading = ranked.filter((r) => r.fading)
  const nearestActive = (c) => ranked.filter((r) => !r.fading && r.c.type !== c.type).sort((x, y) => miles(c, x.c) - miles(c, y.c))[0]?.c
  const outside = Object.entries(s.users.filter((u) => u.campusId === 'other').reduce((m, u) => ({ ...m, [u.otherCampus]: (m[u.otherCampus] ?? 0) + 1 }), {})).sort((x, y) => y[1] - x[1])

  return (
    <div className="grid items-start gap-6 pt-5 lg:grid-cols-[250px_minmax(0,1fr)_300px]">
      <aside className="space-y-3 lg:sticky lg:top-20">
        <div className="card !p-0"><div className="h-[72px] rounded-t-[14px] bg-black/10" />
          <div className="px-4 pb-4"><span className="-mt-8 grid h-16 w-16 place-items-center rounded-full border-[3px] border-white bg-gold text-3xl font-bold text-[#1a1200]">M</span>
            <p className="mt-2 font-semibold">{me.name}</p><p className="text-sm text-mute">Network operations · {CAMPUSES.length} campuses</p></div></div>
        <StatsCards />
        <div className="card"><h3 className="text-lg">Outside the network</h3>
          {outside.length ? <ul className="mt-2 space-y-1.5 text-sm">{outside.map(([n, k]) => <li key={n} className="flex justify-between"><span>{n}</span><span className="text-mute">{k}</span></li>)}</ul> : <p className="mt-1 text-sm text-mute">No students from unaffiliated colleges yet.</p>}
          <p className="mt-2 text-xs text-mute">Colleges to invite into Manara Connect.</p></div>
      </aside>

      <div className="min-w-0 space-y-3">
        <div className="card !p-0 overflow-hidden"><NetworkMap picked={[a, b]} onPick={pick} className="h-[440px]" />
          <p className="flex flex-wrap gap-x-5 gap-y-1 px-4 py-3 text-xs text-mute"><Dot c="#34a853">Community college</Dot><Dot c="#fbbc04">4-year</Dot><Dot c="#ea4335">Fading (60+ days idle)</Dot><span className="flex items-center gap-1.5"><i className="inline-block h-0.5 w-4" style={{ background: '#1a73e8' }} />Link · thickness = activity</span></p></div>
        <div className="card space-y-3">
          <div className="flex items-center justify-between gap-3"><h3 className="text-lg">Link two MSAs</h3>
            <button role="switch" aria-checked={sim} onClick={() => setSim(!sim)} className="flex items-center gap-3 text-sm text-mute">Simulate activity
              <span className={`relative h-[31px] w-[51px] rounded-full transition-colors ${sim ? 'bg-[#34c759]' : 'bg-black/15'}`}><motion.span className="absolute left-0.5 top-0.5 h-[27px] w-[27px] rounded-full bg-white shadow" animate={{ x: sim ? 20 : 0 }} transition={{ type: 'spring', stiffness: 500, damping: 24 }} /></span></button></div>
          <div className="flex flex-wrap gap-2"><Pick label="Campus A (or click the map)" value={a} onChange={setA} /><Pick label="Campus B" value={b} onChange={setB} /><button className="btn btn-gold" disabled={!a || !b || a === b} onClick={() => link()}>Link</button></div>
          {msg && <p role="status" className="text-sm text-gold2">{msg}</p>}
          {s.links.length > 0 && <ul className="flex flex-wrap gap-2 text-sm">{s.links.map((l) => <li key={l.a + l.b} className="flex items-center gap-1.5 rounded-full bg-white/5 py-1 pl-3 pr-2">{campusById(l.a).short} ↔ {campusById(l.b).short}<button className="px-1 text-mute hover:text-fading" aria-label={`Unlink ${l.a} and ${l.b}`} onClick={() => unlinkCampuses(l.a, l.b)}>✕</button></li>)}</ul>}
        </div>
        <ActivityFeed />
      </div>

      <aside className="space-y-3 lg:sticky lg:top-20">
        <div className="card"><h3 className="text-lg text-fading">MSAs to reconnect</h3>
          {fading.length ? <ul className="mt-1">{fading.map(({ c, idle }) => { const t = nearestActive(c); return (
            <li key={c.id} className="flex items-center gap-3 border-t border-white/10 py-3 first:border-0"><Crest id={c.id} size={42} />
              <div className="min-w-0 flex-1"><p className="truncate font-semibold">{c.name.replace(' College', '')}</p><p className="text-sm text-fading">{idle} days idle</p></div>
              {t && <button className="btn btn-out !px-3 !py-1 text-sm" onClick={() => link(c.id, t.id)}>Link {t.short}</button>}</li>) })}</ul> : <p className="mt-1 text-sm text-mute">All campuses are active.</p>}</div>
        <div className="card"><h3 className="text-lg">Strongest MSAs</h3>
          <ul className="mt-1">{ranked.slice(0, 6).map(({ c, str }) => (
            <li key={c.id} className="flex items-center gap-3 border-t border-white/10 py-3 first:border-0"><Crest id={c.id} size={38} />
              <p className="min-w-0 flex-1 truncate font-semibold">{c.name.replace(' College', '')}</p>
              <span className="h-1.5 w-16 overflow-hidden rounded-full bg-black/10"><motion.span className="block h-full bg-gold" initial={{ width: 0 }} animate={{ width: `${str}%` }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }} /></span>
              <span className="w-7 text-right text-sm tabular-nums text-mute">{str}</span></li>))}</ul></div>
      </aside>
    </div>
  )
}
