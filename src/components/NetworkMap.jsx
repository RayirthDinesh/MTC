import { useEffect, useRef, useState } from 'react'
import { useStore } from '../lib/useStore.js'
import { CAMPUSES } from '../data/seed.js'
import { campusById, pairActivity, strength, isFading, lastActivityTs } from '../store.js'
import { PIN, LINK, pinIcon, pulse } from '../lib/mapPins.js'
import GMap from './GMap.jsx'

/** Live Google map. Pulses fire when a NEW activity row arrives (existing rows at load never pulse). */
export default function NetworkMap({ picked = [], onPick, className = 'h-[520px]' }) {
  const s = useStore()
  const [g, setG] = useState(null) // { map, maps }
  const seen = useRef(null)
  const pickRef = useRef(onPick)
  pickRef.current = onPick

  useEffect(() => { // pins, links, popups
    if (!g) return
    const { map, maps } = g
    const iw = new maps.InfoWindow()
    const days = (c) => { const t = lastActivityTs(c.id, s); return t ? Math.floor((Date.now() - t) / 86400000) : null }
    const markers = CAMPUSES.map((c) => {
      const fading = isFading(c.id, s), on = picked.includes(c.id)
      const mk = new maps.Marker({ map, position: { lat: c.lat, lng: c.lng }, title: c.name, icon: pinIcon(maps, fading ? PIN.fading : PIN[c.type], on), zIndex: on ? 1000 : fading ? 500 : 1 })
      mk.addListener('click', () => {
        iw.setContent(`<div style="color:#202124;font:13px/1.5 Roboto,system-ui,sans-serif"><b style="font-size:15px;font-weight:500">${c.name}</b><div style="color:#5f6368">${c.type === 'cc' ? 'Community college' : '4-year university'}</div><div>Strength <b>${strength(c.id, s)}</b>/100 · ${s.users.filter((u) => u.campusId === c.id && u.role === 'student').length} students</div><div style="color:${fading ? PIN.fading : '#188038'}">${fading ? `Fading · ${days(c)}d idle` : `Active ${days(c)}d ago`}</div></div>`)
        iw.open(map, mk); pickRef.current?.(c.id)
      })
      return mk
    })
    const lines = s.links.map((l) => { const a = campusById(l.a), b = campusById(l.b); return new maps.Polyline({ map, path: [{ lat: a.lat, lng: a.lng }, { lat: b.lat, lng: b.lng }], strokeColor: LINK, strokeOpacity: 0.85, strokeWeight: 3 + Math.min(11, pairActivity(l.a, l.b, s) / 2.5) }) })
    return () => { markers.forEach((m) => m.setMap(null)); lines.forEach((l) => l.setMap(null)); iw.close() }
  }, [g, s, picked.join()]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { // pulse on fresh activity only
    if (seen.current === null) { seen.current = new Set(s.activity.map((a) => a.id)); return }
    const fresh = s.activity.filter((a) => !seen.current.has(a.id) && CAMPUSES.some((c) => c.id === a.campusId))
    s.activity.forEach((a) => seen.current.add(a.id))
    if (g) fresh.forEach((a) => { const c = campusById(a.campusId); pulse(g.maps, g.map, c.lat, c.lng) })
  }, [s.activity, g])

  return <GMap center={[36.2, -118.2]} zoom={6} onMap={(map, maps) => setG({ map, maps })} className={`w-full ${className}`} label="Map of Manara West campuses" />
}
