import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import Search from './Search'
import ScrollToTop from './ScrollToTop'
import LoginPromptModal from './LoginPromptModal'
import { PageLoading } from './RouteGuards'
import { useContent } from '../context/ContentContext'
import { isDemoMode } from '../lib/backend'

export default function Layout() {
  const [searchOpen, setSearchOpen] = useState(false)
  const { status, error } = useContent()
  const { pathname } = useLocation()
  const bare = pathname === '/login'

  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const skipToMain = (e) => {
    e.preventDefault()
    document.getElementById('main')?.focus()
  }

  return (
    <>
      <ScrollToTop />
      <a href="#main" className="skip-link" onClick={skipToMain}>
        본문 바로가기
      </a>
      {isDemoMode && (
        <div className="mode-banner" role="note">
          🧪 데모 모드 — 실제 인증이 아니며, 데이터는 이 브라우저에만 저장됩니다.
        </div>
      )}
      {status === 'error' && (
        <div className="mode-banner mode-banner--error" role="alert">
          ⚠ 서버에서 콘텐츠를 불러오지 못해 공개 콘텐츠만 표시합니다. ({error})
        </div>
      )}
      {!bare && <Navbar onOpenSearch={() => setSearchOpen(true)} />}
      <main id="main" tabIndex={-1}>
        {status === 'loading' ? <PageLoading /> : <Outlet />}
      </main>
      {!bare && <Footer />}
      {searchOpen && <Search open onClose={() => setSearchOpen(false)} />}
      <LoginPromptModal />
    </>
  )
}
