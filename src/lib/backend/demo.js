/**
 * 데모 백엔드 — Supabase 를 연결하기 전 화면·흐름을 체험하기 위한 모드
 * ------------------------------------------------------------------
 * ⚠ 실제 인증이 아닙니다.
 *   - 모든 데이터는 "이 브라우저의 localStorage"에만 저장되며 다른 사람과 공유되지 않습니다.
 *   - 공개 범위 필터도 화면에서만 적용됩니다. (실제 보안은 Supabase 모드의 RLS 가 담당)
 *   - 데모 계정 비밀번호도 평문이 아닌 SHA-256 해시로만 보관합니다.
 * 화면 상단 배너로 데모 모드임을 항상 표시합니다.
 */
import { CONTENT_TYPE_KEYS, seedFor, sortItems, withDefaults } from '../contentTypes'
import { academicYears as seedYears } from '../../data/clubs'
import { canView } from '../../data/visibility'

const KEY = 'philolab.demo.v2'
export const DEMO_ACCOUNTS = {
  students: [
    { studentNumber: '202620101', password: 'philo1234', name: '김민수', grade: 2, classNumber: 1, number: 1 },
    { studentNumber: '202620102', password: 'philo1234', name: '이서준', grade: 2, classNumber: 1, number: 2 },
    { studentNumber: '202620201', password: 'philo1234', name: '박지우', grade: 2, classNumber: 2, number: 1 },
  ],
  admin: { loginId: 'admin', password: 'admin1234' },
}

