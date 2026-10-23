/**
 * 학생 일괄 등록 CSV 파서
 *   헤더: 학년도,학년,반,번호,학번,이름   (영문 헤더 academic_year,grade,class_number,number,student_number,name 도 허용)
 *   엑셀에서 "CSV UTF-8" 로 저장한 파일을 권장합니다.
 */
import { validateStudentRow } from './validation'

const HEADER_MAP = {
  학년도: 'academicYear',
  academic_year: 'academicYear',
  학년: 'grade',
  grade: 'grade',
  반: 'classNumber',
  class_number: 'classNumber',
  번호: 'number',
  number: 'number',
  학번: 'studentNumber',
  student_number: 'studentNumber',
  이름: 'name',
  name: 'name',
}
const REQUIRED = ['academicYear', 'grade', 'classNumber', 'number', 'studentNumber', 'name']

export const CSV_TEMPLATE = '학년도,학년,반,번호,학번,이름\n2026,2,1,1,2026020101,김민수\n2026,2,1,2,2026020102,이서준\n'

/** 따옴표·쉼표를 처리하는 최소 CSV 파서 */
export const parseCsvText = (text) => {
  const rows = []
  let row = []
  let cell = ''
  let quoted = false
  const src = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text
  for (let i = 0; i < src.length; i++) {
    const c = src[i]
    if (quoted) {
      if (c === '"' && src[i + 1] === '"') {
        cell += '"'
        i++
      } else if (c === '"') quoted = false
      else cell += c
    } else if (c === '"') quoted = true
    else if (c === ',') {
      row.push(cell)
      cell = ''
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && src[i + 1] === '\n') i++
      row.push(cell)
      rows.push(row)
      row = []
      cell = ''
    } else cell += c
  }
  if (cell || row.length) {
    row.push(cell)
    rows.push(row)
  }
  return rows.filter((r) => r.some((c) => c.trim() !== ''))
}

/**
 * CSV 텍스트 → 미리보기 행 목록
 * @param existingNumbers 이미 등록된 학번 Set (중복 검사)
 * @returns { headerError, rows: [{ line, data, errors }] }
 */
export const parseStudentCsv = (text, existingNumbers = new Set()) => {
  const table = parseCsvText(text)
  if (!table.length) return { headerError: '내용이 비어 있습니다', rows: [] }
  const header = table[0].map((h) => HEADER_MAP[h.trim()] || null)
  const missing = REQUIRED.filter((k) => !header.includes(k))
  if (missing.length) return { headerError: `필수 열이 없습니다: 학년도,학년,반,번호,학번,이름 형식의 첫 줄이 필요합니다`, rows: [] }

  const seen = new Set()
  const rows = table.slice(1).map((cells, i) => {
    const obj = {}
    header.forEach((key, idx) => {
      if (key) obj[key] = (cells[idx] || '').trim()
    })
    const data = {
      academicYear: Number(obj.academicYear),
      grade: Number(obj.grade),
      classNumber: Number(obj.classNumber),
      number: Number(obj.number),
      studentNumber: obj.studentNumber,
      name: obj.name,
    }
    const errors = validateStudentRow(data).map((f) => `${f} 확인`)
    if (data.studentNumber && seen.has(data.studentNumber)) errors.push('파일 안 중복 학번')
    if (data.studentNumber && existingNumbers.has(data.studentNumber)) errors.push('이미 등록된 학번')
    seen.add(data.studentNumber)
    return { line: i + 2, data, errors }
  })
  return { headerError: null, rows }
}

/** 결과(임시 비밀번호 포함)를 CSV 로 내려받기 */
export const downloadCsv = (filename, rows) => {
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const text = '﻿' + rows.map((r) => r.map(esc).join(',')).join('\r\n')
  const url = URL.createObjectURL(new Blob([text], { type: 'text/csv;charset=utf-8' }))
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
