import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { LESSON_SECTIONS, findTopic } from '../data/classes'
import { useContent } from '../context/ContentContext'
import { useAuth } from '../context/AuthContext'
import { useMyRecords } from '../hooks/useMyRecords'
import PageHeader from '../components/PageHeader'
import Breadcrumb from '../components/Breadcrumb'
import Badge from '../components/Badge'
import EmptyState from '../components/EmptyState'
import Reveal from '../components/Reveal'
import NotFound from './NotFound'

/**
 * 주제(사상가/쟁점) 상세 페이지.
 * lesson.sections 에 내용이 있으면 표시하고, 철학자와 연결된 경우 도감 데이터로 기본 내용을 채웁니다.
 * 내용이 없는 섹션은 "준비 중"으로 표시됩니다.
 */
const buildSections = (topic, philosopher, { getPhilosopher, getGame }) => {
  const auto = {}
  if (philosopher) {
    auto.concepts = philosopher.keywords
    auto.explanation = [philosopher.summary, ...philosopher.ideas].filter(Boolean)
    const related = philosopher.related.map(getPhilosopher).filter(Boolean)
    if (related.length) auto.compare = related.map((r) => ({ to: `/philosophers/${r.id}`, label: `${r.name} — ${r.keywords.slice(0, 2).join(', ')}` }))
    const games = philosopher.games.map(getGame).filter(Boolean)
    if (games.length) auto.game = games.map((g) => ({ to: `/games/${g.id}`, label: `${g.icon} ${g.title}` }))
  }
  if (topic.questions?.length) auto.activity = topic.questions.map((q) => `토론 질문: ${q}`)
  const own = Object.fromEntries(Object.entries(topic.sections || {}).filter(([, v]) => v && (!Array.isArray(v) || v.length)))
  return { ...auto, ...own }
}

const SectionBody = ({ content }) => {
  if (!content || (Array.isArray(content) && content.length === 0)) {
    return <EmptyState compact icon="⏳" title="준비 중" />
  }
  if (typeof content === 'string') return <p>{content}</p>
  return (
    <ul className="lesson-list">
      {content.map((item, i) => (
        <li key={i}>{typeof item === 'string' ? item : <Link to={item.to}>{item.label}</Link>}</li>
      ))}
    </ul>
  )
}

function CompleteButton({ lessonId }) {
  const { student, isAdmin, logActivity, promptLogin } = useAuth()
  const { logs, reload } = useMyRecords({ limit: 200 })
  const [busy, setBusy] = useState(false)
  const done = logs.some((l) => l.contentType === 'lesson' && l.contentId === lessonId && l.action === 'complete')

  if (isAdmin) return null
  const onClick = async () => {
    if (!student) return promptLogin('학습 완료 기록은 로그인한 학생만 저장할 수 있습니다.')
    setBusy(true)
    await logActivity('lesson', lessonId, 'complete')
    await reload()
    setBusy(false)
  }
  return (
    <button type="button" className={`btn ${done ? 'btn--done' : 'btn--gold'} btn--sm`} onClick={onClick} disabled={busy || done}>
      {done ? '✓ 학습 완료' : busy ? '저장 중…' : '학습 완료 표시'}
    </button>
  )
}

export default function TopicPage() {
  const { subjectId, topicId } = useParams()
  const content = useContent()
  const { student, logActivity } = useAuth()
  const found = findTopic(content.subjects, subjectId, topicId)
  const studentId = student?.id

  // 수업 콘텐츠 열람 기록 (학생만, 페이지당 1회)
  useEffect(() => {
    if (found && studentId) logActivity('lesson', topicId, 'view')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicId, studentId])

  if (!found) return <NotFound />
  const { subject, group, topic } = found
  const philosopher = topic.philosopherId ? content.getPhilosopher(topic.philosopherId) : null
  const sections = buildSections(topic, philosopher, content)

  return (
    <>
      <PageHeader
        eyebrow={`${subject.name} · ${group.title}`}
        icon={philosopher?.symbol || subject.icon}
        title={topic.name}
        description={philosopher ? philosopher.quote : topic.summary}
      >
        <div className="page-header__meta">
          {philosopher && (
            <Link to={`/philosophers/${philosopher.id}`} className="btn btn--outline-light btn--sm">
              철학자 도감에서 보기 →
            </Link>
          )}
          <CompleteButton lessonId={topic.id} />
          {topic.visibility !== 'public' && <Badge tone="rose">🔒 {topic.visibility === 'class' ? '우리 반 전용 콘텐츠' : '학생 전용 콘텐츠'}</Badge>}
        </div>
      </PageHeader>

      <section className="section">
        <div className="container">
          <Breadcrumb items={[{ to: '/classes', label: '수업' }, { to: `/classes/${subject.id}`, label: subject.name }, { label: topic.name }]} />

          {topic.questions?.length > 0 && (
            <Reveal className="issue-box">
              <p className="eyebrow eyebrow--gold">KEY ISSUES</p>
              <h2>핵심 쟁점</h2>
              <ul>
                {topic.questions.map((q) => (
                  <li key={q}>“{q}”</li>
                ))}
              </ul>
            </Reveal>
          )}

          {topic.tools?.length > 0 && (
            <Reveal className="tools-box">
              <h3>🛠 인터랙티브 도구</h3>
              <div className="grid grid--3">
                {topic.tools.map((tool) => (
                  <div key={tool.name} className="card tool-card is-locked">
                    <strong>{tool.name}</strong>
                    <Badge tone="muted">준비 중</Badge>
                  </div>
                ))}
              </div>
            </Reveal>
          )}

          <nav className="lesson-nav" aria-label="수업 구조">
            {LESSON_SECTIONS.map((s) => (
              <a
                key={s.key}
                href={`#sec-${s.key}`}
                onClick={(e) => {
                  e.preventDefault()
                  document.getElementById(`sec-${s.key}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }}
              >
                {s.icon} {s.label}
              </a>
            ))}
          </nav>

          <div className="lesson-grid">
            {LESSON_SECTIONS.map((s, i) => (
              <Reveal key={s.key} id={`sec-${s.key}`} delay={(i % 3) * 60} className={`card lesson-card ${sections[s.key] ? '' : 'is-empty'}`}>
                <h3>
                  <span aria-hidden="true">{s.icon}</span> {s.label}
                </h3>
                {s.key === 'concepts' && Array.isArray(sections.concepts) ? (
                  <div className="keyword-list">
                    {sections.concepts.map((k) => (
                      <span key={k} className="keyword">
                        #{k}
                      </span>
                    ))}
                  </div>
                ) : (
                  <SectionBody content={sections[s.key]} />
                )}
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
