import { useMemo, useRef, useState } from 'react'
import { contentTypes, validateItem } from '../../lib/contentTypes'
import { backend } from '../../lib/backend'
import { VISIBILITY } from '../../data/visibility'
import { useContent } from '../../context/ContentContext'
import { classLabel } from '../../hooks/useSchool'
import { asset } from '../../utils/asset'

/** 배열·JSON 필드를 편집용 문자열로 */
const toDraft = (type, item) => {
  const d = { ...item }
  for (const f of contentTypes[type].fields) {
    const v = item[f.key]
    if (f.type === 'tags') d[f.key] = (v || []).join(', ')
    else if (f.type === 'lines') d[f.key] = (v || []).join('\n')
    else if (f.type === 'json') d[f.key] = JSON.stringify(v ?? f.default ?? null, null, 2)
  }
  return d
}

/** 편집용 문자열 → 저장용 값. JSON 오류는 errors 에 담아 반환 */
const fromDraft = (type, draft) => {
  const item = { ...draft }
  const errors = {}
  for (const f of contentTypes[type].fields) {
    const v = draft[f.key]
    if (f.type === 'tags') item[f.key] = String(v || '').split(',').map((s) => s.trim()).filter(Boolean)
    else if (f.type === 'lines') item[f.key] = String(v || '').split('\n').map((s) => s.trim()).filter(Boolean)
    else if (f.type === 'number' || f.type === 'year') item[f.key] = Number(v) || 0
    else if (f.type === 'json') {
      try {
        item[f.key] = v?.trim() ? JSON.parse(v) : f.default
      } catch {
        errors[f.key] = 'JSON 형식이 올바르지 않습니다'
      }
    } else if (typeof v === 'string') item[f.key] = v.trim()
  }
  return { item, errors }
}

function Uploader({ onUploaded, accept = 'image/*', label = '파일 올리기' }) {
  const ref = useRef(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const onChange = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setBusy(true)
    setError('')
    try {
      onUploaded(await backend.content.upload(file))
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }
  return (
    <span className="uploader">
      <button type="button" className="chip" onClick={() => ref.current?.click()} disabled={busy}>
        {busy ? '올리는 중…' : `⬆ ${label}`}
      </button>
      <input ref={ref} type="file" accept={accept === '*' ? undefined : accept} hidden onChange={onChange} />
      {error && <small className="form-error">{error}</small>}
    </span>
  )
}

function RefPicker({ field, value, onChange }) {
  const content = useContent()
  const options = content[field.ref] || []
  const titleKey = contentTypes[field.ref].titleKey
  const labelOf = (id) => {
    const it = options.find((o) => o.id === id)
    return it ? it[titleKey] : id
  }
  if (field.single) {
    return (
      <select value={value || ''} onChange={(e) => onChange(e.target.value)}>
        <option value="">(선택 안 함)</option>
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o[titleKey]}
            {field.ref === 'clubs' ? ` (${o.academicYear})` : ''}
          </option>
        ))}
      </select>
    )
  }
  const selected = value || []
  return (
    <div className="ref-picker">
      <div className="ref-picker__chips">
        {selected.map((id) => (
          <button key={id} type="button" className="chip is-active" onClick={() => onChange(selected.filter((x) => x !== id))} title="빼기">
            {labelOf(id)} ✕
          </button>
        ))}
        {!selected.length && <span className="muted">선택 없음</span>}
      </div>
      <select value="" onChange={(e) => e.target.value && onChange([...selected, e.target.value])}>
        <option value="">+ 추가</option>
        {options
          .filter((o) => !selected.includes(o.id))
          .map((o) => (
            <option key={o.id} value={o.id}>
              {o[titleKey]}
            </option>
          ))}
      </select>
    </div>
  )
}

function ClassPicker({ classes, value, onChange }) {
  const selected = value || []
  if (!classes.length) return <p className="muted">등록된 학급이 없습니다. 학급 관리에서 먼저 추가하세요.</p>
  return (
    <div className="class-picker">
      {classes.map((c) => (
        <label key={c.id} className={`check-chip ${selected.includes(c.id) ? 'is-on' : ''}`}>
          <input type="checkbox" checked={selected.includes(c.id)} onChange={(e) => onChange(e.target.checked ? [...selected, c.id] : selected.filter((x) => x !== c.id))} />
          {classLabel(c)}
        </label>
      ))}
    </div>
  )
}

/**
 * 콘텐츠 편집 폼 — contentTypes 의 필드 정의로 자동 생성됩니다.
 */
