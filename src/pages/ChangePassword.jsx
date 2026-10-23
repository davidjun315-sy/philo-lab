import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { validatePassword } from '../lib/validation'
import PageHeader from '../components/PageHeader'

export default function ChangePassword() {
  const { account, changePassword } = useAuth()
  const navigate = useNavigate()
  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    const invalid = validatePassword(pw)
    if (invalid) return setError(invalid)
    if (pw !== pw2) return setError('두 비밀번호가 다릅니다')
    setBusy(true)
    setError('')
    try {
      await changePassword(pw)
      navigate(account?.role === 'admin' ? '/admin' : '/my', { replace: true, state: { flash: '비밀번호를 변경했습니다.' } })
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <PageHeader eyebrow="ACCOUNT" icon="🔑" title="비밀번호 변경" description={account?.mustChangePassword ? '처음 로그인했어요. 안전을 위해 새 비밀번호로 바꿔 주세요.' : '새 비밀번호를 설정합니다.'} />
      <section className="section">
        <div className="container narrow">
          <form className="card form-card" onSubmit={submit} noValidate>
            <label className="field">
              <span>새 비밀번호</span>
              <input type="password" autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} />
              <small>8자 이상, 영문과 숫자를 모두 포함</small>
            </label>
            <label className="field">
              <span>새 비밀번호 확인</span>
              <input type="password" autoComplete="new-password" value={pw2} onChange={(e) => setPw2(e.target.value)} />
            </label>
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <div className="form-actions">
              <button type="submit" className="btn btn--gold" disabled={busy}>
                {busy ? '변경 중…' : '비밀번호 변경'}
              </button>
              {!account?.mustChangePassword && (
                <Link to="/my" className="btn btn--ghost">
                  취소
                </Link>
              )}
            </div>
          </form>
        </div>
      </section>
    </>
  )
}
