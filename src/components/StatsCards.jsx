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

const Row = ({ label, value, sub }) => (
  <li className="flex items-center justify-between gap-3 border-t border-white/10 py-3 first:border-0">
    <div><p className="font-semibold">{label}</p><p className="text-xs text-mute">{sub}</p></div>
    <p className="font-display text-2xl tabular-nums"><Count value={value} /></p>
  </li>
)

/** Combined totals with brothers/sisters breakdown (admin view only has the full data). */
export default function StatsCards() {
  const { users, events, connections } = useStore()
  const students = users.filter((u) => u.role === 'student')
  const by = (g) => students.filter((u) => u.gender === g)
  const gOf = new Map(users.map((u) => [u.id, u.gender]))
  const stampsOf = (list) => list.reduce((n, u) => n + (u.stampCount ?? u.stamps.length), 0)
  const conn = (g) => connections.filter((c) => gOf.get(c.a) === g).length
  const co = events.filter((e) => e.coHostId).length
  return (
    <ul className="card !py-1">
      <Row label="Students" value={students.length} sub={`🟦 ${by('brother').length} · 🟪 ${by('sister').length}`} />
      <Row label="Stamps earned" value={stampsOf(students)} sub={`🟦 ${stampsOf(by('brother'))} · 🟪 ${stampsOf(by('sister'))}`} />
      <Row label="Connections" value={connections.length} sub={`🟦 ${conn('brother')} · 🟪 ${conn('sister')}`} />
      <Row label="Events" value={events.length} sub={`${co} co-hosted`} />
    </ul>
  )
}
