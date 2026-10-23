import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { navItems, site } from '../data/site'

export default function Navbar({ onOpenSearch }) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => setOpen(false), [pathname])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`navbar ${scrolled ? 'is-scrolled' : ''} ${open ? 'is-open' : ''}`}>
      <div className="container navbar__inner">
        <Link to="/" className="logo" aria-label={`${site.name} 홈`}>
          <span className="logo__mark" aria-hidden="true">
            <svg viewBox="0 0 32 32">
              <path d="M5 11 16 4l11 7M7 11h18M9 13v11M14 13v11M18 13v11M23 13v11M6 26h20" />
            </svg>
          </span>
          <span className="logo__text">
            <strong>{site.name}</strong>
            <small>{site.nameKo}</small>
          </span>
        </Link>

        <nav className="navbar__nav" aria-label="주 메뉴">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => `navbar__link ${isActive ? 'is-active' : ''}`}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="navbar__actions">
          <button type="button" className="icon-btn" onClick={onOpenSearch} aria-label="검색 열기">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <kbd className="navbar__kbd">Ctrl K</kbd>
          </button>
          <button
            type="button"
            className="icon-btn navbar__burger"
            aria-label={open ? '메뉴 닫기' : '메뉴 열기'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>
    </header>
  )
}
