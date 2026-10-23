/**
 * PHILO LAB 백업 · 이전 (내보내기 / 가져오기)
 * ------------------------------------------------------------------
 * 내보내기: 현재 데이터를 JSON 파일로 저장합니다. 아무것도 바꾸거나 지우지 않습니다.
 *   - 데모 모드   : 이 브라우저의 관리자 수정 내용(edits) + 예전 저장 키의 콘텐츠 사본 + 현재 화면 콘텐츠 전체
 *   - Supabase 모드: DB 의 콘텐츠 전체 (정기 백업용)
 *   - 학생 명부·비밀번호·활동 기록 같은 개인정보는 포함하지 않습니다.
 *
 * 가져오기: 백업 파일에서 "기본 데이터와 달라진 항목"만 골라 미리보기 → 선택한 항목만 추가/수정합니다.
 *   - 삭제는 하지 않습니다. (백업에 '삭제한 항목' 기록이 있어도 안내만 표시)
 *   - 이미 있는 항목은 달라진 필드만 덮어씁니다.
 */
import { backend } from './backend'
import { CONTENT_TYPE_KEYS, contentTypes, seedFor, validateItem, withDefaults } from './contentTypes'

export const BACKUP_FORMAT = 'philolab-backup'

const isEmpty = (v) => v === '' || v === null || v === undefined || (Array.isArray(v) && v.length === 0)
const same = (a, b) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null)
const SKIP_KEYS = new Set(['id', 'classIds', 'sortOrder'])

/** 기본 데이터(seed)와 비교해 실제로 바꾼 필드만 추출. 수정 당시 비어 있던 값은 무시 (나중에 추가된 기본값 보호) */
export const changedFields = (item, base) => {
  const out = {}
  for (const [k, v] of Object.entries(item)) {
    if (SKIP_KEYS.has(k) || v === undefined) continue
    if (base && same(v, base[k])) continue
    if (base && isEmpty(v) && !isEmpty(base[k])) continue
    out[k] = v
  }
  if (item.classIds?.length) out.classIds = item.classIds
  return out
}

/** 백업 파일 만들기 (읽기 전용) */
export async function buildBackup(content) {
  const [years, classes] = await Promise.all([backend.school.listYears(), backend.school.listClasses()])
  const local = backend.exportLocal ? backend.exportLocal() : null
  return {
    format: BACKUP_FORMAT,
    version: 1,
    exportedAt: new Date().toISOString(),
    source: backend.mode,
    site: typeof location !== 'undefined' ? location.origin + location.pathname : '',
    academicYears: years,
    classes,
    // 데모 모드: 관리자가 직접 수정·추가·삭제한 기록 (가장 중요한 부분)
    edits: local?.edits || null,
    // 예전 저장 형식(전체 사본)으로 남아 있던 데이터
    legacy: local?.legacy || {},
    legacyClasses: local?.classes || [],
    // 현재 화면에 보이는 콘텐츠 전체 스냅샷
    content: Object.fromEntries(CONTENT_TYPE_KEYS.map((t) => [t, content[t]])),
  }
}

export const backupFileName = () => {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `philolab-backup-${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}.json`
}

export const downloadJson = (filename, data) => {
  const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }))
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/** 백업 요약 (화면 표시용) */
export const summarizeEdits = (edits) =>
  CONTENT_TYPE_KEYS.map((t) => ({
    type: t,
    saved: Object.keys(edits?.[t]?.saved || {}).length,
    deleted: (edits?.[t]?.deleted || []).length,
  })).filter((r) => r.saved || r.deleted)

/**
 * 가져오기 계획 세우기
 * @param backup  백업 파일 내용
 * @param target  현재 사이트 콘텐츠 (useContent)
 * @param targetClasses 현재 학급 목록 — 학급 지정 공개(classIds)를 학년도·학년·반으로 다시 연결
 */
