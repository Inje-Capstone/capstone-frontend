// Flat baseball illustration: two separated curved seams with perpendicular stitches.
// Geometry is shared between the seam curve and stitch placement so they stay aligned.
const STITCH_COUNT = 11
const STITCH_HALF_LENGTH = 4.6

function Seam() {
  return <g fill="none" stroke="#d93440">
    <path d="M 21 15 C 39 35 39 65 21 85" strokeWidth="2.4" strokeLinecap="round" />
    {Array.from({ length: STITCH_COUNT }, (_, index) => {
      const t = 0.07 + index * 0.86 / (STITCH_COUNT - 1)
      // Exact point and tangent of the cubic curve above.
      const x = 21 + 54 * t * (1 - t)
      const y = 15 + 60 * t + 30 * t * t - 20 * t * t * t
      const dx = 54 * (1 - 2 * t)
      const dy = 60 + 60 * t - 60 * t * t
      const length = Math.hypot(dx, dy)
      const nx = dy / length * STITCH_HALF_LENGTH
      const ny = -dx / length * STITCH_HALF_LENGTH
      return <path key={index} d={`M ${x - nx} ${y - ny} L ${x + nx} ${y + ny}`}
        strokeWidth="2.8" strokeLinecap="butt" />
    })}
  </g>
}

export default function BaseballSpinner() {
  return <div className="offline-motion">
    <svg className="offline-baseball" viewBox="0 0 100 100" width="100" height="100"
      aria-hidden="true" focusable="false">
      <circle cx="50" cy="50" r="46" fill="#fff" stroke="#c9c9c9" strokeWidth="1.5" />
      <Seam />
      <g transform="translate(100 0) scale(-1 1)"><Seam /></g>
    </svg>
  </div>
}
