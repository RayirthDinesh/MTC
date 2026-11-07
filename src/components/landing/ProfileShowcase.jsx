import { useRef, useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from 'framer-motion'
import { KhatamPath } from './Khatam.jsx'

/**
 * Two profiles side by side, each showing only its own space. This is the
 * clearest way to make the boundary visible: the same product, two feeds, no
 * overlap between them anywhere on screen.
 *
 * Photos are optional. Drop files at public/people/{sister,brother}.jpg and
 * they appear; until then each profile falls back to a khatam monogram.
 */
const PROFILES = [
  {
    space: 'sister',
    photo: '/people/sister.jpg',
    name: 'Aisha Noor',
    headline: 'CS @ San Diego Mesa · transferring to UCSD',
    campus: 'San Diego Mesa College',
    level: 'Traveler',
    accent: '#b58cff',
    tint: '#b58cff',
    badges: ['Transfer Track', 'Peer Tutor', '6 campuses'],
    stats: [
      ['7', 'stamps'],
      ['24', 'sisters'],
      ['3', 'campuses'],
    ],
    feed: [
      ['Fatima Z.', 'Bioengineering @ UCSD', 'Made the Mesa → UCSD transfer'],
      ['Sumayya P.', 'CS @ UC Berkeley', 'Mentors transfer students'],
      ['Khadija A.', 'Nursing @ De Anza', 'Same transfer cycle'],
    ],
  },
  {
    space: 'brother',
    photo: '/people/brother.jpg',
    name: 'Omar Khalid',
    headline: 'CS @ San Diego Mesa · transferring to UCSD',
    campus: 'San Diego Mesa College',
    level: 'Traveler',
    accent: '#5b8cff',
    tint: '#5b8cff',
    badges: ['Transfer Track', 'Halaqa Regular', '4 campuses'],
    stats: [
      ['6', 'stamps'],
      ['19', 'brothers'],
      ['3', 'campuses'],
    ],
    feed: [
      ['Bilal R.', 'CS @ UCSD', 'Made the Mesa → UCSD transfer'],
      ['Idris M.', 'Public Health @ SDSU', 'MSA outreach chair'],
      ['Yusuf A.', 'Mech E @ De Anza', 'Same transfer cycle'],
    ],
  },
]

export default function ProfileShowcase() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {PROFILES.map((p) => (
        <ProfileCard key={p.space} {...p} />
      ))}
    </div>
  )
}

