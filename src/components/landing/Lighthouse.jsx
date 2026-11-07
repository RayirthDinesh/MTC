import { motion, useReducedMotion } from 'framer-motion'

// Tower half-width at height y: 18 at the top (y=130) widening to 30 at the base (y=360).
const hw = (y) => 18 + ((y - 130) / 230) * 12
const band = (a, b) => `${100 - hw(a)},${a} ${100 + hw(a)},${a} ${100 + hw(b)},${b} ${100 - hw(b)},${b}`

/** Flat lighthouse with a slow sweeping beam: two opposite light wedges rotating around the lantern. */
export default function Lighthouse({ className = '' }) {
  const reduced = useReducedMotion()
  const wedge = { clipPath: 'polygon(0 47%, 100% 0, 100% 100%, 0 53%)' }
  return (
    <div className={`relative ${className}`} aria-hidden="true">
      {[0, 1].map((i) => (
        <motion.i key={i} className="pointer-events-none absolute left-1/2 top-[26.8%] block h-40 w-[900px] bg-sun/15" style={{ ...wedge, transformOrigin: '0 50%', marginTop: -80, scaleX: i ? -1 : 1 }}
          animate={reduced ? { rotate: i ? 4 : -4 } : { rotate: i ? [16, -16] : [-16, 16] }} transition={{ duration: 9, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }} />
      ))}
      <svg viewBox="0 0 200 400" className="relative w-full" role="img" aria-label="Lighthouse">
        <motion.circle cx="100" cy="107" r="30" fill="#ffc247" initial={{ opacity: 0.25 }} animate={reduced ? undefined : { opacity: [0.18, 0.4, 0.18] }} transition={{ duration: 3, repeat: Infinity }} />
        <path d="M30 392 Q60 358 100 366 Q142 356 172 392 Z" fill="#1a2550" />
        <polygon points={`${100 - hw(360)},360 ${100 + hw(360)},360 ${100 + hw(130)},130 ${100 - hw(130)},130`} fill="#f6efdd" />
        <polygon points={band(130, 185)} fill="#e3b04b" /><polygon points={band(240, 295)} fill="#e3b04b" />
        <rect x="93" y="318" width="14" height="42" rx="7" fill="#2a3358" /><rect x="95" y="205" width="10" height="18" rx="5" fill="#2a3358" />
        <rect x="70" y="122" width="60" height="9" rx="2" fill="#2a3358" />
        <rect x="84" y="90" width="32" height="32" fill="#ffe9a8" /><path d="M92 90v32M100 90v32M108 90v32" stroke="#2a3358" strokeWidth="2" />
        <polygon points="78,90 122,90 100,66" fill="#2a3358" /><path d="M100 66V54" stroke="#2a3358" strokeWidth="3" strokeLinecap="round" />
      </svg>
    </div>
  )
}
