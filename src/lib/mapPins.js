// Shared map pieces (admin map + student's nearby-events map). Google Maps flavored.
export const PIN = { cc: '#34a853', '4yr': '#fbbc04', fading: '#ea4335', event: '#ea4335' }
export const LINK = '#1a73e8'

const PATH = 'M14 1C6.8 1 1 6.7 1 13.7 1 23.4 14 37 14 37s13-13.6 13-23.3C27 6.7 21.2 1 14 1z'
/** Teardrop marker icon. `picked` enlarges it. */
export const pinIcon = (maps, color, picked = false) => ({ path: PATH, fillColor: color, fillOpacity: 1, strokeColor: '#000', strokeOpacity: 0.3, strokeWeight: 1, scale: picked ? 1.3 : 1, anchor: new maps.Point(14, 37) })
/** Google's blue "you are here" dot. */
export const youIcon = (maps) => ({ path: maps.SymbolPath.CIRCLE, scale: 8, fillColor: '#1a73e8', fillOpacity: 1, strokeColor: '#fff', strokeWeight: 3 })
/** Expanding ring at a point; removes itself after 1.6s. */
export function pulse(maps, map, lat, lng) {
  const max = 1.2e6 / 2 ** map.getZoom(), c = new maps.Circle({ map, center: { lat, lng }, radius: 1, strokeColor: LINK, strokeWeight: 2, fillColor: LINK, fillOpacity: 0.3, clickable: false, zIndex: 2000 }), t0 = performance.now()
  const f = (t) => { const k = (t - t0) / 1600; if (k >= 1) return c.setMap(null); c.setRadius(max * (1 - (1 - k) ** 3)); c.setOptions({ fillOpacity: 0.3 * (1 - k), strokeOpacity: 1 - k }); requestAnimationFrame(f) }
  requestAnimationFrame(f)
}

const rad = (d) => (d * Math.PI) / 180
/** Great-circle distance in miles. */
export const miles = (a, b) => {
  const h = Math.sin(rad(b.lat - a.lat) / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(rad(b.lng - a.lng) / 2) ** 2
  return 3958.8 * 2 * Math.asin(Math.sqrt(h))
}
