import { useRef, useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from 'framer-motion'
import { KhatamPath } from './Khatam.jsx'

/**
 * The same profile surface, twice — one sisters', one brothers'. Showing the
 * two feeds never touching makes the point without a paragraph about it.
 *
 * Photos are optional: drop public/people/{sister,brother}.jpg and they
 * appear; until then each falls back to a khatam monogram.
 */
const PROFILES = [
  {
    space: 'sister',
    photo: '/people/sister.jpg',
    name: 'Aisha Noor',
    sub: 'CS · Mesa → UCSD',
    accent: '#b58cff',
    cover: '#7c5cff',
    feed: ['Fatima Z. · UCSD', 'Sumayya P. · Berkeley', 'Khadija A. · De Anza'],
  },
  {
    space: 'brother',
    photo: '/people/brother.jpg',
    name: 'Omar Khalid',
    sub: 'CS · Mesa → UCSD',
    accent: '#5b8cff',
    cover: '#3f6bd8',
    feed: ['Bilal R. · UCSD', 'Idris M. · SDSU', 'Yusuf A. · De Anza'],
  },
]

export default function ProfileShowcase() {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {PROFILES.map((p) => (
        <Card key={p.space} {...p} />
      ))}
    </div>
  )
}

function Card({ space, photo, name, sub, accent, cover, feed }) {
  const reduced = useReducedMotion()
  const ref = useRef(null)
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [5, -5]), { stiffness: 200, damping: 22 })
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-6, 6]), { stiffness: 200, damping: 22 })

  return (
    <motion.article
      ref={ref}
      onPointerMove={(e) => {
        if (reduced || !ref.current) return
        const r = ref.current.getBoundingClientRect()
        mx.set((e.clientX - r.left) / r.width - 0.5)
        my.set((e.clientY - r.top) / r.height - 0.5)
      }}
      onPointerLeave={() => {
        mx.set(0)
        my.set(0)
      }}
      style={{ rotateX: rx, rotateY: ry, transformStyle: 'preserve-3d', perspective: 1200 }}
      className="overflow-hidden rounded-3xl border border-white/10 bg-[#101a3c]"
    >
      <div className="relative h-16" style={{ background: cover }}>
        <span
          className="absolute top-3 right-3 rounded-full bg-[#0b1530cc] px-2.5 py-1 text-[11px] backdrop-blur-md"
          style={{ color: accent }}
        >
          {space === 'sister' ? '🟪 Sisters' : '🟦 Brothers'}
        </span>
      </div>

      <div className="px-5 pb-5">
        <div className="-mt-9">
          <Avatar photo={photo} name={name} accent={accent} />
        </div>
        <h3 className="mt-3 text-[22px] font-semibold">{name}</h3>
        <p className="text-[13px] text-mute">{sub}</p>

        <ul className="mt-4 grid gap-1">
          {feed.map((who) => (
            <li key={who} className="flex items-center justify-between rounded-lg px-2 py-1.5 text-[13px] hover:bg-white/5">
              <span className="text-cream/85">{who}</span>
              <span style={{ color: accent }}>Connect</span>
            </li>
          ))}
        </ul>
      </div>
    </motion.article>
  )
}

function Avatar({ photo, name, accent }) {
  const [failed, setFailed] = useState(false)
  const ring = { boxShadow: `0 0 0 3px #101a3c, 0 0 0 4.5px ${accent}99` }
  if (photo && !failed) {
    return (
      <img
        src={photo}
        alt={name}
        onError={() => setFailed(true)}
        className="size-[72px] rounded-2xl object-cover"
        style={ring}
      />
    )
  }
  return (
    <div
      className="relative grid size-[72px] place-items-center overflow-hidden rounded-2xl bg-[#1b2b5e]"
      style={ring}
    >
      <svg className="absolute inset-0 size-full opacity-25" viewBox="-60 -60 120 120" aria-hidden="true">
        <g fill="none" stroke={accent} strokeWidth="2.5">
          <KhatamPath r={48} />
        </g>
      </svg>
      <span className="relative text-xl font-semibold" style={{ color: accent }}>
        {name.split(' ').slice(0, 2).map((p) => p[0]).join('')}
      </span>
    </div>
  )
}
