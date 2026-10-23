import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { searchSite } from '../data/searchIndex'

const SUGGESTIONS = ['칸트', '공리주의', 'AI', '맹자', '실존', '딜레마']

/** 사이트 전체 검색 모달 (Ctrl/⌘ + K) */
export default function Search({ open, onClose }) {
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef(null)
  const navigate = useNavigate()
  const results = searchSite(query)

  useEffect(() => {
    if (!open) return
    setQuery('')
    setActive(0)
    requestAnimationFrame(() => inputRef.current?.focus())
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  if (!open) return null

  const go = (item) => {
    onClose()
    navigate(item.to)
  }

  const onKeyDown = (e) => {
    if (e.key === 'Escape') onClose()
    else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((a) => Math.min(a + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((a) => Math.max(a - 1, 0))
    } else if (e.key === 'Enter' && results[active]) go(results[active])
  }

  return (
    <div className="search-overlay" onMouseDown={onClose}>
      <div className="search" role="dialog" aria-modal="true" aria-label="사이트 검색" onMouseDown={(e) => e.stopPropagation()}>
        <div className="search__field">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setActive(0)
            }}
            onKeyDown={onKeyDown}
            placeholder="철학자, 수업 주제, 게임, 프로젝트 검색"
            aria-label="검색어"
          />
          <button type="button" className="search__close" onClick={onClose} aria-label="검색 닫기">
            ESC
          </button>
        </div>

        {!query && (
          <div className="search__suggest">
            <p>추천 검색어</p>
            <div>
              {SUGGESTIONS.map((s) => (
                <button key={s} type="button" className="chip" onClick={() => setQuery(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {query && results.length === 0 && <p className="search__empty">“{query}”에 대한 결과가 없습니다.</p>}

        {results.length > 0 && (
          <ul className="search__results">
            {results.map((item, i) => (
              <li key={`${item.to}-${item.title}`}>
                <button type="button" className={i === active ? 'is-active' : ''} onMouseEnter={() => setActive(i)} onClick={() => go(item)}>
                  <span className="search__type">{item.type}</span>
                  <span className="search__text">
                    <strong>{item.title}</strong>
                    <small>{item.subtitle}</small>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
