import { Link, useParams } from 'react-router-dom'
import { gameStatusLabel, isPlayable } from '../data/games'
import { VISIBILITY } from '../data/visibility'
import { useContent } from '../context/ContentContext'
import PhilosopherImage from '../components/PhilosopherImage'
import { IMAGE_TYPE_LABEL } from '../data/imageTypes'
import StatStars from '../components/StatStars'
import Breadcrumb from '../components/Breadcrumb'
import Badge from '../components/Badge'
import EmptyState from '../components/EmptyState'
import Reveal from '../components/Reveal'
import NotFound from './NotFound'

/**
 * 철학자 상세 = 콘텐츠 허브
 * 수업(lessons.philosopherId) · 게임(philosopher.games / game.philosophers) · 프로젝트(project.philosophers)
 * · 교사자료(resource.philosophers) · 딜레마를 한곳에 모아 보여줍니다.
 */
export default function PhilosopherDetail() {
  const { id } = useParams()
  const { getPhilosopher, games, projects, resources, subjects } = useContent()
  const p = getPhilosopher(id)
  if (!p) return <NotFound />

  const related = p.related.map(getPhilosopher).filter(Boolean)
  const relatedGames = games.filter((g) => p.games.includes(g.id) || g.philosophers.includes(p.id))
  const relatedProjects = projects.filter((pr) => pr.philosophers.includes(p.id))
  const relatedResources = resources.filter((r) => r.philosophers.includes(p.id))
  const lessons = subjects.flatMap((s) =>
    s.groups.flatMap((g) => g.topics.filter((t) => t.philosopherId === p.id).map((t) => ({ subject: s, group: g, topic: t }))),
  )

  return (
    <>
      <section className={`philo-hero philo-hero--${p.region === '동양' ? 'east' : 'west'}`}>
        <div className="container philo-hero__inner">
          <Reveal className="philo-hero__visual-wrap">
            <div className={`philo-hero__visual ${p.image ? 'has-image' : ''}`}>
              <span className="philo-hero__symbol" aria-hidden="true">{p.symbol}</span>
              <PhilosopherImage philosopher={p} />
            </div>
            {p.image && (p.imageSource || p.imageLicense) && (
              <p className="image-credit">
                {IMAGE_TYPE_LABEL[p.imageType] && <span>{IMAGE_TYPE_LABEL[p.imageType]}</span>}
                {p.imageCreator && <span>{p.imageCreator}</span>}
                {p.imageLicense && <span>{p.imageLicense}</span>}
                {p.imageSource && (
                  <a href={p.imageSource} target="_blank" rel="noopener noreferrer">
                    출처
                  </a>
                )}
              </p>
            )}
          </Reveal>
          <Reveal delay={100} className="philo-hero__copy">
            <div className="philo-hero__badges">
              <Badge tone={p.region === '동양' ? 'green' : 'navy'}>{p.region}</Badge>
              <Badge tone="gold">{p.era}</Badge>
              {p.school && <Badge tone="outline-light">{p.school}</Badge>}
            </div>
            <h1>{p.name}</h1>
            <p className="philo-hero__en">
              {p.nameEn} {p.period && `· ${p.period}`}
            </p>
            {p.quote && <blockquote className="philo-hero__quote">“{p.quote}”</blockquote>}
            <div className="keyword-list keyword-list--light">
              {p.keywords.map((k) => (
                <span key={k} className="keyword">
                  #{k}
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Breadcrumb items={[{ to: '/philosophers', label: '철학자 도감' }, { label: p.name }]} />

          <div className="detail-grid">
            <Reveal className="card detail-card detail-card--wide">
              <h2>핵심 사상</h2>
              <p className="detail-card__lead">{p.summary}</p>
              <ul className="idea-list">
                {p.ideas.map((idea) => (
                  <li key={idea}>{idea}</li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={80} className="card detail-card stat-card">
              <h2>능력치</h2>
              {(p.stats || []).length ? p.stats.map((s) => <StatStars key={s.label} label={s.label} value={s.value} />) : <EmptyState compact title="준비 중" />}
            </Reveal>

            <Reveal className="card detail-card">
              <h2>관련 철학자</h2>
              {related.length ? (
                <div className="related-list">
                  {related.map((r) => (
                    <Link key={r.id} to={`/philosophers/${r.id}`} className="related-item">
                      <span className="related-item__symbol">{r.symbol}</span>
                      <span>
                        <strong>{r.name}</strong>
                        <small>{r.keywords[0]}</small>
                      </span>
                    </Link>
                  ))}
                </div>
              ) : (
                <EmptyState compact title="준비 중" />
              )}
            </Reveal>

            <Reveal delay={60} className="card detail-card">
              <h2>관련 수업</h2>
              {lessons.length ? (
                <ul className="link-list">
                  {lessons.map(({ subject, group, topic }) => (
                    <li key={subject.id + topic.id}>
                      <Link to={`/classes/${subject.id}/${topic.id}`}>
                        {subject.icon} {subject.name} · {group.title} · {topic.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState compact title="준비 중" />
              )}
            </Reveal>

            <Reveal delay={120} className="card detail-card">
              <h2>관련 게임</h2>
              {relatedGames.length ? (
                <ul className="link-list">
                  {relatedGames.map((g) => (
                    <li key={g.id}>
                      <Link to={`/games/${g.id}`}>
                        {g.icon} {g.title}
                      </Link>
                      <Badge tone={isPlayable(g) ? 'green' : 'muted'}>{gameStatusLabel(g)}</Badge>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState compact title="준비 중" />
              )}
            </Reveal>

            <Reveal className="card detail-card">
              <h2>관련 프로젝트</h2>
              {relatedProjects.length ? (
                <ul className="link-list">
                  {relatedProjects.map((pr) => (
                    <li key={pr.id}>
                      <Link to={`/projects/${pr.id}`}>
                        {pr.icon} {pr.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState compact title="준비 중" />
              )}
            </Reveal>

            <Reveal delay={60} className="card detail-card">
              <h2>관련 자료</h2>
              {relatedResources.length ? (
                <ul className="link-list">
                  {relatedResources.map((r) => (
                    <li key={r.id}>
                      <Link to="/resources">📄 {r.title}</Link>
                      <Badge tone={VISIBILITY[r.visibility]?.tone}>{VISIBILITY[r.visibility]?.short}</Badge>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState compact title="공개된 자료 없음" />
              )}
            </Reveal>

            <Reveal className="card detail-card detail-card--wide dilemma-card">
              <h2>관련 딜레마</h2>
              {p.dilemmas.length ? (
                <ul className="dilemma-list">
                  {p.dilemmas.map((d) => (
                    <li key={d}>
                      <span aria-hidden="true">⚖️</span> {d}
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState compact title="딜레마 준비 중" />
              )}
              <Link to="/games/ethics-dilemma" className="more-link">
                윤리 딜레마 게임 →
              </Link>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  )
}
