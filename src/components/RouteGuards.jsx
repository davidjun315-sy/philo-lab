import { Link, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * 화면 단 접근 제어 (사용자 경험용).
 * ※ 실제 데이터 보호는 DB Row Level Security 와 Edge Function 의 역할 확인이 담당합니다.
 */
export function PageLoading({ label = '불러오는 중…' }) {
  return (
    <div className="page-loading" role="status">
      <span className="page-loading__spinner" aria-hidden="true" />
      {label}
    </div>
  )
}

const loginPath = (location, mode) => `/login?${mode ? `mode=${mode}&` : ''}next=${encodeURIComponent(location.pathname + location.search)}`

export function RequireLogin({ children }) {
  const { ready, account } = useAuth()
  const location = useLocation()
  if (!ready) return <PageLoading />
  if (!account) return <Navigate to={loginPath(location)} replace />
  return children
}

export function RequireStudent({ children }) {
  const { ready, account, student } = useAuth()
  const location = useLocation()
  if (!ready) return <PageLoading />
  if (!account) return <Navigate to={loginPath(location)} replace />
  if (!student) return <AccessDenied title="학생 전용 페이지입니다" message="학생 계정으로 로그인하면 나의 생각실험실을 볼 수 있습니다." />
  return children
}

export function RequireAdmin({ children }) {
  const { ready, account, isAdmin } = useAuth()
  const location = useLocation()
  if (!ready) return <PageLoading />
  if (!account) return <Navigate to={loginPath(location, 'admin')} replace />
  if (!isAdmin) return <AccessDenied title="관리자만 접근할 수 있습니다" message="이 페이지는 관리자 권한이 있는 계정만 이용할 수 있습니다." />
  return children
}

export function AccessDenied({ title, message }) {
  return (
    <section className="not-found">
      <div className="container not-found__inner">
        <p className="not-found__code">403</p>
        <h1>{title}</h1>
        <p>{message}</p>
        <div className="not-found__actions">
          <Link to="/" className="btn btn--gold">
            HOME으로
          </Link>
        </div>
      </div>
    </section>
  )
}
