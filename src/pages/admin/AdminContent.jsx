import { useMemo, useState } from 'react'
import { contentTypes, newItem, withDefaults } from '../../lib/contentTypes'
import { backend } from '../../lib/backend'
import { VISIBILITY } from '../../data/visibility'
import { useContent } from '../../context/ContentContext'
import { useSchool } from '../../hooks/useSchool'
import Badge from '../../components/Badge'
import ContentEditor from './ContentEditor'

/**
 * 콘텐츠 관리 (추가 / 수정 / 삭제) — 모든 콘텐츠 종류에 공통으로 사용
 *   filter   : 목록 필터 함수 (예: 특정 동아리의 활동만)
 *   defaults : 새 항목 기본값 (예: { clubId })
 */
export default function AdminContent({ type, filter, defaults, title, embedded = false }) {
  const def = contentTypes[type]
  const content = useContent()
  const { classes } = useSchool({ students: false })
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState(null) // { item, isNew }
  const [message, setMessage] = useState('')

  const all = content[type]
  const list = useMemo(() => {
    const q = query.trim().toLowerCase()
    return all.filter((i) => (!filter || filter(i)) && (!q || JSON.stringify(i).toLowerCase().includes(q)))
  }, [all, filter, query])
  const existingIds = useMemo(() => new Set(all.map((i) => i.id)), [all])

  const startNew = () => setEditing({ item: withDefaults(type, { ...newItem(type), ...defaults, sortOrder: all.length }), isNew: true })

  const onSaved = async (item) => {
    setEditing(null)
    setMessage(`‘${item[def.titleKey]}’ 저장 완료`)
    await content.reload()
  }

  const remove = async (item) => {
    if (!window.confirm(`‘${item[def.titleKey]}’을(를) 삭제할까요? 되돌릴 수 없습니다.`)) return
    try {
      await backend.content.remove(type, item.id)
      setMessage('삭제했습니다')
      await content.reload()
    } catch (e) {
      setMessage(`⚠ ${e.message}`)
    }
  }

  return (
    <div className={embedded ? '' : 'admin-page'}>
      <div className="admin-page__head">
        <h2>
          {def.icon} {title || `${def.label} 관리`} <span className="admin-count">{list.length}</span>
        </h2>
        <div className="admin-page__tools">
          <input className="admin-search" type="search" placeholder="검색" value={query} onChange={(e) => setQuery(e.target.value)} aria-label={`${def.label} 검색`} />
          <button type="button" className="btn btn--gold btn--sm" onClick={startNew}>
            + 새 {def.label}
          </button>
        </div>
      </div>

      {message && (
        <p className="admin-flash" role="status">
          {message}
        </p>
      )}

      {editing && (
        <ContentEditor
          key={editing.item.id || 'new'}
          type={type}
          item={editing.item}
          isNew={editing.isNew}
          existingIds={existingIds}
          classes={classes}
          onSaved={onSaved}
          onCancel={() => setEditing(null)}
        />
      )}

      <div className="admin-list">
        {list.map((item) => (
          <div key={item.id} className="admin-row">
            <div className="admin-row__main">
              <strong>{item[def.titleKey]}</strong>
              <small>
                <code>{item.id}</code> · {def.subtitle(item)}
              </small>
            </div>
            <Badge tone={VISIBILITY[item.visibility]?.tone}>{VISIBILITY[item.visibility]?.short}</Badge>
            <div className="admin-row__actions">
              <button type="button" className="chip" onClick={() => setEditing({ item, isNew: false })}>
                수정
              </button>
              <button type="button" className="chip chip--danger" onClick={() => remove(item)}>
                삭제
              </button>
            </div>
          </div>
        ))}
        {!list.length && <p className="muted admin-empty">항목이 없습니다.</p>}
      </div>
    </div>
  )
}
