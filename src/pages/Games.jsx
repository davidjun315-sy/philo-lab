import { useState } from 'react'
import { GAME_TYPES } from '../data/games'
import { profileFromResult } from '../data/profile'
import { useContent } from '../context/ContentContext'
import { useAuth } from '../context/AuthContext'
import { useMyRecords } from '../hooks/useMyRecords'
import PageHeader from '../components/PageHeader'
import FilterChips from '../components/FilterChips'
import GameCard from '../components/GameCard'
import ProfileCard from '../components/ProfileCard'
import EmptyState from '../components/EmptyState'
import Reveal from '../components/Reveal'

export default function Games() {
  const { games } = useContent()
  const { student } = useAuth()
  const { results } = useMyRecords({ limit: 1 })
  const [type, setType] = useState('')
  const list = type ? games.filter((g) => g.type === type) : games

  return (
    <>
      <PageHeader eyebrow="PHILOSOPHY ARCADE" icon="🎮" title="게임" description="놀면서 배우는 철학, 게임처럼 즐기는 사유의 세계" />
      <section className="section section--dark">
        <div className="container">
          <FilterChips label="카테고리" options={GAME_TYPES} value={type} onChange={setType} />
          {list.length ? (
            <div className="grid grid--games">
              {list.map((g, i) => (
                <Reveal key={g.id} delay={(i % 6) * 60}>
                  <GameCard game={g} />
                </Reveal>
              ))}
            </div>
          ) : (
            <EmptyState icon="🎲" title="이 카테고리의 게임은 준비 중입니다" />
          )}
        </div>
      </section>
      <section className="section section--cream">
        <div className="container games-profile">
          <div>
            <p className="eyebrow">MY PHILOSOPHY PROFILE</p>
            <h2>게임 결과가 나의 프로필이 됩니다</h2>
            <p>
              윤리 사상가 심리테스트 결과를 저장하면 나만의 철학 프로필이 만들어집니다. 앞으로 딜레마·데스매치에서 내린 선택도 프로필에 더해질
              예정입니다.
            </p>
          </div>
          <ProfileCard profile={student ? profileFromResult(results[0]) : undefined} />
        </div>
      </section>
    </>
  )
}
