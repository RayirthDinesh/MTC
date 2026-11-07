import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useMotionValue, useSpring, useReducedMotion } from 'framer-motion'

const MotionLink = motion.create(Link)
const PULL = { stiffness: 260, damping: 18, mass: 0.5 }

const SKINS = {
  sun: {
    background: 'linear-gradient(176deg,#ffd98a,#ffc247 42%,#ff9a3c)',
    color: '#30190a',
    boxShadow: '0 10px 30px -8px #ff9a3c80, inset 0 2px 0 #ffffff6b, inset 0 -2px 0 #b9631f33',
  },
  violet: {
    background: 'linear-gradient(176deg,#9b86ff,#7c5cff 60%,#5b3fd1)',
    color: '#ffffff',
    boxShadow: '0 10px 30px -8px #7c5cff7a, inset 0 2px 0 #ffffff40',
  },
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
      <span className="rihla-sheen" aria-hidden="true" />
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
        .rihla-magnet .rihla-sheen {
          position: absolute;
          inset: 0;
          translate: -130% 0;
          background: linear-gradient(104deg, transparent 36%, #ffffffa6 50%, transparent 64%);
          transition: translate .75s cubic-bezier(.16,1,.3,1);
        }
        .rihla-magnet:hover .rihla-sheen { translate: 130% 0 }
        .rihla-magnet:focus-visible { outline: 2px solid var(--color-sun); outline-offset: 3px }
        @media (prefers-reduced-motion: reduce) { .rihla-magnet .rihla-sheen { display: none } }
      `}</style>
    </>
  )
}
