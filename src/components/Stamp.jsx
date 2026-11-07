// Flat passport stamps and badges: one thin Manara-arch outline, lighthouse glyph, one flat ink per track. No gradients.
export const TRACK_INK = { Career: '#e08a00', Leadership: '#1e9e4a', Transfer: '#2f7df6', Deen: '#a855f7' }
const FONT = 'Geist Mono, ui-monospace, monospace'
const ARCH = 'M8 112V48C8 26 30 10 50 3c20 7 42 23 42 45v64z'

/** Passport stamp: arch outline, lighthouse emblem, campus code + stamp name. */
export default function Stamp({ campus, label, track = 'Career', className = '' }) {
  const top = String(campus).toUpperCase().slice(0, 16)
  const bottom = String(label).toUpperCase().slice(0, 18)
  return (
    <svg viewBox="0 0 100 116" role="img" aria-label={`${label} stamp from ${campus}`} className={className} style={{ color: TRACK_INK[track] ?? TRACK_INK.Career }}>
      <path d={ARCH} fill="currentColor" fillOpacity=".09" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M46.5 66l1.2-16h4.6l1.2 16zM44.5 50h11M47 47.5Q50 38 53 47.5M50 38v-3M42 44l-7-3M58 44l7-3M41 51l-8 1M59 51l8 1M43 66h14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <g fill="currentColor" fontFamily={FONT} textAnchor="middle">
        <text x="50" y="87" fontSize="12" fontWeight="700" textLength={top.length > 7 ? 70 : undefined} lengthAdjust="spacingAndGlyphs">{top}</text>
        <text x="50" y="102" fontSize="7" opacity=".85" textLength={bottom.length > 12 ? 70 : undefined} lengthAdjust="spacingAndGlyphs">{bottom}</text>
      </g>
    </svg>
  )
}

/** Empty slot in the passport book. */
export const EmptyStamp = ({ className = '' }) => (
  <svg viewBox="0 0 100 116" aria-hidden="true" className={className} style={{ color: '#9a9aa2' }}>
    <path d={ARCH} fill="none" stroke="currentColor" strokeOpacity=".6" strokeWidth="1.5" strokeDasharray="3 5" />
  </svg>
)

const GLYPH = {
  Career: <><rect x="20" y="30" width="20" height="14" rx="2.5" /><path d="M26 30v-3.5h8V30M20 37h20" /></>,
  Leadership: <path d="M30 24l3.2 6.8 7.3.8-5.4 5 1.5 7.3L30 40l-6.6 3.9 1.5-7.3-5.4-5 7.3-.8z" />,
  Transfer: <path d="M22 43l17-17M29 26h10v10" />,
  Deen: <path d="M35 24a10 10 0 1 0 0 20 8 8 0 1 1 0-20z" />,
}
/** Track badge (the college badge is the campus <Crest/>). */
export function Badge({ track = 'Career', label, className = '', private: priv = false }) {
  return (
    <svg viewBox="0 0 60 70" role="img" aria-label={`${label} badge${priv ? ' (private)' : ''}`} className={className} style={{ color: TRACK_INK[track] ?? TRACK_INK.Career }}>
      <path d="M4 66V30C4 17 17 7 30 2c13 5 26 15 26 28v36z" fill="currentColor" fillOpacity=".13" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <g fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">{GLYPH[track] ?? GLYPH.Career}</g>
      <text x="30" y="60" textAnchor="middle" fontSize="7" fontWeight="700" fontFamily={FONT} fill="currentColor" letterSpacing=".06em">{String(label).toUpperCase().slice(0, 10)}</text>
    </svg>
  )
}
