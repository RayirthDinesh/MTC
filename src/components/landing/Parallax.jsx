import { useRef } from 'react'
import { motion, useScroll, useTransform, useSpring, useReducedMotion } from 'framer-motion'

/**
 * Drifts its children as the element crosses the viewport. `speed` is how far
 * it travels in pixels across the full pass — negative moves against scroll.
 */
export default function Parallax({ children, speed = -60, className = '', style }) {
  const reduced = useReducedMotion()
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const raw = useTransform(scrollYProgress, [0, 1], [-speed / 2, speed / 2])
  const y = useSpring(raw, { stiffness: 90, damping: 24, mass: 0.4 })

  return (
    <motion.div ref={ref} style={reduced ? style : { ...style, y }} className={className}>
      {children}
    </motion.div>
  )
}

/** Breaks a child out of the centred page container to the full viewport width. */
export function FullBleed({ children, className = '' }) {
  return (
    <div className={`relative left-1/2 w-screen -translate-x-1/2 ${className}`}>{children}</div>
  )
}
