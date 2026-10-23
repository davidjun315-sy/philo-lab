/**
 * DB 스키마 + Row Level Security 검증 (PGlite: WebAssembly PostgreSQL)
 *   npm run test:db
 * Supabase 의 auth 스키마(auth.users, auth.uid())를 흉내 낸 뒤
 * 실제 마이그레이션과 seed.sql 을 실행하고, 게스트·학생·관리자 권한을 검사합니다.
 */
import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { PGlite } from '@electric-sql/pglite'

const dir = (p) => fileURLToPath(new URL(p, import.meta.url))
const db = new PGlite()
let failed = 0
const check = (name, cond, detail = '') => {
  console.log(`${cond ? '✓' : '✗'} ${name}${detail ? ` — ${detail}` : ''}`)
  if (!cond) failed++
}

// --- Supabase auth 흉내 -------------------------------------------------------
await db.exec(`
  create role anon nologin;
  create role authenticated nologin;
  create schema auth;
  create table auth.users (
    id uuid primary key default gen_random_uuid(),
    email text unique,
    raw_app_meta_data jsonb default '{}',
    raw_user_meta_data jsonb default '{}'
  );
  create function auth.uid() returns uuid language sql stable as
    $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  grant usage on schema auth to anon, authenticated;
  grant execute on function auth.uid() to anon, authenticated;
`)

// --- 마이그레이션 (storage 는 Supabase 전용이라 제외) + seed --------------------
for (const f of readdirSync(dir('../supabase/migrations')).sort()) {
  if (f.includes('storage')) continue
  await db.exec(readFileSync(dir(`../supabase/migrations/${f}`), 'utf8'))
  console.log(`· migration ${f}`)
}
await db.exec(readFileSync(dir('../supabase/seed.sql'), 'utf8'))
console.log('· seed.sql')

// --- 테스트 사용자 ------------------------------------------------------------
const one = async (sql, params) => (await db.query(sql, params)).rows[0]
const adminId = (await one(`insert into auth.users (email) values ('admin@admin.philolab.local') returning id`)).id
const aId = (await one(`insert into auth.users (email, raw_app_meta_data) values ('202620101@students.philolab.local', '{"must_change_password": true}') returning id`)).id
const bId = (await one(`insert into auth.users (email) values ('202620201@students.philolab.local') returning id`)).id
await db.query(`update public.profiles set role = 'admin' where id = $1`, [adminId])

const class21 = (await one(`select id from public.classes where academic_year = 2026 and grade = 2 and class_number = 1`)).id
const class22 = (await one(`select id from public.classes where academic_year = 2026 and grade = 2 and class_number = 2`)).id
const sA = (await one(`insert into public.students (user_id, student_number, name, grade, class_number, number, academic_year) values ($1, '202620101', '김민수', 2, 1, 1, 2026) returning id`, [aId])).id
const sB = (await one(`insert into public.students (user_id, student_number, name, grade, class_number, number, academic_year) values ($1, '202620201', '이서준', 2, 2, 1, 2026) returning id`, [bId])).id
await db.query(`insert into public.student_classes values ($1, $2), ($3, $4)`, [sA, class21, sB, class22])
await db.query(`update public.lessons set visibility = 'class', class_ids = array[$1::uuid] where id = 'kant'`, [class21])

const counts = { philosophers: (await one(`select count(*)::int n from public.philosophers`)).n, resources: (await one(`select count(*)::int n from public.resources`)).n }
check('seed: 철학자 32명', counts.philosophers === 32, String(counts.philosophers))
check('트리거: 학생 프로필 자동 생성 (must_change_password 반영)', (await one(`select must_change_password from public.profiles where id = $1`, [aId])).must_change_password === true)

// --- 역할 전환 헬퍼 -----------------------------------------------------------
const as = async (role, uid, fn) => {
  await db.exec(`reset role; select set_config('request.jwt.claim.sub', '${uid || ''}', false); set role ${role};`)
  try {
    return await fn()
  } finally {
    await db.exec(`reset role; select set_config('request.jwt.claim.sub', '', false);`)
  }
}
const count = async (sql) => (await one(`select count(*)::int n from (${sql}) t`)).n
const fails = async (sql, params) => {
  try {
    const r = await db.query(sql, params)
    return r.affectedRows === 0
  } catch {
    return true
  }
}

// --- 게스트(anon) -------------------------------------------------------------
await as('anon', null, async () => {
  check('게스트: 공개 철학자 조회', (await count(`select * from public.philosophers`)) === 32)
  check('게스트: 공개 교사자료만 조회', (await count(`select * from public.resources`)) === (await count(`select * from public.resources where visibility = 'public'`)) && (await count(`select * from public.resources`)) < counts.resources)
  check('게스트: 학급 지정 수업(칸트) 숨김', (await count(`select * from public.lessons where id = 'kant'`)) === 0)
  check('게스트: 학생 명부 0건', (await count(`select * from public.students`)) === 0)
  check('게스트: 학생 전용 동아리 활동 숨김', (await count(`select * from public.club_activities where visibility = 'students'`)) === 0)
  check('게스트: 콘텐츠 추가 불가', await fails(`insert into public.games (id, title, type) values ('hack', 'x', '퀴즈')`))
})

