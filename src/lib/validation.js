/** 입력값 검증 (클라이언트 1차 검증 — 서버/DB 에서도 같은 규칙을 다시 검사합니다) */

export const STUDENT_NUMBER_RE = /^[0-9]{4,12}$/

export const validateStudentNumber = (v) => (STUDENT_NUMBER_RE.test(String(v || '').trim()) ? null : '학번은 숫자 4~12자리로 입력하세요')

export const validatePassword = (v) => {
  if (typeof v !== 'string' || v.length < 8) return '비밀번호는 8자 이상이어야 합니다'
  if (v.length > 72) return '비밀번호는 72자 이하여야 합니다'
  if (!/[A-Za-z]/.test(v) || !/[0-9]/.test(v)) return '영문과 숫자를 모두 포함해야 합니다'
  return null
}

const inRange = (n, min, max) => Number.isInteger(n) && n >= min && n <= max

/** 학생 1명 검증 → 오류 메시지 배열 */
export const validateStudentRow = (r) => {
  const errors = []
  if (!inRange(r.academicYear, 2000, 2100)) errors.push('학년도')
  if (!inRange(r.grade, 1, 3)) errors.push('학년(1~3)')
  if (!inRange(r.classNumber, 1, 30)) errors.push('반(1~30)')
  if (!inRange(r.number, 1, 60)) errors.push('번호(1~60)')
  if (!STUDENT_NUMBER_RE.test(r.studentNumber || '')) errors.push('학번(숫자 4~12자리)')
  const name = (r.name || '').trim()
  if (name.length < 1 || name.length > 40) errors.push('이름')
  return errors
}

export const formatClass = (s) => (s ? `${s.grade}학년 ${s.classNumber}반${s.number ? ` ${s.number}번` : ''}` : '')
