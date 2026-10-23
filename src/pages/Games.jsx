import { useState } from 'react'
import { GAME_CATEGORIES, games } from '../data/games'
import PageHeader from '../components/PageHeader'
import FilterChips from '../components/FilterChips'
import GameCard from '../components/GameCard'
import ProfileCard from '../components/ProfileCard'
import EmptyState from '../components/EmptyState'
import Reveal from '../components/Reveal'

export default function Games() {
  const [category, setCategory] = useState('')
  const list = category ? games.filter((g) => g.category === category) : games

  return (
    <>
      <PageHeader eyebrow="PHILOSOPHY ARCADE" icon="🎮" title="게임" description="놀면서 배우는 철학, 게임처럼 즐기는 사유의 세계" />
      <section className="section section--dark">
        <div className="container">
          <FilterChips label="카테고리" options={GAME_CATEGORIES} value={category} onChange={setCategory} />
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
            <p className="eyebrow">COMING SOON</p>
            <h2>게임 결과가 나의 프로필이 됩니다</h2>
            <p>
              심리테스트, 딜레마, 데스매치에서 내린 선택이 모여 나만의 철학 프로필이 완성될 예정입니다. 지금은 UI 데모로 미리
              만나 보세요.
            </p>
          </div>
          <ProfileCard />
        </div>
      </section>
    </>
  )
}