// --- 학생 A (2학년 1반) -------------------------------------------------------
await as('authenticated', aId, async () => {
  check('학생A: 본인 학생 정보만 조회', (await count(`select * from public.students`)) === 1)
  check('학생A: 다른 학생 정보 조회 불가', (await count(`select * from public.students where id = '${sB}'`)) === 0)
  check('학생A: 다른 사람 프로필 조회 불가', (await count(`select * from public.profiles`)) === 1)
  check('학생A: 자기 role 을 admin 으로 변경 불가', await fails(`update public.profiles set role = 'admin' where id = $1`, [aId]))
  check('학생A: 학생 공개 자료 조회', (await count(`select * from public.resources where visibility = 'students'`)) > 0)
  check('학생A: 교사 전용 자료 숨김', (await count(`select * from public.resources where visibility = 'admin'`)) === 0)
  check('학생A: 자기 반(2-1) 지정 수업 조회', (await count(`select * from public.lessons where id = 'kant'`)) === 1)
  check('학생A: 콘텐츠 수정 불가', await fails(`update public.philosophers set name = 'x' where id = 'kant'`))
  check('학생A: 학생 명부 추가 불가', await fails(`insert into public.students (student_number, name, grade, class_number, number, academic_year) values ('202610199', 'x', 1, 1, 99, 2026)`))
  check('학생A: 내 활동 기록 저장', !(await fails(`insert into public.activity_logs (student_id, content_type, content_id, action) values ($1, 'lesson', 'kant', 'complete')`, [sA])))
  check('학생A: 남의 이름으로 활동 기록 불가', await fails(`insert into public.activity_logs (student_id, content_type, content_id, action) values ($1, 'lesson', 'kant', 'complete')`, [sB]))
  check('학생A: 허용되지 않은 action 거부', await fails(`insert into public.activity_logs (student_id, content_type, content_id, action) values ($1, 'lesson', 'kant', 'hack')`, [sA]))
  check('학생A: 심리테스트 결과 저장', !(await fails(`insert into public.test_results (student_id, test_id, result_type, philosopher, utilitarianism_score, deontology_score, virtue_score, existentialism_score) values ($1, 'ethics-personality-test', 'kant', 'kant', 30, 85, 55, 40)`, [sA])))
  check('학생A: 범위 밖 점수 거부', await fails(`insert into public.test_results (student_id, test_id, utilitarianism_score) values ($1, 'ethics-personality-test', 150)`, [sA]))
  const acc = (await one(`select public.get_my_account() a`)).a
  check('학생A: get_my_account()', acc.role === 'student' && acc.student?.name === '김민수' && acc.must_change_password === true)
  await db.query(`select public.mark_password_changed()`)
  check('학생A: 비밀번호 변경 표시 해제', (await one(`select must_change_password m from public.profiles`)).m === false)
})

// --- 학생 B (2학년 2반) -------------------------------------------------------
await as('authenticated', bId, async () => {
  check('학생B: 다른 반 지정 수업 숨김', (await count(`select * from public.lessons where id = 'kant'`)) === 0)
  check('학생B: 학생A 활동 기록 조회 불가', (await count(`select * from public.activity_logs`)) === 0)
  check('학생B: 학생A 심리테스트 결과 조회 불가', (await count(`select * from public.test_results`)) === 0)
})

// --- 관리자 -------------------------------------------------------------------
await as('authenticated', adminId, async () => {
  check('관리자: 전체 학생 조회', (await count(`select * from public.students`)) === 2)
  check('관리자: 교사 전용 자료 조회', (await count(`select * from public.resources`)) === counts.resources)
  check('관리자: 게임 추가', !(await fails(`insert into public.games (id, title, type) values ('new-game', '새 게임', '퀴즈')`)))
  check('관리자: 철학자 수정', !(await fails(`update public.philosophers set quote = '수정' where id = 'kant'`)))
  check('관리자: 학생 활동 기록 조회', (await count(`select * from public.activity_logs`)) === 1)
  check('관리자: 새 학년도·동아리 추가', !(await fails(`insert into public.academic_years (year, label) values (2027, '2027학년도'); `)) && !(await fails(`insert into public.clubs (id, academic_year, name) values ('2027-philosophy', 2027, '철학 동아리')`)))
  check('관리자: 활동 기록이 있는 동아리는 삭제 불가(보존)', await fails(`delete from public.clubs where id = '2026-philosophy'`))
  check('관리자: 9자리가 아닌 학번 거부', await fails(`insert into public.students (student_number, name, grade, class_number, number, academic_year) values ('2026020101', '열자리', 2, 1, 1, 2026)`))
  check('관리자: 9자리 학번 등록', !(await fails(`insert into public.students (student_number, name, grade, class_number, number, academic_year) values ('202620301', '최하늘', 2, 3, 1, 2026)`)))
  check('관리자: 잘못된 외부 URL 거부', await fails(`update public.games set external_url = 'javascript:alert(1)' where id = 'new-game'`))
})

console.log(failed ? `\n${failed}개 실패` : '\n모든 DB 권한 테스트 통과')
process.exit(failed ? 1 : 0)
