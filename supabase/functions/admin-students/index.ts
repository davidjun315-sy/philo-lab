// ============================================================================
// PHILO LAB — 관리자 전용 학생 계정 함수 (Supabase Edge Function, Deno)
// ----------------------------------------------------------------------------
// 높은 권한이 필요한 작업(학생 계정 생성·비밀번호 초기화·비활성화)은 여기서만 처리합니다.
// SUPABASE_SERVICE_ROLE_KEY 는 Supabase 가 함수 실행 환경에 자동 주입하며,
// 프론트엔드 코드나 GitHub 에는 절대 포함되지 않습니다.
//
// 요청: POST { action, ... }  (Authorization: Bearer <관리자 로그인 토큰>)
//   create_students : { rows: StudentRow[], password: { mode: 'random' } | { mode: 'common', value } }
//   reset_password  : { student_id, password: {...} }
//   set_active      : { student_id, active }
// ============================================================================
import { createClient } from 'npm:@supabase/supabase-js@2'

const STUDENT_EMAIL_DOMAIN = 'students.philolab.local'
const MAX_ROWS = 500

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

type StudentRow = {
  academic_year: number
  grade: number
  class_number: number
  number: number
  student_number: string
  name: string
}

type PasswordOption = { mode: 'random' } | { mode: 'common'; value: string }

const isInt = (v: unknown, min: number, max: number) => Number.isInteger(v) && (v as number) >= min && (v as number) <= max

function validateRow(r: StudentRow): string | null {
  if (!isInt(r.academic_year, 2000, 2100)) return '학년도가 올바르지 않습니다'
  if (!isInt(r.grade, 1, 3)) return '학년은 1~3 사이여야 합니다'
  if (!isInt(r.class_number, 1, 30)) return '반은 1~30 사이여야 합니다'
  if (!isInt(r.number, 1, 60)) return '번호는 1~60 사이여야 합니다'
  if (typeof r.student_number !== 'string' || !/^[0-9]{4,12}$/.test(r.student_number)) return '학번은 숫자 4~12자리여야 합니다'
  if (typeof r.name !== 'string' || r.name.trim().length < 1 || r.name.trim().length > 40) return '이름이 올바르지 않습니다'
  return null
}

function validatePasswordOption(p: PasswordOption | undefined): string | null {
  if (!p || (p.mode !== 'random' && p.mode !== 'common')) return '비밀번호 방식이 올바르지 않습니다'
  if (p.mode === 'common') {
    if (typeof p.value !== 'string' || p.value.length < 8 || p.value.length > 72) return '공통 초기 비밀번호는 8~72자여야 합니다'
    if (!/[A-Za-z]/.test(p.value) || !/[0-9]/.test(p.value)) return '공통 초기 비밀번호는 영문과 숫자를 모두 포함해야 합니다'
  }
  return null
}

// 헷갈리는 문자(0/O, 1/l/I)를 뺀 10자리 임시 비밀번호
function randomPassword(length = 10) {
  const alphabet = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const bytes = new Uint32Array(length)
  crypto.getRandomValues(bytes)
  let pw = ''
  for (const b of bytes) pw += alphabet[b % alphabet.length]
  // 숫자 최소 1개 보장
  return /[0-9]/.test(pw) ? pw : pw.slice(0, -1) + '7'
}

const passwordFor = (p: PasswordOption) => (p.mode === 'common' ? p.value : randomPassword())

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'POST 요청만 허용됩니다' }, 405)

  const url = Deno.env.get('SUPABASE_URL')!
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

  // 1) 호출자 확인 (로그인 토큰)
  const authHeader = req.headers.get('Authorization') ?? ''
  const caller = createClient(url, anonKey, { global: { headers: { Authorization: authHeader } }, auth: { persistSession: false } })
  const { data: userData, error: userError } = await caller.auth.getUser()
  if (userError || !userData?.user) return json({ error: '로그인이 필요합니다' }, 401)

  // 2) 관리자 역할 확인 (DB 의 profiles.role)
  const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })
  const { data: profile } = await admin.from('profiles').select('role').eq('id', userData.user.id).single()
  if (profile?.role !== 'admin') return json({ error: '관리자 권한이 필요합니다' }, 403)

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return json({ error: '잘못된 요청 형식입니다' }, 400)
  }

  switch (body.action) {
    case 'create_students':
      return createStudents(admin, body.rows as StudentRow[], body.password as PasswordOption)
    case 'reset_password':
      return resetPassword(admin, body.student_id as string, body.password as PasswordOption)
    case 'set_active':
      return setActive(admin, body.student_id as string, body.active as boolean)
    default:
      return json({ error: '알 수 없는 작업입니다' }, 400)
  }
})

// deno-lint-ignore no-explicit-any
type Admin = any

