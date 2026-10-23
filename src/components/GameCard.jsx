import { Link } from 'react-router-dom'
import Badge from './Badge'
import { gameStatusLabel, isPlayable } from '../data/games'
import { asset } from '../utils/asset'

const toneOf = (game) => (isPlayable(game) ? 'green' : game.status === 'external' ? 'gold' : 'muted')

export default function GameCard({ game, index }) {
  const playable = isPlayable(game)
  return (
    <Link to={`/games/${game.id}`} className={`card game-card accent-${game.accent || 'gold'} ${playable ? '' : 'is-locked'}`}>
      <div className="game-card__top">
        {index != null && <span className="game-card__no">{String(index + 1).padStart(2, '0')}</span>}
        <Badge tone={toneOf(game)}>{gameStatusLabel(game)}</Badge>
      </div>
      {game.thumbnail ? (
        <img className="game-card__thumb" src={asset(game.thumbnail)} alt="" loading="lazy" />
      ) : (
        <span className="game-card__icon" aria-hidden="true">{game.icon || '🎲'}</span>
      )}
      <p className="game-card__category">{game.type}</p>
      <h3>{game.title}</h3>
      <p className="game-card__tagline">{game.tagline}</p>
      <span className="game-card__cta">{playable ? '플레이하기 →' : '자세히 보기 →'}</span>
    </Link>
  )
}
