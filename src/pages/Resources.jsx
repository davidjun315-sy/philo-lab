import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { RESOURCE_CATEGORIES } from '../data/resources'
import { VISIBILITY } from '../data/visibility'
import { useContent } from '../context/ContentContext'
import { useAuth } from '../context/AuthContext'
import PageHeader from '../components/PageHeader'
import FilterChips from '../components/FilterChips'
import Badge from '../components/Badge'
import EmptyState from '../components/EmptyState'
import { asset } from '../utils/asset'

export default function Resources() {
  const { resources } = useContent()
  const { isGuest, isAdmin } = useAuth()
  const [category, setCategory] = useState('')
  const [visibility, setVisibility] = useState('')

  // 실제로 보이는 공개 범위만 필터로 제공 (게스트에게 교사 전용 필터를 보여줄 필요 없음)
  const visOptions = useMemo(() => {
    const present = new Set(resources.map((r) => r.visibility))
    return Object.entries(VISIBILITY)
      .filter(([v]) => present.has(v))
      .map(([value, v]) => ({ value, label: v.label }))
  }, [resources])

  const list = useMemo(
    () =>
      resources
        .filter((r) => (!category || r.category === category) && (!visibility || r.visibility === visibility))
        .sort((a, b) => (b.date || '').localeCompare(a.date || '')),
    [resources, category, visibility],
  )

  const counts = useMemo(() => Object.fromEntries(RESOURCE_CATEGORIES.map((c) => [c, resources.filter((r) => r.category === c).length])), [resources])

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

          {isGuest && (
            <p className="notice notice--lock">
              🔒 학생 전용·학급 전용 자료는 <Link to="/login?next=%2Fresources">로그인</Link> 후 볼 수 있습니다. 교사 전용 자료는 관리자만 볼 수 있습니다.
            </p>
          )}

          <div className="toolbar toolbar--compact">
            {visOptions.length > 1 && <FilterChips label="공개 범위" options={visOptions} value={visibility} onChange={setVisibility} />}
            {category && (
              <button type="button" className="chip" onClick={() => setCategory('')}>
                {category} ✕
              </button>
            )}
            {isAdmin && (
              <Link to="/admin/resources" className="btn btn--ghost btn--sm">
                ⚙ 자료 관리
              </Link>
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
                  <span role="cell" className="res-row__muted">
                    {r.subject}
                  </span>
                  <span role="cell" className="res-row__muted">
                    {r.date}
                  </span>
                  <span role="cell">
                    <Badge tone={VISIBILITY[r.visibility]?.tone}>
                      {r.visibility !== 'public' ? '🔒 ' : ''}
                      {VISIBILITY[r.visibility]?.label}
                    </Badge>
                  </span>
                  <span role="cell">
                    {r.fileUrl ? (
                      <a href={asset(r.fileUrl)} target="_blank" rel="noopener noreferrer" className="file-link">
                        {r.format || '열기'} ↓
                      </a>
                    ) : (
                      <span className="file-link is-pending">{r.format ? `${r.format} · ` : ''}연결 예정</span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon="📂" title="해당 조건의 자료가 아직 없습니다" />
          )}
        </div>
      </section>
    </>
  )
}
