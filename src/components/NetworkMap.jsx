import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import { MapContainer, TileLayer, ZoomControl, Polyline, Marker, Popup, Tooltip } from 'react-leaflet'
import { useStore } from '../lib/useStore.js'
import { CAMPUSES } from '../data/seed.js'
import { campusById, pairActivity, strength, isFading, lastActivityTs } from '../store.js'

// Google-Maps look: light street tiles, teardrop pins (green = community college, yellow = 4-year, red = fading), blue links.
const PIN = { cc: '#34a853', '4yr': '#fbbc04', fading: '#ea4335' }
const LINK = '#1a73e8'
const icons = new Map()
const pin = (color, picked) => {
  const key = color + picked
  if (!icons.has(key)) icons.set(key, L.divIcon({
    className: `gpin${picked ? ' gpin-picked' : ''}`,
    html: `<svg viewBox="0 0 28 38" width="28" height="38" aria-hidden="true"><path d="M14 1C6.8 1 1 6.7 1 13.7 1 23.4 14 37 14 37s13-13.6 13-23.3C27 6.7 21.2 1 14 1z" fill="${color}" stroke="rgba(0,0,0,.35)" stroke-width="1.2"/><circle cx="14" cy="13.5" r="5" fill="#fff" fill-opacity=".92"/></svg>`,
    iconSize: [28, 38], iconAnchor: [14, 37], popupAnchor: [0, -34],
  }))
  return icons.get(key)
}
const pulseIcon = L.divIcon({ className: 'pulse-wrap', html: '<span class="pulse"></span>', iconSize: [28, 28], iconAnchor: [14, 14] })

/** Live map. Pulses fire when a NEW activity row arrives (existing rows at load never pulse). */
export default function NetworkMap({ picked = [], onPick }) {
  const s = useStore()
  const seen = useRef(null)
  const [pulses, setPulses] = useState([])
  useEffect(() => {
    if (seen.current === null) { seen.current = new Set(s.activity.map((a) => a.id)); return }
    const fresh = s.activity.filter((a) => !seen.current.has(a.id) && CAMPUSES.some((c) => c.id === a.campusId))
    s.activity.forEach((a) => seen.current.add(a.id))
    if (!fresh.length) return
    const ps = fresh.map((a) => ({ key: a.id, campusId: a.campusId }))
    setPulses((p) => [...p, ...ps])
    const t = setTimeout(() => setPulses((p) => p.filter((x) => !ps.includes(x))), 1800)
    return () => clearTimeout(t)
  }, [s.activity])

  const days = (c) => { const t = lastActivityTs(c.id, s); return t ? Math.floor((Date.now() - t) / 86400000) : null }
  return (
    <MapContainer center={[36.2, -118.2]} zoom={6} zoomControl={false} scrollWheelZoom className="gmap h-[520px] w-full overflow-hidden rounded-2xl border border-white/10" aria-label="Map of Manara West campuses">
      <TileLayer attribution="Tiles &copy; Esri" maxZoom={19} url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}" />
      <ZoomControl position="bottomright" />
      {s.links.map((l) => {
        const a = campusById(l.a), b = campusById(l.b), w = pairActivity(l.a, l.b, s)
        return (
          <Polyline key={l.a + l.b} positions={[[a.lat, a.lng], [b.lat, b.lng]]} pathOptions={{ color: LINK, weight: 3 + Math.min(11, w / 2.5), opacity: 0.8, lineCap: 'round' }}>
            <Tooltip sticky>{a.short} ↔ {b.short} · activity {w}</Tooltip>
          </Polyline>
        )
      })}
      {CAMPUSES.map((c) => {
        const fading = isFading(c.id, s), on = picked.includes(c.id)
        return (
          <Marker key={c.id} position={[c.lat, c.lng]} icon={pin(fading ? PIN.fading : PIN[c.type], on)} zIndexOffset={on ? 1000 : fading ? 500 : 0} eventHandlers={{ click: () => onPick?.(c.id) }}>
            <Popup>
              <b className="gmap-title">{c.name}</b>
              <div className="gmap-sub">{c.type === 'cc' ? 'Community college' : '4-year university'}</div>
              <div>Strength <b>{strength(c.id, s)}</b>/100 · {s.users.filter((u) => u.campusId === c.id && u.role === 'student').length} students</div>
              <div style={{ color: fading ? PIN.fading : '#188038' }}>{fading ? `Fading · ${days(c)}d idle` : `Active ${days(c)}d ago`}</div>
            </Popup>
          </Marker>
        )
      })}
      {pulses.map((p) => { const c = campusById(p.campusId); return <Marker key={p.key} position={[c.lat, c.lng]} icon={pulseIcon} interactive={false} zIndexOffset={2000} /> })}
    </MapContainer>
  )
}
