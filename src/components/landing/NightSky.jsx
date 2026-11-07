import { useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { KhatamPath } from './Khatam.jsx'

/**
 * The hero's backdrop, in parallax layers: star field, horizon glow, the
 * lighthouse, and its sweeping beam. `y` motion values are supplied by the
 * page so each layer drifts at its own rate as you scroll.
 */
export default function NightSky({ yStars, yGlow, yTower }) {
  const reduced = useReducedMotion()

  // Deterministic placement — a reseeded random field flickers between renders.
  const stars = useMemo(
    () =>
      Array.from({ length: 70 }, (_, i) => {
        const r = Math.sin(i * 12.9898) * 43758.5453
        const r2 = Math.sin(i * 78.233) * 12345.6789
        return {
          left: `${Math.abs(r % 1) * 100}%`,
          top: `${Math.abs(r2 % 1) * 78}%`,
          size: 1 + (i % 3) * 0.6,
          delay: (i % 11) * 0.37,
          bright: i % 7 === 0,
        }
      }),
    [],
  )

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* stars */}
      <motion.div style={{ y: yStars }} className="absolute inset-0">
        {stars.map((s, i) => (
          <motion.span
            key={i}
            className="absolute rounded-full"
            style={{
              left: s.left,
              top: s.top,
              width: s.size,
              height: s.size,
              background: s.bright ? '#ffd98a' : '#cfe0ff',
              boxShadow: s.bright ? '0 0 6px #ffc247aa' : 'none',
            }}
            animate={reduced ? {} : { opacity: [0.25, 0.9, 0.25] }}
            transition={{ duration: 3.5 + (i % 5), repeat: Infinity, delay: s.delay, ease: 'easeInOut' }}
          />
        ))}
      </motion.div>

      {/* pre-dawn glow sitting on the horizon */}
      <motion.div
        style={{ y: yGlow }}
        className="absolute inset-x-0 bottom-0 h-[55%]"
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(110% 100% at 50% 118%, #ff7a3d4d 0%, #7c5cff2b 38%, transparent 68%)',
          }}
        />
      </motion.div>

      {/* rotating geometric field, very faint */}
      <motion.svg
        className="absolute top-1/2 left-1/2 size-[180%] -translate-x-1/2 -translate-y-1/2 text-gold opacity-[0.07]"
        viewBox="-200 -200 400 400"
        animate={reduced ? {} : { rotate: 360 }}
        transition={{ duration: 220, repeat: Infinity, ease: 'linear' }}
      >
        {[0, 1, 2].map((ring) => (
          <g key={ring} fill="none" stroke="currentColor" strokeWidth="0.5">
            <KhatamPath r={70 + ring * 55} />
          </g>
        ))}
      </motion.svg>

      {/* lighthouse + beam */}
      <motion.div style={{ y: yTower }} className="absolute bottom-0 left-1/2 -translate-x-1/2">
        <Lighthouse reduced={reduced} />
      </motion.div>
    </div>
  )
}

function Lighthouse({ reduced }) {
  return (
    <div className="relative">
      {/* the beam, anchored at the lamp */}
      <motion.div
        className="absolute bottom-[190px] left-1/2 h-[140vh] w-[170vw] origin-bottom -translate-x-1/2"
        style={{
          background:
            'conic-gradient(from 180deg at 50% 100%, transparent 158deg, #ffc2471f 172deg, #ffd98a44 180deg, #ffc2471f 188deg, transparent 202deg)',
          filter: 'blur(2px)',
        }}
        animate={reduced ? {} : { rotate: [-19, 19] }}
        transition={{ duration: 9, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
      />

      <svg width="170" height="230" viewBox="0 0 170 230" className="relative">
        <defs>
          <linearGradient id="tower" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#0a1230" />
            <stop offset=".45" stopColor="#1b2b5e" />
            <stop offset="1" stopColor="#060c20" />
          </linearGradient>
          <radialGradient id="lamp">
            <stop offset="0" stopColor="#fff3cf" />
            <stop offset=".5" stopColor="#ffc247" />
            <stop offset="1" stopColor="#ff7a3d00" />
          </radialGradient>
        </defs>

        {/* lamp halo */}
        <circle cx="85" cy="42" r="40" fill="url(#lamp)" opacity=".55" />

        {/* tower */}
        <path d="M70 62 L100 62 L112 206 L58 206 Z" fill="url(#tower)" stroke="#e3b04b4d" strokeWidth="1" />
        {/* the classic banding, in gold */}
        {[92, 122, 152, 182].map((y, i) => (
          <path
            key={y}
            d={`M${66.5 + i * 0.9} ${y} L${103.5 - i * 0.9} ${y} l${1.5} 14 L${65 + i * 0.9} ${y + 14} Z`}
            fill="#e3b04b"
            opacity={0.17}
          />
        ))}
        {/* gallery + lamp room */}
        <rect x="62" y="54" width="46" height="9" rx="2" fill="#0a1230" stroke="#e3b04b66" strokeWidth="1" />
        <rect x="71" y="30" width="28" height="25" rx="3" fill="#120d05" stroke="#e3b04b88" strokeWidth="1" />
        <motion.rect
          x="74"
          y="33"
          width="22"
          height="19"
          rx="2"
          fill="#ffd98a"
          animate={reduced ? {} : { opacity: [0.75, 1, 0.75] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* cap */}
        <path d="M68 30 L85 14 L102 30 Z" fill="#0a1230" stroke="#e3b04b88" strokeWidth="1" />
        <circle cx="85" cy="11" r="2.6" fill="#ffc247" />
        {/* base rock */}
        <path d="M34 206 Q85 194 136 206 L150 230 L20 230 Z" fill="#070d20" stroke="#e3b04b26" strokeWidth="1" />
      </svg>
    </div>
  )
}
