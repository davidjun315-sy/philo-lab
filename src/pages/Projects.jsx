import { useState } from 'react'
import { PROJECT_CATEGORIES, projects } from '../data/projects'
import PageHeader from '../components/PageHeader'
import FilterChips from '../components/FilterChips'
import ProjectCard from '../components/ProjectCard'
import EmptyState from '../components/EmptyState'
import Reveal from '../components/Reveal'

export default function Projects() {
  const [category, setCategory] = useState('')
  const list = category ? projects.filter((p) => p.category === category) : projects

  return (
    <>
      <PageHeader eyebrow="PROJECTS" icon="🧪" title="프로젝트" description="한 차시를 넘어서는 큰 질문. 토론, 사회문제 탐구, 생각실험, 융합 활동을 모았습니다." />
      <section className="section">
        <div className="container">
          <FilterChips label="카테고리" options={PROJECT_CATEGORIES} value={category} onChange={setCategory} />
          {list.length ? (
            <div className="grid grid--3">
              {list.map((p, i) => (
                <Reveal key={p.id} delay={i * 80}>
                  <ProjectCard project={p} />
                </Reveal>
              ))}
            </div>
          ) : (
            <EmptyState icon="🧭" title={`${category} 준비 중`}>
              곧 새로운 프로젝트가 등록될 예정입니다.
            </EmptyState>
          )}
        </div>
      </section>
    </>
  )
}
