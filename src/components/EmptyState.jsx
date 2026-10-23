/** 준비 중 / 결과 없음 표시 */
export default function EmptyState({ icon = '🌙', title = '준비 중입니다', children, compact = false }) {
  return (
    <div className={`empty ${compact ? 'empty--compact' : ''}`}>
      <span className="empty__icon" aria-hidden="true">{icon}</span>
      <strong>{title}</strong>
      {children && <p>{children}</p>}
    </div>
  )
}
