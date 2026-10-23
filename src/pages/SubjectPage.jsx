import { Link, useParams } from 'react-router-dom'
import { getSubject } from '../data/classes'
import { getPhilosopher } from '../data/philosophers'
import PageHeader from '../components/PageHeader'
import Breadcrumb from '../components/Breadcrumb'
import Badge from '../components/Badge'
import Reveal from '../components/Reveal'
import NotFound from './NotFound'

export default function SubjectPage() {
  const { subjectId } = useParams()
  const subject = getSubject(subjectId)
  if (!subject) return <NotFound />

  return (
    <>
      <PageHeader eyebrow={subject.nameEn} icon={subject.icon} title={subject.name} description={subject.description} />
      <section className="section">
        <div className="container">
          <Breadcrumb items={[{ to: '/classes', label: '수업' }, { label: subject.name }]} />
          {subject.groups.map((g) => (
            <div key={g.title} className="topic-section">
              <h2 className="topic-section__title">
                {g.title} <span>{g.topics.length}</span>
              </h2>
              <div className="grid grid--topics">
                {g.topics.map((t, i) => {
                  const p = t.philosopherId ? getPhilosopher(t.philosopherId) : null
                  return (
                    <Reveal key={t.id} delay={(i % 8) * 40}>
                      <Link to={`/classes/${subject.id}/${t.id}`} className={`card topic-card accent-${subject.accent}`}>
                        {p && <span className="topic-card__symbol" aria-hidden="true">{p.symbol}</span>}
                        <h3>{t.name}</h3>
                        {p && <p className="topic-card__meta">{p.era} · {p.school}</p>}
                        {t.summary && <p className="topic-card__desc">{t.summary}</p>}
                        {p && <p className="topic-card__desc">{p.keywords.slice(0, 3).join(' · ')}</p>}
                        {t.questions?.[0] && <p className="topic-card__q">Q. {t.questions[0]}</p>}
                        {t.tools?.length > 0 && (
                          <div className="topic-card__tools">
                            {t.tools.map((tool) => (
                              <Badge key={tool.name} tone="outline">🛠 {tool.name}</Badge>
                            ))}
                          </div>
                        )}
                      </Link>
                    </Reveal>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
