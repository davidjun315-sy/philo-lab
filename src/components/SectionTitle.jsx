export default function SectionTitle({ eyebrow, title, description, action, align = 'left', light = false }) {
  return (
    <div className={`section-title section-title--${align} ${light ? 'section-title--light' : ''}`}>
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2>{title}</h2>
        {description && <p className="section-title__desc">{description}</p>}
      </div>
      {action && <div className="section-title__action">{action}</div>}
    </div>
  )
}
