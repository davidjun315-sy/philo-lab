import { useState } from 'react'
import { club, clubLogs, clubOutputs } from '../data/clubs'
import PageHeader from '../components/PageHeader'
import SectionTitle from '../components/SectionTitle'
import FilterChips from '../components/FilterChips'
import Badge from '../components/Badge'
import EmptyState from '../components/EmptyState'
import Reveal from '../components/Reveal'
import { asset } from '../utils/asset'

const TABS = [
  { id: 'intro', label: '동아리 소개' },
  { id: 'plan', label: '연간 활동' },
  { id: 'logs', label: '활동 기록' },
  { id: 'outputs', label: '학생 결과물' },
  { id: 'gallery', label: '갤러리' },
]

const scrollTo = (id) => (e) => {
  e.preventDefault()
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export default function Club() {
  const [type, setType] = useState('')
  const logs = [...clubLogs].sort((a, b) => b.date.localeCompare(a.date)).filter((l) => !type || l.type === type)
  const photos = clubLogs.flatMap((l) => l.photos.map((src) => ({ src, title: l.title })))

  return (
    <>
      <PageHeader eyebrow="CLUB PORTFOLIO" icon="🌿" title="동아리" description={`${club.nameKo} — ${club.motto}`} />

      <div className="subnav">
        <div className="container subnav__inner">
          {TABS.map((t) => (
            <a key={t.id} href={`#${t.id}`} onClick={scrollTo(t.id)}>
              {t.label}
            </a>
          ))}
        </div>
      </div>

      <section id="intro" className="section">
        <div className="container club-intro">
          <Reveal>
            <SectionTitle eyebrow="ABOUT" title="동아리 소개" />
            <p className="club-intro__text">{club.intro}</p>
          </Reveal>
          <Reveal delay={100} className="activity-types">
            {club.activityTypes.map((a) => (
              <div key={a.name} className="activity-type">
                <span aria-hidden="true">{a.icon}</span>
                {a.name}
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <section id="plan" className="section section--cream">
        <div className="container">
          <SectionTitle eyebrow="ANNUAL PLAN" title="연간 활동" />
          <ol className="year-plan">
            {club.annualPlan.map((p, i) => (
              <Reveal as="li" key={p.month} delay={(i % 5) * 50}>
                <span className="year-plan__month">{p.month}</span>
                <span>{p.title}</span>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section id="logs" className="section">
        <div className="container">
          <SectionTitle eyebrow="ACTIVITY LOG" title="활동 기록" />
          <FilterChips label="활동 유형" options={club.activityTypes.map((a) => a.name)} value={type} onChange={setType} />
          {logs.length ? (
            <div className="log-timeline">
              {logs.map((log) => (
                <Reveal key={log.id} className="log-entry">
                  <div className="log-entry__date">
                    <span>{log.date.slice(0, 4)}</span>
                    <strong>{log.date.slice(5)}</strong>
                  </div>
                  <article className="card log-entry__card">
                    <div className="log-entry__head">
                      <Badge tone="green">{log.type}</Badge>
                      <span className="log-entry__full-date">{log.date}</span>
                    </div>
                    <h3>{log.title}</h3>
                    <p>{log.summary}</p>
                    <div className="log-entry__cols">
                      <div>
                        <h4>📷 활동 사진</h4>
                        {log.photos.length ? (
                          <div className="photo-row">
                            {log.photos.map((src) => (
                              <img key={src} src={asset(src)} alt={log.title} loading="lazy" />
                            ))}
                          </div>
                        ) : (
                          <div className="photo-placeholder">사진 준비 중</div>
                        )}
                      </div>
                      <div>
                        <h4>💬 학생 의견</h4>
                        <ul className="opinions">
                          {log.opinions.map((o) => (
                            <li key={o}>{o}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <p className="log-entry__result">
                      <strong>결과</strong> {log.result}
                    </p>
                  </article>
                </Reveal>
              ))}
            </div>
          ) : (
            <EmptyState icon="🗓️" title={`${type} 활동 기록이 아직 없습니다`} />
          )}
        </div>
      </section>

      <section id="outputs" className="section section--cream">
        <div className="container">
          <SectionTitle eyebrow="OUTPUTS" title="학생 결과물" />
          <div className="grid grid--3">
            {clubOutputs.map((o) => (
              <div key={o.title} className="card output-card">
                <Badge tone="gold">{o.type}</Badge>
                <h3>{o.title}</h3>
                <p>{o.author}</p>
                {o.url ? (
                  <a href={asset(o.url)} target="_blank" rel="noopener noreferrer" className="more-link">
                    보기 ↗
                  </a>
                ) : (
                  <span className="file-link is-pending">업로드 예정</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="gallery" className="section">
        <div className="container">
          <SectionTitle eyebrow="GALLERY" title="갤러리" />
          {photos.length ? (
            <div className="gallery">
              {photos.map((p) => (
                <img key={p.src} src={asset(p.src)} alt={p.title} loading="lazy" />
              ))}
            </div>
          ) : (
            <div className="gallery">
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="gallery__placeholder" aria-hidden="true">
                  <span>{['🏛️', '📚', '🎬', '💬', '⚖️', '🌿'][i]}</span>
                </div>
              ))}
              <p className="gallery__note">활동 사진은 개인정보 동의 후 업로드될 예정입니다.</p>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
