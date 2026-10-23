/** 카테고리 필터 칩 그룹. options: string[] 또는 { value, label }[] */
export default function FilterChips({ options, value, onChange, label, allLabel = '전체' }) {
  const items = [{ value: '', label: allLabel }, ...options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o))]
  return (
    <div className="chips" role="group" aria-label={label}>
      {label && <span className="chips__label">{label}</span>}
      {items.map((o) => (
        <button
          key={o.value || 'all'}
          type="button"
          className={`chip ${value === o.value ? 'is-active' : ''}`}
          aria-pressed={value === o.value}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
