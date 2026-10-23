import { Link } from 'react-router-dom'

/** 범용 카드. to 가 있으면 링크, 없으면 정적 카드 */
export default function ContentCard({ to, icon, eyebrow, title, description, footer, accent = 'navy', className = '', children }) {
  const body = (
    <>
      {icon && <span className="content-card__icon" aria-hidden="true">{icon}</span>}
      {eyebrow && <p className="content-card__eyebrow">{eyebrow}</p>}
      <h3 className="content-card__title">{title}</h3>
      {description && <p className="content-card__desc">{description}</p>}
      {children}
      {footer && <div className="content-card__footer">{footer}</div>}
    </>
  )
  const cls = `card content-card accent-${accent} ${to ? 'card--link' : ''} ${className}`
  return to ? (
    <Link to={to} className={cls}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  )
}
