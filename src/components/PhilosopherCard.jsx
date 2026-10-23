import { Link } from 'react-router-dom'
import Badge from './Badge'
import PhilosopherImage from './PhilosopherImage'

export default function PhilosopherCard({ philosopher: p }) {
  if (!p) return null
  return (
    <Link to={`/philosophers/${p.id}`} className={`card philo-card philo-card--${p.region === '동양' ? 'east' : 'west'} ${p.image ? 'has-image' : ''}`}>
      <div className="philo-card__visual">
        <span className="philo-card__symbol" aria-hidden="true">{p.symbol}</span>
        <PhilosopherImage philosopher={p} />
      </div>
      <div className="philo-card__body">
        <div className="philo-card__badges">
          <Badge tone={p.region === '동양' ? 'green' : 'navy'}>{p.region}</Badge>
          <Badge tone="outline">{p.era}</Badge>
        </div>
        <h3>{p.name}</h3>
        <p className="philo-card__en">{p.nameEn}</p>
        <p className="philo-card__keywords">{(p.keywords || []).slice(0, 3).map((k) => `#${k}`).join(' ')}</p>
      </div>
    </Link>
  )
}
