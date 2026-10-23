import { useMemo, useState } from 'react'
import { backend, isDemoMode } from '../../lib/backend'
import { useSchool } from '../../hooks/useSchool'
import { CSV_TEMPLATE, downloadCsv, parseStudentCsv } from '../../lib/csv'
import { validatePassword, validateStudentRow } from '../../lib/validation'
import Badge from '../../components/Badge'

/**
 * 학생 관리
 *  - 명부 조회 / 필터 / 정보 수정 / 비활성화 / 비밀번호 초기화
 *  - 한 명 등록, CSV 일괄 등록 (업로드 → 미리보기 → 오류 확인 → 계정 생성)
 * 계정 생성·비밀번호 초기화는 서버(Edge Function)에서 관리자 권한을 다시 확인한 뒤 처리됩니다.
 * 비밀번호는 어디에도 평문으로 저장하지 않으며, 무작위 임시 비밀번호는 생성 직후 한 번만 보여 줍니다.
 */
export default function AdminStudents() {
  const school = useSchool()
  const [panel, setPanel] = useState(null) // 'single' | 'csv' | null
  const [filters, setFilters] = useState({ year: '', grade: '', classNumber: '', q: '', active: 'active' })
  const [flash, setFlash] = useState('')
  const [issued, setIssued] = useState(null) // 방금 발급된 임시 비밀번호 [{ studentNumber, name, tempPassword }]
  const [editing, setEditing] = useState(null)

  const years = [...new Set([...school.years.map((y) => y.year), ...school.students.map((s) => s.academicYear)])].sort((a, b) => b - a)
  const list = useMemo(() => {
    const q = filters.q.trim()
    return school.students.filter(
      (s) =>
        (!filters.year || s.academicYear === Number(filters.year)) &&
        (!filters.grade || s.grade === Number(filters.grade)) &&
        (!filters.classNumber || s.classNumber === Number(filters.classNumber)) &&
        (filters.active === 'all' || (filters.active === 'active') === s.active) &&
        (!q || s.name.includes(q) || s.studentNumber.includes(q)),
    )
  }, [school.students, filters])
  const setFilter = (k) => (e) => setFilters((f) => ({ ...f, [k]: e.target.value }))

  const reset = async (s) => {
    const mode = window.confirm(`${s.name}(${s.studentNumber}) 학생의 비밀번호를 무작위 임시 비밀번호로 초기화할까요?`) ? 'random' : null
    if (!mode) return
    try {
      const { tempPassword } = await backend.school.resetPassword(s.id, { mode })
      setIssued([{ studentNumber: s.studentNumber, name: s.name, tempPassword }])
      setFlash('비밀번호를 초기화했습니다. 학생은 다음 로그인 때 새 비밀번호로 바꾸게 됩니다.')
    } catch (e) {
      setFlash(`⚠ ${e.message}`)
    }
  }

  const toggleActive = async (s) => {
    if (!window.confirm(s.active ? `${s.name} 학생을 비활성화할까요? (로그인 차단, 기록은 보존)` : `${s.name} 학생을 다시 활성화할까요?`)) return
    try {
      await backend.school.setActive(s.id, !s.active)
      await school.reload()
    } catch (e) {
      setFlash(`⚠ ${e.message}`)
    }
  }

  const afterCreate = async (results) => {
    const ok = results.filter((r) => r.ok)
    setIssued(ok.filter((r) => r.tempPassword))
    setFlash(`${ok.length}명 등록 완료${results.length - ok.length ? `, ${results.length - ok.length}명 실패` : ''}`)
    await school.reload()
  }

  return (
    <div className="admin-page">
      <div className="admin-page__head">
        <h2>
          🎓 학생 관리 <span className="admin-count">{list.length}</span>
        </h2>
        <div className="admin-page__tools">
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => setPanel(panel === 'single' ? null : 'single')}>
            + 한 명 등록
          </button>
          <button type="button" className="btn btn--gold btn--sm" onClick={() => setPanel(panel === 'csv' ? null : 'csv')}>
            ⬆ CSV 일괄 등록
          </button>
        </div>
      </div>

      {flash && <p className="admin-flash">{flash}</p>}
      {issued?.length > 0 && <IssuedPasswords list={issued} onClose={() => setIssued(null)} />}
      {panel === 'single' && <SingleStudentForm years={years} onDone={afterCreate} onClose={() => setPanel(null)} existing={school.students} />}
      {panel === 'csv' && <CsvImport existing={school.students} onDone={afterCreate} onClose={() => setPanel(null)} />}
      {editing && (
        <EditStudent
          student={editing}
          onClose={() => setEditing(null)}
          onSaved={async () => {
            setEditing(null)
            await school.reload()
          }}
        />
      )}

      <div className="admin-filter">
        <label>
          학년도
          <select value={filters.year} onChange={setFilter('year')}>
            <option value="">전체</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </label>
        <label>
          학년
          <select value={filters.grade} onChange={setFilter('grade')}>
            <option value="">전체</option>
            {[1, 2, 3].map((g) => (
              <option key={g} value={g}>
                {g}학년
              </option>
            ))}
          </select>
        </label>
        <label>
          반
          <select value={filters.classNumber} onChange={setFilter('classNumber')}>
            <option value="">전체</option>
            {Array.from({ length: 15 }, (_, i) => i + 1).map((c) => (
              <option key={c} value={c}>
                {c}반
              </option>
            ))}
          </select>
        </label>
        <label>
          상태
          <select value={filters.active} onChange={setFilter('active')}>
            <option value="active">활성</option>
            <option value="inactive">비활성</option>
            <option value="all">전체</option>
          </select>
        </label>
        <input className="admin-search" type="search" placeholder="이름·학번 검색" value={filters.q} onChange={setFilter('q')} aria-label="이름·학번 검색" />
      </div>

      {school.error && <p className="form-error">{school.error}</p>}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>학번</th>
              <th>이름</th>
              <th>학년·반·번호</th>
              <th>학년도</th>
              <th>상태</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {list.map((s) => (
              <tr key={s.id} className={s.active ? '' : 'is-muted'}>
                <td>
                  <code>{s.studentNumber}</code>
                </td>
                <td>{s.name}</td>
                <td>
                  {s.grade}-{s.classNumber}-{s.number}
                </td>
                <td>{s.academicYear}</td>
                <td>{s.active ? <Badge tone="green">활성</Badge> : <Badge tone="muted">비활성</Badge>}</td>
                <td className="admin-table__actions">
                  <button type="button" className="chip" onClick={() => setEditing(s)}>
                    수정
                  </button>
                  <button type="button" className="chip" onClick={() => reset(s)}>
                    비밀번호 초기화
                  </button>
                  <button type="button" className="chip" onClick={() => toggleActive(s)}>
                    {s.active ? '비활성화' : '활성화'}
                  </button>
                </td>
              </tr>
            ))}
            {!list.length && (
              <tr>
                <td colSpan={6} className="muted">
                  {school.loading ? '불러오는 중…' : '학생이 없습니다.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="privacy-note">개인정보 최소 수집: 학번·이름·학년·반·번호·학년도만 저장합니다. 연락처·생년월일 등은 받지 않습니다.</p>
    </div>
  )
}

/** 초기 비밀번호 방식 선택 */
function PasswordOption({ value, onChange }) {
  return (
    <fieldset className="pw-option">
      <legend>초기 비밀번호</legend>
      <label className="radio">
        <input type="radio" checked={value.mode === 'random'} onChange={() => onChange({ mode: 'random' })} />
        학생마다 무작위 임시 비밀번호 생성 (권장) — 생성 직후 한 번만 표시
      </label>
      <label className="radio">
        <input type="radio" checked={value.mode === 'common'} onChange={() => onChange({ mode: 'common', value: '' })} />
        공통 초기 비밀번호 지정
      </label>
      {value.mode === 'common' && (
        <input type="text" value={value.value} onChange={(e) => onChange({ mode: 'common', value: e.target.value })} placeholder="영문+숫자 8자 이상" autoComplete="off" />
      )}
      <small>모든 학생은 첫 로그인 후 비밀번호를 바꾸도록 안내됩니다. 비밀번호는 서버에 해시로만 저장됩니다.</small>
    </fieldset>
  )
}

const passwordError = (opt) => (opt.mode === 'common' ? validatePassword(opt.value) : null)

function SingleStudentForm({ years, onDone, onClose, existing }) {
  const year = years[0] || new Date().getFullYear()
  const [row, setRow] = useState({ academicYear: year, grade: 1, classNumber: 1, number: 1, studentNumber: '', name: '' })
  const [pw, setPw] = useState({ mode: 'random' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const set = (k, num) => (e) => setRow((r) => ({ ...r, [k]: num ? Number(e.target.value) : e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    const errs = validateStudentRow(row)
    if (errs.length) return setError(`확인 필요: ${errs.join(', ')}`)
    if (existing.some((s) => s.studentNumber === row.studentNumber)) return setError('이미 등록된 학번입니다')
    const pwErr = passwordError(pw)
    if (pwErr) return setError(pwErr)
    setBusy(true)
    setError('')
    try {
      const results = await backend.school.createStudents([row], pw)
      if (!results[0]?.ok) throw new Error(results[0]?.error || '등록하지 못했습니다')
      await onDone(results)
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="editor" onSubmit={submit} noValidate>
      <div className="editor__head">
        <h3>🎓 학생 한 명 등록</h3>
        <button type="button" className="chip" onClick={onClose}>
          닫기 ✕
        </button>
      </div>
      <div className="editor__grid editor__grid--compact">
        <label className="field">
          <span>학년도</span>
          <input type="number" value={row.academicYear} onChange={set('academicYear', true)} />
        </label>
        <label className="field">
          <span>학년</span>
          <input type="number" min={1} max={3} value={row.grade} onChange={set('grade', true)} />
        </label>
        <label className="field">
          <span>반</span>
          <input type="number" min={1} max={30} value={row.classNumber} onChange={set('classNumber', true)} />
        </label>
        <label className="field">
          <span>번호</span>
          <input type="number" min={1} max={60} value={row.number} onChange={set('number', true)} />
        </label>
        <label className="field">
          <span>학번</span>
          <input inputMode="numeric" value={row.studentNumber} onChange={(e) => setRow((r) => ({ ...r, studentNumber: e.target.value.replace(/[^0-9]/g, '') }))} />
        </label>
        <label className="field">
          <span>이름</span>
          <input value={row.name} onChange={set('name')} maxLength={40} />
        </label>
      </div>
      <PasswordOption value={pw} onChange={setPw} />
      {error && <p className="form-error">{error}</p>}
      <div className="editor__actions">
        <button type="submit" className="btn btn--gold" disabled={busy}>
          {busy ? '등록 중…' : '계정 생성'}
        </button>
      </div>
    </form>
  )
}

function CsvImport({ existing, onDone, onClose }) {
  const [text, setText] = useState('')
  const [parsed, setParsed] = useState(null)
  const [pw, setPw] = useState({ mode: 'random' })
  const [busy, setBusy] = useState(false)
  const [results, setResults] = useState(null)
  const [error, setError] = useState('')
  const existingNumbers = useMemo(() => new Set(existing.map((s) => s.studentNumber)), [existing])

  const loadFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 512 * 1024) return setError('CSV 파일은 512KB 이하여야 합니다')
    const reader = new FileReader()
    reader.onload = () => {
      setText(String(reader.result))
      setParsed(parseStudentCsv(String(reader.result), existingNumbers))
      setResults(null)
    }
    reader.readAsText(file, 'utf-8')
  }

  const preview = () => {
    setParsed(parseStudentCsv(text, existingNumbers))
    setResults(null)
  }

  const valid = parsed?.rows.filter((r) => !r.errors.length) || []
  const invalid = parsed?.rows.filter((r) => r.errors.length) || []

  const create = async () => {
    const pwErr = passwordError(pw)
    if (pwErr) return setError(pwErr)
    if (!window.confirm(`오류 없는 ${valid.length}명의 계정을 만들까요?`)) return
    setBusy(true)
    setError('')
    try {
      const res = await backend.school.createStudents(
        valid.map((r) => r.data),
        pw,
      )
      setResults(res)
      await onDone(res)
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  const step = results ? 4 : parsed && !parsed.headerError ? 2 : 1

  return (
    <section className="editor csv-import">
      <div className="editor__head">
        <h3>⬆ CSV 일괄 등록</h3>
        <button type="button" className="chip" onClick={onClose}>
          닫기 ✕
        </button>
      </div>
      <ol className="csv-steps">
        {['CSV 업로드', '미리보기', '오류 확인', '계정 생성'].map((s, i) => (
          <li key={s} className={step >= i + 1 || (i === 2 && step >= 2) ? 'is-on' : ''}>
            <span>{i + 1}</span>
            {s}
          </li>
        ))}
      </ol>

      <div className="csv-input">
        <div className="csv-input__actions">
          <label className="btn btn--ghost btn--sm">
            파일 선택
            <input type="file" accept=".csv,text/csv" hidden onChange={loadFile} />
          </label>
          <button type="button" className="chip" onClick={() => downloadCsv('philolab-students-template.csv', CSV_TEMPLATE.trim().split('\n').map((l) => l.split(',')))}>
            양식 내려받기
          </button>
        </div>
        <textarea className="mono" rows={5} value={text} onChange={(e) => setText(e.target.value)} placeholder={CSV_TEMPLATE} spellCheck={false} />
        <button type="button" className="btn btn--ghost btn--sm" onClick={preview} disabled={!text.trim()}>
          미리보기
        </button>
      </div>

      {parsed?.headerError && <p className="form-error">{parsed.headerError}</p>}

      {parsed && !parsed.headerError && (
        <>
          <p className="csv-summary">
            총 {parsed.rows.length}명 · <b className="ok">정상 {valid.length}</b> · <b className="bad">오류 {invalid.length}</b>
            {invalid.length > 0 && ' — 오류가 있는 줄은 등록되지 않습니다. CSV를 고친 뒤 다시 미리보기 하세요.'}
          </p>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>줄</th>
                  <th>학년도</th>
                  <th>학년</th>
                  <th>반</th>
                  <th>번호</th>
                  <th>학번</th>
                  <th>이름</th>
                  <th>확인</th>
                </tr>
              </thead>
              <tbody>
                {parsed.rows.map((r) => (
                  <tr key={r.line} className={r.errors.length ? 'is-error' : ''}>
                    <td>{r.line}</td>
                    <td>{r.data.academicYear || '-'}</td>
                    <td>{r.data.grade || '-'}</td>
                    <td>{r.data.classNumber || '-'}</td>
                    <td>{r.data.number || '-'}</td>
                    <td>{r.data.studentNumber}</td>
                    <td>{r.data.name}</td>
                    <td>{r.errors.length ? r.errors.join(', ') : '✓'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!results && valid.length > 0 && (
            <>
              <PasswordOption value={pw} onChange={setPw} />
              {isDemoMode && <p className="muted">데모 모드: 계정은 이 브라우저에만 만들어집니다.</p>}
              <button type="button" className="btn btn--gold" onClick={create} disabled={busy}>
                {busy ? '계정 생성 중…' : `${valid.length}명 계정 생성`}
              </button>
            </>
          )}
        </>
      )}
      {error && <p className="form-error">{error}</p>}

      {results && (
        <div className="csv-results">
          <h4>생성 결과</h4>
          <ul>
            {results
              .filter((r) => !r.ok)
              .map((r) => (
                <li key={r.studentNumber} className="bad">
                  ✗ {r.studentNumber} {r.name}: {r.error}
                </li>
              ))}
          </ul>
          <p>
            ✓ {results.filter((r) => r.ok).length}명 생성 완료.
            {pw.mode === 'random' ? ' 임시 비밀번호는 위 안내 상자에서 내려받으세요.' : ' 학생들에게 공통 초기 비밀번호를 안내하세요.'}
          </p>
        </div>
      )}
    </section>
  )
}

/** 방금 발급된 임시 비밀번호 — 화면을 벗어나면 다시 볼 수 없습니다 */
function IssuedPasswords({ list, onClose }) {
  const download = () =>
    downloadCsv(`philolab-temp-passwords-${new Date().toISOString().slice(0, 10)}.csv`, [['학번', '이름', '임시 비밀번호'], ...list.map((r) => [r.studentNumber, r.name, r.tempPassword])])
  return (
    <div className="issued">
      <div className="issued__head">
        <strong>🔑 임시 비밀번호 {list.length}건</strong>
        <div>
          <button type="button" className="btn btn--gold btn--sm" onClick={download}>
            CSV로 내려받기
          </button>
          <button type="button" className="chip" onClick={onClose}>
            닫기
          </button>
        </div>
      </div>
      <p>이 비밀번호는 저장되지 않으며 지금 한 번만 볼 수 있습니다. 학생에게 전달한 뒤 파일은 삭제하세요.</p>
      <ul>
        {list.slice(0, 10).map((r) => (
          <li key={r.studentNumber}>
            <code>{r.studentNumber}</code> {r.name} — <code>{r.tempPassword}</code>
          </li>
        ))}
        {list.length > 10 && <li>… 외 {list.length - 10}명 (CSV로 확인)</li>}
      </ul>
    </div>
  )
}

function EditStudent({ student, onClose, onSaved }) {
  const [row, setRow] = useState({ ...student })
  const [error, setError] = useState('')
  const set = (k, num) => (e) => setRow((r) => ({ ...r, [k]: num ? Number(e.target.value) : e.target.value }))
  const submit = async (e) => {
    e.preventDefault()
    const errs = validateStudentRow(row)
    if (errs.length) return setError(`확인 필요: ${errs.join(', ')}`)
    try {
      await backend.school.updateStudent(student.id, row)
      onSaved()
    } catch (err) {
      setError(err.message)
    }
  }
  return (
    <form className="editor" onSubmit={submit} noValidate>
      <div className="editor__head">
        <h3>
          학생 정보 수정 · <code>{student.studentNumber}</code>
        </h3>
        <button type="button" className="chip" onClick={onClose}>
          닫기 ✕
        </button>
      </div>
      <div className="editor__grid editor__grid--compact">
        <label className="field">
          <span>이름</span>
          <input value={row.name} onChange={set('name')} maxLength={40} />
        </label>
        <label className="field">
          <span>학년</span>
          <input type="number" value={row.grade} onChange={set('grade', true)} />
        </label>
        <label className="field">
          <span>반</span>
          <input type="number" value={row.classNumber} onChange={set('classNumber', true)} />
        </label>
        <label className="field">
          <span>번호</span>
          <input type="number" value={row.number} onChange={set('number', true)} />
        </label>
      </div>
      <p className="muted">학번·학년도는 로그인 정보와 기록 보존을 위해 바꿀 수 없습니다. 다음 학년도에는 새 학번으로 등록하세요.</p>
      {error && <p className="form-error">{error}</p>}
      <div className="editor__actions">
        <button type="submit" className="btn btn--gold">
          저장
        </button>
      </div>
    </form>
  )
}
