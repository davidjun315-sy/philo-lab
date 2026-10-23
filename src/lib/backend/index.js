/**
 * 백엔드 선택
 *   - Supabase 환경변수가 있으면 → 실제 인증·DB (supabaseBackend)
 *   - 없으면 → 데모 모드 (demoBackend, 이 브라우저에만 저장 / 실제 인증 아님)
 */
import { isSupabaseConfigured } from '../supabase'
import { supabaseBackend } from './supabaseBackend'
import { demoBackend } from './demo'

export const backend = isSupabaseConfigured ? supabaseBackend : demoBackend
export const isDemoMode = backend.mode === 'demo'
