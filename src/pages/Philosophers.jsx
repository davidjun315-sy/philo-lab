import { useMemo, useState } from 'react'
import { ERAS, REGIONS } from '../data/philosophers'
import { useContent } from '../context/ContentContext'
import PageHeader from '../components/PageHeader'
import FilterChips from '../components/FilterChips'
import PhilosopherCard from '../components/PhilosopherCard'
import EmptyState from '../components/EmptyState'

export default function Philosophers() {
  const { philosophers } = useContent()
  const [region, setRegion] = useState('')
  const [era, setEra] = useState('')
  const [query, setQuery] = useState('')

  const list = useMemo(() => {
    const q = query.trim().toLowerCase()
    return philosophers.filter((p) => {
      if (region && p.region !== region) return false
      if (era && p.era !== era) return false
      if (!q) return true
      return [p.name, p.nameEn, p.school, ...p.keywords].join(' ').toLowerCase().includes(q)
    })
  }, [philosophers, region, era, query])

  return (
    <>
      <PageHeader eyebrow="PHILOSOPHER DEX" icon="📜" title="철학자 도감" description="동서양 사상가를 시대와 지역별로 모아 보세요. 카드를 누르면 상세 정보가 열립니다." />
      <section className="section">
        <div className="container">
          <div className="toolbar">
            <label className="search-input">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="이름, 키워드로 검색 (예: 정언명령, 성선설)" aria-label="철학자 검색" />
            </label>
            <div className="toolbar__filters">
              <FilterChips label="지역" options={REGIONS} value={region} onChange={setRegion} />
              <FilterChips label="시대" options={ERAS} value={era} onChange={setEra} />
            </div>
          </div>

          <p className="result-count">
            <strong>{list.length}</strong>명의 철학자
          </p>

          {list.length ? (
            <div className="grid grid--philo">
              {list.map((p) => (
                <PhilosopherCard key={p.id} philosopher={p} />
              ))}
            </div>
          ) : (
            <EmptyState icon="🔭" title="조건에 맞는 철학자가 없습니다">
              필터를 바꾸거나 다른 검색어를 입력해 보세요.
            </EmptyState>
          )}
        </div>
      </section>
    </>
  )
}
