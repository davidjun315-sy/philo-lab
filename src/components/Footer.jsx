import { Link } from 'react-router-dom'
import { navItems, site } from '../data/site'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <p className="footer__logo">
            {site.name} <span>{site.nameKo}</span>
          </p>
          <p className="footer__slogan">“{site.slogan}”</p>
          <p className="footer__desc">{site.description}</p>
        </div>
        <nav className="footer__nav" aria-label="하단 메뉴">
          {navItems.map((item) => (
            <Link key={item.to} to={item.to}>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="container footer__bottom">
        <span>
          © {new Date().getFullYear()} {site.name}. 고등학교 윤리·철학·사회 수업 플랫폼
        </span>
        <span className="footer__laurel" aria-hidden="true">❦</span>
      </div>
    </footer>
  )
}
