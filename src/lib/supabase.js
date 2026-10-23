/**
 * Supabase 클라이언트
 * ------------------------------------------------------------------
 * 환경변수(VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY)가 설정되어 있으면 실제 인증·DB 를 사용하고,
 * 없으면 앱은 "데모 모드"로 동작합니다. (src/lib/backend/demo.js)
 *
 * ※ 여기에는 공개용 키(publishable/anon key)만 사용합니다. 이 키는 브라우저에 노출되어도 되며,
 *   실제 데이터 접근은 DB 의 Row Level Security 가 제한합니다.
 *   service_role / secret 키는 절대 프론트엔드에 넣지 마세요. (Edge Function 에서만 사용)
 */
import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(url && key)

export const supabase = isSupabaseConfigured
  ? createClient(url, key, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false, storageKey: 'philolab-auth' },
    })
  : null

/**
 * 학생은 학번, 관리자는 아이디로 로그인합니다.
 * Supabase Auth 는 이메일 형식 식별자가 필요하므로 내부적으로만 아래 주소로 바꿔 사용합니다. (화면에 노출하지 않음, 메일 발송 없음)
 *   학생   202620101 → 202620101@students.philolab.local
 *   관리자 admin     → admin@admin.philolab.local
 */
export const STUDENT_EMAIL_DOMAIN = 'students.philolab.local'
export const ADMIN_EMAIL_DOMAIN = 'admin.philolab.local'
export const studentAuthId = (studentNumber) => `${studentNumber}@${STUDENT_EMAIL_DOMAIN}`
export const adminAuthId = (loginId) => `${loginId}@${ADMIN_EMAIL_DOMAIN}`
