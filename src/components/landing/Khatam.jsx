/**
 * The eight-point khatam star — the page's structural motif. It is the stamp
 * shape, the section divider, and the shape of the glow behind the lighthouse.
 * Two overlaid squares at 45°, which is how the figure is actually constructed.
 */
export function KhatamPath({ r = 50 }) {
  const pts = (rot) =>
    Array.from({ length: 4 }, (_, i) => {
      const a = ((rot + i * 90) * Math.PI) / 180
      return `${Math.cos(a) * r},${Math.sin(a) * r}`
    }).join(' ')
  return (
    <>
      <polygon points={pts(0)} />
      <polygon points={pts(45)} />
    </>
  )
}

/** Outlined star, for ornament. */
export default function Khatam({ size = 28, stroke = 'currentColor', width = 1, className = '', style }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="-60 -60 120 120"
      className={className}
      style={style}
      aria-hidden="true"
      fill="none"
      stroke={stroke}
      strokeWidth={width * (120 / size)}
      strokeLinejoin="round"
    >
      <KhatamPath r={50} />
    </svg>
  )
}

/** Horizontal rule with a star at its centre. Separates the page's chapters. */
export function StarRule({ className = '' }) {
  return (
    <div className={`flex items-center gap-4 ${className}`} aria-hidden="true">
      <span className="h-px flex-1 bg-gradient-to-r from-transparent to-gold/30" />
      <Khatam size={20} stroke="var(--color-gold)" width={1} />
      <span className="h-px flex-1 bg-gradient-to-l from-transparent to-gold/30" />
    </div>
  )
}

/** Tiling geometric field used as a faint background texture. */
export function KhatamField({ className = '', opacity = 0.1 }) {
  return (
    <svg className={className} aria-hidden="true" style={{ opacity }}>
      <defs>
        <pattern id="khatam-field" width="90" height="90" patternUnits="userSpaceOnUse">
          <g transform="translate(45 45)" fill="none" stroke="currentColor" strokeWidth="0.7">
            <KhatamPath r={30} />
            <circle r="18" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#khatam-field)" />
    </svg>
  )
}
