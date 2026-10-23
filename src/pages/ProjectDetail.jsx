import { Link, useParams } from 'react-router-dom'
import { getProject } from '../data/projects'
import { getPhilosopher } from '../data/philosophers'
import PageHeader from '../components/PageHeader'
import Breadcrumb from '../components/Breadcrumb'
import Badge from '../components/Badge'
import EmptyState from '../components/EmptyState'
import Reveal from '../components/Reveal'
import { asset } from '../utils/asset'
import NotFound from './NotFound'

const FileLink = ({ item }) =>
  item.url ? (
    <a href={asset(item.url)} target="_blank" rel="noopener noreferrer" className="file-link">
      열기 ↗
    </a>
  ) : (
    <span className="file-link is-pending">연결 예정</span>
  )

export default function ProjectDetail() {
  const { id } = useParams()
  const project = getProject(id)
  if (!project) return <NotFound />
  const cast = project.philosophers.map(getPhilosopher).filter(Boolean)

  return (
    <>
      <PageHeader eyebrow={project.category} icon={project.icon} title={project.title}>
        <div className="page-header__meta">
          <Badge tone="gold">{project.subject}</Badge>
          <Badge tone="outline-light">{project.period}</Badge>
          <Badge tone="outline-light">{project.status}</Badge>
        </div>
      </PageHeader>

      <section className="section">
        <div className="container">
          <Breadcrumb items={[{ to: '/projects', label: '프로젝트' }, { label: project.title }]} />

          <div className="detail-grid">
            <Reveal className="card detail-card detail-card--wide">
              <h2>프로젝트 설명</h2>
              <p className="detail-card__lead">{project.description}</p>
            </Reveal>

            <Reveal className="card detail-card detail-card--wide issue-box issue-box--inline">
              <h2>핵심 질문</h2>
              <ul>
                {project.coreQuestions.map((q) => (
                  <li key={q}>“{q}”</li>
                ))}
              </ul>
            </Reveal>

            <Reveal className="card detail-card detail-card--wide">
              <h2>진행 방법</h2>
              <p className="method">{project.method}</p>
            </Reveal>

            <Reveal className="card detail-card detail-card--wide">
              <h2>활동 단계</h2>
              <ol className="timeline-steps">
                {project.steps.map((s, i) => (
                  <li key={s.title}>
                    <span className="timeline-steps__no">{i + 1}</span>
                    <strong>{s.title}</strong>
                    <p>{s.desc}</p>
                  </li>
                ))}
              </ol>
            </Reveal>

            <Reveal className="card detail-card">
              <h2>학생 결과물</h2>
              {project.outputs.length ? (
                <ul className="file-list">
                  {project.outputs.map((o) => (
                    <li key={o.title}>
                      <span>
                        <strong>{o.title}</strong>
                        <small>
                          {o.author} · {o.type}
                        </small>
                      </span>
                      <FileLink item={o} />
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState compact icon="🗂️" title="결과물 준비 중">
                  프로젝트가 진행되면 학생 결과물이 이곳에 쌓입니다.
                </EmptyState>
              )}
            </Reveal>

            <Reveal delay={80} className="card detail-card">
              <h2>관련 자료</h2>
              <ul className="file-list">
                {project.materials.map((m) => (
                  <li key={m.title}>
                    <span>
                      <strong>{m.title}</strong>
                      <small>{m.type}</small>
                    </span>
                    <FileLink item={m} />
                  </li>
                ))}
              </ul>
              {cast.length > 0 && (
                <div className="cast-row">
                  {cast.map((p) => (
                    <Link key={p.id} to={`/philosophers/${p.id}`} className="chip">
                      {p.symbol} {p.name}
                    </Link>
                  ))}
                </div>
              )}
            </Reveal>
          </div>
        </div>
      </section>
    </>
  )
}
