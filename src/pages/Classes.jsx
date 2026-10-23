import { Link } from 'react-router-dom'
import { useContent } from '../context/ContentContext'
import PageHeader from '../components/PageHeader'
import ClassCard from '../components/ClassCard'
import SectionTitle from '../components/SectionTitle'
import Reveal from '../components/Reveal'

export default function Classes() {
  const { subjects } = useContent()
  return (
    <>
      <PageHeader eyebrow="CLASSES" icon="🏛️" title="수업" description="윤리와 사상 · 현대 사회와 윤리 · 통합사회 — 과목을 골라 생각의 여행을 시작하세요." />
      <section className="section">
        <div className="container">
          <div className="grid grid--3">
            {subjects.map((s, i) => (
              <Reveal key={s.id} delay={i * 80}>
                <ClassCard subject={s} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {subjects.map((s) => (
        <section key={s.id} className="section section--tight section--cream-alt">
          <div className="container">
            <SectionTitle
              eyebrow={s.nameEn}
              title={`${s.icon} ${s.name}`}
              action={
                <Link to={`/classes/${s.id}`} className="btn btn--ghost btn--sm">
                  과목 페이지 →
                </Link>
              }
            />
            {s.groups.map((g) => (
              <div key={g.title} className="topic-group">
                <h3 className="topic-group__title">{g.title}</h3>
                <div className="topic-pills">
                  {g.topics.map((t) => (
                    <Link key={t.id} to={`/classes/${s.id}/${t.id}`} className="topic-pill">
                      {t.name}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </>
  )
}
