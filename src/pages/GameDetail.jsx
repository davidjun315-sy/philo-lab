import { Link, useParams } from 'react-router-dom'
import { gameStatusLabel, isPlayable } from '../data/games'
import { useContent } from '../context/ContentContext'
import { useAuth } from '../context/AuthContext'
import Breadcrumb from '../components/Breadcrumb'
import Badge from '../components/Badge'
import GameCard from '../components/GameCard'
import Reveal from '../components/Reveal'
import { asset } from '../utils/asset'
import NotFound from './NotFound'

function PlayButton({ game }) {
  const { logActivity } = useAuth()
  const contentType = game.type === '심리테스트' ? 'test' : 'game'
  const onPlay = () => logActivity(contentType, game.id, 'play')

  if (game.internalRoute) {
    return (
      <Link to={game.internalRoute} className="btn btn--gold btn--lg" onClick={onPlay}>
        ▶ 플레이하기
      </Link>
    )
  }
  if (game.externalUrl) {
    return (
      <a href={game.externalUrl} target="_blank" rel="noopener noreferrer" className="btn btn--gold btn--lg" onClick={onPlay}>
        ▶ 플레이하기 ↗
      </a>
    )
  }
  return (
    <button type="button" className="btn btn--disabled btn--lg" disabled>
      {game.status === 'external' ? '🔗 연결 예정' : '⏳ 준비 중'}
    </button>
  )
}

export default function GameDetail() {
  const { id } = useParams()
  const { games, getGame, getPhilosopher } = useContent()
  const { student } = useAuth()
  const game = getGame(id)
  if (!game) return <NotFound />

  const playable = isPlayable(game)
  const cast = game.philosophers.map(getPhilosopher).filter(Boolean)
  const others = games.filter((g) => g.id !== game.id && g.featured).slice(0, 3)

  return (
    <>
      <section className={`game-hero accent-${game.accent || 'gold'}`}>
        <div className="container game-hero__inner">
          <Reveal className="game-hero__copy">
            <div className="game-hero__badges">
              <Badge tone="gold">{game.type}</Badge>
              <Badge tone={playable ? 'green' : 'outline-light'}>{gameStatusLabel(game)}</Badge>
              {game.saveResult && <Badge tone="outline-light">💾 결과 저장 지원</Badge>}
            </div>
            <h1>{game.title}</h1>
            <p className="game-hero__tagline">{game.tagline}</p>
            <div className="game-hero__meta">
              {game.duration && <span>⏱ {game.duration}</span>}
              {game.players && <span>👥 {game.players}</span>}
            </div>
            <PlayButton game={game} />
          </Reveal>
          <Reveal delay={100} className="game-hero__screen" aria-hidden="true">
            <div className="screen">
              <div className="screen__bar">
                <span />
                <span />
                <span />
              </div>
              <div className="screen__body">
                {game.thumbnail ? <img className="screen__thumb" src={asset(game.thumbnail)} alt="" /> : <span className="screen__icon">{game.icon}</span>}
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
                <p className="notice">🔗 이 게임은 별도 프로젝트로 제작되어 있으며, 곧 PHILO LAB과 연결될 예정입니다.</p>
              )}
              {game.saveResult && (
                <p className="notice notice--green">
                  💾 테스트를 마친 뒤 결과 화면에서 <strong>PHILO LAB에 저장</strong>을 누르면{' '}
                  {student ? <Link to="/my">MY PHILO LAB</Link> : '로그인한 학생의 MY PHILO LAB'}의 철학 프로필에 반영됩니다.
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

          {others.length > 0 && (
            <>
              <h2 className="subhead">다른 게임</h2>
              <div className="grid grid--3">
                {others.map((g) => (
                  <GameCard key={g.id} game={g} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </>
  )
}
