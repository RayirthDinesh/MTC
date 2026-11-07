import { useEffect, useMemo, useState } from 'react'
import { useStore, useMe } from '../lib/useStore.js'
import { visibleEvents, campusById, campusName } from '../store.js'
import { PIN, pinIcon, youIcon, pulse, miles } from '../lib/mapPins.js'
import GenderPill from './GenderPill.jsx'
import Crest from './Crest.jsx'
import GMap from './GMap.jsx'

const DAY = 86400000, RADIUS = 150
const fmt = (ts) => new Date(ts).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })

/** Upcoming events closest to the student's campus (or their GPS position) as [{...event, c, mi}] plus the origin used. */
export function useNearby(me, s, geo) {
  const home = campusById(me.campusId)
  const origin = geo ?? (home?.lat != null ? { lat: home.lat, lng: home.lng } : null)
  const out = useMemo(() => {
    if (!origin) return { shown: [], within: true }
    const now = Date.now()
    const all = visibleEvents(me, s).filter((e) => e.date >= now - DAY)
      .map((e) => { const c = campusById(e.campusId); return { ...e, c, mi: miles(origin, c) } })
      .sort((a, b) => a.mi - b.mi || a.date - b.date)
    const near = all.filter((e) => e.mi <= RADIUS)
    return { shown: (near.length ? near : all).slice(0, 8), within: near.length > 0 }
  }, [s, me, origin?.lat, origin?.lng]) // eslint-disable-line react-hooks/exhaustive-deps
  return { origin, ...out }
}

/** "Near you": events on a Google map and as a list. */
export default function NearbyEvents() {
  const s = useStore()
  const me = useMe()
  const [geo, setGeo] = useState(null)
  const [geoErr, setGeoErr] = useState('')
  const [g, setG] = useState(null)
  const { origin, shown, within } = useNearby(me, s, geo)

  const locate = () => navigator.geolocation?.getCurrentPosition(
    (p) => { setGeo({ lat: p.coords.latitude, lng: p.coords.longitude }); setGeoErr('') },
    () => setGeoErr('Location is blocked. Allow it in your browser to use this.'),
  ) ?? setGeoErr('Location is not supported here.')

  useEffect(() => { // pins + you-dot + fit
    if (!g || !origin) return
    const { map, maps } = g
    const iw = new maps.InfoWindow(), bounds = new maps.LatLngBounds({ lat: origin.lat, lng: origin.lng })
    const you = new maps.Marker({ map, position: { lat: origin.lat, lng: origin.lng }, icon: youIcon(maps), clickable: false, zIndex: 999 })
    const byCampus = shown.reduce((m, e) => ((m[e.campusId] ??= []).push(e), m), {})
    const pins = Object.entries(byCampus).map(([id, evs]) => {
      const c = campusById(id), mk = new maps.Marker({ map, position: { lat: c.lat, lng: c.lng }, icon: pinIcon(maps, PIN.event), animation: maps.Animation.DROP })
      bounds.extend({ lat: c.lat, lng: c.lng })
      mk.addListener('click', () => { iw.setContent(`<div style="color:#202124;font:13px/1.5 Roboto,system-ui,sans-serif"><b style="font-size:15px;font-weight:500">${c.name}</b>${evs.map((e) => `<div>${e.title.replace(/</g, '&lt;')} · ${fmt(e.date)}</div>`).join('')}</div>`); iw.open(map, mk) })
      return mk
    })
    map.fitBounds(bounds, 56)
    pulse(maps, map, origin.lat, origin.lng)
    return () => { you.setMap(null); pins.forEach((p) => p.setMap(null)); iw.close() }
  }, [g, origin?.lat, origin?.lng, shown]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section className="space-y-4" aria-label="Events near you">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div><h2 className="text-3xl">Events near you</h2>
          <p className="text-sm text-mute">{origin ? (geo ? 'From your current location' : `From ${campusName(me)}`) : 'Share a location to see events near you.'}</p></div>
        <button className="btn btn-glass !py-2 text-sm" onClick={locate}>📍 {geo ? 'Update my location' : 'Use my location'}</button>
      </div>
      {geoErr && <p role="alert" className="text-sm text-fading">{geoErr}</p>}
      {origin && <>
        {!within && <p className="text-sm text-mute">Nothing within {RADIUS} miles. Showing the closest upcoming events.</p>}
        <GMap center={[origin.lat, origin.lng]} zoom={9} onMap={(map, maps) => setG({ map, maps })} className="h-80 rounded-2xl" label="Map of nearby events" />
        <ul className="card !p-4">
          {shown.length ? shown.map((e) => (
            <li key={e.id} className="flex items-center gap-3 border-t border-white/10 py-3 first:border-0">
              <Crest id={e.campusId} size={48} />
              <div className="min-w-0 flex-1"><p className="truncate font-semibold">{e.title}</p>
                <p className="truncate text-sm text-mute">{e.c.name}{e.coHostId ? ` × ${campusById(e.coHostId)?.short}` : ''} · {fmt(e.date)}</p></div>
              <GenderPill value={e.audience} />
              <span className="shrink-0 rounded-full bg-[#1a73e8]/15 px-2.5 py-0.5 text-xs font-medium text-[#1a73e8]">{e.mi < 1 ? '<1' : Math.round(e.mi)} mi</span>
            </li>)) : <li className="text-mute">No upcoming events yet.</li>}
        </ul>
      </>}
    </section>
  )
}
