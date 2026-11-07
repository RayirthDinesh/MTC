import { motion, AnimatePresence } from 'framer-motion'
import { spring } from '../lib/motion.js'

/** DOM confetti burst via WAAPI (transform/opacity only). Skipped under reduced motion. */
export function fireConfetti(x = window.innerWidth / 2, y = window.innerHeight / 3) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const colors = ['#e3b04b', '#f6d58a', '#2db5a6', '#f6efdd']
  for (let i = 0; i < 44; i++) {
    const d = document.createElement('i')
    d.style.cssText = `position:fixed;left:${x}px;top:${y}px;width:8px;height:8px;border-radius:2px;pointer-events:none;z-index:80;background:${colors[i % 4]}`
    document.body.appendChild(d)
    const a = Math.random() * Math.PI * 2, v = 90 + Math.random() * 190
    d.animate([
      { transform: 'translate(0,0) rotate(0)', opacity: 1 },
      { transform: `translate(${Math.cos(a) * v}px,${Math.sin(a) * v + 140}px) rotate(${Math.random() * 720}deg)`, opacity: 0 },
    ], { duration: 1200, easing: 'cubic-bezier(.16,1,.3,1)' }).onfinish = () => d.remove()
  }
}

export function LevelUpModal({ level, onClose }) {
  return (
    <AnimatePresence>
      {level && (
        <motion.div className="fixed inset-0 z-[70] grid place-items-center bg-black/60 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Level up"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div initial={{ scale: 0.6, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }} transition={spring.pop}
            className="card w-[min(90vw,380px)] text-center" onClick={(e) => e.stopPropagation()}>
            <div className="text-5xl">✦</div>
            <p className="mt-2 font-mono text-xs uppercase tracking-widest text-gold">Level up</p>
            <h2 className="mt-1 text-5xl text-gold2">{level}</h2>
            <p className="mt-2 text-mute">Your journey continues, inshaAllah.</p>
            <button className="btn btn-gold mt-5" onClick={onClose} autoFocus>Keep going</button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