export default function ContentEditor({ type, item, isNew, existingIds, classes, onSaved, onCancel }) {
  const def = contentTypes[type]
  const [draft, setDraft] = useState(() => toDraft(type, item))
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)
  const [saveError, setSaveError] = useState('')
  const set = (key, v) => setDraft((d) => ({ ...d, [key]: v }))

  const fields = useMemo(() => def.fields.filter((f) => f.type !== 'classes' || draft.visibility === 'class'), [def, draft.visibility])

  const submit = async (e) => {
    e.preventDefault()
    const { item: next, errors: parseErrors } = fromDraft(type, draft)
    const errs = { ...validateItem(type, next), ...parseErrors }
    if (isNew && existingIds.has(next.id)) errs.id = '이미 사용 중인 ID입니다'
    if (next.visibility !== 'class') next.classIds = []
    setErrors(errs)
    if (Object.keys(errs).length) return
    setBusy(true)
    setSaveError('')
    try {
      await backend.content.save(type, next)
      onSaved(next)
    } catch (err) {
      setSaveError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const renderInput = (f) => {
    const v = draft[f.key]
    switch (f.type) {
      case 'textarea':
      case 'lines':
        return <textarea rows={f.type === 'lines' ? 4 : 3} value={v || ''} onChange={(e) => set(f.key, e.target.value)} />
      case 'json':
        return <textarea className="mono" rows={5} value={v || ''} onChange={(e) => set(f.key, e.target.value)} spellCheck={false} />
      case 'number':
      case 'year':
        return <input type="number" value={v ?? ''} onChange={(e) => set(f.key, e.target.value)} min={f.type === 'year' ? 2000 : undefined} max={f.type === 'year' ? 2100 : undefined} />
      case 'boolean':
        return (
          <label className="switch">
            <input type="checkbox" checked={Boolean(v)} onChange={(e) => set(f.key, e.target.checked)} />
            <span>{v ? '예' : '아니오'}</span>
          </label>
        )
      case 'select':
        return (
          <select value={v ?? ''} onChange={(e) => set(f.key, e.target.value)}>
            {!f.required && !f.options.includes('') && <option value="">(선택)</option>}
            {f.options.map((o) => (
              <option key={o} value={o}>
                {f.optionLabels?.[o] ?? o}
              </option>
            ))}
          </select>
        )
      case 'visibility':
        return (
          <div className="segmented" role="radiogroup">
            {Object.entries(VISIBILITY).map(([value, meta]) => (
              <button key={value} type="button" role="radio" aria-checked={v === value} className={v === value ? 'is-active' : ''} onClick={() => set(f.key, value)} title={meta.desc}>
                {meta.label}
              </button>
            ))}
          </div>
        )
      case 'classes':
        return <ClassPicker classes={classes} value={v} onChange={(x) => set(f.key, x)} />
      case 'ref':
        return <RefPicker field={f} value={v} onChange={(x) => set(f.key, x)} />
      case 'image':
        return (
          <div className="image-field">
            <input type="text" value={v || ''} onChange={(e) => set(f.key, e.target.value)} placeholder="https://… 또는 업로드" />
            <Uploader accept={f.accept || 'image/*'} label={f.accept === '*' ? '파일 올리기' : '이미지 올리기'} onUploaded={(url) => set(f.key, url)} />
            {v && f.accept !== '*' && <img className="image-field__preview" src={asset(v)} alt="" />}
          </div>
        )
      case 'images': {
        const list = v || []
        return (
          <div className="image-field">
            <div className="image-list">
              {list.map((src, i) => (
                <span key={`${src}-${i}`} className="image-list__item">
                  <img src={asset(src)} alt="" />
                  <button type="button" onClick={() => set(f.key, list.filter((_, j) => j !== i))} aria-label="사진 빼기">
                    ✕
                  </button>
                </span>
              ))}
            </div>
            <Uploader label="사진 추가" onUploaded={(url) => set(f.key, [...list, url])} />
          </div>
        )
      }
      default:
        return (
          <input
            type="text"
            value={v ?? ''}
            onChange={(e) => set(f.key, e.target.value)}
            disabled={f.idField && !isNew}
            maxLength={f.maxLength}
            placeholder={f.type === 'url' ? 'https://' : f.type === 'date' ? 'YYYY.MM.DD' : undefined}
          />
        )
    }
  }

  return (
    <form className="editor" onSubmit={submit} noValidate>
      <div className="editor__head">
        <h3>
          {def.icon} {isNew ? `새 ${def.label}` : `${def.label} 수정`}
        </h3>
        <button type="button" className="chip" onClick={onCancel}>
          닫기 ✕
        </button>
      </div>
      <div className="editor__grid">
        {fields.map((f) => (
          <div key={f.key} className={`field ${['textarea', 'lines', 'json', 'ref', 'visibility', 'classes', 'images', 'image'].includes(f.type) ? 'field--wide' : ''}`}>
            <span>
              {f.label}
              {f.required && <b className="req">*</b>}
            </span>
            {renderInput(f)}
            {f.help && <small>{f.help}</small>}
            {errors[f.key] && <small className="form-error">{errors[f.key]}</small>}
          </div>
        ))}
      </div>
      {saveError && <p className="form-error">{saveError}</p>}
      <div className="editor__actions">
        <button type="submit" className="btn btn--gold" disabled={busy}>
          {busy ? '저장 중…' : '저장'}
        </button>
        <button type="button" className="btn btn--ghost" onClick={onCancel}>
          취소
        </button>
      </div>
    </form>
  )
}
