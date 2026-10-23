/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { backend } from '../lib/backend'
import { CONTENT_TYPE_KEYS, seedFor } from '../lib/contentTypes'
import { buildSubjects } from '../data/classes'
import { academicYears as seedYears } from '../data/clubs'
import { useAuth } from './AuthContext'

/**
 * 사이트 전체 콘텐츠 (철학자·게임·수업·프로젝트·동아리·교사자료·오늘의 질문)
 *   - Supabase 모드: DB 에서 현재 사용자에게 보이는 콘텐츠만 받아옵니다 (RLS)
 *   - 데모 모드   : src/data 의 초기 데이터 + 이 브라우저에서 관리자가 수정한 내용
 * 로그인 상태가 바뀌면 자동으로 다시 불러옵니다.
 */
const ContentContext = createContext(null)

/** DB 연결 실패 시 사용할 공개 콘텐츠 (src/data) */
const publicFallback = () => ({
  academicYears: seedYears,
  ...Object.fromEntries(CONTENT_TYPE_KEYS.map((t) => [t, seedFor(t).filter((i) => i.visibility === 'public')])),
})

export function ContentProvider({ children }) {
  const { ready, account } = useAuth()
  const [state, setState] = useState({ status: 'loading', data: null, error: null })
  const userId = account?.userId

  const load = useCallback(
    () =>
      backend.content
        .loadAll()
        .then((data) => ({ status: 'ready', data, error: null }))
        .catch((e) => ({ status: 'error', data: publicFallback(), error: e.message })),
    [],
  )
  const reload = useCallback(() => load().then(setState), [load])

  useEffect(() => {
    if (!ready) return
    let alive = true
    load().then((next) => alive && setState(next))
    return () => {
      alive = false
    }
  }, [ready, userId, load])

  const value = useMemo(() => {
    const data = state.data || Object.fromEntries([...CONTENT_TYPE_KEYS, 'academicYears'].map((k) => [k, []]))
    const index = Object.fromEntries(CONTENT_TYPE_KEYS.map((t) => [t, new Map(data[t].map((i) => [i.id, i]))]))
    const get = (type) => (id) => index[type].get(id)
    return {
      status: state.status,
      error: state.error,
      reload,
      ...data,
      subjects: buildSubjects(data.lessons),
      get: (type, id) => index[type]?.get(id),
      getPhilosopher: get('philosophers'),
      getGame: get('games'),
      getProject: get('projects'),
      getClub: get('clubs'),
      getLesson: get('lessons'),
    }
  }, [state, reload])

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>
}

export const useContent = () => useContext(ContentContext)
