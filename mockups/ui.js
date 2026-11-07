/* Shared helpers for the mockups (classic script so it works from file://). */
(function () {
  // Campus crests: monograms in each school's colors. PLACEHOLDERS: swap for official logo files (public/logos/<id>.svg).
  const CAMPUS = {
    ucla: ['UCLA', '#2774AE', '#FFD100'], ucb: ['CAL', '#003262', '#FDB515'], ucsd: ['UCSD', '#182B49', '#C69214'],
    uci: ['UCI', '#0064A4', '#FFD200'], ucr: ['UCR', '#2D6CC0', '#F1AB00'], usc: ['USC', '#990000', '#FFC72C'],
    sjsu: ['SJSU', '#0055A2', '#E5A823'], mesa: ['MESA', '#1B5E3B', '#F2B705'], deanza: ['DA', '#B31B1B', '#FFFFFF'],
    smc: ['SMC', '#00205B', '#FFFFFF'], stanford: ['SU', '#8C1515', '#FFFFFF'], csulb: ['LB', '#111111', '#FFC72C'],
  }
  const TRACK = { Career: '#ff9f0a', Leadership: '#30d158', Transfer: '#0a84ff', Deen: '#bf5af2' }
  const GLYPH = {
    Career: '<rect x="20" y="30" width="20" height="14" rx="2.5"/><path d="M26 30v-3.5h8V30M20 37h20"/>',
    Leadership: '<path d="M30 24l3.2 6.8 7.3.8-5.4 5 1.5 7.3L30 40l-6.6 3.9 1.5-7.3-5.4-5 7.3-.8z"/>',
    Transfer: '<path d="M22 43l17-17M29 26h10v10"/>',
    Deen: '<path d="M35 24a10 10 0 1 0 0 20 8 8 0 1 1 0-20z"/>',
  }

  const crest = (id, size = 40) => {
    const [t, p, s] = CAMPUS[id] || [id.toUpperCase().slice(0, 4), '#3a3a3c', '#f5f5f7'] // fallback monogram
    const fs = t.length <= 2 ? 17 : t.length === 3 ? 13.5 : t.length === 4 ? 11.5 : 10
    return `<svg class="crest" width="${size}" height="${size}" viewBox="0 0 48 48" role="img" aria-label="${t} crest"><circle cx="24" cy="24" r="23.5" fill="${p}"/><circle cx="24" cy="24" r="20" fill="none" stroke="${s}" stroke-width="1.5"/><text x="24" y="24.5" text-anchor="middle" dominant-baseline="central" font-family="-apple-system,Inter,sans-serif" font-weight="800" font-size="${fs}" fill="${s}" letter-spacing="-.02em">${t}</text></svg>`
  }

  // Passport stamp: one thin arch outline (Manara mark), lighthouse glyph, flat track color.
  const stamp = (code, label, track = 'Career', cls = '') => `<svg viewBox="0 0 100 116" class="${cls}" style="color:${TRACK[track]}" role="img" aria-label="${label} stamp from ${code}"><path d="M8 112V48C8 26 30 10 50 3c20 7 42 23 42 45v64z" fill="currentColor" fill-opacity=".07" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M46.5 66l1.2-16h4.6l1.2 16zM44.5 50h11M47 47.5Q50 38 53 47.5M50 38v-3M42 44l-7-3M58 44l7-3M41 51l-8 1M59 51l8 1M43 66h14"/></g><text x="50" y="87" text-anchor="middle" font-family="-apple-system,Inter,sans-serif" font-size="13" font-weight="700" fill="currentColor" letter-spacing=".02em">${code}</text><text x="50" y="102" text-anchor="middle" font-family="-apple-system,Inter,sans-serif" font-size="7.5" fill="currentColor" fill-opacity=".8" letter-spacing=".08em">${label.toUpperCase()}</text></svg>`
  const emptyStamp = () => '<svg viewBox="0 0 100 116" aria-hidden="true" style="color:var(--t3)"><path d="M8 112V48C8 26 30 10 50 3c20 7 42 23 42 45v64z" fill="none" stroke="currentColor" stroke-opacity=".5" stroke-width="1.5" stroke-dasharray="3 5"/></svg>'

  const badge = (track, label, size = 56) => `<svg width="${size}" height="${size * 1.17}" viewBox="0 0 60 70" role="img" aria-label="${label} badge" style="color:${TRACK[track]}"><path d="M4 66V30C4 17 17 7 30 2c13 5 26 15 26 28v36z" fill="currentColor" fill-opacity=".1" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><g fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${GLYPH[track]}</g><text x="30" y="60" text-anchor="middle" font-family="-apple-system,Inter,sans-serif" font-size="7" font-weight="700" fill="currentColor" letter-spacing=".06em">${label.toUpperCase()}</text></svg>`

  const lighthouse = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9.5 21l1-11h3l1 11zM8 21h8M10 10l2-4 2 4M12 6V4M7 7l-3-1M17 7l3-1"/></svg>'

  // sheets / alerts
  const open = (id) => document.getElementById(id).classList.add('open')
  const close = (id) => document.getElementById(id).classList.remove('open')
  document.addEventListener('click', (e) => { if (e.target.classList?.contains('scrim')) e.target.classList.remove('open'); const c = e.target.closest('[data-close]'); if (c) c.closest('.scrim').classList.remove('open'); const o = e.target.closest('[data-open]'); if (o) open(o.dataset.open) })
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') document.querySelectorAll('.scrim.open').forEach((s) => s.classList.remove('open')) })

  let tt
  const toast = (msg) => { const t = document.getElementById('toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('show'), 2200) }

  // segmented control: sliding thumb
  const seg = (el, onChange) => {
    const thumb = document.createElement('i'); thumb.className = 'thumb'; el.prepend(thumb)
    const btns = [...el.querySelectorAll('button')]
    const place = (b) => { thumb.style.width = b.offsetWidth + 'px'; thumb.style.transform = `translateX(${b.offsetLeft}px)` }
    btns.forEach((b) => b.addEventListener('click', () => { btns.forEach((x) => x.setAttribute('aria-selected', x === b)); place(b); onChange?.(b.dataset.v) }))
    const first = btns.find((b) => b.getAttribute('aria-selected') === 'true') || btns[0]; first.setAttribute('aria-selected', true)
    requestAnimationFrame(() => place(first)); addEventListener('resize', () => place(btns.find((b) => b.getAttribute('aria-selected') === 'true')))
  }

  const initTheme = () => {
    const root = document.documentElement
    const saved = (() => { try { return localStorage.getItem('rihla-mock-theme') } catch { return null } })()
    root.dataset.theme = saved || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark')
    document.getElementById('theme')?.addEventListener('click', () => { root.dataset.theme = root.dataset.theme === 'light' ? 'dark' : 'light'; try { localStorage.setItem('rihla-mock-theme', root.dataset.theme) } catch {} })
  }

  // Google-style map (Leaflet + Esri street tiles)
  const pinIcon = (color, size = 1) => L.divIcon({ className: 'gpin', html: `<svg viewBox="0 0 28 38" width="${28 * size}" height="${38 * size}"><path d="M14 1C6.8 1 1 6.7 1 13.7 1 23.4 14 37 14 37s13-13.6 13-23.3C27 6.7 21.2 1 14 1z" fill="${color}" stroke="rgba(0,0,0,.35)" stroke-width="1.2"/><circle cx="14" cy="13.5" r="5" fill="#fff" fill-opacity=".92"/></svg>`, iconSize: [28 * size, 38 * size], iconAnchor: [14 * size, 37 * size], popupAnchor: [0, -34 * size] })
  const map = (el, { center, zoom = 6, bounds, pins = [], links = [], you }) => {
    const m = L.map(el, { zoomControl: false, scrollWheelZoom: false, attributionControl: true })
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', { attribution: 'Tiles © Esri', maxZoom: 19 }).addTo(m)
    L.control.zoom({ position: 'bottomright' }).addTo(m)
    links.forEach(([a, b, w]) => L.polyline([a, b], { color: '#1a73e8', weight: w, opacity: .8, lineCap: 'round' }).addTo(m))
    pins.forEach((p) => L.marker([p.lat, p.lng], { icon: pinIcon(p.color) }).addTo(m).bindPopup(p.popup))
    if (you) L.marker([you.lat, you.lng], { icon: L.divIcon({ className: 'gpin', html: '<span class="you-dot"></span>', iconSize: [18, 18], iconAnchor: [9, 9] }), interactive: false }).addTo(m)
    if (bounds) m.fitBounds(bounds, { padding: [40, 40], maxZoom: 11 }); else m.setView(center, zoom)
    return m
  }
  const miles = (a, b) => { const r = (d) => d * Math.PI / 180, h = Math.sin(r(b[0] - a[0]) / 2) ** 2 + Math.cos(r(a[0])) * Math.cos(r(b[0])) * Math.sin(r(b[1] - a[1]) / 2) ** 2; return 3958.8 * 2 * Math.asin(Math.sqrt(h)) }

  window.UI = { CAMPUS, TRACK, crest, stamp, emptyStamp, badge, lighthouse, open, close, toast, seg, initTheme, map, miles }
})()
