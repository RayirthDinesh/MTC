import { useId } from 'react'

// Ink color per track. Mentor/visit stamps ("x:") use the Career color.
export const TRACK_INK = { Career: '#e3b04b', Leadership: '#2db5a6', Transfer: '#8fb4ff', Deen: '#c9a8ff' }
// Manara West mark gradient (orange -> pink -> purple), redrawn from their logo: three pointed arches.
const MARK = ['#ff8a3d', '#e0457b', '#8a4fe0']

const Gradient = ({ id }) => (
  <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
    {MARK.map((c, i) => <stop key={c} offset={i / 2} stopColor={c} />)}
  </linearGradient>
)
const Noise = ({ id, seed = 3 }) => (
  <filter id={id} x="-5%" y="-5%" width="110%" height="110%">
    <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={seed} result="n" />
    <feDisplacementMap in="SourceGraphic" in2="n" scale="1.5" />
  </filter>
)
/** The Manara-style triple arch, centered on cx at baseline y. */
const arches = (cx, base, w = 5, h = 17) =>
  [-1, 0, 1].map((k) => { const x = cx + k * (w * 2 + 1.5), t = base - h
    return `M${x - w} ${base} V${t + 8} Q${x - w} ${t + 3} ${x} ${t - 2} Q${x + w} ${t + 3} ${x + w} ${t + 8} V${base}` }).join(' ')

const ARCH_OUT = 'M10 134 V60 C10 34 36 14 60 4 C84 14 110 34 110 60 V134 Z'
const ARCH_IN = 'M18 126 V61 C18 40 40 22 60 14 C80 22 102 40 102 61 V126 Z'

/** Passport stamp: Manara-arch shape, gradient double outline, lighthouse emblem, campus + stamp name plate. */
export default function Stamp({ campus, label, track = 'Career', className = '' }) {
  const uid = useId().replace(/:/g, '')
  const ink = TRACK_INK[track] ?? TRACK_INK.Career
  const top = String(campus).toUpperCase().slice(0, 16)
  const bottom = String(label).toUpperCase().slice(0, 22)
  return (
    <svg viewBox="0 0 120 140" role="img" aria-label={`${label} stamp from ${campus}`} className={className} style={{ color: ink }}>
      <defs><Gradient id={`g${uid}`} /><Noise id={`n${uid}`} seed={uid.length} />
        <radialGradient id={`f${uid}`} cx=".5" cy=".4"><stop offset="0" stopColor="currentColor" stopOpacity=".22" /><stop offset="1" stopColor="currentColor" stopOpacity=".04" /></radialGradient></defs>
      <g filter={`url(#n${uid})`} fill="none">
        <path d={ARCH_OUT} fill={`url(#f${uid})`} stroke={`url(#g${uid})`} strokeWidth="3.2" strokeLinejoin="round" />
        <path d={ARCH_IN} stroke={`url(#g${uid})`} strokeWidth="1.1" strokeDasharray="1 2.4" strokeLinecap="round" />
        <path d={arches(60, 40)} stroke={`url(#g${uid})`} strokeWidth="1.6" strokeLinejoin="round" />
        <g transform="translate(60 72) scale(.82) translate(-60 -58)" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M55.5 78 L57 56 H63 L64.5 78 Z" fill="currentColor" fillOpacity=".25" />
          <path d="M53.5 56 H66.5" /><path d="M56 53 Q60 41 64 53" fill="currentColor" fillOpacity=".25" /><path d="M60 41 V37" />
          <path d="M51 50 L40 45 M69 50 L80 45 M50 58 L38 60 M70 58 L82 60" strokeWidth="1.2" opacity=".8" /><path d="M52 78 H68" />
        </g>
        <rect x="20" y="98" width="80" height="27" rx="4" fill={`url(#g${uid})`} fillOpacity=".2" stroke={`url(#g${uid})`} strokeWidth="1.2" />
      </g>
      <g fill="currentColor" fontFamily="Geist Mono, monospace" textAnchor="middle">
        <text x="60" y="110" fontSize="10.5" fontWeight="700" textLength={top.length > 9 ? 72 : undefined} lengthAdjust="spacingAndGlyphs">{top}</text>
        <text x="60" y="120.5" fontSize="6.8" fontWeight="600" opacity=".9" textLength={bottom.length > 15 ? 72 : undefined} lengthAdjust="spacingAndGlyphs">{bottom}</text>
      </g>
    </svg>
  )
}

