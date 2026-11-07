import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useMotionValue, useSpring, useReducedMotion } from 'framer-motion'

const MotionLink = motion.create(Link)
const PULL = { stiffness: 260, damping: 18, mass: 0.5 }

const SKINS = {
  sun: { background: '#ffc247', color: '#2a1a05' },
  violet: { background: '#7c5cff', color: '#ffffff' },
  glass: {
    background: '#ffffff0f',
    color: 'var(--color-cream)',
    boxShadow: 'inset 0 0 0 1px #ffffff26, 0 8px 24px -12px #000a',
  },
}

/**
 * Button that leans toward the cursor as it approaches, with a sheen that
 * sweeps across on hover and a lit rim beneath. Renders a Link when given
 * `to`, otherwise a button.
 */
export default function MagneticButton({
  to,
  onClick,
  children,
  variant = 'sun',
  className = '',
  type = 'button',
  ...rest
}) {
  const reduced = useReducedMotion()
  const ref = useRef(null)
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const x = useSpring(mx, PULL)
  const y = useSpring(my, PULL)

  const move = (e) => {
    const el = ref.current
    if (!el || reduced) return
    const r = el.getBoundingClientRect()
    mx.set(((e.clientX - r.left) / r.width - 0.5) * 16)
    my.set(((e.clientY - r.top) / r.height - 0.5) * 10)
  }
  const leave = () => {
    mx.set(0)
    my.set(0)
  }

  const shared = {
    ref,
    onPointerMove: move,
    onPointerLeave: leave,
    style: { x, y, ...SKINS[variant] },
    whileTap: { scale: 0.96 },
    transition: { type: 'spring', stiffness: 380, damping: 32 },
    className: `rihla-magnet relative inline-flex items-center justify-center overflow-hidden rounded-2xl px-6 py-3.5 text-[15px] font-medium no-underline ${className}`,
  }

  const inner = (
    <>
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </>
  )

  return (
    <>
      {to ? (
        <MotionLink to={to} {...shared} {...rest}>
          {inner}
        </MotionLink>
      ) : (
        <motion.button type={type} onClick={onClick} {...shared} {...rest}>
          {inner}
        </motion.button>
      )}
      <style>{`
        .rihla-magnet:focus-visible { outline: 2px solid var(--color-sun); outline-offset: 3px }
      `}</style>
    </>
  )
}
