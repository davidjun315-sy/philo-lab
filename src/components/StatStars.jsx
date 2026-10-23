/** 능력치 ★ 표시 (1~5) */
export default function StatStars({ label, value, max = 5 }) {
  return (
    <div className="stat">
      <span className="stat__label">{label}</span>
      <span className="stat__stars" aria-label={`${label} ${value}점 / ${max}점`}>
        {Array.from({ length: max }, (_, i) => (
          <span key={i} className={i < value ? 'on' : 'off'} aria-hidden="true">
            {i < value ? '★' : '☆'}
          </span>
        ))}
      </span>
      <span className="stat__bar" aria-hidden="true">
        <span style={{ width: `${(value / max) * 100}%` }} />
      </span>
    </div>
  )
}
