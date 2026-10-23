/** 입력값 검증 (클라이언트 1차 검증 — 서버/DB 에서도 같은 규칙을 다시 검사합니다) */

/**
 * 학번: 9자리 = 학년도(4) + 학년(1) + 반(2) + 번호(2)
 *   예) 2026학년도 2학년 1반 1번 → 202620101
 */
export const STUDENT_NUMBER_RE = /^[0-9]{9}$/

export const makeStudentNumber = ({ academicYear, grade, classNumber, number }) =>
  `${academicYear}${grade}${String(classNumber).padStart(2, '0')}${String(number).padStart(2, '0')}`

export const validateStudentNumber = (v) => (STUDENT_NUMBER_RE.test(String(v || '').trim()) ? null : '학번은 숫자 9자리로 입력하세요 (예: 202620101)')

/** 관리자 아이디: 영문 소문자·숫자·._- 3~32자 (예: admin) */
export const ADMIN_ID_RE = /^[a-z0-9][a-z0-9._-]{2,31}$/

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
  if (!STUDENT_NUMBER_RE.test(r.studentNumber || '')) errors.push('학번(숫자 9자리)')
  else if (!errors.length && r.studentNumber !== makeStudentNumber(r)) errors.push(`학번 불일치(예상 ${makeStudentNumber(r)})`)
  const name = (r.name || '').trim()
  if (name.length < 1 || name.length > 40) errors.push('이름')
  return errors
}

export const formatClass = (s) => (s ? `${s.grade}학년 ${s.classNumber}반${s.number ? ` ${s.number}번` : ''}` : '')