async function ensureClass(admin: Admin, year: number, grade: number, classNumber: number) {
  await admin.from('academic_years').upsert({ year, label: `${year}학년도` }, { onConflict: 'year', ignoreDuplicates: true })
  const { data, error } = await admin
    .from('classes')
    .upsert({ academic_year: year, grade, class_number: classNumber }, { onConflict: 'academic_year,grade,class_number' })
    .select('id')
    .single()
  if (error) throw error
  return data.id as string
}

async function createStudents(admin: Admin, rows: StudentRow[], password: PasswordOption) {
  if (!Array.isArray(rows) || rows.length === 0) return json({ error: '등록할 학생이 없습니다' }, 400)
  if (rows.length > MAX_ROWS) return json({ error: `한 번에 최대 ${MAX_ROWS}명까지 등록할 수 있습니다` }, 400)
  const pwError = validatePasswordOption(password)
  if (pwError) return json({ error: pwError }, 400)

  const seen = new Set<string>()
  const results = []

  for (const raw of rows) {
    const row: StudentRow = {
      academic_year: Number(raw.academic_year),
      grade: Number(raw.grade),
      class_number: Number(raw.class_number),
      number: Number(raw.number),
      student_number: String(raw.student_number ?? '').trim(),
      name: String(raw.name ?? '').trim(),
    }
    const invalid = validateRow(row) ?? (seen.has(row.student_number) ? '파일 안에 중복된 학번입니다' : null)
    if (invalid) {
      results.push({ student_number: row.student_number, name: row.name, ok: false, error: invalid })
      continue
    }
    seen.add(row.student_number)

    const tempPassword = passwordFor(password)
    let userId: string | null = null
    try {
      const { data: created, error: createError } = await admin.auth.admin.createUser({
        email: `${row.student_number}@${STUDENT_EMAIL_DOMAIN}`,
        password: tempPassword,
        email_confirm: true,
        app_metadata: { must_change_password: true },
      })
      if (createError) throw new Error(createError.message.includes('already') ? '이미 등록된 학번입니다' : createError.message)
      userId = created.user.id

      const classId = await ensureClass(admin, row.academic_year, row.grade, row.class_number)
      const { data: student, error: studentError } = await admin
        .from('students')
        .insert({ ...row, user_id: userId })
        .select('id')
        .single()
      if (studentError) throw new Error(studentError.code === '23505' ? '이미 등록된 학번입니다' : studentError.message)
      const { error: linkError } = await admin.from('student_classes').insert({ student_id: student.id, class_id: classId })
      if (linkError) throw linkError

      results.push({
        student_number: row.student_number,
        name: row.name,
        ok: true,
        // 무작위 임시 비밀번호는 이 응답에서 한 번만 전달되며 어디에도 저장되지 않습니다.
        temp_password: password.mode === 'random' ? tempPassword : undefined,
      })
    } catch (e) {
      if (userId) await admin.auth.admin.deleteUser(userId) // 중간 실패 시 계정 정리
      results.push({ student_number: row.student_number, name: row.name, ok: false, error: (e as Error).message })
    }
  }

  return json({ results })
}

async function findStudentUser(admin: Admin, studentId: string) {
  if (typeof studentId !== 'string' || !/^[0-9a-f-]{36}$/i.test(studentId)) return null
  const { data } = await admin.from('students').select('id, user_id').eq('id', studentId).single()
  return data?.user_id ? (data as { id: string; user_id: string }) : null
}

async function resetPassword(admin: Admin, studentId: string, password: PasswordOption) {
  const pwError = validatePasswordOption(password)
  if (pwError) return json({ error: pwError }, 400)
  const student = await findStudentUser(admin, studentId)
  if (!student) return json({ error: '학생 계정을 찾을 수 없습니다' }, 404)
  const tempPassword = passwordFor(password)
  const { error } = await admin.auth.admin.updateUserById(student.user_id, { password: tempPassword })
  if (error) return json({ error: error.message }, 400)
  await admin.from('profiles').update({ must_change_password: true }).eq('id', student.user_id)
  return json({ ok: true, temp_password: password.mode === 'random' ? tempPassword : undefined })
}

async function setActive(admin: Admin, studentId: string, active: boolean) {
  if (typeof active !== 'boolean') return json({ error: 'active 값이 필요합니다' }, 400)
  const student = await findStudentUser(admin, studentId)
  if (!student) return json({ error: '학생 계정을 찾을 수 없습니다' }, 404)
  // 비활성 학생은 로그인 차단 (기록은 보존)
  const { error } = await admin.auth.admin.updateUserById(student.user_id, { ban_duration: active ? 'none' : '876000h' })
  if (error) return json({ error: error.message }, 400)
  await admin.from('students').update({ active }).eq('id', student.id)
  return json({ ok: true })
}
