/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { backend } from '../lib/backend'

/**
 * 사용자 유형
 *   guest   : 로그인하지 않은 방문자 (계정 없음)
 *   student : 학번으로 로그인한 학생
 *   admin   : 관리자 (교사) — role 은 DB(profiles.role)에서만 결정됩니다.
 */
const AuthContext = createContext(null)
const GUEST_KEY = 'philolab.guest'

export function AuthProvider({ children }) {
  const [account, setAccount] = useState(null)
  const [ready, setReady] = useState(false)
  const [guestChosen, setGuestChosen] = useState(() => {
    try {
      return sessionStorage.getItem(GUEST_KEY) === '1'
    } catch {
      return false
    }
  })
  const [loginPrompt, setLoginPrompt] = useState(null)

  const refresh = useCallback(async () => {
    try {
      const next = await backend.auth.getAccount()
      setAccount(next)
      return next
    } finally {
      setReady(true)
    }
  }, [])

  useEffect(() => {
    refresh()
    return backend.auth.onChange(refresh)
  }, [refresh])

  const value = useMemo(() => {
    const role = account ? account.role : 'guest'
    const student = account?.student || null
    return {
      ready,
      account,
      role,
      student,
      isAdmin: role === 'admin',
      isStudent: Boolean(student),
      isGuest: !account,
      guestChosen,
      viewer: { isAdmin: role === 'admin', isStudent: Boolean(student), classIds: account?.classIds || [] },

      async signInStudent(studentNumber, password) {
        const next = await backend.auth.signInStudent(studentNumber, password)
        setAccount(next)
        return next
      },
      async signInAdmin(loginId, password) {
        const next = await backend.auth.signInAdmin(loginId, password)
        setAccount(next)
        return next
      },
      async signOut() {
        await backend.auth.signOut()
        setAccount(null)
      },
      async changePassword(newPassword) {
        await backend.auth.changePassword(newPassword)
        await refresh()
      },
      enterGuest() {
        try {
          sessionStorage.setItem(GUEST_KEY, '1')
        } catch {
          /* noop */
        }
        setGuestChosen(true)
      },
      refresh,

      /** 학생 활동 기록 (교육 목적 최소 정보만). 게스트·관리자는 기록하지 않습니다. */
      logActivity(contentType, contentId, action, result = null) {
        if (!student) return Promise.resolve(false)
        // 열람(view)은 같은 브라우저 세션에서 한 번만 기록 — 불필요한 로그 최소화
        if (action === 'view') {
          const key = `philolab.viewed.${student.id}.${contentType}.${contentId}`
          try {
            if (sessionStorage.getItem(key)) return Promise.resolve(false)
            sessionStorage.setItem(key, '1')
          } catch {
            /* noop */
          }
        }
        return backend.records
          .log(student.id, { contentType, contentId, action, result })
          .then(() => true)
          .catch(() => false)
      },

      /** 게스트가 제한된 기능을 눌렀을 때 로그인 안내 띄우기 */
      promptLogin(message) {
        setLoginPrompt(message || '로그인한 학생만 사용할 수 있는 기능입니다.')
      },
      loginPrompt,
      closeLoginPrompt() {
        setLoginPrompt(null)
      },
    }
  }, [account, ready, guestChosen, loginPrompt, refresh])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
