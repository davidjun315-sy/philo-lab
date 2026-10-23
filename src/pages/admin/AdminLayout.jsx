import { NavLink, Outlet } from 'react-router-dom'
import { isDemoMode } from '../../lib/backend'

const ADMIN_MENU = [
  { to: '/admin', label: '대시보드', icon: '📊', end: true },
  { to: '/admin/students', label: '학생 관리', icon: '🎓' },
  { to: '/admin/classes', label: '학급 관리', icon: '🏫' },
  { to: '/admin/lessons', label: '수업 관리', icon: '🏛️' },
  { to: '/admin/philosophers', label: '철학자 관리', icon: '📜' },
  { to: '/admin/games', label: '게임 관리', icon: '🎮' },
  { to: '/admin/projects', label: '프로젝트 관리', icon: '🧪' },
  { to: '/admin/clubs', label: '동아리 관리', icon: '🌿' },
  { to: '/admin/resources', label: '교사자료 관리', icon: '🗄️' },
  { to: '/admin/questions', label: '오늘의 철학 질문', icon: '❓' },
  { to: '/admin/visibility', label: '공개 범위 관리', icon: '🔐' },
  { to: '/admin/backup', label: '백업 · 이전', icon: '💾' },
]

/** /admin 하위 페이지 공통 레이아웃 (RequireAdmin 으로 감싸져 있음) */
export default function AdminLayout() {
  return (
    <div className="admin">
      <header className="admin-top">
        <div className="container admin-top__inner">
          <div>
            <p className="eyebrow eyebrow--gold">ADMIN DASHBOARD</p>
            <h1>PHILO LAB 관리</h1>
          </div>
          <span className={`admin-mode ${isDemoMode ? 'is-demo' : ''}`}>{isDemoMode ? '🧪 데모 모드 (이 브라우저에만 저장)' : '🟢 Supabase 연결됨'}</span>
        </div>
      </header>
      <div className="container admin-body">
        <nav className="admin-nav" aria-label="관리 메뉴">
          {ADMIN_MENU.map((m) => (
            <NavLink key={m.to} to={m.to} end={m.end} className={({ isActive }) => (isActive ? 'is-active' : '')}>
              <span aria-hidden="true">{m.icon}</span>
              {m.label}
            </NavLink>
          ))}
        </nav>
        <div className="admin-main">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
