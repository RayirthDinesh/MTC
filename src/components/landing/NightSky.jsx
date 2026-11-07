import { useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

/** Hero backdrop: stars, a dawn glow on the horizon, and the lighthouse. */
export default function NightSky() {
  const reduced = useReducedMotion()

  // Deterministic placement — a reseeded field flickers between renders.
  const stars = useMemo(
    () =>
      Array.from({ length: 48 }, (_, i) => ({
        left: `${Math.abs((Math.sin(i * 12.9898) * 43758.5453) % 1) * 100}%`,
        top: `${Math.abs((Math.sin(i * 78.233) * 12345.6789) % 1) * 70}%`,
        size: 1 + (i % 3) * 0.5,
        delay: (i % 9) * 0.4,
      })),
    [],
  )

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {stars.map((s, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full bg-[#cfe0ff]"
          style={{ left: s.left, top: s.top, width: s.size, height: s.size }}
          animate={reduced ? {} : { opacity: [0.2, 0.85, 0.2] }}
          transition={{ duration: 4 + (i % 4), repeat: Infinity, delay: s.delay, ease: 'easeInOut' }}
        />
      ))}

      {/* dawn sitting on the horizon */}
      <div
        className="absolute inset-x-0 bottom-0 h-[60%]"
        style={{ background: 'radial-gradient(90% 90% at 50% 125%, #ff7a3d33, transparent 68%)' }}
      />

      {/* the beam */}
      <motion.div
        className="absolute bottom-[150px] left-1/2 h-[130vh] w-[160vw] origin-bottom -translate-x-1/2"
        style={{
          background:
            'conic-gradient(from 180deg at 50% 100%, transparent 160deg, #ffc2471c 173deg, #ffd98a3d 180deg, #ffc2471c 187deg, transparent 200deg)',
        }}
        animate={reduced ? {} : { rotate: [-17, 17] }}
        transition={{ duration: 10, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
      />

      <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
        <svg width="130" height="180" viewBox="0 0 130 180">
          <defs>
            <radialGradient id="lamp">
              <stop offset="0" stopColor="#ffd98a" />
              <stop offset="1" stopColor="#ffd98a00" />
            </radialGradient>
          </defs>
          <circle cx="65" cy="34" r="32" fill="url(#lamp)" opacity=".5" />
          <path d="M53 50 L77 50 L87 162 L43 162 Z" fill="#101b40" stroke="#e3b04b40" strokeWidth="1" />
          {[72, 96, 120, 144].map((y, i) => (
            <path
              key={y}
              d={`M${50 + i * 0.8} ${y} L${80 - i * 0.8} ${y} l1.2 11 L${48.8 + i * 0.8} ${y + 11} Z`}
              fill="#e3b04b"
              opacity=".15"
            />
          ))}
          <rect x="47" y="43" width="36" height="8" rx="2" fill="#0a1230" stroke="#e3b04b55" strokeWidth="1" />
          <rect x="54" y="24" width="22" height="19" rx="3" fill="#120d05" stroke="#e3b04b80" strokeWidth="1" />
          <motion.rect
            x="56.5"
            y="26.5"
            width="17"
            height="14"
            rx="2"
            fill="#ffd98a"
            animate={reduced ? {} : { opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          />
          <path d="M51 24 L65 11 L79 24 Z" fill="#0a1230" stroke="#e3b04b80" strokeWidth="1" />
          <path d="M20 162 Q65 152 110 162 L120 180 L10 180 Z" fill="#070d20" stroke="#e3b04b1f" strokeWidth="1" />
        </svg>
      </div>
    </div>
  )
}
