import { useRef } from 'react'

/** Shared .card plus a gold spotlight that tracks the cursor and a hover lift. */
export default function SpotlightCard({ children, className = '' }) {
  const ref = useRef(null)

  const move = (e) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    el.style.setProperty('--mx', `${e.clientX - r.left}px`)
    el.style.setProperty('--my', `${e.clientY - r.top}px`)
    el.style.setProperty('--spot', '1')
  }

  return (
    <div
      ref={ref}
      onPointerMove={move}
      onPointerLeave={() => ref.current?.style.setProperty('--spot', '0')}
      className={`card rihla-spot ${className}`}
    >
      <div className="relative">{children}</div>
      <style>{`
        .rihla-spot {
          position: relative;
          overflow: hidden;
          transition: transform .5s cubic-bezier(.16,1,.3,1), border-color .3s;
        }
        .rihla-spot:hover { transform: translateY(-4px); border-color: #e3b04b55 }
        .rihla-spot::before {
          content: '';
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: var(--spot, 0);
          transition: opacity .3s;
          background: radial-gradient(400px circle at var(--mx, 50%) var(--my, 0%), #E3B04B18, transparent 60%);
        }
      `}</style>
    </div>
  )
}
