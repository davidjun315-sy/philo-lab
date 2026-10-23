import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { navItems, site } from '../data/site'
import { useAuth } from '../context/AuthContext'

export default function Navbar({ onOpenSearch }) {
  const { pathname } = useLocation()
  // 메뉴를 연 경로를 기억 → 다른 페이지로 이동하면 자동으로 닫힘
  const [openPath, setOpenPath] = useState(null)
  const open = openPath === pathname
  const [scrolled, setScrolled] = useState(false)
  const navigate = useNavigate()
  const { account, student, isAdmin, signOut } = useAuth()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const logout = async () => {
    // 보호된 페이지(MY·관리자)에 있다면 먼저 HOME 으로 이동한 뒤 로그아웃
    navigate('/')
    await signOut()
  }

  const accountLink = isAdmin ? { to: '/admin', label: 'ADMIN' } : student ? { to: '/my', label: 'MY PHILO LAB' } : null

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
          {/* 모바일 메뉴 전용 계정 항목 */}
          <div className="navbar__mobile-account">
            {account ? (
              <>
                {accountLink && (
                  <NavLink to={accountLink.to} className="navbar__link">
                    {accountLink.label}
                  </NavLink>
                )}
                <button type="button" className="navbar__link" onClick={logout}>
                  로그아웃
                </button>
              </>
            ) : (
              <NavLink to="/login" className="navbar__link">
                로그인
              </NavLink>
            )}
          </div>
        </nav>

        <div className="navbar__actions">
          <button type="button" className="icon-btn" onClick={onOpenSearch} aria-label="검색 열기">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <kbd className="navbar__kbd">Ctrl K</kbd>
          </button>

          {account ? (
            <div className="account-chip">
              <Link to={accountLink?.to || '/'} className="account-chip__main" title={accountLink?.label}>
                <span className="account-chip__avatar" aria-hidden="true">
                  {isAdmin ? '⚙' : student?.name?.slice(0, 1)}
                </span>
                <span className="account-chip__name">{isAdmin ? '관리자' : student?.name}</span>
              </Link>
              <button type="button" className="account-chip__logout" onClick={logout} aria-label="로그아웃" title="로그아웃">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10" />
                </svg>
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn btn--gold btn--sm navbar__login">
              로그인
            </Link>
          )}

          <button
            type="button"
            className="icon-btn navbar__burger"
            aria-label={open ? '메뉴 닫기' : '메뉴 열기'}
            aria-expanded={open}
            onClick={() => setOpenPath(open ? null : pathname)}
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
