import { useMemo, useState } from 'react'
import { backend, isDemoMode } from '../../lib/backend'
import { contentTypes } from '../../lib/contentTypes'
import { applyImport, backupFileName, buildBackup, downloadJson, planImport, summarizeEdits } from '../../lib/backup'
import { useContent } from '../../context/ContentContext'
import { useSchool } from '../../hooks/useSchool'
import Badge from '../../components/Badge'

/**
 * 백업 · 이전
 *  1) 내보내기 — 현재 데이터를 JSON 파일로 저장 (읽기만 함, 아무것도 지우지 않음)
 *  2) 가져오기 — 백업 파일의 수정 내용을 미리보기 후 선택한 것만 추가/수정 (삭제 없음)
 */
export default function AdminBackup() {
  const content = useContent()
  const school = useSchool({ students: false })
  const local = useMemo(() => (backend.exportLocal ? backend.exportLocal() : null), [])
  const editSummary = summarizeEdits(local?.edits)
  const legacyKeys = Object.keys(local?.legacy || {})
  const [exported, setExported] = useState('')
  const [exportError, setExportError] = useState('')

  const exportNow = async () => {
    setExportError('')
    try {
      const data = await buildBackup(content)
      const name = backupFileName()
      downloadJson(name, data)
      setExported(name)
    } catch (e) {
      setExportError(e.message)
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-page__head">
        <h2>💾 백업 · 이전</h2>
      </div>

      <section className="admin-panel">
        <h3>1. 내보내기 (백업 파일 만들기)</h3>
        {isDemoMode ? (
          <>
            <p className="muted">
              지금은 <b>데모 모드</b>라서 관리자 수정 내용이 <b>이 기기·이 브라우저</b>에만 저장되어 있습니다. 수정했던 기기(예: 휴대폰)마다 이
              화면에서 각각 내보내기 하세요.
            </p>
            <ul className="backup-summary">
              {editSummary.length ? (
                editSummary.map((r) => (
                  <li key={r.type}>
                    {contentTypes[r.type].icon} {contentTypes[r.type].label}: 수정·추가 <b>{r.saved}</b>건{r.deleted ? `, 삭제 ${r.deleted}건` : ''}
                  </li>
                ))
              ) : (
                <li>이 브라우저에는 현재 형식의 관리자 수정 기록이 없습니다.</li>
              )}
              {legacyKeys.map((k) => (
                <li key={k}>
                  📦 예전 저장 데이터 발견: <code>{k}</code> — 백업에 함께 포함됩니다.
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="muted">DB의 콘텐츠 전체(철학자·게임·수업·프로젝트·동아리·자료·질문)와 학년도·학급 구성을 파일로 저장합니다. 정기 백업용으로 사용하세요.</p>
        )}
        <p className="muted">학생 명부·비밀번호·활동 기록 같은 개인정보는 백업 파일에 넣지 않습니다. 내보내기는 아무것도 바꾸거나 지우지 않습니다.</p>
        <div>
          <button type="button" className="btn btn--gold" onClick={exportNow}>
            ⬇ 백업 파일 내려받기
          </button>
        </div>
        {exported && <p className="admin-flash">✓ {exported} 저장 완료 — 안전한 곳(구글 드라이브 등)에 보관하세요.</p>}
        {exportError && <p className="form-error">{exportError}</p>}
      </section>

      <ImportPanel content={content} classes={school.classes} reloadSchool={school.reload} />

      <section className="admin-panel">
        <h3>3. Supabase로 옮기는 순서</h3>
        <ol className="backup-steps">
          <li>수정했던 모든 기기에서 위 <b>내보내기</b>로 백업 파일을 받습니다.</li>
          <li>Supabase 프로젝트를 만들고 SQL Editor에서 마이그레이션 2개와 <code>seed.sql</code>을 실행합니다. (README 5장)</li>
          <li>Edge Function 배포, 최초 관리자(<code>admin</code>) 생성 (README 5~6장)</li>
          <li>GitHub → Settings → Secrets and variables → Actions → Variables에 키를 등록하고 재배포합니다.</li>
          <li>배포된 사이트에 관리자로 로그인 → 이 화면의 <b>가져오기</b>에서 백업 파일을 올리고, 미리보기를 확인한 뒤 가져옵니다.</li>
          <li>데모 모드에 저장된 기존 데이터는 지워지지 않고 그대로 남습니다.</li>
        </ol>
      </section>
    </div>
  )
}

const STATUS = { new: { label: '새 항목', tone: 'green' }, update: { label: '수정', tone: 'gold' } }

function ImportPanel({ content, classes, reloadSchool }) {
  const [backup, setBackup] = useState(null)
  const [plan, setPlan] = useState(null)
  const [selected, setSelected] = useState(new Set())
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [results, setResults] = useState(null)

  const onFile = (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setError('')
    setResults(null)
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result))
        const p = planImport(data, content, classes)
        setBackup(data)
        setPlan(p)
        setSelected(new Set(p.rows.map((r) => r.key)))
      } catch (err) {
        setPlan(null)
        setError(err.message.includes('JSON') ? '백업 파일을 읽을 수 없습니다 (JSON 형식 오류)' : err.message)
      }
    }
    reader.readAsText(file, 'utf-8')
  }

  const toggle = (key) =>
    setSelected((s) => {
      const next = new Set(s)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })

  const run = async () => {
    const rows = plan.rows.filter((r) => selected.has(r.key))
    if (!rows.length) return
    if (!window.confirm(`선택한 ${rows.length}개 항목을 가져올까요? (추가·수정만 하고 삭제는 하지 않습니다)`)) return
    setBusy(true)
    try {
      const res = await applyImport(rows, backup)
      setResults(res)
      await Promise.all([content.reload(), reloadSchool()])
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="admin-panel">
      <h3>2. 가져오기 (백업 파일 반영)</h3>
      <p className="muted">
        백업 파일에서 기본 데이터와 달라진 항목만 찾아 보여 줍니다. 선택한 항목만 <b>추가하거나 달라진 부분만 수정</b>하며, <b>삭제는 하지 않습니다.</b>
      </p>
      <label className="btn btn--ghost btn--sm backup-file">
        백업 파일 선택 (.json)
        <input type="file" accept=".json,application/json" hidden onChange={onFile} />
      </label>
      {error && <p className="form-error">{error}</p>}

      {plan && !results && (
        <>
          <p className="csv-summary">
            백업 시각 {backup.exportedAt ? new Date(backup.exportedAt).toLocaleString('ko-KR') : '-'} · 출처 {backup.source === 'demo' ? '데모 모드(브라우저)' : 'Supabase DB'} ·
            가져올 수 있는 항목 <b>{plan.rows.length}</b>개
          </p>
          {plan.deleted.length > 0 && (
            <p className="notice">
              ℹ 백업에는 삭제했던 항목 {plan.deleted.length}개가 기록되어 있습니다 ({plan.deleted.map((d) => d.id).join(', ')}). 가져오기는 삭제하지 않으니 필요하면 각 관리 화면에서 직접
              삭제하세요.
            </p>
          )}
          {plan.missingClasses.length > 0 && <p className="notice">ℹ 없는 학급은 자동으로 만들어 연결합니다: {plan.missingClasses.join(', ')}</p>}
          {plan.rows.length ? (
            <>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>
                        <input
                          type="checkbox"
                          aria-label="전체 선택"
                          checked={selected.size === plan.rows.length}
                          onChange={(e) => setSelected(e.target.checked ? new Set(plan.rows.map((r) => r.key)) : new Set())}
                        />
                      </th>
                      <th>종류</th>
                      <th>항목</th>
                      <th>구분</th>
                      <th>바뀌는 필드</th>
                    </tr>
                  </thead>
                  <tbody>
                    {plan.rows.map((r) => (
                      <tr key={r.key}>
                        <td>
                          <input type="checkbox" checked={selected.has(r.key)} onChange={() => toggle(r.key)} aria-label={`${r.title} 선택`} />
                        </td>
                        <td>{contentTypes[r.type].label}</td>
                        <td>
                          <strong>{r.title}</strong> <code>{r.id}</code>
                          {r.note && <div className="form-error">{r.note}</div>}
                        </td>
                        <td>
                          <Badge tone={STATUS[r.status].tone}>{STATUS[r.status].label}</Badge>
                        </td>
                        <td className="backup-fields">{r.status === 'new' ? '전체' : r.changedKeys.join(', ')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div>
                <button type="button" className="btn btn--gold" disabled={busy || !selected.size} onClick={run}>
                  {busy ? '가져오는 중…' : `선택한 ${selected.size}개 가져오기`}
                </button>
              </div>
            </>
          ) : (
            <p className="admin-flash">현재 사이트와 다른 항목이 없습니다. 가져올 것이 없어요.</p>
          )}
        </>
      )}

      {results && (
        <div className="csv-results">
          <p>
            ✓ {results.filter((r) => r.ok).length}개 반영 완료{results.some((r) => !r.ok) ? `, ${results.filter((r) => !r.ok).length}개 실패` : ''}
          </p>
          <ul>
            {results
              .filter((r) => !r.ok)
              .map((r) => (
                <li key={r.key} className="bad">
                  ✗ {contentTypes[r.type].label} {r.title}: {r.error}
                </li>
              ))}
          </ul>
        </div>
      )}
    </section>
  )
}
