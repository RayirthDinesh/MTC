import { useEffect, useRef, useState } from 'react'
import { hasMaps, loadMaps } from '../lib/gmaps.js'

/** Google Map. Calls onMap(map, maps) once ready. No key (or load failure): plain Google embed, no overlays. */
export default function GMap({ center, zoom = 6, onMap, className = '', label }) {
  const ref = useRef(null)
  const cb = useRef(onMap)
  cb.current = onMap
  const [fail, setFail] = useState(!hasMaps)
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
  return (
    <div className={`relative overflow-hidden bg-[#e5e3df] ${className}`} role="region" aria-label={label}>
      {fail
        ? <><iframe title="Google Map" loading="lazy" className="h-full w-full border-0" src={`https://maps.google.com/maps?q=${center[0]},${center[1]}&z=${zoom}&output=embed`} />
          <p className="absolute bottom-3 left-3 rounded-lg bg-white px-2.5 py-1.5 text-xs text-[#202124] shadow">Set VITE_GMAPS_KEY to show pins and links</p></>
        : <div ref={ref} className="h-full w-full" />}
    </div>
  )
}
