import { useCallback, useEffect, useState } from 'react'
import { backend } from '../lib/backend'
import { useAuth } from '../context/AuthContext'

const EMPTY = { loading: false, logs: [], results: [], error: null }

/** 로그인한 학생 본인의 활동 기록·심리테스트 결과 (RLS 로 본인 것만 조회됨) */
export function useMyRecords({ limit = 50 } = {}) {
  const { student } = useAuth()
  const studentId = student?.id
  const [state, setState] = useState({ ...EMPTY, loading: true })

  const fetchRecords = useCallback(
    () =>
      Promise.all([backend.records.myActivity(studentId, limit), backend.records.myTestResults(studentId)])
        .then(([logs, results]) => ({ loading: false, logs, results, error: null }))
        .catch((e) => ({ ...EMPTY, error: e.message })),
    [studentId, limit],
  )

  useEffect(() => {
    if (!studentId) return
    let alive = true
    fetchRecords().then((next) => alive && setState(next))
    return () => {
      alive = false
    }
  }, [studentId, fetchRecords])

  const reload = useCallback(() => (studentId ? fetchRecords().then(setState) : Promise.resolve()), [studentId, fetchRecords])

  return studentId ? { ...state, reload } : { ...EMPTY, reload }
}
