import { Link } from 'react-router-dom'
import Badge from './Badge'

export default function ProjectCard({ project }) {
  return (
    <Link to={`/projects/${project.id}`} className="card project-card">
      <div className="project-card__head">
        <span className="project-card__icon" aria-hidden="true">{project.icon}</span>
        <Badge tone="gold">{project.category}</Badge>
      </div>
      <h3>{project.title}</h3>
      <p className="project-card__desc">{project.description}</p>
      <div className="project-card__meta">
        <span>{project.subject}</span>
        <span>{project.period}</span>
        <Badge tone="outline">{project.status}</Badge>
      </div>
    </Link>
  )
}
