import { useRef, useState } from 'react'
import {
  motion,
  useMotionValue,
  useMotionTemplate,
  useSpring,
  useTransform,
  useReducedMotion,
} from 'framer-motion'
import Khatam, { KhatamPath } from './Khatam.jsx'

const SOFT = { stiffness: 220, damping: 22, mass: 0.6 }

/**
 * The passport as a physical object: tilts toward the cursor, can be dragged
 * and thrown, snaps home on release, and takes a stamp with a thump. Built as
 * a real travel document — embossed cover, holder panel, and a machine-
 * readable zone along the bottom edge.
 */
export default function PassportCard({
  name = 'Omar Khalid',
  route = 'San Diego Mesa → UC San Diego',
  space = 'brother',
  track = 'Transfer',
  stamps = [],
  filled,
  draggable = true,
  photo,
  className = '',
}) {
  const reduced = useReducedMotion()
  const ref = useRef(null)

  // Pointer position, normalised to -0.5…0.5, drives tilt and the glare.
  const px = useMotionValue(0)
  const py = useMotionValue(0)
  const rx = useSpring(useTransform(py, [-0.5, 0.5], [13, -13]), SOFT)
  const ry = useSpring(useTransform(px, [-0.5, 0.5], [-16, 16]), SOFT)
  const glareX = useTransform(px, [-0.5, 0.5], ['15%', '85%'])
  const glareY = useTransform(py, [-0.5, 0.5], ['5%', '80%'])
  const glare = useMotionTemplate`radial-gradient(420px circle at ${glareX} ${glareY}, #ffd98a38, transparent 62%)`

  // While dragging, lean into the direction of travel.
  const dx = useMotionValue(0)
  const dy = useMotionValue(0)
  const dragTilt = useSpring(useTransform(dx, [-240, 240], [-18, 18]), { stiffness: 160, damping: 18 })

  const shown = typeof filled === 'number' ? filled : stamps.length

  const move = (e) => {
    const el = ref.current
    if (!el || reduced) return
    const r = el.getBoundingClientRect()
    px.set((e.clientX - r.left) / r.width - 0.5)
    py.set((e.clientY - r.top) / r.height - 0.5)
  }

  const rest = () => {
    px.set(0)
    py.set(0)
  }

  return (
    <div className={`[perspective:1400px] ${className}`}>
      {/* glow pooled under the card */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 blur-3xl"
        style={{
          background:
            'radial-gradient(60% 50% at 50% 45%, #ffc24733, transparent 70%), radial-gradient(45% 40% at 65% 70%, #7c5cff2e, transparent 70%)',
        }}
        animate={reduced ? {} : { opacity: [0.75, 1, 0.75], scale: [1, 1.05, 1] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        ref={ref}
        onPointerMove={move}
        onPointerLeave={rest}
        drag={draggable && !reduced}
        dragElastic={0.14}
        dragSnapToOrigin
        dragTransition={{ bounceStiffness: 180, bounceDamping: 18 }}
        onDrag={(_, i) => {
          dx.set(i.offset.x)
          dy.set(i.offset.y)
        }}
        onDragEnd={() => {
          dx.set(0)
          dy.set(0)
        }}
        whileDrag={{ scale: 1.04, cursor: 'grabbing' }}
        style={{
          rotateX: rx,
          rotateY: ry,
          rotateZ: dragTilt,
          transformStyle: 'preserve-3d',
          cursor: draggable ? 'grab' : 'default',
        }}
        className="relative aspect-[3/4.1] w-full max-w-[340px] touch-none rounded-[26px] select-none"
      >
        {/* cover */}
        <div
          className="absolute inset-0 overflow-hidden rounded-[26px] border"
          style={{
            borderColor: '#e3b04b55',
            background:
              'linear-gradient(158deg,#1b2d63 0%,#0d1838 45%,#0a1230 100%)',
            boxShadow:
              '0 44px 90px -24px #000c, 0 10px 30px -12px #00000090, inset 0 1px 0 #ffffff1f, inset 0 0 0 1px #ffffff0a',
          }}
        >
          {/* embossed khatam, catching the light */}
          <svg className="absolute -top-16 -right-16 size-64 opacity-[0.13]" viewBox="-60 -60 120 120" aria-hidden="true">
            <g fill="none" stroke="#F6D58A" strokeWidth="1.1">
              <KhatamPath r={52} />
              <KhatamPath r={36} />
              <circle r="22" />
            </g>
          </svg>

          {/* glare follows the pointer */}
          <motion.div className="pointer-events-none absolute inset-0" style={{ background: glare }} aria-hidden="true" />

          <div className="relative flex h-full flex-col p-5" style={{ transform: 'translateZ(40px)' }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="font-mono text-[9px] tracking-[0.22em] text-gold/80 uppercase">Manara West</p>
                <p className="font-display text-[19px] leading-tight text-cream">Rihla Passport</p>
              </div>
              <Khatam size={22} stroke="var(--color-gold)" width={1.1} />
            </div>

            <div className="mt-4 flex items-center gap-3">
              <Holder photo={photo} name={name} />
              <div className="min-w-0">
                <p className="truncate font-display text-[26px] leading-none text-cream">{name}</p>
                <p className="mt-1 truncate text-[11px] text-mute">{route}</p>
                <p className="mt-1.5 inline-block rounded-full px-2 py-0.5 font-mono text-[9px] tracking-wider uppercase"
                   style={space === 'sister'
                     ? { background: '#b58cff22', color: '#d2b8ff' }
                     : { background: '#5b8cff22', color: '#9db9ff' }}>
                  {space === 'sister' ? '🟪 Sisters' : '🟦 Brothers'} · {track}
                </p>
              </div>
            </div>

            {/* stamp pages */}
            <div className="mt-4 grid flex-1 grid-cols-3 content-start gap-2">
              {stamps.map((s, i) => (
                <Stamp key={s + i} label={s} on={i < shown} index={i} />
              ))}
            </div>

            {/* machine-readable zone */}
            <div className="mt-3 border-t border-dashed border-gold/25 pt-2">
              <p className="truncate font-mono text-[8.5px] leading-[1.5] tracking-[0.14em] text-gold/45">
                {mrz(name, space, shown)}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

/** Holder photo, or a generated khatam monogram when there is no file yet. */
function Holder({ photo, name }) {
  const [failed, setFailed] = useState(false)
  if (photo && !failed) {
    return (
      <img
        src={photo}
        alt=""
        onError={() => setFailed(true)}
        className="size-[58px] shrink-0 rounded-xl object-cover"
        style={{ boxShadow: '0 0 0 1.5px #e3b04b66, 0 6px 16px #0007' }}
      />
    )
  }
  return (
    <div
      className="relative grid size-[58px] shrink-0 place-items-center overflow-hidden rounded-xl"
      style={{ background: 'linear-gradient(150deg,#243a7d,#121f4a)', boxShadow: '0 0 0 1.5px #e3b04b66' }}
      aria-hidden="true"
    >
      <svg className="absolute inset-0 size-full opacity-30" viewBox="-60 -60 120 120">
        <g fill="none" stroke="#F6D58A" strokeWidth="2">
          <KhatamPath r={48} />
        </g>
      </svg>
      <span className="relative font-display text-xl text-gold2">
        {name.split(' ').slice(0, 2).map((p) => p[0]).join('')}
      </span>
    </div>
  )
}

/** A stamp: dashed and empty, or struck in gold at a slight angle. */
function Stamp({ label, on, index }) {
  const tilt = ((index * 37) % 15) - 7
  return (
    <motion.div
      initial={false}
      animate={on ? { scale: 1, opacity: 1, rotate: tilt } : { scale: 1, opacity: 1, rotate: 0 }}
      className="relative grid aspect-square place-items-center rounded-full text-center"
      style={
        on
          ? {
              border: '1.6px solid var(--color-gold)',
              background: 'radial-gradient(circle at 35% 30%, #e3b04b26, #e3b04b0d)',
              boxShadow: '0 0 14px -2px #e3b04b55',
            }
          : { border: '1.4px dashed #e3b04b33' }
      }
    >
      {on && label && (
        <motion.span
          initial={{ scale: 2.6, opacity: 0, rotate: -34 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 18 }}
          className="font-mono text-[8.5px] leading-[1.1] tracking-wide text-gold uppercase"
        >
          {label}
        </motion.span>
      )}
    </motion.div>
  )
}

const mrz = (name, space, n) => {
  const surname = (name.split(' ').pop() || 'TRAVELLER').toUpperCase().replace(/[^A-Z]/g, '')
  const given = (name.split(' ')[0] || '').toUpperCase().replace(/[^A-Z]/g, '')
  return `P<MNW${surname}<<${given}<<<<<<<<<<${space[0].toUpperCase()}${String(n).padStart(2, '0')}<<<`
}
