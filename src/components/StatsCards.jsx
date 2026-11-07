import { useEffect, useRef, useState } from 'react'
import { useStore } from '../lib/useStore.js'

/** Number ticker: eases from the previous value to the next over 800ms. */
function Count({ value }) {
  const [v, setV] = useState(value)
  const from = useRef(value)
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setV(value); from.current = value; return }
    const a = from.current, t0 = performance.now()
    let raf
    const tick = (t) => {
      const k = Math.min(1, (t - t0) / 800), e = 1 - (1 - k) ** 3
      setV(Math.round(a + (value - a) * e))
      if (k < 1) raf = requestAnimationFrame(tick); else from.current = value
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value])
  return <>{v}</>
}

const Card = ({ label, value, b, s, e }) => (
  <div className="card !p-5">
    <p className="text-sm text-mute">{label}</p>
    <p className="font-display text-5xl text-gold2"><Count value={value} /></p>
    <p className="mt-1 text-xs text-mute">🟦 {b} · 🟪 {s}{e != null && <> · 🌙 {e}</>}</p>
  </div>
)

/** Combined totals with brothers/sisters breakdown (admin view only has the full data). */
export default function StatsCards() {
  const { users, events, connections } = useStore()
  const students = users.filter((u) => u.role === 'student')
  const by = (g) => students.filter((u) => u.gender === g)
  const gOf = new Map(users.map((u) => [u.id, u.gender]))
  const stampsOf = (list) => list.reduce((n, u) => n + (u.stampCount ?? u.stamps.length), 0)
  const conn = (g) => connections.filter((c) => gOf.get(c.a) === g).length
  const aud = (x) => events.filter((e) => e.audience === x).length
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
      <Card label="Students" value={students.length} b={by('brother').length} s={by('sister').length} />
      <Card label="Stamps earned" value={stampsOf(students)} b={stampsOf(by('brother'))} s={stampsOf(by('sister'))} />
      <Card label="Connections" value={connections.length} b={conn('brother')} s={conn('sister')} />
      <Card label="Events" value={events.length} b={aud('brothers')} s={aud('sisters')} e={aud('everyone')} />
      <Card label="Co-hosted" value={events.filter((e) => e.coHostId).length} b={events.filter((e) => e.coHostId && e.audience === 'brothers').length} s={events.filter((e) => e.coHostId && e.audience === 'sisters').length} e={events.filter((e) => e.coHostId && e.audience === 'everyone').length} />
    </div>
  )
}
