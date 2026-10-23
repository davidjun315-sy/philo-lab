import { Link } from 'react-router-dom'
import Badge from './Badge'
import { STATUS_LABEL, isPlayable } from '../data/games'

const toneOf = (game) => (isPlayable(game) ? 'green' : game.status === 'external' ? 'gold' : 'muted')

export default function GameCard({ game, index }) {
  const playable = isPlayable(game)
  return (
    <Link to={`/games/${game.id}`} className={`card game-card accent-${game.accent} ${playable ? '' : 'is-locked'}`}>
      <div className="game-card__top">
        {index != null && <span className="game-card__no">{String(index + 1).padStart(2, '0')}</span>}
        <Badge tone={toneOf(game)}>{playable ? STATUS_LABEL.live : STATUS_LABEL[game.status]}</Badge>
      </div>
      <span className="game-card__icon" aria-hidden="true">{game.icon}</span>
      <p className="game-card__category">{game.category}</p>
      <h3>{game.title}</h3>
      <p className="game-card__tagline">{game.tagline}</p>
      <span className="game-card__cta">
        {playable ? '플레이하기 →' : '자세히 보기 →'}
      </span>
    </Link>
  )
}
