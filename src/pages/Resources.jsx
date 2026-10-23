import { useMemo, useState } from 'react'
import { RESOURCE_CATEGORIES, VISIBILITY, resources } from '../data/resources'
import PageHeader from '../components/PageHeader'
import FilterChips from '../components/FilterChips'
import Badge from '../components/Badge'
import EmptyState from '../components/EmptyState'
import { asset } from '../utils/asset'

const VIS_OPTIONS = Object.entries(VISIBILITY).map(([value, v]) => ({ value, label: v.label }))

export default function Resources() {
  const [category, setCategory] = useState('')
  const [visibility, setVisibility] = useState('')

  const list = useMemo(
    () =>
      resources
        .filter((r) => (!category || r.category === category) && (!visibility || r.visibility === visibility))
        .sort((a, b) => b.date.localeCompare(a.date)),
    [category, visibility],
  )

  const counts = useMemo(() => Object.fromEntries(RESOURCE_CATEGORIES.map((c) => [c, resources.filter((r) => r.category === c).length])), [])

  return (
    <>
      <PageHeader eyebrow="TEACHER ARCHIVE" icon="🗄️" title="교사자료" description="수업지도안부터 수업 성찰까지, 수업의 모든 기록을 보관하는 아카이브입니다." />
      <section className="section">
        <div className="container">
          <div className="res-cats">
            {RESOURCE_CATEGORIES.map((c) => (
              <button key={c} type="button" className={`res-cat ${category === c ? 'is-active' : ''}`} onClick={() => setCategory(category === c ? '' : c)}>
                <strong>{c}</strong>
                <span>{counts[c]}건</span>
              </button>
            ))}
          </div>

          <div className="toolbar toolbar--compact">
            <FilterChips label="공개 범위" options={VIS_OPTIONS} value={visibility} onChange={setVisibility} />
            {category && (
              <button type="button" className="chip" onClick={() => setCategory('')}>
                {category} ✕
              </button>
            )}
          </div>

          {list.length ? (
            <div className="res-table" role="table" aria-label="자료 목록">
              <div className="res-row res-row--head" role="row">
                <span role="columnheader">자료명</span>
                <span role="columnheader">분류</span>
                <span role="columnheader">과목</span>
                <span role="columnheader">날짜</span>
                <span role="columnheader">공개</span>
                <span role="columnheader">파일</span>
              </div>
              {list.map((r) => (
                <div key={r.id} className="res-row" role="row">
                  <span role="cell" className="res-row__title">
                    <strong>{r.title}</strong>
                    <small>{r.description}</small>
                  </span>
                  <span role="cell">
                    <Badge tone="outline">{r.category}</Badge>
                  </span>
                  <span role="cell" className="res-row__muted">{r.subject}</span>
                  <span role="cell" className="res-row__muted">{r.date}</span>
                  <span role="cell">
                    <Badge tone={VISIBILITY[r.visibility].tone}>
                      {r.visibility === 'teacher' ? '🔒 ' : ''}
                      {VISIBILITY[r.visibility].label}
                    </Badge>
                  </span>
                  <span role="cell">
                    {r.fileUrl ? (
                      <a href={asset(r.fileUrl)} target="_blank" rel="noopener noreferrer" className="file-link">
                        {r.format} ↓
                      </a>
                    ) : (
                      <span className="file-link is-pending">{r.format} · 연결 예정</span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon="📂" title="해당 조건의 자료가 아직 없습니다" />
          )}

          <p className="notice">
            ℹ️ 파일 업로드 기능은 준비 중입니다. <code>public/files/</code>에 파일을 넣고 <code>src/data/resources.js</code>의{' '}
            <code>fileUrl</code>을 채우면 다운로드 버튼이 활성화됩니다. ‘교사 전용’은 현재 표시용이며, 실제 접근 제한은 로그인 기능 도입 후
            적용됩니다.
          </p>
        </div>
      </section>
    </>
  )
}
