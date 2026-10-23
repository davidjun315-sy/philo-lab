import { Link, useParams } from 'react-router-dom'
import { LESSON_SECTIONS, getTopic } from '../data/classes'
import { getPhilosopher } from '../data/philosophers'
import { getGame } from '../data/games'
import PageHeader from '../components/PageHeader'
import Breadcrumb from '../components/Breadcrumb'
import Badge from '../components/Badge'
import EmptyState from '../components/EmptyState'
import Reveal from '../components/Reveal'
import NotFound from './NotFound'

/**
 * 주제(사상가/쟁점) 상세 페이지.
 * topic.sections 에 내용이 있으면 표시하고, 철학자와 연결된 경우 도감 데이터로 기본 내용을 채웁니다.
 * 내용이 없는 섹션은 "준비 중"으로 표시됩니다.
 */
const buildSections = (topic, philosopher) => {
  const auto = {}
  if (philosopher) {
    auto.concepts = philosopher.keywords
    auto.explanation = [philosopher.summary, ...philosopher.ideas]
    const related = philosopher.related.map(getPhilosopher).filter(Boolean)
    if (related.length) auto.compare = related.map((r) => ({ to: `/philosophers/${r.id}`, label: `${r.name} — ${r.keywords.slice(0, 2).join(', ')}` }))
    const games = philosopher.games.map(getGame).filter(Boolean)
    if (games.length) auto.game = games.map((g) => ({ to: `/games/${g.id}`, label: `${g.icon} ${g.title}` }))
  }
  if (topic.questions?.length) auto.activity = topic.questions.map((q) => `토론 질문: ${q}`)
  return { ...auto, ...(topic.sections || {}) }
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

export default function TopicPage() {
  const { subjectId, topicId } = useParams()
  const found = getTopic(subjectId, topicId)
  if (!found) return <NotFound />
  const { subject, group, topic } = found
  const philosopher = topic.philosopherId ? getPhilosopher(topic.philosopherId) : null
  const sections = buildSections(topic, philosopher)

  return (
    <>
      <PageHeader
        eyebrow={`${subject.name} · ${group.title}`}
        icon={philosopher?.symbol || subject.icon}
        title={topic.name}
        description={philosopher ? philosopher.quote : topic.summary}
      >
        {philosopher && (
          <Link to={`/philosophers/${philosopher.id}`} className="btn btn--outline-light btn--sm page-header__btn">
            철학자 도감에서 보기 →
          </Link>
        )}
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
              <a key={s.key} href={`#sec-${s.key}`} onClick={(e) => { e.preventDefault(); document.getElementById(`sec-${s.key}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }}>
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
                      <span key={k} className="keyword">#{k}</span>
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
