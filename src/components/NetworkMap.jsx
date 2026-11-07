import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import { MapContainer, TileLayer, CircleMarker, Polyline, Marker, Popup, Tooltip } from 'react-leaflet'
import { useStore } from '../lib/useStore.js'
import { CAMPUSES } from '../data/seed.js'
import { campusById, pairActivity, strength, isFading, lastActivityTs } from '../store.js'

const pulseIcon = L.divIcon({ className: 'pulse-wrap', html: '<span class="pulse"></span>', iconSize: [28, 28], iconAnchor: [14, 14] })
const COLOR = { cc: '#2db5a6', '4yr': '#e3b04b' }

/** Live map. Pulses fire when a NEW activity row arrives (existing rows at load never pulse). */
export default function NetworkMap({ picked = [], onPick }) {
  const s = useStore()
  const seen = useRef(null)
  const [pulses, setPulses] = useState([])
  useEffect(() => {
    if (seen.current === null) { seen.current = new Set(s.activity.map((a) => a.id)); return }
    const fresh = s.activity.filter((a) => !seen.current.has(a.id) && a.campusId)
    fresh.forEach((a) => seen.current.add(a.id))
    if (!fresh.length) return
    const ps = fresh.map((a) => ({ key: a.id, campusId: a.campusId }))
    setPulses((p) => [...p, ...ps])
    const t = setTimeout(() => setPulses((p) => p.filter((x) => !ps.includes(x))), 1800)
    return () => clearTimeout(t)
  }, [s.activity])

  const days = (c) => { const t = lastActivityTs(c.id, s); return t ? Math.floor((Date.now() - t) / 86400000) : null }
  return (
    <MapContainer center={[36.6, -119.6]} zoom={6} scrollWheelZoom className="h-[520px] w-full rounded-3xl border border-white/10" aria-label="Map of Manara West campuses">
      <TileLayer attribution="Tiles &copy; Esri" maxZoom={16} url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}" />
      {s.links.map((l) => {
        const a = campusById(l.a), b = campusById(l.b), w = pairActivity(l.a, l.b, s)
        return (
          <Polyline key={l.a + l.b} positions={[[a.lat, a.lng], [b.lat, b.lng]]} pathOptions={{ color: '#f6d58a', weight: 2 + Math.min(12, w / 2.5), opacity: 0.75, lineCap: 'round' }}>
            <Tooltip sticky>{a.short} ↔ {b.short} · activity {w}</Tooltip>
          </Polyline>
        )
      })}
      {CAMPUSES.map((c) => {
        const fading = isFading(c.id, s), on = picked.includes(c.id)
        return (
          <span key={c.id}>
            {fading && <CircleMarker center={[c.lat, c.lng]} radius={15} pathOptions={{ color: '#ff5c5c', weight: 3, fill: false }} interactive={false} />}
            <CircleMarker center={[c.lat, c.lng]} radius={on ? 11 : 8} pathOptions={{ color: on ? '#fff' : '#070d20', weight: on ? 3 : 2, fillColor: COLOR[c.type], fillOpacity: 1 }} eventHandlers={{ click: () => onPick?.(c.id) }}>
              <Popup><b>{c.name}</b><br />{c.type === 'cc' ? 'Community college' : '4-year university'}<br />Strength {strength(c.id, s)}/100<br />Students {s.users.filter((u) => u.campusId === c.id && u.role === 'student').length}<br />{fading ? <span style={{ color: '#ff5c5c' }}>Fading · {days(c)}d idle</span> : `Active ${days(c)}d ago`}</Popup>
            </CircleMarker>
          </span>
        )
      })}
      {pulses.map((p) => { const c = campusById(p.campusId); return <Marker key={p.key} position={[c.lat, c.lng]} icon={pulseIcon} interactive={false} /> })}
    </MapContainer>
  )
}
