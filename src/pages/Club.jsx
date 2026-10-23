import { useMemo, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { useContent } from '../context/ContentContext'
import { useAuth } from '../context/AuthContext'
import PageHeader from '../components/PageHeader'
import SectionTitle from '../components/SectionTitle'
import FilterChips from '../components/FilterChips'
import Badge from '../components/Badge'
import EmptyState from '../components/EmptyState'
import ProjectCard from '../components/ProjectCard'
import Reveal from '../components/Reveal'
import { VISIBILITY } from '../data/visibility'
import { asset } from '../utils/asset'
import NotFound from './NotFound'

const TABS = [
  { id: 'intro', label: '동아리 소개' },
  { id: 'plan', label: '연간 운영 계획' },
  { id: 'logs', label: '활동 기록' },
  { id: 'outputs', label: '학생 결과물' },
  { id: 'gallery', label: '갤러리' },
  { id: 'projects', label: '관련 프로젝트' },
]

const scrollTo = (id) => (e) => {
  e.preventDefault()
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

/**
 * 동아리 — 학년도 › 동아리 구조
 *   #/club                 → 현재 학년도의 첫 동아리로 이동
 *   #/club/2026            → 2026학년도 첫 동아리
 *   #/club/2026/<clubId>   → 동아리 상세
 */
export default function Club() {
  const { year: yearParam, clubId } = useParams()
  const navigate = useNavigate()
  const { clubs, clubActivities, academicYears, getProject } = useContent()
  const { isAdmin, isGuest } = useAuth()
  const [type, setType] = useState('')

  const years = useMemo(() => {
    const set = new Set([...academicYears.map((y) => y.year), ...clubs.map((c) => c.academicYear)])
    return [...set].sort((a, b) => b - a)
  }, [academicYears, clubs])
  const archived = clubs.filter((c) => c.archived)

  const defaultYear =
    academicYears.find((y) => y.isCurrent && clubs.some((c) => c.academicYear === y.year && !c.archived))?.year ||
    clubs.find((c) => !c.archived)?.academicYear ||
    years[0]

  if (!yearParam) return defaultYear ? <Navigate to={`/club/${defaultYear}`} replace /> : <ClubEmpty />
  const year = Number(yearParam)
  if (!years.includes(year)) return <NotFound />

  const yearClubs = clubs.filter((c) => c.academicYear === year).sort((a, b) => Number(a.archived) - Number(b.archived) || a.sortOrder - b.sortOrder)
  if (!clubId && yearClubs.length) return <Navigate to={`/club/${year}/${yearClubs[0].id}`} replace />
  const club = clubId ? yearClubs.find((c) => c.id === clubId) : null
  if (clubId && !club) return <NotFound />

  const activities = club ? clubActivities.filter((a) => a.clubId === club.id) : []
  const logs = activities.filter((a) => !type || a.type === type)
  const outputs = activities.flatMap((a) => (a.studentOutputs || []).map((o) => ({ ...o, activity: a })))
  const photos = activities.flatMap((a) => (a.images || []).map((src) => ({ src, title: a.title, date: a.date })))
  const projects = club ? club.relatedProjects.map(getProject).filter(Boolean) : []
  const typeOptions = club ? [...new Set([...club.activityTypes.map((t) => t.name), ...activities.map((a) => a.type).filter(Boolean)])] : []

  return (
    <>
      <PageHeader eyebrow={`CLUB · ${year}학년도`} icon="🌿" title={club ? club.name : '동아리'} description={club?.motto || `${year}학년도 동아리 활동 포트폴리오`}>
        <div className="club-switcher">
          <label>
            <span>학년도</span>
            <select value={year} onChange={(e) => navigate(`/club/${e.target.value}`)}>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}학년도
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>동아리</span>
            <select value={club?.id || ''} onChange={(e) => navigate(`/club/${year}/${e.target.value}`)} disabled={!yearClubs.length}>
              {!yearClubs.length && <option value="">등록된 동아리 없음</option>}
              {yearClubs.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                  {c.archived ? ' (보관)' : ''}
                </option>
              ))}
            </select>
          </label>
          {isAdmin && (
            <Link to="/admin/clubs" className="btn btn--outline-light btn--sm">
              ⚙ 동아리 관리
            </Link>
          )}
        </div>
      </PageHeader>

      {!club ? (
        <section className="section">
          <div className="container">
            <EmptyState icon="🌱" title={`${year}학년도에 등록된 동아리가 없습니다`}>
              관리자 페이지 → 동아리 관리에서 새 동아리를 추가할 수 있습니다.
            </EmptyState>
          </div>
        </section>
      ) : (
        <>
          <div className="subnav">
            <div className="container subnav__inner">
              {TABS.map((t) => (
                <a key={t.id} href={`#${t.id}`} onClick={scrollTo(t.id)}>
                  {t.label}
                </a>
              ))}
            </div>
          </div>

          {club.archived && (
            <div className="container">
              <p className="notice archive-notice">📦 {year}학년도에 운영된 지난 동아리입니다. 기록은 그대로 보존됩니다.</p>
            </div>
          )}

          <section id="intro" className="section">
            <div className="container club-intro">
              <Reveal>
                <SectionTitle eyebrow="ABOUT" title="동아리 소개" />
                <p className="club-intro__text">{club.description}</p>
              </Reveal>
              {club.activityTypes.length > 0 && (
                <Reveal delay={100} className="activity-types">
                  {club.activityTypes.map((a) => (
                    <div key={a.name} className="activity-type">
                      <span aria-hidden="true">{a.icon}</span>
                      {a.name}
                    </div>
                  ))}
                </Reveal>
              )}
            </div>
          </section>

          <section id="plan" className="section section--cream">
            <div className="container">
              <SectionTitle eyebrow="ANNUAL PLAN" title="연간 운영 계획" />
              {club.annualPlan.length ? (
                <ol className="year-plan">
                  {club.annualPlan.map((p, i) => (
                    <Reveal as="li" key={`${p.month}-${i}`} delay={(i % 5) * 50}>
                      <span className="year-plan__month">{p.month}</span>
                      <span>{p.title}</span>
                    </Reveal>
                  ))}
                </ol>
              ) : (
                <EmptyState compact title="운영 계획 준비 중" />
              )}
            </div>
          </section>

          <section id="logs" className="section">
            <div className="container">
              <SectionTitle eyebrow="ACTIVITY LOG" title="활동 기록" />
              {typeOptions.length > 1 && <FilterChips label="활동 유형" options={typeOptions} value={type} onChange={setType} />}
              {logs.length ? (
                <div className="log-timeline">
                  {logs.map((log) => (
                    <Reveal key={log.id} className="log-entry">
                      <div className="log-entry__date">
                        <span>{log.date.slice(0, 4)}</span>
                        <strong>{log.date.slice(5)}</strong>
                      </div>
                      <article className="card log-entry__card">
                        <div className="log-entry__head">
                          <span className="log-entry__badges">
                            {log.type && <Badge tone="green">{log.type}</Badge>}
                            {log.visibility !== 'public' && <Badge tone={VISIBILITY[log.visibility]?.tone}>🔒 {VISIBILITY[log.visibility]?.label}</Badge>}
                          </span>
                          <span className="log-entry__full-date">{log.date}</span>
                        </div>
                        <h3>{log.title}</h3>
                        <p>{log.description}</p>
                        <div className="log-entry__cols">
                          <div>
                            <h4>📷 활동 사진</h4>
                            {log.images.length ? (
                              <div className="photo-row">
                                {log.images.map((src) => (
                                  <img key={src} src={asset(src)} alt={log.title} loading="lazy" />
                                ))}
                              </div>
                            ) : (
                              <div className="photo-placeholder">사진 준비 중</div>
                            )}
                          </div>
                          <div>
                            <h4>💬 학생 의견</h4>
                            {log.opinions.length ? (
                              <ul className="opinions">
                                {log.opinions.map((o) => (
                                  <li key={o}>{o}</li>
                                ))}
                              </ul>
                            ) : (
                              <p className="muted">-</p>
                            )}
                          </div>
                        </div>
                        {log.result && (
                          <p className="log-entry__result">
                            <strong>결과</strong> {log.result}
                          </p>
                        )}
                      </article>
                    </Reveal>
                  ))}
                </div>
              ) : (
                <EmptyState icon="🗓️" title={type ? `${type} 활동 기록이 아직 없습니다` : '아직 활동 기록이 없습니다'} />
              )}
              {isGuest && <p className="notice notice--lock">🔒 학생 전용으로 공개된 활동 기록은 로그인한 학생에게만 보입니다.</p>}
            </div>
          </section>

          <section id="outputs" className="section section--cream">
            <div className="container">
              <SectionTitle eyebrow="OUTPUTS" title="학생 결과물" />
              {outputs.length ? (
                <div className="grid grid--3">
                  {outputs.map((o, i) => (
                    <div key={`${o.title}-${i}`} className="card output-card">
                      {o.type && <Badge tone="gold">{o.type}</Badge>}
                      <h3>{o.title}</h3>
                      <p>
                        {o.author} · {o.activity.date}
                      </p>
                      {o.url ? (
                        <a href={asset(o.url)} target="_blank" rel="noopener noreferrer" className="more-link">
                          보기 ↗
                        </a>
                      ) : (
                        <span className="file-link is-pending">업로드 예정</span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState compact icon="🗂️" title="결과물 준비 중" />
              )}
            </div>
          </section>

          <section id="gallery" className="section">
            <div className="container">
              <SectionTitle eyebrow="GALLERY" title="갤러리" />
              <div className="gallery">
                {photos.length
                  ? photos.map((p) => <img key={p.src} src={asset(p.src)} alt={`${p.date} ${p.title}`} loading="lazy" />)
                  : ['🏛️', '📚', '🎬', '💬', '⚖️', '🌿'].map((icon) => (
                      <div key={icon} className="gallery__placeholder" aria-hidden="true">
                        <span>{icon}</span>
                      </div>
                    ))}
                {!photos.length && <p className="gallery__note">활동 사진은 개인정보 동의 후 업로드될 예정입니다.</p>}
              </div>
            </div>
          </section>

          <section id="projects" className="section section--cream">
            <div className="container">
              <SectionTitle eyebrow="PROJECTS" title="관련 프로젝트" />
              {projects.length ? (
                <div className="grid grid--3">
                  {projects.map((p) => (
                    <ProjectCard key={p.id} project={p} />
                  ))}
                </div>
              ) : (
                <EmptyState compact title="연결된 프로젝트가 없습니다" />
              )}
            </div>
          </section>
        </>
      )}

      {archived.length > 0 && (
        <section className="section section--tight past-clubs">
          <div className="container">
            <SectionTitle eyebrow="ARCHIVE" title="지난 활동" description="이전 학년도에 운영된 동아리의 기록은 삭제하지 않고 보관합니다." />
            <div className="past-clubs__list">
              {archived.map((c) => (
                <Link key={c.id} to={`/club/${c.academicYear}/${c.id}`} className={`card past-club ${c.id === club?.id ? 'is-current' : ''}`}>
                  <span className="past-club__year">{c.academicYear}</span>
                  <strong>{c.name}</strong>
                  <small>{clubActivities.filter((a) => a.clubId === c.id).length}개의 활동 기록</small>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}

function ClubEmpty() {
  return (
    <>
      <PageHeader eyebrow="CLUB" icon="🌿" title="동아리" />
      <section className="section">
        <div className="container">
          <EmptyState icon="🌱" title="등록된 동아리가 없습니다" />
        </div>
      </section>
    </>
  )
}
