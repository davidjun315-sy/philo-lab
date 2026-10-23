/**
 * Supabase 백엔드 (실제 인증 + PostgreSQL + Row Level Security)
 * 모든 권한 검사는 DB(RLS)와 Edge Function 에서 다시 수행됩니다.
 */
import { supabase, studentAuthId } from '../supabase'
import { CONTENT_TYPE_KEYS, contentTypes, fromRow, sortItems, toRow } from '../contentTypes'

const fail = (error, fallback) => {
  if (!error) return
  throw new Error(error.message || fallback)
}

const mapStudent = (s) =>
  s && {
    id: s.id,
    userId: s.user_id,
    studentNumber: s.student_number,
    name: s.name,
    grade: s.grade,
    classNumber: s.class_number,
    number: s.number,
    academicYear: s.academic_year,
    active: s.active,
    createdAt: s.created_at,
    classIds: (s.student_classes || []).map((c) => c.class_id),
  }

const toStudentPayload = (rows) =>
  rows.map((r) => ({
    academic_year: r.academicYear,
    grade: r.grade,
    class_number: r.classNumber,
    number: r.number,
    student_number: r.studentNumber,
    name: r.name.trim(),
  }))

async function getAccount() {
  const { data: sessionData } = await supabase.auth.getSession()
  const user = sessionData?.session?.user
  if (!user) return null
  const { data, error } = await supabase.rpc('get_my_account')
  if (error || !data) return null
  let classIds = []
  if (data.student) {
    const { data: links } = await supabase.from('student_classes').select('class_id').eq('student_id', data.student.id)
    classIds = (links || []).map((l) => l.class_id)
  }
  return {
    userId: user.id,
    email: data.role === 'student' ? null : user.email,
    role: data.role,
    mustChangePassword: data.must_change_password,
    student: data.student ? mapStudent(data.student) : null,
    classIds,
  }
}

async function callAdminFunction(body) {
  const { data, error } = await supabase.functions.invoke('admin-students', { body })
  if (error) {
    let message = error.message
    try {
      const detail = await error.context?.json?.()
      if (detail?.error) message = detail.error
    } catch {
      /* 응답 본문 없음 */
    }
    throw new Error(message || '서버 함수 호출에 실패했습니다')
  }
  if (data?.error) throw new Error(data.error)
  return data
}