const uid = () => (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`)
const delay = (ms = 120) => new Promise((r) => setTimeout(r, ms))

async function hash(password, salt) {
  const bytes = new TextEncoder().encode(`${salt}:${password}`)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('')
}
async function makeCredential(password) {
  const salt = uid()
  return { salt, passwordHash: await hash(password, salt) }
}
const checkCredential = async (cred, password) => cred && (await hash(password, cred.salt)) === cred.passwordHash

const randomPassword = () => {
  const alphabet = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const bytes = crypto.getRandomValues(new Uint32Array(10))
  const pw = Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('')
  return /[0-9]/.test(pw) ? pw : `${pw.slice(0, -1)}7`
}

// ---------------------------------------------------------------------------
// localStorage 저장소
// ---------------------------------------------------------------------------
let memory = null
const read = () => {
  if (memory) return memory
  try {
    memory = JSON.parse(localStorage.getItem(KEY) || 'null')
  } catch {
    memory = null
  }
  return memory
}
const write = (db) => {
  memory = db
  try {
    localStorage.setItem(KEY, JSON.stringify(db))
  } catch {
    /* 저장 공간 부족·사생활 보호 모드: 메모리에서만 유지 */
  }
}

/**
 * 콘텐츠는 "최신 기본 데이터(src/data) + 이 브라우저에서 관리자가 수정한 내용(edits)"으로 계산합니다.
 * 기본 데이터 전체를 저장해 두면 사이트를 업데이트해도(예: 철학자 이미지 추가) 예전에 방문한 기기에는 반영되지 않기 때문입니다.
 *   edits[type] = { saved: { [id]: item }, deleted: [id] }
 */
const contentList = (d, type) => {
  const edits = d.edits?.[type] || { saved: {}, deleted: [] }
  const deleted = new Set(edits.deleted)
  const seed = seedFor(type).filter((i) => !deleted.has(i.id))
  const seedIds = new Set(seed.map((i) => i.id))
  return [...seed.map((i) => edits.saved[i.id] || i), ...Object.values(edits.saved).filter((i) => !seedIds.has(i.id) && !deleted.has(i.id))]
}
const editsOf = (d, type) => {
  d.edits ??= {}
  return (d.edits[type] ??= { saved: {}, deleted: [] })
}

/** 예전 형식(콘텐츠 전체 사본 저장) → 수정 내용만 저장하는 형식으로 변환. 계정·기록은 그대로 유지 */
const upgrade = (data) => {
  if (data.content && !data.edits) {
    data.edits = {}
    delete data.content
    write(data)
  }
  return data
}

let initPromise = null
async function db() {
  const existing = read()
  if (existing) return upgrade(existing)
  if (!initPromise) initPromise = createInitialDb()
  return initPromise
}

async function createInitialDb() {
  const years = seedYears.map((y) => ({ ...y }))
  const classes = []
  for (const grade of [1, 2]) for (const classNumber of [1, 2, 3]) classes.push({ id: uid(), academicYear: 2026, grade, classNumber })
  const classOf = (g, c) => classes.find((x) => x.grade === g && x.classNumber === c)?.id

  const users = []
  const students = []
  for (const s of DEMO_ACCOUNTS.students) {
    const userId = uid()
    users.push({ id: userId, role: 'student', mustChangePassword: false, ...(await makeCredential(s.password)) })
    students.push({
      id: uid(),
      userId,
      studentNumber: s.studentNumber,
      name: s.name,
      grade: s.grade,
      classNumber: s.classNumber,
      number: s.number,
      academicYear: 2026,
      active: true,
      createdAt: new Date().toISOString(),
      classIds: [classOf(s.grade, s.classNumber)],
    })
  }
  users.push({ id: uid(), role: 'admin', loginId: DEMO_ACCOUNTS.admin.loginId, mustChangePassword: false, ...(await makeCredential(DEMO_ACCOUNTS.admin.password)) })

  // 김민수 학생의 샘플 기록 (MY PHILO LAB 미리보기)
  const minsu = students[0].id
  const at = (d) => new Date(`${d}T10:00:00+09:00`).toISOString()
  const logs = [
    { contentType: 'test', contentId: 'ethics-personality-test', action: 'complete', createdAt: at('2026-10-23') },
    { contentType: 'lesson', contentId: 'ai-ethics', action: 'complete', createdAt: at('2026-10-20') },
    { contentType: 'game', contentId: 'kant-vs-bentham', action: 'play', createdAt: at('2026-10-18') },
    { contentType: 'lesson', contentId: 'kant', action: 'complete', createdAt: at('2026-10-15') },
    { contentType: 'project', contentId: 'ai-judge', action: 'submit', createdAt: at('2026-10-10') },
    { contentType: 'lesson', contentId: 'bentham', action: 'view', createdAt: at('2026-10-08') },
  ].map((l, i) => ({ id: i + 1, studentId: minsu, result: null, ...l }))
  const results = [
    {
      id: uid(),
      studentId: minsu,
      testId: 'ethics-personality-test',
      resultType: 'bentham',
      philosopher: 'bentham',
      scores: { utilitarianism: 70, deontology: 40, virtue: 60, existentialism: 30 },
      createdAt: at('2026-10-23'),
    },
  ]

  const data = { version: 2, years, classes, users, students, edits: {}, logs, results, session: null }
  write(data)
  return data
}

const mutate = async (fn) => {
  const data = structuredClone(await db())
  const out = fn(data)
  write(data)
  await delay()
  return out
}

// ---------------------------------------------------------------------------
// 계정
// ---------------------------------------------------------------------------
async function getAccount() {
  const data = await db()
  const user = data.users.find((u) => u.id === data.session?.userId)
  if (!user) return null
  const student = data.students.find((s) => s.userId === user.id) || null
  if (student && !student.active) return null
  return {
    userId: user.id,
    loginId: user.loginId || null,
    role: user.role,
    mustChangePassword: user.mustChangePassword,
    student,
    classIds: student?.classIds || [],
  }
}

const listeners = new Set()
const notify = () => listeners.forEach((cb) => cb())

const viewerFor = (account) => ({
  isAdmin: account?.role === 'admin',
  isStudent: Boolean(account?.student),
  classIds: account?.classIds || [],
})

export const demoBackend = {
  mode: 'demo',

  auth: {
    getAccount,

    async signInStudent(studentNumber, password) {
      const data = await db()
      const student = data.students.find((s) => s.studentNumber === studentNumber)
      const user = student && data.users.find((u) => u.id === student.userId)
      await delay(250)
      if (!user || !(await checkCredential(user, password))) throw new Error('학번 또는 비밀번호가 올바르지 않습니다')
      if (!student.active) throw new Error('비활성화된 계정입니다. 선생님께 문의하세요')
      await mutate((d) => (d.session = { userId: user.id }))
      notify()
      return getAccount()
    },

    async signInAdmin(loginId, password) {
      const data = await db()
      const user = data.users.find((u) => u.loginId && u.loginId === loginId.trim().toLowerCase())
      await delay(250)
      if (!user || !(await checkCredential(user, password))) throw new Error('아이디 또는 비밀번호가 올바르지 않습니다')
      if (user.role !== 'admin') throw new Error('관리자 권한이 없는 계정입니다')
      await mutate((d) => (d.session = { userId: user.id }))
      notify()
      return getAccount()
    },

    async signOut() {
      await mutate((d) => (d.session = null))
      notify()
    },

    async changePassword(newPassword) {
      const account = await getAccount()
      if (!account) throw new Error('로그인이 필요합니다')
      const cred = await makeCredential(newPassword)
      await mutate((d) => {
        const user = d.users.find((u) => u.id === account.userId)
        Object.assign(user, cred, { mustChangePassword: false })
      })
      notify()
    },

    onChange(callback) {
      listeners.add(callback)
      return () => listeners.delete(callback)
    },
  },

  content: {
    async loadAll() {
      const data = await db()
      const viewer = viewerFor(await getAccount())
      const out = { academicYears: [...data.years].sort((a, b) => b.year - a.year) }
      for (const type of CONTENT_TYPE_KEYS) {
        out[type] = sortItems(type, contentList(data, type).map((i) => withDefaults(type, i)).filter((i) => canView(i, viewer)))
      }
      return out
    },
    async save(type, item) {
      await mutate((d) => {
        const edits = editsOf(d, type)
        edits.saved[item.id] = item
        edits.deleted = edits.deleted.filter((id) => id !== item.id)
      })
    },
    async remove(type, id) {
      await mutate((d) => {
        if (type === 'clubs' && contentList(d, 'clubActivities').some((a) => a.clubId === id)) {
          throw new Error('연결된 기록이 있어 삭제할 수 없습니다. 대신 보관 처리하세요.')
        }
        const edits = editsOf(d, type)
        delete edits.saved[id]
        if (!edits.deleted.includes(id)) edits.deleted.push(id)
      })
    },
    async upload(file) {
      if (file.size > 400 * 1024) throw new Error('데모 모드에서는 400KB 이하 이미지만 저장할 수 있습니다 (Supabase 연결 시 5MB)')
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.onerror = () => reject(new Error('파일을 읽지 못했습니다'))
        reader.readAsDataURL(file)
      })
    },
  },

  school: {
    async listYears() {
      return [...(await db()).years].sort((a, b) => b.year - a.year)
    },
    async saveYear(year) {
      await mutate((d) => {
        if (year.isCurrent) d.years.forEach((y) => (y.isCurrent = false))
        const existing = d.years.find((y) => y.year === year.year)
        if (existing) Object.assign(existing, year)
        else d.years.push(year)
      })
    },
    async listClasses() {
      return [...(await db()).classes].sort((a, b) => b.academicYear - a.academicYear || a.grade - b.grade || a.classNumber - b.classNumber)
    },
    async saveClass(c) {
      await mutate((d) => {
        if (d.classes.some((x) => x.academicYear === c.academicYear && x.grade === c.grade && x.classNumber === c.classNumber)) throw new Error('이미 있는 학급입니다')
        if (!d.years.some((y) => y.year === c.academicYear)) d.years.push({ year: c.academicYear, label: `${c.academicYear}학년도`, isCurrent: false })
        d.classes.push({ id: uid(), ...c })
      })
    },
    async removeClass(id) {
      await mutate((d) => {
        d.classes = d.classes.filter((c) => c.id !== id)
        d.students.forEach((s) => (s.classIds = s.classIds.filter((c) => c !== id)))
      })
    },
    async listStudents() {
      return [...(await db()).students].sort((a, b) => b.academicYear - a.academicYear || a.grade - b.grade || a.classNumber - b.classNumber || a.number - b.number)
    },
    async updateStudent(id, patch) {
      await mutate((d) => {
        const s = d.students.find((x) => x.id === id)
        Object.assign(s, { name: patch.name.trim(), grade: patch.grade, classNumber: patch.classNumber, number: patch.number })
        let cls = d.classes.find((c) => c.academicYear === s.academicYear && c.grade === s.grade && c.classNumber === s.classNumber)
        if (!cls) d.classes.push((cls = { id: uid(), academicYear: s.academicYear, grade: s.grade, classNumber: s.classNumber }))
        const sameYear = new Set(d.classes.filter((c) => c.academicYear === s.academicYear).map((c) => c.id))
        s.classIds = [...s.classIds.filter((c) => !sameYear.has(c)), cls.id]
      })
    },
    async createStudents(rows, password) {
      const results = []
      for (const r of rows) {
        const data = await db()
        if (data.students.some((s) => s.studentNumber === r.studentNumber)) {
          results.push({ studentNumber: r.studentNumber, name: r.name, ok: false, error: '이미 등록된 학번입니다' })
          continue
        }
        const temp = password.mode === 'common' ? password.value : randomPassword()
        const cred = await makeCredential(temp)
        await mutate((d) => {
          let cls = d.classes.find((c) => c.academicYear === r.academicYear && c.grade === r.grade && c.classNumber === r.classNumber)
          if (!cls) {
            cls = { id: uid(), academicYear: r.academicYear, grade: r.grade, classNumber: r.classNumber }
            d.classes.push(cls)
          }
          if (!d.years.some((y) => y.year === r.academicYear)) d.years.push({ year: r.academicYear, label: `${r.academicYear}학년도`, isCurrent: false })
          const userId = uid()
          d.users.push({ id: userId, role: 'student', mustChangePassword: true, ...cred })
          d.students.push({ id: uid(), userId, ...r, name: r.name.trim(), active: true, createdAt: new Date().toISOString(), classIds: [cls.id] })
        })
        results.push({ studentNumber: r.studentNumber, name: r.name, ok: true, tempPassword: password.mode === 'random' ? temp : undefined })
      }
      return results
    },
    async resetPassword(studentId, password) {
      const temp = password.mode === 'common' ? password.value : randomPassword()
      const cred = await makeCredential(temp)
      await mutate((d) => {
        const s = d.students.find((x) => x.id === studentId)
        Object.assign(d.users.find((u) => u.id === s.userId), cred, { mustChangePassword: true })
      })
      return { tempPassword: password.mode === 'random' ? temp : undefined }
    },
    async setActive(studentId, active) {
      await mutate((d) => (d.students.find((s) => s.id === studentId).active = active))
    },
  },

  records: {
    async myActivity(studentId, limit = 50) {
      return (await db()).logs
        .filter((l) => l.studentId === studentId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, limit)
    },
    async myTestResults(studentId) {
      return (await db()).results.filter((r) => r.studentId === studentId).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    },
    async log(studentId, entry) {
      await mutate((d) => d.logs.push({ id: d.logs.length + 1, studentId, result: null, ...entry, createdAt: new Date().toISOString() }))
    },
    async saveTestResult(studentId, r) {
      await mutate((d) => d.results.push({ id: uid(), studentId, ...r, createdAt: new Date().toISOString() }))
    },
    async recentActivity(limit = 20) {
      const data = await db()
      return [...data.logs]
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, limit)
        .map((l) => ({ ...l, student: data.students.find((s) => s.id === l.studentId) }))
    },
  },

  /** 데모 데이터를 처음 상태로 되돌리기 */
  async reset() {
    try {
      localStorage.removeItem(KEY)
    } catch {
      /* noop */
    }
    memory = null
    initPromise = null
    await db()
    notify()
  },
}
