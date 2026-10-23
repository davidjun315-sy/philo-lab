import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useContent } from '../context/ContentContext'
import { backend } from '../lib/backend'
import PageHeader from '../components/PageHeader'
import ProfileCard from '../components/ProfileCard'
import EmptyState from '../components/EmptyState'

/**
 * 외부 심리테스트 → PHILO LAB 결과 연동 페이지
 * ------------------------------------------------------------------
 * 외부 테스트의 결과 화면에서 아래 주소로 이동시키면 됩니다. (README 참고)
 *   https://<PHILO LAB 주소>/#/connect/test-result?test=ethics-personality-test&type=kant&philosopher=kant&u=30&d=85&v=55&e=40
 *     test        : 게임 id (games 데이터에서 saveResult: true 인 항목)
 *     type        : 결과 유형 코드 (64자 이하)
 *     philosopher : 가장 닮은 철학자 id (선택)
 *     u / d / v / e : 공리주의 / 의무론 / 덕 윤리 / 실존주의 점수 (0~100)
 * 학생이 직접 [내 기록에 저장]을 눌러야 저장되며, 로그인한 본인 계정에만 저장됩니다 (DB RLS).
 */
const score = (v) => {
  if (v === null || v === '') return null
  const n = Number(v)
  return Number.isInteger(n) && n >= 0 && n <= 100 ? n : NaN
}
const code = (v) => (v && /^[a-z0-9-]{1,64}$/i.test(v) ? v : null)

export default function TestResultConnect() {
  const [params] = useSearchParams()
  const { student, isAdmin, promptLogin } = useAuth()
  const { getGame, getPhilosopher } = useContent()
  const [state, setState] = useState({ status: 'idle', message: '' })

  const parsed = useMemo(() => {
    const game = getGame(params.get('test') || '')
    const scores = { utilitarianism: score(params.get('u')), deontology: score(params.get('d')), virtue: score(params.get('v')), existentialism: score(params.get('e')) }
    const philosopher = code(params.get('philosopher'))
    const errors = []
    if (!game || !game.saveResult) errors.push('결과 저장을 지원하지 않는 테스트입니다')
    if (Object.values(scores).some((s) => Number.isNaN(s))) errors.push('점수는 0~100 사이 정수여야 합니다')
    if (params.get('philosopher') && !philosopher) errors.push('철학자 값이 올바르지 않습니다')
    return {
      game,
      errors,
      result: {
        testId: game?.id,
        resultType: code(params.get('type')) || philosopher || 'unknown',
        philosopher: philosopher && getPhilosopher(philosopher) ? philosopher : null,
        scores: Object.fromEntries(Object.entries(scores).map(([k, v]) => [k, v ?? null])),
      },
    }
  }, [params, getGame, getPhilosopher])

  const save = async () => {
    if (!student) return promptLogin('심리테스트 결과는 로그인한 학생 계정에만 저장할 수 있습니다.')
    setState({ status: 'saving', message: '' })
    try {
      await backend.records.saveTestResult(student.id, parsed.result)
      await backend.records.log(student.id, { contentType: 'test', contentId: parsed.result.testId, action: 'complete', result: { type: parsed.result.resultType } })
      setState({ status: 'saved', message: '' })
    } catch (e) {
      setState({ status: 'error', message: e.message })
    }
  }

  return (
    <>
      <PageHeader eyebrow="CONNECT" icon="💾" title="심리테스트 결과 저장" description={parsed.game ? parsed.game.title : '외부 테스트 결과를 PHILO LAB 계정에 저장합니다.'} />
      <section className="section section--cream">
        <div className="container narrow">
          {parsed.errors.length ? (
            <EmptyState icon="⚠️" title="결과 정보를 확인할 수 없습니다">
              {parsed.errors.join(' · ')}
            </EmptyState>
          ) : (
            <div className="connect">
              <ProfileCard profile={{ ...parsed.result, type: parsed.result.philosopher, title: '이번 테스트 결과', source: parsed.result.testId }} />
              <div className="card form-card">
                {state.status === 'saved' ? (
                  <>
                    <h2>✓ 저장했습니다</h2>
                    <p>MY PHILO LAB의 철학 프로필에 반영되었습니다.</p>
                    <Link to="/my" className="btn btn--gold">
                      MY PHILO LAB 보기
                    </Link>
                  </>
                ) : (
                  <>
                    <h2>내 기록에 저장할까요?</h2>
                    <p className="muted">
                      {student ? `${student.name} 학생의 계정에 저장됩니다.` : isAdmin ? '관리자 계정에는 저장되지 않습니다.' : '저장하려면 학생 로그인이 필요합니다. 게스트는 결과만 볼 수 있습니다.'}
                    </p>
                    {state.status === 'error' && <p className="form-error">{state.message}</p>}
                    {!isAdmin && (
                      <button type="button" className="btn btn--gold" onClick={save} disabled={state.status === 'saving'}>
                        {state.status === 'saving' ? '저장 중…' : '내 기록에 저장'}
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