export const supabaseBackend = {
  mode: 'supabase',

  auth: {
    getAccount,

    async signInStudent(studentNumber, password) {
      const { error } = await supabase.auth.signInWithPassword({ email: studentAuthId(studentNumber), password })
      if (error) throw new Error('학번 또는 비밀번호가 올바르지 않습니다')
      const account = await getAccount()
      if (!account?.student) {
        await supabase.auth.signOut()
        throw new Error('학생 계정이 아닙니다')
      }
      return account
    },

    async signInAdmin(email, password) {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw new Error('이메일 또는 비밀번호가 올바르지 않습니다')
      const account = await getAccount()
      if (account?.role !== 'admin') {
        await supabase.auth.signOut()
        throw new Error('관리자 권한이 없는 계정입니다')
      }
      return account
    },

    async signOut() {
      await supabase.auth.signOut()
    },

    async changePassword(newPassword) {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      fail(error, '비밀번호를 바꾸지 못했습니다')
      await supabase.rpc('mark_password_changed')
    },

    onChange(callback) {
      const { data } = supabase.auth.onAuthStateChange((event) => {
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') setTimeout(callback, 0)
      })
      return () => data.subscription.unsubscribe()
    },
  },

  content: {
    /** RLS 가 현재 사용자에게 보이는 행만 돌려줍니다. */
    async loadAll() {
      const entries = await Promise.all(
        CONTENT_TYPE_KEYS.map(async (type) => {
          const { data, error } = await supabase.from(contentTypes[type].table).select('*')
          fail(error, `${contentTypes[type].label} 데이터를 불러오지 못했습니다`)
          return [type, sortItems(type, data.map((row) => fromRow(type, row)))]
        }),
      )
      const { data: years, error } = await supabase.from('academic_years').select('*').order('year', { ascending: false })
      fail(error)
      return {
        ...Object.fromEntries(entries),
        academicYears: years.map((y) => ({ year: y.year, label: y.label, isCurrent: y.is_current })),
      }
    },

    async save(type, item) {
      const { error } = await supabase.from(contentTypes[type].table).upsert(toRow(type, item))
      fail(error, '저장하지 못했습니다')
    },

    async remove(type, id) {
      const { error } = await supabase.from(contentTypes[type].table).delete().eq('id', id)
      if (error?.code === '23503') throw new Error('연결된 기록이 있어 삭제할 수 없습니다. 대신 보관 처리하세요.')
      fail(error, '삭제하지 못했습니다')
    },

    async upload(file) {
      const ext = (file.name.split('.').pop() || 'bin').toLowerCase().replace(/[^a-z0-9]/g, '')
      const path = `${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${ext}`
      const { error } = await supabase.storage.from('media').upload(path, file, { contentType: file.type, upsert: false })
      fail(error, '업로드하지 못했습니다')
      return supabase.storage.from('media').getPublicUrl(path).data.publicUrl
    },
  },

  school: {
    async listYears() {
      const { data, error } = await supabase.from('academic_years').select('*').order('year', { ascending: false })
      fail(error)
      return data.map((y) => ({ year: y.year, label: y.label, isCurrent: y.is_current }))
    },
    async saveYear({ year, label, isCurrent }) {
      if (isCurrent) await supabase.from('academic_years').update({ is_current: false }).neq('year', year)
      const { error } = await supabase.from('academic_years').upsert({ year, label, is_current: Boolean(isCurrent) })
      fail(error, '학년도를 저장하지 못했습니다')
    },
    async listClasses() {
      const { data, error } = await supabase.from('classes').select('*').order('academic_year', { ascending: false }).order('grade').order('class_number')
      fail(error)
      return data.map((c) => ({ id: c.id, academicYear: c.academic_year, grade: c.grade, classNumber: c.class_number }))
    },
    async saveClass({ academicYear, grade, classNumber }) {
      const { error } = await supabase.from('classes').insert({ academic_year: academicYear, grade, class_number: classNumber })
      if (error?.code === '23505') throw new Error('이미 있는 학급입니다')
      fail(error, '학급을 추가하지 못했습니다')
    },
    async removeClass(id) {
      const { error } = await supabase.from('classes').delete().eq('id', id)
      fail(error, '학급을 삭제하지 못했습니다')
    },
    async listStudents() {
      const { data, error } = await supabase
        .from('students')
        .select('*, student_classes(class_id)')
        .order('academic_year', { ascending: false })
        .order('grade')
        .order('class_number')
        .order('number')
      fail(error)
      return data.map(mapStudent)
    },
    async updateStudent(id, patch) {
      const { error } = await supabase
        .from('students')
        .update({ name: patch.name.trim(), grade: patch.grade, class_number: patch.classNumber, number: patch.number })
        .eq('id', id)
      fail(error, '학생 정보를 저장하지 못했습니다')
      // 학년·반이 바뀌면 같은 학년도의 학급 연결도 갱신 (학급 지정 콘텐츠 공개에 사용)
      const { data: cls, error: clsError } = await supabase
        .from('classes')
        .upsert({ academic_year: patch.academicYear, grade: patch.grade, class_number: patch.classNumber }, { onConflict: 'academic_year,grade,class_number' })
        .select('id')
        .single()
      fail(clsError)
      const { data: yearClasses } = await supabase.from('classes').select('id').eq('academic_year', patch.academicYear)
      await supabase.from('student_classes').delete().eq('student_id', id).in('class_id', (yearClasses || []).map((c) => c.id))
      const { error: linkError } = await supabase.from('student_classes').insert({ student_id: id, class_id: cls.id })
      fail(linkError)
    },
    /** 계정 생성은 서버(Edge Function)에서만 — 관리자 권한을 서버가 다시 확인합니다. */
    async createStudents(rows, password) {
      const data = await callAdminFunction({ action: 'create_students', rows: toStudentPayload(rows), password })
      return data.results.map((r) => ({ studentNumber: r.student_number, name: r.name, ok: r.ok, error: r.error, tempPassword: r.temp_password }))
    },
    async resetPassword(studentId, password) {
      const data = await callAdminFunction({ action: 'reset_password', student_id: studentId, password })
      return { tempPassword: data.temp_password }
    },
    async setActive(studentId, active) {
      await callAdminFunction({ action: 'set_active', student_id: studentId, active })
    },
  },

  records: {
    async myActivity(studentId, limit = 50) {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false })
        .limit(limit)
      fail(error)
      return data.map((l) => ({ id: l.id, contentType: l.content_type, contentId: l.content_id, action: l.action, result: l.result, createdAt: l.created_at }))
    },
    async myTestResults(studentId) {
      const { data, error } = await supabase.from('test_results').select('*').eq('student_id', studentId).order('created_at', { ascending: false })
      fail(error)
      return data.map((r) => ({
        id: r.id,
        testId: r.test_id,
        resultType: r.result_type,
        philosopher: r.philosopher,
        scores: { utilitarianism: r.utilitarianism_score, deontology: r.deontology_score, virtue: r.virtue_score, existentialism: r.existentialism_score },
        createdAt: r.created_at,
      }))
    },
    async log(studentId, { contentType, contentId, action, result = null }) {
      const { error } = await supabase.from('activity_logs').insert({ student_id: studentId, content_type: contentType, content_id: contentId, action, result })
      fail(error)
    },
    async saveTestResult(studentId, r) {
      const { error } = await supabase.from('test_results').insert({
        student_id: studentId,
        test_id: r.testId,
        result_type: r.resultType,
        philosopher: r.philosopher,
        utilitarianism_score: r.scores.utilitarianism,
        deontology_score: r.scores.deontology,
        virtue_score: r.scores.virtue,
        existentialism_score: r.scores.existentialism,
      })
      fail(error, '결과를 저장하지 못했습니다')
    },
    /** 관리자: 최근 활동 (RLS 로 관리자만 전체 조회 가능) */
    async recentActivity(limit = 20) {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*, students(student_number, name, grade, class_number, number)')
        .order('created_at', { ascending: false })
        .limit(limit)
      fail(error)
      return data.map((l) => ({
        id: l.id,
        contentType: l.content_type,
        contentId: l.content_id,
        action: l.action,
        createdAt: l.created_at,
        student: l.students && { studentNumber: l.students.student_number, name: l.students.name, grade: l.students.grade, classNumber: l.students.class_number, number: l.students.number },
      }))
    },
  },
}
