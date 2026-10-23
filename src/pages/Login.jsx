import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { isDemoMode } from '../lib/backend'
import { DEMO_ACCOUNTS } from '../lib/backend/demo'
import { ADMIN_ID_RE, validateStudentNumber } from '../lib/validation'
import { site } from '../data/site'

/** next 파라미터는 사이트 내부 경로만 허용 (외부 주소로 튕기는 것 방지) */
const safeNext = (next) => (next && next.startsWith('/') && !next.startsWith('//') ? next : null)

export default function Login() {
  const [params] = useSearchParams()
  const [mode, setMode] = useState(params.get('mode') === 'admin' ? 'admin' : 'student')
  const [studentNumber, setStudentNumber] = useState('')
  const [adminId, setAdminId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const auth = useAuth()
  const navigate = useNavigate()
  const next = safeNext(params.get('next'))

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (mode === 'student') {
      const invalid = validateStudentNumber(studentNumber)
      if (invalid) return setError(invalid)
    } else if (!ADMIN_ID_RE.test(adminId.trim().toLowerCase())) {
      return setError('아이디를 확인하세요 (영문 소문자·숫자 3자 이상)')
    }
    if (!password) return setError('비밀번호를 입력하세요')

    setBusy(true)
    try {
      const account =
        mode === 'student' ? await auth.signInStudent(studentNumber.trim(), password) : await auth.signInAdmin(adminId.trim().toLowerCase(), password)
      setPassword('')
      if (account.mustChangePassword) navigate('/my/password', { replace: true })
      else navigate(next || (account.role === 'admin' ? '/admin' : '/my'), { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const guest = () => {
    auth.enterGuest()
    navigate(next || '/')
  }

  const fillDemo = (kind) => {
    setError('')
    if (kind === 'admin') {
      setMode('admin')
      setAdminId(DEMO_ACCOUNTS.admin.loginId)
      setPassword(DEMO_ACCOUNTS.admin.password)
    } else {
      setMode('student')
      setStudentNumber(DEMO_ACCOUNTS.students[0].studentNumber)
      setPassword(DEMO_ACCOUNTS.students[0].password)
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-page__bg" aria-hidden="true" />
      <div className="auth-card">
        <Link to="/" className="auth-card__brand">
          <span className="logo__mark" aria-hidden="true">
            <svg viewBox="0 0 32 32">
              <path d="M5 11 16 4l11 7M7 11h18M9 13v11M14 13v11M18 13v11M23 13v11M6 26h20" />
            </svg>
          </span>
          <span>
            <strong>{site.name}</strong>
            <small>{site.nameKo}</small>
          </span>
        </Link>

        <div className="auth-tabs" role="tablist" aria-label="로그인 유형">
          <button type="button" role="tab" aria-selected={mode === 'student'} className={mode === 'student' ? 'is-active' : ''} onClick={() => setMode('student')}>
            학생 로그인
          </button>
          <button type="button" role="tab" aria-selected={mode === 'admin'} className={mode === 'admin' ? 'is-active' : ''} onClick={() => setMode('admin')}>
            관리자
          </button>
        </div>

        <form className="auth-form" onSubmit={submit} noValidate>
          <h1>{mode === 'student' ? '학생 로그인' : '관리자 로그인'}</h1>
          {mode === 'student' ? (
            <label className="field">
              <span>학번</span>
              <input
                inputMode="numeric"
                autoComplete="username"
                value={studentNumber}
                onChange={(e) => setStudentNumber(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="예: 202620101"
                maxLength={9}
                required
              />
              <small>학년도 4자리 + 학번 5자리 (2026학년도 2학년 1반 1번 → 202620101)</small>
            </label>
          ) : (
            <label className="field">
              <span>아이디</span>
              <input autoComplete="username" autoCapitalize="none" spellCheck={false} value={adminId} onChange={(e) => setAdminId(e.target.value)} placeholder="admin" required />
            </label>
          )}
          <label className="field">
            <span>비밀번호</span>
            <input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </label>

          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}

          <button type="submit" className="btn btn--gold btn--block" disabled={busy}>
            {busy ? '확인 중…' : '로그인'}
          </button>
          {mode === 'student' && (
            <button type="button" className="btn btn--ghost btn--block" onClick={guest}>
              게스트로 둘러보기
            </button>
          )}
          <p className="auth-form__help">
            {mode === 'student'
              ? '계정은 선생님이 만들어 드립니다. 비밀번호를 잊었다면 선생님께 초기화를 요청하세요.'
              : '관리자 권한은 서버(DB)에서만 부여됩니다.'}
          </p>
        </form>

        {isDemoMode && (
          <div className="demo-box">
            <strong>🧪 데모 모드</strong>
            <p>Supabase가 아직 연결되지 않아 실제 인증 대신 체험용 계정으로 동작합니다. 데이터는 이 브라우저에만 저장됩니다.</p>
            <ul>
              <li>
                학생: <code>{DEMO_ACCOUNTS.students[0].studentNumber}</code> / <code>{DEMO_ACCOUNTS.students[0].password}</code>
              </li>
              <li>
                관리자: <code>{DEMO_ACCOUNTS.admin.loginId}</code> / <code>{DEMO_ACCOUNTS.admin.password}</code>
              </li>
            </ul>
            <div className="demo-box__actions">
              <button type="button" className="chip" onClick={() => fillDemo('student')}>
                학생 데모 입력
              </button>
              <button type="button" className="chip" onClick={() => fillDemo('admin')}>
                관리자 데모 입력
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
