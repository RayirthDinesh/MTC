import { useEffect, useRef, useState } from 'react'
import { hasMaps, loadMaps } from '../lib/gmaps.js'

const PIN = 'M14 1C6.8 1 1 6.7 1 13.7 1 23.4 14 37 14 37s13-13.6 13-23.3C27 6.7 21.2 1 14 1z'
const proj = (lat, lng, z) => { const W = 256 * 2 ** z, s = Math.sin((lat * Math.PI) / 180); return [((lng + 180) / 360) * W, (0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * W] }

/** Highest zoom (3..11) at which every point fits inside the box, and the box's centre. */
function fit(points, w, h) {
  const lats = points.map((p) => p[0]), lngs = points.map((p) => p[1])
  const c = [(Math.min(...lats) + Math.max(...lats)) / 2, (Math.min(...lngs) + Math.max(...lngs)) / 2]
  for (let z = 11; z > 3; z--) {
    const [x0, y0] = proj(Math.max(...lats), Math.min(...lngs), z), [x1, y1] = proj(Math.min(...lats), Math.max(...lngs), z)
    if (x1 - x0 < w - 120 && y1 - y0 < h - 140) return { c, z }
  }
  return { c, z: 3 }
}

/**
 * Google Map. With VITE_GMAPS_KEY: the JS API, onMap(map, maps) once ready.
 * Without a key: a Google embed (not draggable) with our own pins/lines drawn on top from `pins` / `lines`.
 * pins: [{ id, lat, lng, color, title, sub, you }]   lines: [{ a: [lat,lng], b: [lat,lng], w }]   bounds: [[lat,lng], ...]
 */
export default function GMap({ center, zoom = 6, bounds, pins = [], lines = [], onPin, onMap, className = '', label }) {
  const ref = useRef(null)
  const cb = useRef(onMap)
  cb.current = onMap
  const [fail, setFail] = useState(!hasMaps)
  const [size, setSize] = useState({ w: 0, h: 0 })
  const [open, setOpen] = useState(null)

  useEffect(() => {
    if (!hasMaps) return
    let off = false
    loadMaps().then((maps) => {
      if (off) return
      const map = new maps.Map(ref.current, { center: { lat: center[0], lng: center[1] }, zoom, mapTypeControl: false, streetViewControl: false, fullscreenControl: false, gestureHandling: 'cooperative' })
      cb.current?.(map, maps)
    }).catch(() => setFail(true))
    return () => { off = true }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const box = useRef(null)
  useEffect(() => {
    if (!fail || !box.current) return
    const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height }))
    ro.observe(box.current)
    return () => ro.disconnect()
  }, [fail])

  let body
  if (!fail) body = <div ref={ref} className="h-full w-full" />
  else {
    const v = size.w && bounds?.length > 1 ? fit(bounds, size.w, size.h) : { c: center, z: Math.round(zoom) }
    const [xc, yc] = proj(v.c[0], v.c[1], v.z)
    const at = (lat, lng) => { const [x, y] = proj(lat, lng, v.z); return [size.w / 2 + x - xc, size.h / 2 + y - yc] }
    const sel = pins.find((p) => p.id === open)
    body = (
      <div ref={box} className="relative h-full w-full" onClick={() => setOpen(null)}>
        <iframe title="Google Map" loading="lazy" tabIndex={-1} className="pointer-events-none h-full w-full border-0" src={`https://maps.google.com/maps?ll=${v.c[0]},${v.c[1]}&z=${v.z}&output=embed`} />
        {size.w > 0 && <>
          <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
            {lines.map((l, i) => { const [x1, y1] = at(...l.a), [x2, y2] = at(...l.b); return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#1a73e8" strokeOpacity=".85" strokeWidth={l.w ?? 3} strokeLinecap="round" /> })}
          </svg>
          {pins.map((p) => { const [x, y] = at(p.lat, p.lng); return (
            <button key={p.id} type="button" aria-label={p.title} title={p.title} onClick={(e) => { e.stopPropagation(); setOpen(p.id); onPin?.(p.id) }} className="absolute transition-transform hover:scale-110"
              style={p.you ? { left: x - 9, top: y - 9 } : { left: x - 14, top: y - 37, transformOrigin: '50% 100%' }}>
              {p.you ? <span className="block h-[18px] w-[18px] rounded-full border-[3px] border-white bg-[#1a73e8] shadow" />
                : <svg viewBox="0 0 28 38" width="28" height="38" className="drop-shadow"><path d={PIN} fill={p.color} stroke="rgba(0,0,0,.35)" strokeWidth="1.2" /><circle cx="14" cy="13.5" r="5" fill="#fff" fillOpacity=".92" /></svg>}
            </button>) })}
          {sel && (() => { const [x, y] = at(sel.lat, sel.lng); return (
            <div className="pointer-events-none absolute z-10 w-max max-w-[240px] -translate-x-1/2 rounded-lg bg-white px-3 py-2 text-[13px] leading-snug text-[#202124] shadow-lg" style={{ left: x, top: y - 46, transform: 'translate(-50%,-100%)' }}>
              <b className="block text-[15px] font-medium">{sel.title}</b>{sel.sub}</div>) })()}
        </>}
      </div>)
  }
  return <div className={`relative overflow-hidden bg-[#e5e3df] ${className}`} role="region" aria-label={label}>{body}</div>
}
