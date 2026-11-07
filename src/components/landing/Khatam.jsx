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
