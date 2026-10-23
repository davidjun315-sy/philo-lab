import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Badge from './Badge'
import { PROFILE_AXES, PROFILE_STORAGE_KEY, demoProfile } from '../data/profile'
import { getPhilosopher } from '../data/philosophers'

/** 저장된 심리테스트 결과가 있으면 사용하고, 없으면 데모 데이터를 보여줍니다. */
const loadProfile = () => {
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed?.scores)) return parsed
    }
  } catch {
    /* 저장소 접근 불가 시 데모로 대체 */
  }
  return demoProfile
}

export default function ProfileCard() {
  const [profile] = useState(loadProfile)
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setAnimate(true), 150)
    return () => clearTimeout(t)
  }, [])

  const isDemo = profile.source === 'demo'
  const match = getPhilosopher(profile.type)

  return (
    <div className="profile card">
      <div className="profile__head">
        <div>
          <p className="eyebrow">MY PHILOSOPHY PROFILE</p>
          <h3>나의 철학 프로필</h3>
        </div>
        {isDemo && <Badge tone="gold">UI 데모</Badge>}
      </div>

      <div className="profile__identity">
        <span className="profile__avatar" aria-hidden="true">{match?.symbol || '?'}</span>
        <div>
          <strong>{profile.title || '나의 철학 유형'}</strong>
          {match && (
            <p>
              가장 닮은 사상가 · <Link to={`/philosophers/${match.id}`}>{match.name}</Link>
            </p>
          )}
        </div>
      </div>

      <ul className="profile__bars">
        {PROFILE_AXES.map((axis) => {
          const value = profile.scores.find((s) => s.key === axis.key)?.value ?? 0
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
          ? '현재는 예시 데이터입니다. 윤리 사상가 심리테스트가 연결되면 나의 결과가 이곳에 표시됩니다.'
          : '윤리 사상가 심리테스트 결과를 바탕으로 한 프로필입니다.'}
      </p>
      <Link to="/games/ethics-type-test" className="btn btn--ghost btn--sm">
        심리테스트 보러 가기 →
      </Link>
    </div>
  )
}
