import { useRef } from 'react'
import { motion, useScroll, useTransform, useSpring, useReducedMotion } from 'framer-motion'
import GenderPill from '../GenderPill.jsx'
import Crest from '../Crest.jsx'

/**
 * The same professional profile, twice — one sisters', one brothers'. Showing
 * the two feeds never touching makes the point without a paragraph about it.
 *
 * On scroll the pair morphs: they start low, apart and rotated outward, then
 * converge flat as the section reaches the middle of the viewport.
 */
const PROFILES = [
  {
    gender: 'sister',
    campus: 'mesa',
    name: 'Aisha Noor',
    headline: 'CS student at San Diego Mesa · transferring to UCSD',
    location: 'San Diego, CA · Mesa MSA',
    level: 'Traveler',
    openTo: ['Internships', 'Mentorship'],
    stats: [['7', 'stamps'], ['24', 'sisters'], ['3', 'campuses']],
    mutual: 'Fatima Z. and 11 others',
    feed: [
      ['ucsd', 'Fatima Z.', 'Bioengineering · UCSD', 'Made the Mesa → UCSD transfer'],
      ['ucb', 'Sumayya P.', 'CS · Berkeley', 'Mentors transfer students'],
      ['deanza', 'Khadija A.', 'Nursing · De Anza', 'Same transfer cycle'],
    ],
  },
  {
    gender: 'brother',
    campus: 'mesa',
    name: 'Omar Khalid',
    headline: 'CS student at San Diego Mesa · transferring to UCSD',
    location: 'San Diego, CA · Mesa MSA',
    level: 'Traveler',
    openTo: ['Internships', 'Study group'],
    stats: [['6', 'stamps'], ['19', 'brothers'], ['3', 'campuses']],
    mutual: 'Bilal R. and 8 others',
    feed: [
      ['ucsd', 'Bilal R.', 'CS · UCSD', 'Made the Mesa → UCSD transfer'],
      ['ucla', 'Idris M.', 'Public Health · UCLA', 'MSA outreach chair'],
      ['deanza', 'Yusuf A.', 'Mech E · De Anza', 'Same transfer cycle'],
    ],
  },
]

export default function ProfileShowcase() {
  const reduced = useReducedMotion()
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'center center'] })
  const p = useSpring(scrollYProgress, { stiffness: 90, damping: 26, mass: 0.4 })

  return (
    <div ref={ref} className="grid gap-5 sm:grid-cols-2" style={{ perspective: 1400 }}>
      {PROFILES.map((profile, i) => (
        <Card key={profile.gender} {...profile} progress={p} side={i === 0 ? -1 : 1} reduced={reduced} />
      ))}
    </div>
  )
}

function Card({ progress, side, reduced, gender, campus, name, headline, location, level, openTo, stats, mutual, feed }) {
  // The morph: apart and tipped away -> together and flat.
  const x = useTransform(progress, [0, 1], [side * 56, 0])
  const y = useTransform(progress, [0, 1], [48, 0])
  const rotateY = useTransform(progress, [0, 1], [side * -11, 0])
  const scale = useTransform(progress, [0, 1], [0.93, 1])
  const opacity = useTransform(progress, [0, 0.45], [0, 1])
  const still = { x: 0, y: 0, rotateY: 0, scale: 1, opacity: 1 }

  return (
    <motion.article
      style={reduced ? still : { x, y, rotateY, scale, opacity, transformStyle: 'preserve-3d' }}
      whileHover={reduced ? undefined : { y: -5 }}
      transition={{ type: 'spring', stiffness: 400, damping: 26 }}
      className="overflow-hidden rounded-[14px] bg-navy2 ring-1 ring-white/10"
    >
      {/* cover */}
      <div className="h-[72px] bg-white/[0.07]" />

      <div className="px-5 pb-5">
        {/* identity */}
        <div className="-mt-9 flex items-end justify-between gap-3">
          <span className="inline-block rounded-full border-[3px] border-navy2">
            <Crest id={campus} size={68} />
          </span>
          <GenderPill value={gender} />
        </div>

        <h3 className="mt-3 text-[21px] leading-tight font-semibold">{name}</h3>
        <p className="mt-0.5 text-[14px] text-cream/85">{headline}</p>
        <p className="mt-1 text-[12.5px] text-mute">{location}</p>

        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          <span className="rounded-full bg-sun/15 px-2.5 py-0.5 text-[12px] font-medium text-sun">{level}</span>
          {openTo.map((o) => (
            <span key={o} className="rounded-full px-2.5 py-0.5 text-[12px] text-mute ring-1 ring-white/12">
              Open to {o}
            </span>
          ))}
        </div>

        {/* actions */}
        <div className="mt-4 flex gap-2">
          <button type="button" className="flex-1 rounded-full bg-sun py-2 text-[13.5px] font-semibold text-[#2a1a05] transition-transform hover:scale-[1.02] active:scale-95">
            Connect
          </button>
          <button type="button" className="flex-1 rounded-full py-2 text-[13.5px] font-semibold text-cream ring-1 ring-white/20 transition-colors hover:bg-white/5">
            Message
          </button>
        </div>

        <p className="mt-3 text-[12px] text-mute">{mutual} are in your space</p>

        {/* stats */}
        <div className="mt-4 flex divide-x divide-white/10 rounded-lg ring-1 ring-white/10">
          {stats.map(([n, l]) => (
            <div key={l} className="flex-1 py-2.5 text-center">
              <div className="text-[17px] leading-none font-semibold">{n}</div>
              <div className="mt-1 text-[11px] text-mute">{l}</div>
            </div>
          ))}
        </div>

        {/* people you may know */}
        <p className="mt-5 font-mono text-[10px] tracking-[0.14em] text-mute uppercase">
          People {name.split(' ')[0]} may know
        </p>
        <ul className="mt-1.5">
          {feed.map(([id, who, what, why]) => (
            <li key={who} className="flex items-center gap-3 border-t border-white/[0.08] py-2.5 first:border-0">
              <Crest id={id} size={36} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13.5px] font-medium">{who}</span>
                <span className="block truncate text-[11.5px] text-mute">{what} · {why}</span>
              </span>
              <span className="shrink-0 rounded-full px-3 py-1 text-[12px] font-semibold text-sun ring-1 ring-sun/50">
                Connect
              </span>
            </li>
          ))}
        </ul>
      </div>
    </motion.article>
  )
}
