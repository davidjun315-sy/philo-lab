import { useState } from 'react'
import { backend } from '../../lib/backend'
import { useSchool } from '../../hooks/useSchool'

/** 학급 관리 — 학년도 › 학년 › 반. 학급 지정 공개(visibility: class)에 사용됩니다. */
export default function AdminClasses() {
  const school = useSchool()
  const thisYear = school.years.find((y) => y.isCurrent)?.year || new Date().getFullYear()
  const [form, setForm] = useState({ academicYear: '', grade: 1, classNumber: 1 })
  const [msg, setMsg] = useState('')
  const year = Number(form.academicYear) || thisYear

  const add = async (e) => {
    e.preventDefault()
    const c = { academicYear: year, grade: Number(form.grade), classNumber: Number(form.classNumber) }
    if (c.academicYear < 2000 || c.academicYear > 2100 || c.grade < 1 || c.grade > 3 || c.classNumber < 1 || c.classNumber > 30) {
      return setMsg('⚠ 학년도·학년(1~3)·반(1~30)을 확인하세요')
    }
    try {
      await backend.school.saveClass(c)
      setMsg(`${c.academicYear}학년도 ${c.grade}학년 ${c.classNumber}반을 추가했습니다`)
      setForm((f) => ({ ...f, classNumber: c.classNumber + 1 }))
      await school.reload()
    } catch (err) {
      setMsg(`⚠ ${err.message}`)
    }
  }

  const remove = async (c, count) => {
    if (count) return setMsg('⚠ 학생이 배정된 학급은 삭제할 수 없습니다')
    if (!window.confirm(`${c.academicYear}학년도 ${c.grade}학년 ${c.classNumber}반을 삭제할까요?`)) return
    try {
      await backend.school.removeClass(c.id)
      await school.reload()
    } catch (err) {
      setMsg(`⚠ ${err.message}`)
    }
  }

  const years = [...new Set(school.classes.map((c) => c.academicYear))].sort((a, b) => b - a)
  const countOf = (c) => school.students.filter((s) => s.classIds?.includes(c.id)).length

  return (
    <div className="admin-page">
      <div className="admin-page__head">
        <h2>🏫 학급 관리</h2>
      </div>
      {msg && <p className="admin-flash">{msg}</p>}

      <form className="admin-panel inline-form" onSubmit={add}>
        <label>
          학년도
          <input type="number" value={form.academicYear || thisYear} onChange={(e) => setForm({ ...form, academicYear: e.target.value })} />
        </label>
        <label>
          학년
          <select value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })}>
            {[1, 2, 3].map((g) => (
              <option key={g} value={g}>
                {g}학년
              </option>
            ))}
          </select>
        </label>
        <label>
          반
          <input type="number" min={1} max={30} value={form.classNumber} onChange={(e) => setForm({ ...form, classNumber: e.target.value })} />
        </label>
        <button type="submit" className="btn btn--gold btn--sm">
          + 학급 추가
        </button>
      </form>
      <p className="muted">CSV로 학생을 등록하면 필요한 학급은 자동으로 만들어집니다.</p>

      {years.map((y) => (
        <section key={y} className="admin-panel">
          <h3>{y}학년도</h3>
          {[1, 2, 3].map((g) => {
            const list = school.classes.filter((c) => c.academicYear === y && c.grade === g)
            if (!list.length) return null
            return (
              <div key={g} className="class-row">
                <strong>{g}학년</strong>
                <div className="class-row__list">
                  {list.map((c) => {
                    const n = countOf(c)
                    return (
                      <span key={c.id} className="class-pill">
                        {c.classNumber}반 <small>{n}명</small>
                        <button type="button" onClick={() => remove(c, n)} aria-label={`${g}학년 ${c.classNumber}반 삭제`}>
                          ✕
                        </button>
                      </span>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </section>
      ))}
      {!years.length && <p className="muted">{school.loading ? '불러오는 중…' : '등록된 학급이 없습니다.'}</p>}
    </div>
  )
}
