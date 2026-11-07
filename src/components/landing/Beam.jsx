/**
 * Lighthouse at night: a conic-gradient beam sweeping across a slowly rotating
 * Islamic geometric tile field. Pure CSS, so it costs nothing per frame in JS.
 * Styles are scoped here rather than in theme.css — that file is shared.
 */
export default function Beam() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <svg className="rihla-pattern" viewBox="0 0 400 400">
        <defs>
          <g id="rihla-tile">
            <rect x="-40" y="-40" width="80" height="80" fill="none" stroke="#E3B04B" strokeWidth=".6" />
            <rect
              x="-40"
              y="-40"
              width="80"
              height="80"
              fill="none"
              stroke="#E3B04B"
              strokeWidth=".6"
              transform="rotate(45)"
            />
            <circle r="28" fill="none" stroke="#E3B04B" strokeWidth=".5" />
          </g>
        </defs>
        {Array.from({ length: 5 }, (_, y) =>
          Array.from({ length: 5 }, (_, x) => (
            <use key={`${x}-${y}`} href="#rihla-tile" x={x * 80 + 40} y={y * 80 + 40} />
          )),
        )}
      </svg>
      <div className="rihla-beam" />
      <style>{`
        .rihla-pattern {
          position: absolute;
          inset: -25%;
          width: 150%;
          height: 150%;
          opacity: .15;
          animation: rihla-spin 140s linear infinite;
        }
        .rihla-beam {
          position: absolute;
          top: -14%;
          left: 50%;
          width: 150%;
          height: 130%;
          translate: -50% 0;
          transform-origin: 50% 0;
          background: conic-gradient(from 180deg at 50% 0%,
            transparent 162deg, #E3B04B2e 175deg, #F6D58A4d 180deg, #E3B04B2e 185deg, transparent 198deg);
          animation: rihla-sweep 9s ease-in-out infinite alternate;
        }
        @keyframes rihla-spin { to { rotate: 360deg } }
        @keyframes rihla-sweep { from { rotate: -20deg } to { rotate: 20deg } }
        @media (prefers-reduced-motion: reduce) {
          .rihla-pattern, .rihla-beam { animation: none }
        }
      `}</style>
    </div>
  )
}
