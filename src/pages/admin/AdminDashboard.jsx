import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { backend, isDemoMode } from '../../lib/backend'
import { CONTENT_TYPE_KEYS, contentTypes } from '../../lib/contentTypes'
import { useContent } from '../../context/ContentContext'
import { useSchool } from '../../hooks/useSchool'
import { formatClass } from '../../lib/validation'

const ACTION = { view: '열람', complete: '완료', play: '플레이', submit: '제출' }
const TYPE_LINK = { philosophers: 'philosophers', games: 'games', questions: 'questions', lessons: 'lessons', projects: 'projects', resources: 'resources', clubs: 'clubs', clubActivities: 'clubs' }

export default function AdminDashboard() {
  const content = useContent()
  const school = useSchool()
  const [recent, setRecent] = useState([])

  useEffect(() => {
    backend.records.recentActivity(12).then(setRecent).catch(() => setRecent([]))
  }, [])

  const active = school.students.filter((s) => s.active).length
  const lockedCount = CONTENT_TYPE_KEYS.reduce((n, t) => n + content[t].filter((i) => i.visibility !== 'public').length, 0)

  return (
    <div className="admin-page">
      <div className="admin-page__head">
        <h2>대시보드</h2>
      </div>

      {isDemoMode && (
        <div className="admin-callout">
          <strong>🧪 데모 모드로 실행 중입니다.</strong>
          <p>
            지금 만드는 학생·콘텐츠는 이 브라우저에만 저장됩니다. 실제 수업에 쓰려면 README의 <b>Supabase 설정</b>을 마친 뒤 환경변수를 넣고 다시
            배포하세요.
          </p>
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => window.confirm('데모 데이터를 처음 상태로 되돌릴까요?') && backend.reset().then(() => window.location.reload())}>
            데모 데이터 초기화
          </button>
        </div>
      )}

      <div className="admin-stats">
        <Link to="/admin/students" className="admin-stat">
          <strong>{active}</strong>
          <span>활성 학생</span>
        </Link>
        <Link to="/admin/classes" className="admin-stat">
          <strong>{school.classes.length}</strong>
          <span>학급</span>
        </Link>
        {CONTENT_TYPE_KEYS.map((t) => (
          <Link key={t} to={`/admin/${TYPE_LINK[t]}`} className="admin-stat">
            <strong>{content[t].length}</strong>
            <span>
              {contentTypes[t].icon} {contentTypes[t].label}
            </span>
          </Link>
        ))}
        <Link to="/admin/visibility" className="admin-stat">
          <strong>{lockedCount}</strong>
          <span>🔐 비공개·제한 콘텐츠</span>
        </Link>
      </div>

      <div className="admin-two">
        <section className="admin-panel">
          <h3>최근 학생 활동</h3>
          {recent.length ? (
            <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>일시</th>
                  <th>학생</th>
                  <th>활동</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((r) => (
                  <tr key={r.id}>
                    <td>{new Date(r.createdAt).toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                    <td>{r.student ? `${r.student.name} (${formatClass(r.student)})` : '-'}</td>
                    <td>
                      {r.contentType}/{r.contentId} · {ACTION[r.action]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          ) : (
            <p className="muted">아직 기록된 활동이 없습니다.</p>
          )}
        </section>

        <section className="admin-panel">
          <h3>빠른 작업</h3>
          <ul className="admin-quick">
            <li>
              <Link to="/admin/students">🎓 학생 CSV 일괄 등록</Link>
            </li>
            <li>
              <Link to="/admin/questions">❓ 오늘의 철학 질문 추가</Link>
            </li>
            <li>
              <Link to="/admin/games">🔗 심리테스트·생존게임 주소 연결</Link>
            </li>
            <li>
              <Link to="/admin/clubs">🌿 새 학년도 동아리 만들기</Link>
            </li>
            <li>
              <Link to="/admin/resources">🗄️ 수업자료 등록</Link>
            </li>
          </ul>
        </section>
      </div>
    </div>
  )
}