function ProfileCard({ space, photo, name, headline, campus, level, accent, badges, stats, feed }) {
  const reduced = useReducedMotion()
  const ref = useRef(null)
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [6, -6]), { stiffness: 200, damping: 22 })
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-7, 7]), { stiffness: 200, damping: 22 })

  const move = (e) => {
    const el = ref.current
    if (!el || reduced) return
    const r = el.getBoundingClientRect()
    mx.set((e.clientX - r.left) / r.width - 0.5)
    my.set((e.clientY - r.top) / r.height - 0.5)
  }

  return (
    <motion.article
      ref={ref}
      onPointerMove={move}
      onPointerLeave={() => {
        mx.set(0)
        my.set(0)
      }}
      style={{ rotateX: rx, rotateY: ry, transformStyle: 'preserve-3d', perspective: 1200 }}
      className="relative overflow-hidden rounded-[26px] border border-white/10"
    >
      <div
        className="absolute inset-0 -z-10"
        style={{ background: 'linear-gradient(180deg,#141f45,#0b1530)' }}
      />

      {/* cover */}
      <div className="relative h-24 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              space === 'sister'
                ? 'linear-gradient(110deg,#7c5cff,#b06ab3 55%,#ff7a3d)'
                : 'linear-gradient(110deg,#1b3a8f,#3f6bd8 55%,#ffc247)',
          }}
        />
        <svg className="absolute inset-0 size-full text-white/25" aria-hidden="true">
          <defs>
            <pattern id={`cover-${space}`} width="64" height="64" patternUnits="userSpaceOnUse">
              <g transform="translate(32 32)" fill="none" stroke="currentColor" strokeWidth="0.8">
                <KhatamPath r={22} />
              </g>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#cover-${space})`} />
        </svg>
        <span
          className="absolute top-3 right-3 rounded-full px-2.5 py-1 text-[11px] font-medium backdrop-blur-md"
          style={{ background: '#0b1530b3', color: space === 'sister' ? '#d2b8ff' : '#9db9ff' }}
        >
          {space === 'sister' ? '🟪 Sisters space' : '🟦 Brothers space'}
        </span>
      </div>

      <div className="px-6 pt-0 pb-6">
        <div className="-mt-11 flex items-end justify-between gap-3">
          <Avatar photo={photo} name={name} accent={accent} />
          <button
            type="button"
            className="mb-1 rounded-full px-4 py-1.5 text-[13px] font-medium transition-transform duration-200 hover:scale-[1.04] active:scale-95"
            style={{ background: accent + '26', color: accent, boxShadow: `inset 0 0 0 1px ${accent}66` }}
          >
            + Connect
          </button>
        </div>

        <h3 className="mt-3 text-[26px] leading-tight">{name}</h3>
        <p className="text-[14px] text-cream/80">{headline}</p>
        <p className="mt-0.5 text-[13px] text-mute">
          {campus} · <span style={{ color: 'var(--color-sun)' }}>{level}</span>
        </p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {badges.map((b) => (
            <span
              key={b}
              className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11.5px] text-mute"
            >
              {b}
            </span>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
          {stats.map(([n, l]) => (
            <div key={l} className="text-center">
              <div className="font-display text-2xl" style={{ color: accent }}>
                {n}
              </div>
              <div className="text-[11px] text-mute">{l}</div>
            </div>
          ))}
        </div>

        <p className="mt-5 font-mono text-[11px] tracking-[0.14em] text-mute uppercase">
          Suggested for {name.split(' ')[0]}
        </p>
        <ul className="mt-2 grid gap-1.5">
          {feed.map(([who, what, why]) => (
            <li
              key={who}
              className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] px-3 py-2 transition-colors hover:bg-white/[0.06]"
            >
              <span
                className="grid size-9 shrink-0 place-items-center rounded-full font-display text-[13px]"
                style={{ background: accent + '1f', color: accent }}
              >
                {who.split(' ').map((s) => s[0]).join('')}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13.5px]">{who}</span>
                <span className="block truncate text-[11.5px] text-mute">{what} · {why}</span>
              </span>
              <span className="shrink-0 text-[12px]" style={{ color: accent }}>
                Connect
              </span>
            </li>
          ))}
        </ul>
      </div>
    </motion.article>
  )
}

function Avatar({ photo, name, accent }) {
  const [failed, setFailed] = useState(false)
  const common = 'size-[88px] shrink-0 rounded-2xl object-cover'
  if (photo && !failed) {
    return (
      <img
        src={photo}
        alt={name}
        onError={() => setFailed(true)}
        className={common}
        style={{ boxShadow: `0 0 0 3px #0b1530, 0 0 0 4.5px ${accent}99, 0 10px 26px #0009` }}
      />
    )
  }
  return (
    <div
      className="relative grid size-[88px] shrink-0 place-items-center overflow-hidden rounded-2xl"
      style={{
        background: 'linear-gradient(150deg,#243a7d,#121f4a)',
        boxShadow: `0 0 0 3px #0b1530, 0 0 0 4.5px ${accent}99, 0 10px 26px #0009`,
      }}
    >
      <svg className="absolute inset-0 size-full opacity-25" viewBox="-60 -60 120 120" aria-hidden="true">
        <g fill="none" stroke={accent} strokeWidth="2.5">
          <KhatamPath r={48} />
        </g>
      </svg>
      <span className="relative font-display text-2xl" style={{ color: accent }}>
        {name.split(' ').slice(0, 2).map((p) => p[0]).join('')}
      </span>
    </div>
  )
}
