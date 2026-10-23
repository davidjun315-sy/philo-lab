import { Link, useParams } from 'react-router-dom'
import { STATUS_LABEL, games, getGame, isPlayable } from '../data/games'
import { getPhilosopher } from '../data/philosophers'
import Breadcrumb from '../components/Breadcrumb'
import Badge from '../components/Badge'
import GameCard from '../components/GameCard'
import Reveal from '../components/Reveal'
import NotFound from './NotFound'

export default function GameDetail() {
  const { id } = useParams()
  const game = getGame(id)
  if (!game) return <NotFound />

  const playable = isPlayable(game)
  const cast = game.philosophers.map(getPhilosopher).filter(Boolean)
  const others = games.filter((g) => g.id !== game.id && g.featured).slice(0, 3)
  const statusText = playable ? STATUS_LABEL.live : STATUS_LABEL[game.status]

  return (
    <>
      <section className={`game-hero accent-${game.accent}`}>
        <div className="container game-hero__inner">
          <Reveal className="game-hero__copy">
            <div className="game-hero__badges">
              <Badge tone="gold">{game.category}</Badge>
              <Badge tone={playable ? 'green' : 'outline-light'}>{statusText}</Badge>
            </div>
            <h1>{game.title}</h1>
            <p className="game-hero__tagline">{game.tagline}</p>
            <div className="game-hero__meta">
              <span>⏱ {game.duration}</span>
              <span>👥 {game.players}</span>
            </div>
            {playable ? (
              <a href={game.url} target="_blank" rel="noopener noreferrer" className="btn btn--gold btn--lg">
                ▶ 플레이하기
              </a>
            ) : (
              <button type="button" className="btn btn--disabled btn--lg" disabled>
                {game.status === 'external' ? '🔗 외부 게임 연결 예정' : '⏳ 준비 중'}
              </button>
            )}
          </Reveal>
          <Reveal delay={100} className="game-hero__screen" aria-hidden="true">
            <div className="screen">
              <div className="screen__bar">
                <span />
                <span />
                <span />
              </div>
              <div className="screen__body">
                <span className="screen__icon">{game.icon}</span>
                <p>{playable ? 'READY' : game.status === 'external' ? 'LINK PENDING' : 'COMING SOON'}</p>
                <div className="screen__loading">
                  <span />
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Breadcrumb items={[{ to: '/games', label: '게임' }, { label: game.title }]} />
          <div className="detail-grid">
            <Reveal className="card detail-card detail-card--wide">
              <h2>게임 소개</h2>
              <p className="detail-card__lead">{game.description}</p>
              {game.status === 'external' && !playable && (
                <p className="notice">
                  🔗 이 게임은 별도 프로젝트로 제작되어 있습니다. <code>src/data/games.js</code>의 <code>url</code>에 배포 주소를 입력하면
                  바로 연결됩니다.
                </p>
              )}
            </Reveal>
            <Reveal delay={60} className="card detail-card">
              <h2>플레이 방법</h2>
              <ol className="step-list">
                {game.howTo.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ol>
            </Reveal>
            <Reveal delay={120} className="card detail-card">
              <h2>등장 철학자</h2>
              {cast.length ? (
                <div className="related-list">
                  {cast.map((p) => (
                    <Link key={p.id} to={`/philosophers/${p.id}`} className="related-item">
                      <span className="related-item__symbol">{p.symbol}</span>
                      <span>
                        <strong>{p.name}</strong>
                        <small>{p.school}</small>
                      </span>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="muted">추후 공개</p>
              )}
            </Reveal>
          </div>

          <h2 className="subhead">다른 게임</h2>
          <div className="grid grid--3">
            {others.map((g) => (
              <GameCard key={g.id} game={g} />
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
