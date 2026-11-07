// Google Maps JS API loader. Set VITE_GMAPS_KEY in .env to enable pins, links and pulses; without it GMap falls back to a plain Google embed.
const KEY = import.meta.env.VITE_GMAPS_KEY
export const hasMaps = !!KEY

let p
export const loadMaps = () => (p ??= new Promise((res, rej) => {
  if (!KEY) return rej(new Error('no key'))
  window.__gmReady = () => res(window.google.maps)
  const s = document.createElement('script')
  s.src = `https://maps.googleapis.com/maps/api/js?key=${KEY}&callback=__gmReady&v=weekly`
  s.onerror = rej
  document.head.appendChild(s)
}))
