import { CAMPUSES } from '../../data/seed.js'

/** Two copies of the campus list scrolling as one strip, so it loops seamlessly. */
export default function CampusMarquee() {
  const row = [...CAMPUSES, ...CAMPUSES]
  return (
    <div className="relative overflow-hidden py-4" aria-hidden="true">
      <div
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          background: 'linear-gradient(90deg,#070d20 0%,transparent 10%,transparent 90%,#070d20 100%)',
        }}
      />
      <div className="rihla-marquee flex w-max gap-3">
        {row.map((c, i) => (
          <span
            key={`${c.id}-${i}`}
            className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-[13px] whitespace-nowrap text-mute"
          >
            <i className={`size-1.5 rounded-full ${c.type === 'cc' ? 'bg-cc' : 'bg-gold'}`} />
            {c.name}
          </span>
        ))}
      </div>
      <style>{`
        .rihla-marquee { animation: rihla-scroll 52s linear infinite }
        @keyframes rihla-scroll { to { transform: translateX(-50%) } }
        @media (prefers-reduced-motion: reduce) { .rihla-marquee { animation: none } }
      `}</style>
    </div>
  )
}
