// Admin dashboard: live map, link MSAs, strength ranking, fading list, stats, activity feed, simulate toggle.
import { useEffect, useState } from 'react'
import { useStore, useMe } from '../lib/useStore.js'
import { CAMPUSES } from '../data/seed.js'
import { linkCampuses, unlinkCampuses, simulate, campusById, strength, isFading, lastActivityTs } from '../store.js'
import NetworkMap from '../components/NetworkMap.jsx'
import StatsCards from '../components/StatsCards.jsx'
import ActivityFeed from '../components/ActivityFeed.jsx'
import ProfileCard from '../components/ProfileCard.jsx'

const Pick = ({ label, value, onChange }) => (
  <label className="block"><span className="mb-1 block text-sm text-mute">{label}</span>
    <select className="input" value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">Choose campus…</option>
      {[...CAMPUSES].sort((x, y) => x.name.localeCompare(y.name)).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
    </select></label>
)

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
  const link = async () => { const r = await linkCampuses(a, b); setMsg(r.ok ? `Linked ${campusById(a).short} ↔ ${campusById(b).short}` : r.reason); if (r.ok) { setA(''); setB('') } }
  const now = Date.now()
  const ranked = CAMPUSES.map((c) => ({ c, str: strength(c.id, s), fading: isFading(c.id, s), idle: Math.floor((now - lastActivityTs(c.id, s)) / 86400000) })).sort((x, y) => y.str - x.str)
  const fading = ranked.filter((r) => r.fading)
  const outside = Object.entries(s.users.filter((u) => u.campusId === 'other').reduce((m, u) => ({ ...m, [u.otherCampus]: (m[u.otherCampus] ?? 0) + 1 }), {})).sort((x, y) => y[1] - x[1])

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-5xl">Network map</h1>
        <button className={`btn ${sim ? 'btn-gold' : 'btn-glass'}`} aria-pressed={sim} onClick={() => setSim(!sim)}>{sim ? '● Simulating…' : 'Simulate activity'}</button>
      </div>
      <StatsCards />
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div>
          <NetworkMap picked={[a, b]} onPick={pick} />
          <p className="mt-2 flex flex-wrap gap-4 text-xs text-mute"><span><i className="mr-1 inline-block h-2.5 w-2.5 rounded-full bg-cc" />Community college</span><span><i className="mr-1 inline-block h-2.5 w-2.5 rounded-full bg-gold" />4-year</span><span><i className="mr-1 inline-block h-2.5 w-2.5 rounded-full border-2 border-fading" />Fading (60+ days idle)</span><span>Line thickness = cross-campus activity</span></p>
        </div>
        <div className="space-y-4">
          <div className="card space-y-3">
            <h3 className="text-2xl">Link MSAs</h3>
            <Pick label="Campus A (or click the map)" value={a} onChange={setA} />
            <Pick label="Campus B" value={b} onChange={setB} />
            <button className="btn btn-gold" disabled={!a || !b || a === b} onClick={link}>Link</button>
            {msg && <p role="status" className="text-sm text-gold2">{msg}</p>}
            <ul className="max-h-32 space-y-1 overflow-y-auto text-sm">{s.links.map((l) => <li key={l.a + l.b} className="flex justify-between"><span>{campusById(l.a).short} ↔ {campusById(l.b).short}</span><button className="text-mute hover:text-fading" aria-label={`Unlink ${l.a} and ${l.b}`} onClick={() => unlinkCampuses(l.a, l.b)}>✕</button></li>)}</ul>
          </div>
          <ActivityFeed />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="card max-h-[560px] overflow-auto !p-4">
          <h3 className="mb-2 text-2xl">Connection strength</h3>
          <table className="w-full text-sm"><thead className="text-left text-mute"><tr><th className="py-1">#</th><th>Campus</th><th>Type</th><th>Strength</th><th>Last active</th></tr></thead>
            <tbody>{ranked.map(({ c, str, fading: f, idle }, i) => (
              <tr key={c.id} className="border-t border-white/10"><td className="py-1.5 text-mute">{i + 1}</td><td>{c.name}</td><td className="text-mute">{c.type === 'cc' ? 'CC' : '4-yr'}</td>
                <td><span className="inline-block h-1.5 w-20 overflow-hidden rounded-full bg-white/10 align-middle"><span className="block h-full bg-gold" style={{ width: `${str}%` }} /></span> <span className="ml-1 font-mono">{str}</span></td>
                <td className={f ? 'text-fading' : 'text-mute'}>{idle}d ago{f && ' · fading'}</td></tr>))}</tbody></table>
        </div>
        <div className="space-y-4">
          <div className="card !p-4"><h3 className="mb-2 text-2xl text-fading">Fading MSAs</h3>
            {fading.length ? <ul className="space-y-1 text-sm">{fading.map(({ c, idle }) => <li key={c.id} className="flex justify-between"><span>{c.name}</span><span className="text-fading">{idle}d</span></li>)}</ul> : <p className="text-mute">All campuses are active.</p>}
            <p className="mt-2 text-xs text-mute">Tip: link a fading MSA to a sister campus.</p></div>
          <div className="card !p-4"><h3 className="mb-2 text-2xl">Outside the network</h3>
            {outside.length ? <ul className="space-y-1 text-sm">{outside.map(([n, k]) => <li key={n} className="flex justify-between"><span>{n}</span><span className="text-mute">{k} student{k > 1 ? 's' : ''}</span></li>)}</ul> : <p className="text-mute">No students from unaffiliated colleges yet.</p>}
            <p className="mt-2 text-xs text-mute">Colleges to invite into Manara Connect.</p></div>
          <ProfileCard user={me} />
        </div>
      </div>
    </div>
  )
}
