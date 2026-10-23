import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Badge from './Badge'
import { PROFILE_AXES, demoProfile } from '../data/profile'
import { useContent } from '../context/ContentContext'

/**
 * 나의 철학 프로필 카드
 * profile 이 없으면 데모 데이터를 "UI 데모" 배지와 함께 보여줍니다.
 */
export default function ProfileCard({ profile }) {
  const { getPhilosopher } = useContent()
  const [animate, setAnimate] = useState(false)
  const data = profile || demoProfile
  const isDemo = !profile

  useEffect(() => {
    const t = setTimeout(() => setAnimate(true), 150)
    return () => clearTimeout(t)
  }, [])

  const match = getPhilosopher(data.type)

  return (
    <div className="profile card">
      <div className="profile__head">
        <div>
          <p className="eyebrow">MY PHILOSOPHY PROFILE</p>
          <h3>나의 철학 프로필</h3>
        </div>
        {isDemo ? <Badge tone="gold">UI 데모</Badge> : data.createdAt && <Badge tone="green">{new Date(data.createdAt).toLocaleDateString('ko-KR')}</Badge>}
      </div>

      <div className="profile__identity">
        <span className="profile__avatar" aria-hidden="true">{match?.symbol || '?'}</span>
        <div>
          <strong>{data.title || '나의 철학 유형'}</strong>
          {match && (
            <p>
              가장 닮은 사상가 · <Link to={`/philosophers/${match.id}`}>{match.name}</Link>
            </p>
          )}
        </div>
      </div>

      <ul className="profile__bars">
        {PROFILE_AXES.map((axis) => {
          const value = data.scores?.[axis.key] ?? 0
          return (
            <li key={axis.key}>
              <div className="profile__label">
                <span>{axis.label}</span>
                <span>{value}%</span>
              </div>
              <div className="profile__track">
                <span className={`profile__fill fill-${axis.color}`} style={{ width: animate ? `${value}%` : 0 }} />
              </div>
            </li>
          )
        })}
      </ul>

      <p className="profile__note">
        {isDemo
          ? '예시 데이터입니다. 로그인한 학생이 윤리 사상가 심리테스트 결과를 저장하면 나의 결과가 이곳에 표시됩니다.'
          : '윤리 사상가 심리테스트 결과를 바탕으로 한 프로필입니다.'}
      </p>
      <Link to="/games/ethics-personality-test" className="btn btn--ghost btn--sm">
        심리테스트 보러 가기 →
      </Link>
    </div>
  )
}