export function planImport(backup, target, targetClasses) {
  if (backup?.format !== BACKUP_FORMAT) throw new Error('PHILO LAB 백업 파일이 아닙니다')

  // 백업 쪽 학급 id → 학년도·학년·반
  const srcClasses = [...(backup.classes || []), ...(backup.legacyClasses || []), ...Object.values(backup.legacy || {}).flatMap((l) => l.classes || [])]
  const classKey = (c) => `${c.academicYear}-${c.grade}-${c.classNumber}`
  const srcById = new Map(srcClasses.map((c) => [c.id, classKey(c)]))
  const dstByKey = new Map(targetClasses.map((c) => [classKey(c), c.id]))
  const missingClasses = new Map()

  const candidates = new Map() // `${type}:${id}` → { type, id, item, origin }
  const add = (type, item, origin) => {
    if (!item?.id || !contentTypes[type]) return
    candidates.set(`${type}:${item.id}`, { type, id: item.id, item, origin })
  }
  // 1) 예전 저장 키의 전체 사본 → 기본 데이터와 다른 항목만
  for (const [key, l] of Object.entries(backup.legacy || {})) {
    for (const type of CONTENT_TYPE_KEYS) {
      const seed = new Map(seedFor(type).map((i) => [i.id, i]))
      for (const item of l.content?.[type] || []) {
        const base = seed.get(item.id)
        if (!base || Object.keys(changedFields(item, base)).length) add(type, item, key)
      }
      for (const item of Object.values(l.edits?.[type]?.saved || {})) add(type, item, key)
    }
  }
  // 2) 현재 저장 키의 수정 기록 (가장 최신이므로 마지막에 덮어씀)
  for (const type of CONTENT_TYPE_KEYS) for (const item of Object.values(backup.edits?.[type]?.saved || {})) add(type, item, '관리자 수정 기록')
  // 3) Supabase 에서 내보낸 백업이면 전체 콘텐츠가 대상
  if (backup.source === 'supabase') for (const type of CONTENT_TYPE_KEYS) for (const item of backup.content?.[type] || []) add(type, item, 'DB 백업')

  const rows = []
  for (const c of candidates.values()) {
    const seedItem = seedFor(c.type).find((i) => i.id === c.id)
    const current = target[c.type]?.find((i) => i.id === c.id)
    const changes = changedFields(c.item, backup.source === 'supabase' ? null : seedItem)

    // 학급 지정 공개 → 현재 학급으로 다시 연결
    let note = ''
    if (changes.classIds) {
      const mapped = []
      for (const id of changes.classIds) {
        const key = srcById.get(id)
        if (key && dstByKey.has(key)) mapped.push(dstByKey.get(key))
        else if (key) {
          missingClasses.set(key, true)
          mapped.push(`new:${key}`)
        }
      }
      changes.classIds = mapped
      if (!mapped.length && (changes.visibility ?? c.item.visibility) === 'class') {
        changes.visibility = 'admin'
        note = '공개 학급을 찾을 수 없어 교사 전용으로 가져옵니다'
      }
    }

    const merged = withDefaults(c.type, { ...(current || seedItem || {}), ...changes, id: c.id })
    const changedKeys = Object.keys(changes).filter((k) => !current || !same(merged[k], current[k]))
    if (current && !changedKeys.length) continue // 이미 같음
    rows.push({
      key: `${c.type}:${c.id}`,
      type: c.type,
      id: c.id,
      title: merged[contentTypes[c.type].titleKey] || c.id,
      status: current ? 'update' : 'new',
      changedKeys,
      origin: c.origin,
      note,
      item: merged,
    })
  }

  // 클럽이 먼저 들어가야 활동 기록을 넣을 수 있음 → 타입 순서대로 정렬
  rows.sort((a, b) => CONTENT_TYPE_KEYS.indexOf(a.type) - CONTENT_TYPE_KEYS.indexOf(b.type))

  const deleted = CONTENT_TYPE_KEYS.flatMap((t) => (backup.edits?.[t]?.deleted || []).map((id) => ({ type: t, id })))
  return { rows, deleted, missingClasses: [...missingClasses.keys()] }
}

/** 선택한 항목 가져오기 — 추가/수정만, 삭제 없음 */
export async function applyImport(rows, backup) {
  const results = []
  // 필요한 학년도·학급 먼저 추가 (기존 것은 그대로)
  const years = new Set((await backend.school.listYears()).map((y) => y.year))
  // 동아리는 학년도가 있어야 저장되므로, 가져올 동아리의 학년도만 추가 (라벨은 백업 값 사용)
  const needYears = new Set(rows.filter((r) => r.type === 'clubs').map((r) => r.item.academicYear))
  for (const y of needYears) {
    const label = backup.academicYears?.find((x) => x.year === y)?.label
    if (!years.has(y)) {
      await backend.school.saveYear({ year: y, label: label || `${y}학년도`, isCurrent: false })
      years.add(y)
    }
  }
  let classes = await backend.school.listClasses()
  const ensureClass = async (key) => {
    const [academicYear, grade, classNumber] = key.split('-').map(Number)
    let found = classes.find((c) => c.academicYear === academicYear && c.grade === grade && c.classNumber === classNumber)
    if (!found) {
      if (!years.has(academicYear)) {
        await backend.school.saveYear({ year: academicYear, label: `${academicYear}학년도`, isCurrent: false })
        years.add(academicYear)
      }
      await backend.school.saveClass({ academicYear, grade, classNumber })
      classes = await backend.school.listClasses()
      found = classes.find((c) => c.academicYear === academicYear && c.grade === grade && c.classNumber === classNumber)
    }
    return found?.id
  }

  for (const r of rows) {
    try {
      const item = { ...r.item }
      if (item.classIds?.some((id) => String(id).startsWith('new:'))) {
        item.classIds = (await Promise.all(item.classIds.map((id) => (String(id).startsWith('new:') ? ensureClass(id.slice(4)) : id)))).filter(Boolean)
      }
      if (item.visibility !== 'class') item.classIds = []
      const errors = validateItem(r.type, item)
      if (Object.keys(errors).length) throw new Error(Object.entries(errors).map(([k, v]) => `${k}: ${v}`).join(', '))
      await backend.content.save(r.type, item)
      results.push({ ...r, ok: true })
    } catch (e) {
      results.push({ ...r, ok: false, error: e.message })
    }
  }
  return results
}
