// Shared framer-motion presets. Import these instead of inventing per-component springs.
export const spring = {
  ui: { type: 'spring', stiffness: 380, damping: 32 },
  sheet: { type: 'spring', stiffness: 260, damping: 30 },
  pop: { type: 'spring', stiffness: 500, damping: 18 },
}

export const page = {
  initial: { opacity: 0, y: 12, filter: 'blur(6px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)', transition: spring.sheet },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
}

export const stagger = { animate: { transition: { staggerChildren: 0.04 } } }
export const item = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0, transition: spring.ui } }
