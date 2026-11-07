import { useId } from 'react'

// Ink color per track. Mentor/visit stamps ("x:") use the Career color.
export const TRACK_INK = { Career: '#e3b04b', Leadership: '#2db5a6', Transfer: '#8fb4ff', Deen: '#c9a8ff' }

// 16-point star border (alternating radii), computed once.
const STAR = Array.from({ length: 32 }, (_, i) => {
  const a = (Math.PI * 2 * i) / 32 - Math.PI / 2, r = i % 2 ? 51 : 57
  return `${(60 + r * Math.cos(a)).toFixed(1)},${(60 + r * Math.sin(a)).toFixed(1)}`
}).join(' ')

/** Passport stamp: star border, double ring, curved campus + stamp text, minaret-lighthouse emblem, rough ink edge. */
export default function Stamp({ campus, label, track = 'Career', className = '' }) {
  const uid = useId().replace(/:/g, '')
  const ink = TRACK_INK[track] ?? TRACK_INK.Career
  const top = String(campus).toUpperCase().slice(0, 14)
  const bottom = String(label).toUpperCase().slice(0, 18)
  return (
    <svg viewBox="0 0 120 120" role="img" aria-label={`${label} stamp from ${campus}`} className={className} style={{ color: ink }}>
      <defs>
        <filter id={`ink${uid}`} x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={uid.length} result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="1.6" />
        </filter>
        <path id={`t${uid}`} d="M 20 60 A 40 40 0 0 1 100 60" />
        <path id={`b${uid}`} d="M 16 60 A 44 44 0 0 0 104 60" />
        <radialGradient id={`g${uid}`}><stop offset="0" stopColor="currentColor" stopOpacity=".22" /><stop offset="1" stopColor="currentColor" stopOpacity=".05" /></radialGradient>
      </defs>
      <g filter={`url(#ink${uid})`} fill="none" stroke="currentColor">
        <polygon points={STAR} fill={`url(#g${uid})`} strokeWidth="1.6" strokeLinejoin="round" />
        <circle cx="60" cy="60" r="46" strokeWidth="1.4" />
        <circle cx="60" cy="60" r="29" strokeWidth="1" strokeDasharray="2 2.5" />
        {/* minaret + lighthouse beams */}
        <g strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M55.5 78 L57 56 H63 L64.5 78 Z" fill="currentColor" fillOpacity=".25" />
          <path d="M53.5 56 H66.5" />
          <path d="M56 53 Q60 41 64 53" fill="currentColor" fillOpacity=".25" />
          <path d="M60 41 V37" />
          <path d="M62.6 35 A3 3 0 1 1 59.6 33.2 A2.2 2.2 0 0 0 62.6 35 Z" fill="currentColor" strokeWidth="0.8" />
          <path d="M51 50 L43 46 M69 50 L77 46 M50 58 L42 59 M70 58 L78 59" strokeWidth="1.2" opacity=".75" />
          <path d="M52 78 H68" />
        </g>
        <g fill="currentColor" stroke="none" fontFamily="Geist Mono, monospace" fontWeight="600" fontSize="9" letterSpacing="1.2">
          <text textAnchor="middle"><textPath href={`#t${uid}`} startOffset="50%">{top}</textPath></text>
          <text textAnchor="middle" fontSize="8"><textPath href={`#b${uid}`} startOffset="50%">{bottom}</textPath></text>
          <circle cx="17" cy="60" r="1.6" /><circle cx="103" cy="60" r="1.6" />
        </g>
      </g>
    </svg>
  )
}

/** Empty slot in the passport book. */
export const EmptyStamp = ({ className = '' }) => (
  <svg viewBox="0 0 120 120" aria-hidden="true" className={className}>
    <polygon points={STAR} fill="none" stroke="#e3b04b" strokeOpacity=".22" strokeWidth="1.4" strokeDasharray="3 4" />
    <circle cx="60" cy="60" r="46" fill="none" stroke="#e3b04b" strokeOpacity=".15" strokeDasharray="2 4" />
  </svg>
)
