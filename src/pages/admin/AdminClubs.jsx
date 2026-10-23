import { useState } from 'react'
import { Link } from 'react-router-dom'
import { backend } from '../../lib/backend'
import { useContent } from '../../context/ContentContext'
import { useSchool } from '../../hooks/useSchool'
import AdminContent from './AdminContent'

/**
 * 동아리 관리: 학년도 → 동아리 → 활동
 * 학년도가 바뀌면 새 학년도와 새 동아리를 만들고, 지난 동아리는 '보관' 처리합니다. (기록은 삭제하지 않음)
 */
export default function AdminClubs() {
  const content = useContent()
  const school = useSchool({ students: false })
  const [tab, setTab] = useState('clubs')
  const years = [...new Set([...school.years.map((y) => y.year), ...content.clubs.map((c) => c.academicYear)])].sort((a, b) => b - a)
  const [year, setYear] = useState('')
  const [clubId, setClubId] = useState('')
  const [newYear, setNewYear] = useState(String(new Date().getFullYear() + 1))
  const [msg, setMsg] = useState('')

  const clubsOfYear = content.clubs.filter((c) => !year || c.academicYear === Number(year))

  const addYear = async (e) => {
    e.preventDefault()
    const y = Number(newYear)
    if (!Number.isInteger(y) || y < 2000 || y > 2100) return setMsg('⚠ 학년도는 2000~2100 사이 숫자입니다')
    try {
      await backend.school.saveYear({ year: y, label: `${y}학년도`, isCurrent: false })
      setMsg(`${y}학년도를 추가했습니다`)
      await Promise.all([school.reload(), content.reload()])
    } catch (err) {
      setMsg(`⚠ ${err.message}`)
    }
  }

  const setCurrent = async (y) => {
    await backend.school.saveYear({ ...y, isCurrent: true })
    setMsg(`${y.year}학년도를 현재 학년도로 지정했습니다`)
    await Promise.all([school.reload(), content.reload()])
  }

  return (
    <div className="admin-page">
      <div className="admin-page__head">
        <h2>🌿 동아리 관리</h2>
        <Link to="/club" className="btn btn--ghost btn--sm">
          동아리 페이지 보기 →
        </Link>
      </div>
      <div className="admin-tabs" role="tablist">
        {[
          ['years', '학년도'],
          ['clubs', '동아리'],
          ['activities', '활동 기록'],
        ].map(([id, label]) => (
          <button key={id} type="button" role="tab" aria-selected={tab === id} className={tab === id ? 'is-active' : ''} onClick={() => setTab(id)}>
            {label}
          </button>
        ))}
      </div>
      {msg && <p className="admin-flash">{msg}</p>}

      {tab === 'years' && (
        <section className="admin-panel">
          <h3>학년도</h3>
          <table className="admin-table">
            <thead>
              <tr>
                <th>학년도</th>
                <th>동아리 수</th>
                <th>상태</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {school.years.map((y) => (
                <tr key={y.year}>
                  <td>{y.label || `${y.year}학년도`}</td>
                  <td>{content.clubs.filter((c) => c.academicYear === y.year).length}</td>
                  <td>{y.isCurrent ? '✅ 현재 학년도' : ''}</td>
                  <td>
                    {!y.isCurrent && (
                      <button type="button" className="chip" onClick={() => setCurrent(y)}>
                        현재 학년도로 지정
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <form className="inline-form" onSubmit={addYear}>
            <input type="number" min={2000} max={2100} value={newYear} onChange={(e) => setNewYear(e.target.value)} aria-label="새 학년도" />
            <button type="submit" className="btn btn--gold btn--sm">
              + 새 학년도 추가
            </button>
          </form>
          <p className="muted">새 학년도를 추가한 뒤 ‘동아리’ 탭에서 그 해의 동아리를 만들고, 지난 동아리는 ‘지난 동아리로 보관’을 켜 주세요.</p>
        </section>
      )}

      {tab === 'clubs' && (
        <>
          <div className="admin-filter">
            <label>
              학년도
              <select value={year} onChange={(e) => setYear(e.target.value)}>
                <option value="">전체</option>
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <AdminContent
            embedded
            type="clubs"
            title="동아리"
            filter={year ? (c) => c.academicYear === Number(year) : undefined}
            defaults={{ academicYear: Number(year) || school.years.find((y) => y.isCurrent)?.year || new Date().getFullYear() }}
          />
        </>
      )}

      {tab === 'activities' && (
        <>
          <div className="admin-filter">
            <label>
              학년도
              <select
                value={year}
                onChange={(e) => {
                  setYear(e.target.value)
                  setClubId('')
                }}
              >
                <option value="">전체</option>
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </label>
            <label>
              동아리
              <select value={clubId} onChange={(e) => setClubId(e.target.value)}>
                <option value="">전체</option>
                {clubsOfYear.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.academicYear})
                  </option>
                ))}
              </select>
            </label>
          </div>
          <AdminContent
            embedded
            type="clubActivities"
            title="활동 기록"
            filter={(a) => (!clubId || a.clubId === clubId) && (!year || content.getClub(a.clubId)?.academicYear === Number(year))}
            defaults={{ clubId: clubId || clubsOfYear[0]?.id || '', date: new Date().toISOString().slice(0, 10).replace(/-/g, '.') }}
          />
        </>
      )}
    </div>
  )
}
