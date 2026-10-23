import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useContent } from '../context/ContentContext'
import { useMyRecords } from '../hooks/useMyRecords'
import { profileFromResult } from '../data/profile'
import { formatClass } from '../lib/validation'
import ProfileCard from '../components/ProfileCard'
import EmptyState from '../components/EmptyState'
import Badge from '../components/Badge'
import Reveal from '../components/Reveal'
import { PageLoading } from '../components/RouteGuards'

const ACTION_LABEL = { view: '열람', complete: '완료', play: '플레이', submit: '제출' }
const TYPE_LABEL = { lesson: '수업', game: '게임', test: '심리테스트', quiz: '퀴즈', project: '프로젝트', club: '동아리' }
const fmtDate = (iso) => {
  const d = new Date(iso)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

/** 활동 로그 → 화면 표시용 (제목·링크는 현재 콘텐츠에서 찾아 연결) */
const useDescribe = () => {
  const c = useContent()
  return (log) => {
    switch (log.contentType) {
      case 'lesson': {
        const l = c.getLesson(log.contentId)
        return { title: l?.name || log.contentId, to: l ? `/classes/${l.subjectId}/${l.id}` : null, icon: '🏛️' }
      }
      case 'game':
      case 'test':
      case 'quiz': {
        const g = c.getGame(log.contentId)
        return { title: g?.title || log.contentId, to: g ? `/games/${g.id}` : null, icon: g?.icon || '🎮' }
      }
      case 'project': {
        const p = c.getProject(log.contentId)
        return { title: p?.title || log.contentId, to: p ? `/projects/${p.id}` : null, icon: p?.icon || '🧪' }
      }
      default:
        return { title: log.contentId, to: null, icon: '🌿' }
    }
  }
}

export default function MyPage() {
  const { student, account } = useAuth()
  const { loading, logs, results, error } = useMyRecords({ limit: 200 })
  const describe = useDescribe()
  const location = useLocation()
  const flash = location.state?.flash

  if (loading) return <PageLoading />

  const latest = profileFromResult(results[0])
  const unique = (filter) => {
    const seen = new Set()
    return logs.filter((l) => filter(l) && !seen.has(`${l.contentType}:${l.contentId}`) && seen.add(`${l.contentType}:${l.contentId}`))
  }
  const games = unique((l) => ['game', 'test', 'quiz'].includes(l.contentType) && l.action !== 'view')
  const activities = unique((l) => ['project', 'club', 'quiz'].includes(l.contentType))
  const completed = unique((l) => l.contentType === 'lesson' && l.action === 'complete')

  return (
    <>
      <section className="my-hero">
        <div className="container my-hero__inner">
          <div className="my-hero__avatar" aria-hidden="true">
            {student.name.slice(0, 1)}
          </div>
          <div>
            <p className="eyebrow eyebrow--gold">MY PHILO LAB · 나의 생각실험실</p>
            <h1>{student.name}</h1>
            <p className="my-hero__meta">
              <span>{formatClass(student)}</span>
              <span>학번 {student.studentNumber}</span>
              <span>{student.academicYear}학년도</span>
            </p>
          </div>
          <div className="my-hero__actions">
            <Link to="/my/password" className="btn btn--outline-light btn--sm">
              🔑 비밀번호 변경
            </Link>
          </div>
        </div>
      </section>

      <section className="section section--cream">
        <div className="container">
          {flash && <p className="notice notice--green">✓ {flash}</p>}
          {account?.mustChangePassword && (
            <p className="notice">
              🔑 임시 비밀번호를 사용 중입니다. <Link to="/my/password">새 비밀번호로 변경</Link>해 주세요.
            </p>
          )}
          {error && <p className="notice">⚠ 기록을 불러오지 못했습니다: {error}</p>}

          <div className="my-stats">
            <div className="card my-stat">
              <strong>{completed.length}</strong>
              <span>완료한 수업</span>
            </div>
            <div className="card my-stat">
              <strong>{games.length}</strong>
              <span>참여한 게임</span>
            </div>
            <div className="card my-stat">
              <strong>{activities.length}</strong>
              <span>참여한 활동</span>
            </div>
            <div className="card my-stat">
              <strong>{results.length}</strong>
              <span>심리테스트 결과</span>
            </div>
          </div>

          <div className="my-grid">
            <Reveal>
              <ProfileCard profile={latest || undefined} />
            </Reveal>

            <Reveal delay={80} className="card my-panel">
              <h2>최근 활동</h2>
              {logs.length ? (
                <ul className="activity-list">
                  {logs.slice(0, 8).map((l) => {
                    const d = describe(l)
                    return (
                      <li key={l.id}>
                        <span className="activity-list__date">{fmtDate(l.createdAt)}</span>
                        <span className="activity-list__icon" aria-hidden="true">
                          {d.icon}
                        </span>
                        <span className="activity-list__title">{d.to ? <Link to={d.to}>{d.title}</Link> : d.title}</span>
                        <Badge tone="outline">
                          {TYPE_LABEL[l.contentType]} {ACTION_LABEL[l.action]}
                        </Badge>
                      </li>
                    )
                  })}
                </ul>
              ) : (
                <EmptyState compact icon="🌱" title="아직 활동 기록이 없어요">
                  수업 페이지에서 ‘학습 완료 표시’를 누르거나 게임에 참여해 보세요.
                </EmptyState>
              )}
            </Reveal>
          </div>

          <div className="my-columns">
            <MyList title="참여한 게임" items={games} describe={describe} empty="게임 아케이드에서 게임을 시작해 보세요." />
            <MyList title="참여한 활동" items={activities} describe={describe} empty="프로젝트·동아리 활동에 참여하면 여기에 표시됩니다." />
            <MyList title="완료한 수업 콘텐츠" items={completed} describe={describe} empty="수업 페이지에서 학습을 완료해 보세요." />
          </div>

          <p className="privacy-note">
            🔒 이 페이지의 기록은 나와 선생님만 볼 수 있습니다. 학습에 필요한 최소한의 정보(무엇을 언제 했는지)만 저장합니다.
          </p>
        </div>
      </section>
    </>
  )
}

function MyList({ title, items, describe, empty }) {
  return (
    <Reveal className="card my-panel">
      <h2>{title}</h2>
      {items.length ? (
        <ul className="link-list">
          {items.slice(0, 10).map((l) => {
            const d = describe(l)
            return (
              <li key={`${l.contentType}-${l.contentId}`}>
                {d.to ? <Link to={d.to}>{`${d.icon} ${d.title}`}</Link> : `${d.icon} ${d.title}`}
                <small className="muted">{fmtDate(l.createdAt)}</small>
              </li>
            )
          })}
        </ul>
      ) : (
        <p className="muted my-panel__empty">{empty}</p>
      )}
    </Reveal>
  )
}
