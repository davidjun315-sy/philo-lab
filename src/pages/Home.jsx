import { useState } from 'react'
import { Link } from 'react-router-dom'
import { site } from '../data/site'
import { dailyQuestions, getTodayQuestionIndex } from '../data/questions'
import { games } from '../data/games'
import { subjects } from '../data/classes'
import { philosophers, getPhilosopher } from '../data/philosophers'
import { projects } from '../data/projects'
import { clubLogs } from '../data/clubs'
import { resources } from '../data/resources'
import HeroArt from '../components/HeroArt'
import SectionTitle from '../components/SectionTitle'
import GameCard from '../components/GameCard'
import ClassCard from '../components/ClassCard'
import PhilosopherCard from '../components/PhilosopherCard'
import ProjectCard from '../components/ProjectCard'
import ProfileCard from '../components/ProfileCard'
import Reveal from '../components/Reveal'
import Badge from '../components/Badge'

const FEATURED_PHILOSOPHERS = ['socrates', 'confucius', 'kant', 'mill', 'laozi', 'sartre']

export default function Home() {
  const [qIndex, setQIndex] = useState(getTodayQuestionIndex)
  const question = dailyQuestions[qIndex]
  const arcade = games.filter((g) => g.featured)
  const latestLog = [...clubLogs].sort((a, b) => b.date.localeCompare(a.date))[0]

  const stats = [
    { label: '철학자', value: philosophers.length, to: '/philosophers' },
    { label: '수업 과목', value: subjects.length, to: '/classes' },
    { label: '게임', value: games.length, to: '/games' },
    { label: '교사자료', value: resources.length, to: '/resources' },
  ]

  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="hero__bg" aria-hidden="true" />
        <div className="container hero__inner">
          <div className="hero__copy">
            <p className="hero__kicker">
              <span className="dot" /> 윤리 · 철학 · 사회 통합 학습 플랫폼
            </p>
            <h1 className="hero__title">
              <span className="hero__en">{site.name}</span>
              <span className="hero__ko">{site.nameKo}</span>
            </h1>
            <p className="hero__slogan">“{site.slogan}”</p>
            <p className="hero__desc">{site.description}</p>
            <div className="hero__cta">
              <Link to="/classes" className="btn btn--gold">
                수업 둘러보기
              </Link>
              <Link to="/games" className="btn btn--outline-light">
                게임 시작 ▶
              </Link>
            </div>
            <ul className="hero__stats">
              {stats.map((s) => (
                <li key={s.label}>
                  <Link to={s.to}>
                    <strong>{s.value}</strong>
                    <span>{s.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <HeroArt />
        </div>
      </section>

      {/* 오늘의 철학 질문 + 프로필 */}
      <section className="section section--cream">
        <div className="container home-grid">
          <Reveal className="question-card">
            <div className="question-card__head">
              <p className="eyebrow eyebrow--gold">TODAY'S QUESTION</p>
              <span className="question-card__no">
                Q{String(qIndex + 1).padStart(2, '0')} / {String(dailyQuestions.length).padStart(2, '0')}
              </span>
            </div>
            <h2>오늘의 철학 질문</h2>
            <blockquote className="question-card__q">“{question.question}”</blockquote>
            {question.hint && <p className="question-card__hint">💡 {question.hint}</p>}
            <div className="question-card__foot">
              <div className="question-card__related">
                {question.related?.map((id) => {
                  const p = getPhilosopher(id)
                  return p ? (
                    <Link key={id} to={`/philosophers/${id}`} className="chip chip--light">
                      {p.symbol} {p.name}
                    </Link>
                  ) : null
                })}
              </div>
              <button type="button" className="btn btn--outline-light btn--sm" onClick={() => setQIndex((i) => (i + 1) % dailyQuestions.length)}>
                다른 질문 ↻
              </button>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <ProfileCard />
          </Reveal>
        </div>
      </section>

      {/* PHILOSOPHY ARCADE */}
      <section className="section arcade">
        <div className="arcade__glow" aria-hidden="true" />
        <div className="container">
          <SectionTitle
            light
            eyebrow="PLAY & THINK"
            title="PHILOSOPHY ARCADE"
            description="놀면서 배우는 철학, 게임처럼 즐기는 사유의 세계"
            action={
              <Link to="/games" className="btn btn--outline-light btn--sm">
                전체 게임 →
              </Link>
            }
          />
          <div className="grid grid--games">
            {arcade.map((g, i) => (
              <Reveal key={g.id} delay={i * 70}>
                <GameCard game={g} index={i} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 수업 */}
      <section className="section">
        <div className="container">
          <SectionTitle
            eyebrow="CLASSES"
            title="수업 탐험하기"
            description="세 과목, 수십 개의 주제. 사상가와 쟁점을 따라 생각의 지도를 넓혀 보세요."
            action={
              <Link to="/classes" className="btn btn--ghost btn--sm">
                수업 전체 →
              </Link>
            }
          />
          <div className="grid grid--3">
            {subjects.map((s, i) => (
              <Reveal key={s.id} delay={i * 80}>
                <ClassCard subject={s} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 철학자 */}
      <section className="section section--cream">
        <div className="container">
          <SectionTitle
            eyebrow="PHILOSOPHER DEX"
            title="철학자 도감"
            description="동양과 서양, 고대부터 현대까지. 철학자 카드를 모아 보세요."
            action={
              <Link to="/philosophers" className="btn btn--ghost btn--sm">
                도감 전체 보기 →
              </Link>
            }
          />
          <div className="grid grid--philo">
            {FEATURED_PHILOSOPHERS.map((id, i) => (
              <Reveal key={id} delay={i * 60}>
                <PhilosopherCard philosopher={getPhilosopher(id)} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 프로젝트 · 동아리 · 교사자료 */}
      <section className="section">
        <div className="container">
          <SectionTitle eyebrow="LAB NOTES" title="탐구와 기록" description="프로젝트, 동아리 활동, 수업 자료가 차곡차곡 쌓이는 곳" />
          <div className="home-trio">
            <Reveal className="home-trio__main">
              <ProjectCard project={projects[0]} />
              <Link to="/projects" className="more-link">
                프로젝트 {projects.length}개 모두 보기 →
              </Link>
            </Reveal>
            <Reveal delay={100} className="card mini-log">
              <p className="eyebrow">CLUB LOG</p>
              <span className="mini-log__date">{latestLog.date}</span>
              <h3>{latestLog.title}</h3>
              <p>{latestLog.summary}</p>
              <div className="mini-log__tags">
                <Badge tone="green">{latestLog.type}</Badge>
              </div>
              <Link to="/club" className="more-link">
                동아리 활동 기록 →
              </Link>
            </Reveal>
            <Reveal delay={200} className="card mini-res">
              <p className="eyebrow">TEACHER ARCHIVE</p>
              <h3>교사자료 아카이브</h3>
              <ul>
                {resources.slice(0, 4).map((r) => (
                  <li key={r.id}>
                    <span>{r.title}</span>
                    <Badge tone={r.visibility === 'public' ? 'green' : 'gold'}>{r.visibility === 'public' ? '학생 공개' : '교사 전용'}</Badge>
                  </li>
                ))}
              </ul>
              <Link to="/resources" className="more-link">
                자료실 가기 →
              </Link>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  )
}