/** Empty slot in the passport book. */
export const EmptyStamp = ({ className = '' }) => (
  <svg viewBox="0 0 120 140" aria-hidden="true" className={className}>
    <path d={ARCH_OUT} fill="none" stroke="#e3b04b" strokeOpacity=".22" strokeWidth="2" strokeDasharray="3 4" />
    <path d={arches(60, 70, 6, 20)} fill="none" stroke="#e3b04b" strokeOpacity=".16" strokeWidth="1.4" />
  </svg>
)

const GLYPH = {
  Career: <><rect x="28" y="40" width="24" height="16" rx="2.5" /><path d="M35 40 v-4 h10 v4 M28 48 h24" /></>,
  Leadership: <path d="M40 33 L44 43 L55 44 L47 51 L49 62 L40 56 L31 62 L33 51 L25 44 L36 43 Z" />,
  Transfer: <path d="M29 58 L51 36 M39 36 H51 V48" />,
  Deen: <path d="M47 34 A15 15 0 1 0 47 62 A12 12 0 1 1 47 34 Z" />,
  College: <path d="M29 58 V46 Q29 42 34 38 Q37 41 37 46 V58 M37 58 V46 Q37 41 42 36 Q47 41 47 46 V58 M47 58 V46 Q47 42 51 38 Q56 42 56 46 V58" />,
}
/** Small arch-shaped badge. `track` picks the glyph + ink; track 'College' is the campus badge. */
export function Badge({ track = 'Career', label, className = '', private: priv = false }) {
  const uid = useId().replace(/:/g, '')
  const ink = track === 'College' ? '#f6d58a' : TRACK_INK[track] ?? TRACK_INK.Career
  const text = String(label).toUpperCase().slice(0, 16)
  return (
    <svg viewBox="0 0 80 100" role="img" aria-label={`${label} badge${priv ? ' (private)' : ''}`} className={className} style={{ color: ink }}>
      <defs><Gradient id={`g${uid}`} /><radialGradient id={`f${uid}`} cx=".5" cy=".4"><stop offset="0" stopColor="currentColor" stopOpacity=".25" /><stop offset="1" stopColor="currentColor" stopOpacity=".05" /></radialGradient></defs>
      <path d="M5 95 V44 C5 26 22 12 40 3 C58 12 75 26 75 44 V95 Z" fill={`url(#f${uid})`} stroke={`url(#g${uid})`} strokeWidth="3" strokeLinejoin="round" />
      <path d="M11 89 V45 C11 31 25 19 40 11 C55 19 69 31 69 45 V89 Z" fill="none" stroke={`url(#g${uid})`} strokeWidth="1" strokeDasharray="1 2.2" strokeLinecap="round" />
      <g fill={track === 'Leadership' || track === 'Deen' ? 'currentColor' : 'none'} fillOpacity=".3" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">{GLYPH[track] ?? GLYPH.Career}</g>
      <text x="40" y="79" textAnchor="middle" fontSize="8.4" fontWeight="700" fontFamily="Geist Mono, monospace" fill="currentColor" textLength={text.length > 8 ? 56 : undefined} lengthAdjust="spacingAndGlyphs">{text}</text>
      {priv && <text x="40" y="88" textAnchor="middle" fontSize="6" fill="currentColor" opacity=".7" fontFamily="Geist Mono, monospace">PRIVATE</text>}
    </svg>
  )
}
