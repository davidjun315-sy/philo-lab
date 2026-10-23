import { useState } from 'react'
import { CONTENT_TYPE_KEYS, contentTypes } from '../../lib/contentTypes'
import { backend } from '../../lib/backend'
import { VISIBILITY } from '../../data/visibility'
import { useContent } from '../../context/ContentContext'
import { classLabel, useSchool } from '../../hooks/useSchool'

/**
 * 공개 범위 관리 — 모든 콘텐츠의 visibility / 공개 학급을 한 화면에서 바꿉니다.
 * 실제 접근 제한은 DB 의 can_view() + RLS 정책이 수행합니다.
 */
export default function AdminVisibility() {
  const content = useContent()
  const { classes } = useSchool({ students: false })
  const [type, setType] = useState('lessons')
  const [only, setOnly] = useState('')
  const [msg, setMsg] = useState('')
  const [pendingClass, setPendingClass] = useState(null) // 학급 지정 중인 항목

  const def = contentTypes[type]
  const list = content[type].filter((i) => !only || i.visibility === only)

  const save = async (item, patch) => {
    const next = { ...item, ...patch }
    if (next.visibility === 'class' && !next.classIds.length) {
      setPendingClass(next)
      return
    }
    if (next.visibility !== 'class') next.classIds = []
    try {
      await backend.content.save(type, next)
      setMsg(`‘${item[def.titleKey]}’ → ${VISIBILITY[next.visibility].label}`)
      setPendingClass(null)
      await content.reload()
    } catch (e) {
      setMsg(`⚠ ${e.message}`)
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-page__head">
        <h2>🔐 공개 범위 관리</h2>
      </div>
      <div className="vis-legend">
        {Object.entries(VISIBILITY).map(([k, v]) => (
          <span key={k}>
            <b className={`badge badge--${v.tone}`}>{v.label}</b> {v.desc}
          </span>
        ))}
      </div>
      <div className="admin-filter">
        <label>
          콘텐츠
          <select value={type} onChange={(e) => setType(e.target.value)}>
            {CONTENT_TYPE_KEYS.map((t) => (
              <option key={t} value={t}>
                {contentTypes[t].label}
              </option>
            ))}
          </select>
        </label>
        <label>
          공개 범위
          <select value={only} onChange={(e) => setOnly(e.target.value)}>
            <option value="">전체</option>
            {Object.entries(VISIBILITY).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      {msg && <p className="admin-flash">{msg}</p>}

      {pendingClass && (
        <div className="editor">
          <div className="editor__head">
            <h3>‘{pendingClass[def.titleKey]}’ 공개 학급 선택</h3>
            <button type="button" className="chip" onClick={() => setPendingClass(null)}>
              취소
            </button>
          </div>
          <div className="class-picker">
            {classes.map((c) => (
              <label key={c.id} className={`check-chip ${pendingClass.classIds.includes(c.id) ? 'is-on' : ''}`}>
                <input
                  type="checkbox"
                  checked={pendingClass.classIds.includes(c.id)}
                  onChange={(e) =>
                    setPendingClass((p) => ({ ...p, classIds: e.target.checked ? [...p.classIds, c.id] : p.classIds.filter((x) => x !== c.id) }))
                  }
                />
                {classLabel(c)}
              </label>
            ))}
          </div>
          <div className="editor__actions">
            <button type="button" className="btn btn--gold btn--sm" disabled={!pendingClass.classIds.length} onClick={() => save(pendingClass, {})}>
              학급 지정 공개로 저장
            </button>
          </div>
        </div>
      )}

      <div className="admin-list">
        {list.map((item) => (
          <div key={item.id} className="admin-row">
            <div className="admin-row__main">
              <strong>{item[def.titleKey]}</strong>
              <small>
                {def.subtitle(item)}
                {item.visibility === 'class' && ` · ${item.classIds.map((id) => classLabel(classes.find((c) => c.id === id))).filter(Boolean).join(', ')}`}
              </small>
            </div>
            <div className="segmented segmented--sm" role="radiogroup" aria-label="공개 범위">
              {Object.entries(VISIBILITY).map(([k, v]) => (
                <button
                  key={k}
                  type="button"
                  role="radio"
                  aria-checked={item.visibility === k}
                  className={item.visibility === k ? 'is-active' : ''}
                  onClick={() => (k === 'class' ? setPendingClass({ ...item, visibility: 'class' }) : item.visibility !== k && save(item, { visibility: k }))}
                >
                  {v.short}
                </button>
              ))}
            </div>
          </div>
        ))}
        {!list.length && <p className="muted admin-empty">항목이 없습니다.</p>}
      </div>
    </div>
  )
}
