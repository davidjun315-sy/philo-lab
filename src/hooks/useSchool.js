import { useCallback, useEffect, useState } from 'react'
import { backend } from '../lib/backend'

/** 관리자용: 학년도·학급·학생 명부 */
export function useSchool({ students = true } = {}) {
  const [state, setState] = useState({ loading: true, years: [], classes: [], students: [], error: null })

  const load = useCallback(async () => {
    try {
      const [years, classes, list] = await Promise.all([
        backend.school.listYears(),
        backend.school.listClasses(),
        students ? backend.school.listStudents() : Promise.resolve([]),
      ])
      setState({ loading: false, years, classes, students: list, error: null })
    } catch (e) {
      setState((s) => ({ ...s, loading: false, error: e.message }))
    }
  }, [students])

  useEffect(() => {
    load()
  }, [load])

  return { ...state, reload: load }
}

export const classLabel = (c) => (c ? `${c.academicYear} · ${c.grade}학년 ${c.classNumber}반` : '')
