import { useRef, useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from 'framer-motion'
import { KhatamPath } from './Khatam.jsx'

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
  photo,
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
          className="absolute inset-0 overflow-hidden rounded-[10px] bg-[#f2ece0] text-[#0b1530]"
          style={{ boxShadow: '0 30px 60px -22px #000c, 0 2px 0 #ffffff14' }}
        >
          {/* header */}
          <div className="flex items-start justify-between border-b border-[#0b1530]/15 px-4 pt-3.5 pb-2.5">
            <div>
              <p className="font-mono text-[8px] tracking-[0.26em] uppercase opacity-60">Manara West</p>
              <p className="mt-0.5 text-[15px] font-semibold tracking-tight">Rihla Passport</p>
            </div>
            <svg width="24" height="24" viewBox="-60 -60 120 120" aria-hidden="true" fill="none" stroke="#0b1530" strokeWidth="4" opacity=".75">
              <KhatamPath r={50} />
            </svg>
          </div>

          {/* photo + fields */}
          <div className="flex gap-3.5 px-4 pt-3.5">
            <Photo photo={photo} name={name} />
            <dl className="min-w-0 flex-1 space-y-[7px]">
              <Field label="Surname" value={surname} />
              <Field label="Given names" value={givenNames} />
              <Field label="Campus" value={campus} />
              <Field label="Transferring to" value={target} />
            </dl>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-x-3 border-t border-[#0b1530]/12 px-4 pt-2.5">
            <Field label="Space" value={space === 'sister' ? 'Sisters' : 'Brothers'} />
            <Field label="Track" value={track} />
            <Field label="Level" value={level} />
          </div>

          {/* stamps, inked at angles like a real page */}
          <div className="mt-3 flex flex-wrap gap-x-1 gap-y-1 px-4">
            {stamps.map((s, i) => (
              <Stamp key={s + i} label={s} on={i < shown} index={i} />
            ))}
          </div>

          {/* machine-readable zone */}
          <div className="absolute inset-x-0 bottom-0 border-t border-[#0b1530]/15 bg-[#e7e0d0] px-4 py-2">
            {mrz(surname, givenNames, space, shown).map((line) => (
              <p key={line} className="font-mono text-[8px] leading-[1.45] tracking-[0.1em] whitespace-nowrap opacity-75">
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
      <dt className="font-mono text-[7.5px] tracking-[0.16em] uppercase opacity-50">{label}</dt>
      <dd className="truncate text-[12.5px] font-medium">{value}</dd>
    </div>
  )
}

function Photo({ photo, name }) {
  const [failed, setFailed] = useState(false)
  const box = 'h-[92px] w-[70px] shrink-0 rounded-[3px] border border-[#0b1530]/25 object-cover'
  if (photo && !failed) {
    return <img src={photo} alt="" onError={() => setFailed(true)} className={box} />
  }
  return (
    <div className={`${box} relative grid place-items-center bg-[#e4ddcc]`} aria-hidden="true">
      <svg className="absolute inset-0 size-full opacity-20" viewBox="-60 -60 120 120" fill="none" stroke="#0b1530" strokeWidth="3">
        <KhatamPath r={48} />
      </svg>
      <span className="relative text-lg font-semibold opacity-70">
        {name.split(' ').slice(0, 2).map((p) => p[0]).join('')}
      </span>
    </div>
  )
}

/** An inked circular stamp, struck at a slight angle. Empty slots stay faint. */
function Stamp({ label, on, index }) {
  const tilt = ((index * 37) % 17) - 8
  if (!on || !label) {
    return <span className="size-[46px] rounded-full border border-dashed border-[#0b1530]/15" />
  }
  return (
    <motion.span
      initial={{ scale: 2.2, opacity: 0, rotate: tilt - 24 }}
      animate={{ scale: 1, opacity: 1, rotate: tilt }}
      transition={{ type: 'spring', stiffness: 500, damping: 18 }}
      className="grid size-[46px] place-items-center rounded-full border-2 text-center font-mono text-[7.5px] leading-[1.1] tracking-wide uppercase"
      style={{ borderColor: '#9a6b1f', color: '#9a6b1f', opacity: 0.85 }}
    >
      {label}
    </motion.span>
  )
}

const pad = (s, n) => s.toUpperCase().replace(/[^A-Z]/g, '').padEnd(n, '<').slice(0, n)
const mrz = (surname, given, space, n) => [
  `P<MNW${pad(surname, 12)}<<${pad(given, 14)}`,
  `${pad(space, 1)}${String(n).padStart(2, '0')}MNW<<<<<<<<<<<<<<<<<<<<<<<<<`,
]
