import { useRef, useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from 'framer-motion'
import { KhatamPath } from './Khatam.jsx'
import Crest from '../Crest.jsx'

const SOFT = { stiffness: 220, damping: 22, mass: 0.6 }

/**
 * The passport data page: cream paper, navy ink, photo box, labelled fields,
 * and a machine-readable zone. Flat colour throughout — a real document is
 * printed, not lit. It tilts toward the cursor and can be dragged and thrown.
 */
export default function PassportCard({
  name = 'Omar Khalid',
  campus = 'San Diego Mesa',
  target = 'UC San Diego',
  space = 'brother',
  track = 'Transfer',
  level = 'Traveler',
  stamps = [],
  filled,
  draggable = true,
  photo, // eslint-disable-line no-unused-vars
  campusId = 'mesa',
  className = '',
}) {
  const reduced = useReducedMotion()
  const ref = useRef(null)

  const px = useMotionValue(0)
  const py = useMotionValue(0)
  const rx = useSpring(useTransform(py, [-0.5, 0.5], [11, -11]), SOFT)
  const ry = useSpring(useTransform(px, [-0.5, 0.5], [-13, 13]), SOFT)

  const shown = typeof filled === 'number' ? filled : stamps.length
  const [surname, ...given] = name.split(' ').reverse()
  const givenNames = given.reverse().join(' ')

  return (
    <div className={`[perspective:1400px] ${className}`}>
      <motion.div
        ref={ref}
        onPointerMove={(e) => {
          if (reduced || !ref.current) return
          const r = ref.current.getBoundingClientRect()
          px.set((e.clientX - r.left) / r.width - 0.5)
          py.set((e.clientY - r.top) / r.height - 0.5)
        }}
        onPointerLeave={() => {
          px.set(0)
          py.set(0)
        }}
        drag={draggable && !reduced}
        dragElastic={0.12}
        dragSnapToOrigin
        dragTransition={{ bounceStiffness: 180, bounceDamping: 18 }}
        whileDrag={{ scale: 1.03, cursor: 'grabbing' }}
        style={{ rotateX: rx, rotateY: ry, cursor: draggable ? 'grab' : 'default' }}
        className="relative aspect-[3/4.05] w-full max-w-[330px] touch-none select-none"
      >
        <div
          className="absolute inset-0 overflow-hidden rounded-[20px] bg-[#101a3c] text-cream ring-1 ring-[#e3b04b]/45"
          style={{ boxShadow: '0 30px 70px -24px #000d' }}
        >
          {/* header */}
          <div className="flex items-start justify-between border-b border-white/10 px-4 pt-3.5 pb-2.5">
            <div>
              <p className="font-mono text-[8px] tracking-[0.26em] text-[#e3b04b] uppercase">Manara West</p>
              <p className="mt-0.5 text-[15px] font-semibold tracking-tight">Rihla Passport</p>
            </div>
            <svg width="24" height="24" viewBox="-60 -60 120 120" aria-hidden="true" fill="none" stroke="#e3b04b" strokeWidth="4" opacity=".9">
              <KhatamPath r={50} />
            </svg>
          </div>

          {/* photo + fields */}
          <div className="flex gap-3.5 px-4 pt-3.5">
            <Photo campusId={campusId} />
            <dl className="min-w-0 flex-1 space-y-[7px]">
              <Field label="Surname" value={surname} />
              <Field label="Given names" value={givenNames} />
              <Field label="Campus" value={campus} />
              <Field label="Transferring to" value={target} />
            </dl>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-x-3 border-t border-white/10 px-4 pt-2.5">
            <Field label="Space" value={space === 'sister' ? 'Sisters' : 'Brothers'} />
            <Field label="Track" value={track} />
            <Field label="Level" value={level} />
          </div>

          {/* stamps, inked at angles like a real page */}
          <div className="mt-4 grid grid-cols-5 gap-1.5 px-4">
            {stamps.map((s, i) => (
              <Stamp key={s + i} label={s} on={i < shown} index={i} />
            ))}
          </div>

          {/* machine-readable zone */}
          <div className="absolute inset-x-0 bottom-0 border-t border-white/10 bg-[#0b1530] px-4 py-2">
            {mrz(surname, givenNames, space, shown).map((line) => (
              <p key={line} className="font-mono text-[8px] leading-[1.45] tracking-[0.1em] whitespace-nowrap text-[#e3b04b]/60">
                {line}
              </p>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

function Field({ label, value }) {
  return (
    <div>
      <dt className="font-mono text-[7.5px] tracking-[0.16em] text-[#e3b04b]/70 uppercase">{label}</dt>
      <dd className="truncate text-[12.5px] font-medium">{value}</dd>
    </div>
  )
}

function Photo({ campusId }) {
  return <div className="grid h-[92px] w-[70px] shrink-0 place-items-center rounded-xl bg-white/5 ring-1 ring-white/10"><Crest id={campusId} size={54} /></div>
}

/** A stamp with the campus logo, struck at a slight angle. `label` is a campus id. Empty slots stay faint. */
function Stamp({ label, on, index }) {
  const tilt = ((index * 37) % 17) - 8
  if (!on || !label) return <span className="mx-auto block size-[46px] rounded-full border border-dashed border-white/15" />
  return (
    <motion.span initial={{ scale: 2.2, opacity: 0, rotate: tilt - 24 }} animate={{ scale: 1, opacity: 1, rotate: tilt }} transition={{ type: 'spring', stiffness: 500, damping: 18 }}
      className="mx-auto grid size-[46px] place-items-center rounded-full border-2 border-[#e3b04b] bg-[#e3b04b]/10">
      <Crest id={label} size={34} />
    </motion.span>
  )
}

const pad = (s, n) => s.toUpperCase().replace(/[^A-Z]/g, '').padEnd(n, '<').slice(0, n)
const mrz = (surname, given, space, n) => [
  `P<MNW${pad(surname, 12)}<<${pad(given, 14)}`,
  `${pad(space, 1)}${String(n).padStart(2, '0')}MNW<<<<<<<<<<<<<<<<<<<<<<<<<`,
]
