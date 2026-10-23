import { Link, useParams } from 'react-router-dom'
import { getPhilosopher } from '../data/philosophers'
import { getGame, isPlayable, STATUS_LABEL } from '../data/games'
import { subjects } from '../data/classes'
import PhilosopherBust from '../components/PhilosopherBust'
import StatStars from '../components/StatStars'
import Breadcrumb from '../components/Breadcrumb'
import Badge from '../components/Badge'
import EmptyState from '../components/EmptyState'
import Reveal from '../components/Reveal'
import { asset } from '../utils/asset'
import NotFound from './NotFound'

/** 이 철학자를 다루는 수업 주제 찾기 */
const findLessons = (id) =>
  subjects.flatMap((s) => s.groups.flatMap((g) => g.topics.filter((t) => t.philosopherId === id).map((t) => ({ subject: s, topic: t }))))

export default function PhilosopherDetail() {
  const { id } = useParams()
  const p = getPhilosopher(id)
  if (!p) return <NotFound />

  const related = p.related.map(getPhilosopher).filter(Boolean)
  const games = p.games.map(getGame).filter(Boolean)
  const lessons = findLessons(p.id)

  return (
    <>
      <section className={`philo-hero philo-hero--${p.region === '동양' ? 'east' : 'west'}`}>
        <div className="container philo-hero__inner">
          <Reveal className="philo-hero__visual">
            <span className="philo-hero__symbol" aria-hidden="true">{p.symbol}</span>
            {p.image ? <img src={asset(p.image)} alt={p.name} /> : <PhilosopherBust region={p.region} title={`${p.name} 대표 이미지 영역`} />}
          </Reveal>
          <Reveal delay={100} className="philo-hero__copy">
            <div className="philo-hero__badges">
              <Badge tone={p.region === '동양' ? 'green' : 'navy'}>{p.region}</Badge>
              <Badge tone="gold">{p.era}</Badge>
              <Badge tone="outline-light">{p.school}</Badge>
            </div>
            <h1>{p.name}</h1>
            <p className="philo-hero__en">
              {p.nameEn} · {p.period}
            </p>
            <blockquote className="philo-hero__quote">“{p.quote}”</blockquote>
            <div className="keyword-list keyword-list--light">
              {p.keywords.map((k) => (
                <span key={k} className="keyword">#{k}</span>
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
              {p.stats.map((s) => (
                <StatStars key={s.label} label={s.label} value={s.value} />
              ))}
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
                  {lessons.map(({ subject, topic }) => (
                    <li key={subject.id + topic.id}>
                      <Link to={`/classes/${subject.id}/${topic.id}`}>
                        {subject.icon} {subject.name} · {topic.name}
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
              {games.length ? (
                <ul className="link-list">
                  {games.map((g) => (
                    <li key={g.id}>
                      <Link to={`/games/${g.id}`}>
                        {g.icon} {g.title}
                      </Link>
                      <Badge tone={isPlayable(g) ? 'green' : 'muted'}>{isPlayable(g) ? STATUS_LABEL.live : STATUS_LABEL[g.status]}</Badge>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState compact title="준비 중" />
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
