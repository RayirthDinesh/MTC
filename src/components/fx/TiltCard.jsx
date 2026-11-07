import { useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from 'framer-motion'

/** React Bits-style TiltedCard: tilts toward the pointer on a spring, lifts, and settles flat on leave. */
export default function TiltCard({ children, className = '', max = 8, as: Tag = 'div' }) {
  const reduced = useReducedMotion()
  const ref = useRef(null)
  const mx = useMotionValue(0), my = useMotionValue(0)
  const sp = { stiffness: 260, damping: 22, mass: 0.5 }
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [max, -max]), sp)
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-max, max]), sp)
  const lift = useSpring(0, sp)
  const M = motion[Tag] ?? motion.div
  return (
    <M ref={ref} className={className} style={{ rotateX: rx, rotateY: ry, y: lift, transformPerspective: 900 }}
      onPointerMove={(e) => { if (reduced || e.pointerType === 'touch') return; const r = ref.current.getBoundingClientRect(); mx.set((e.clientX - r.left) / r.width - 0.5); my.set((e.clientY - r.top) / r.height - 0.5); lift.set(-4) }}
      onPointerLeave={() => { mx.set(0); my.set(0); lift.set(0) }}>
      {children}
    </M>
  )
}
