import Reveal from './Reveal'

/** 각 탭 상단의 페이지 헤더 */
export default function PageHeader({ eyebrow, title, description, icon, children }) {
  return (
    <header className="page-header">
      <div className="page-header__stars" aria-hidden="true" />
      <div className="container page-header__inner">
        <Reveal>
          {eyebrow && <p className="eyebrow eyebrow--gold">{eyebrow}</p>}
          <h1>
            {icon && <span className="page-header__icon" aria-hidden="true">{icon}</span>}
            {title}
          </h1>
          {description && <p className="page-header__desc">{description}</p>}
          {children}
        </Reveal>
      </div>
    </header>
  )
}
