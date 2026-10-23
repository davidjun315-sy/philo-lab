import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/** 게스트가 제한된 기능을 눌렀을 때 뜨는 로그인 안내 */
export default function LoginPromptModal() {
  const { loginPrompt, closeLoginPrompt } = useAuth()
  const location = useLocation()

  useEffect(() => {
    if (!loginPrompt) return
    const onKey = (e) => e.key === 'Escape' && closeLoginPrompt()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [loginPrompt, closeLoginPrompt])

  if (!loginPrompt) return null
  const next = encodeURIComponent(location.pathname + location.search)

  return (
    <div className="search-overlay" onMouseDown={closeLoginPrompt}>
      <div className="login-prompt" role="dialog" aria-modal="true" aria-labelledby="login-prompt-title" onMouseDown={(e) => e.stopPropagation()}>
        <span className="login-prompt__icon" aria-hidden="true">🔐</span>
        <h2 id="login-prompt-title">로그인이 필요해요</h2>
        <p>{loginPrompt}</p>
        <div className="login-prompt__actions">
          <Link to={`/login?next=${next}`} className="btn btn--gold" onClick={closeLoginPrompt}>
            학생 로그인
          </Link>
          <button type="button" className="btn btn--ghost" onClick={closeLoginPrompt}>
            계속 둘러보기
          </button>
        </div>
      </div>
    </div>
  )
}
