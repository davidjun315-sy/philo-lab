import { Link } from 'react-router-dom'
import Badge from './Badge'
import PhilosopherBust from './PhilosopherBust'
import { asset } from '../utils/asset'

export default function PhilosopherCard({ philosopher: p }) {
  return (
    <Link to={`/philosophers/${p.id}`} className={`card philo-card philo-card--${p.region === '동양' ? 'east' : 'west'}`}>
      <div className="philo-card__visual">
        <span className="philo-card__symbol" aria-hidden="true">{p.symbol}</span>
        {p.image ? (
          <img src={asset(p.image)} alt={p.name} loading="lazy" />
        ) : (
          <PhilosopherBust region={p.region} title={`${p.name} 조각상 일러스트`} />
        )}
      </div>
      <div className="philo-card__body">
        <div className="philo-card__badges">
          <Badge tone={p.region === '동양' ? 'green' : 'navy'}>{p.region}</Badge>
          <Badge tone="outline">{p.era}</Badge>
        </div>
        <h3>{p.name}</h3>
        <p className="philo-card__en">{p.nameEn}</p>
        <p className="philo-card__keywords">{p.keywords.slice(0, 3).map((k) => `#${k}`).join(' ')}</p>
      </div>
    </Link>
  )
}
