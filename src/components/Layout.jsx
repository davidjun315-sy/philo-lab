import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import Search from './Search'
import ScrollToTop from './ScrollToTop'

export default function Layout() {
  const [searchOpen, setSearchOpen] = useState(false)

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
      <Navbar onOpenSearch={() => setSearchOpen(true)} />
      <main id="main" tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
      <Search open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
