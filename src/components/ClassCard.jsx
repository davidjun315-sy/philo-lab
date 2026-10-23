import { Link } from 'react-router-dom'
import { countTopics } from '../data/classes'

export default function ClassCard({ subject }) {
  return (
    <Link to={`/classes/${subject.id}`} className={`card class-card accent-${subject.accent}`}>
      <span className="class-card__icon" aria-hidden="true">{subject.icon}</span>
      <p className="class-card__en">{subject.nameEn}</p>
      <h3>{subject.name}</h3>
      <p className="class-card__desc">{subject.description}</p>
      <div className="class-card__groups">
        {subject.groups.map((g) => (
          <span key={g.title}>{g.title}</span>
        ))}
      </div>
      <span className="class-card__count">주제 {countTopics(subject)}개 →</span>
    </Link>
  )
}
