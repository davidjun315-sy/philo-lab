import PhilosopherBust from './PhilosopherBust'

/** HOME 히어로 오른쪽의 시각 요소: 조각상 + 기둥 + 별 + 월계수 + 말풍선 */
export default function HeroArt() {
  return (
    <div className="hero-art" aria-hidden="true">
      <div className="hero-art__halo" />
      <svg className="hero-art__orbit" viewBox="0 0 400 400">
        <circle cx="200" cy="200" r="170" fill="none" stroke="rgba(212,175,90,.35)" strokeDasharray="2 8" />
        <circle cx="200" cy="200" r="130" fill="none" stroke="rgba(212,175,90,.2)" />
      </svg>

      {/* 기둥 */}
      <svg className="hero-art__column hero-art__column--left" viewBox="0 0 60 260">
        <rect x="4" y="0" width="52" height="14" rx="2" />
        <rect x="10" y="14" width="40" height="8" />
        {[14, 24, 34, 44].map((x) => <rect key={x} x={x} y="22" width="4" height="214" opacity=".5" />)}
        <rect x="10" y="22" width="40" height="214" opacity=".35" />
        <rect x="4" y="236" width="52" height="24" rx="2" />
      </svg>
      <svg className="hero-art__column hero-art__column--right" viewBox="0 0 60 260">
        <rect x="4" y="0" width="52" height="14" rx="2" />
        <rect x="10" y="14" width="40" height="8" />
        {[14, 24, 34, 44].map((x) => <rect key={x} x={x} y="22" width="4" height="214" opacity=".5" />)}
        <rect x="10" y="22" width="40" height="214" opacity=".35" />
        <rect x="4" y="236" width="52" height="24" rx="2" />
      </svg>

      {/* 월계수 */}
      <svg className="hero-art__laurel" viewBox="0 0 300 160">
        {Array.from({ length: 8 }, (_, i) => {
          const a = (Math.PI * (i + 1)) / 10
          const lx = 150 - Math.cos(a) * 120
          const ly = 20 + Math.sin(a) * 120
          const rx = 150 + Math.cos(a) * 120
          return (
            <g key={i}>
              <ellipse cx={lx} cy={ly} rx="14" ry="6" transform={`rotate(${-60 + i * 14} ${lx} ${ly})`} />
              <ellipse cx={rx} cy={ly} rx="14" ry="6" transform={`rotate(${60 - i * 14} ${rx} ${ly})`} />
            </g>
          )
        })}
      </svg>

      <div className="hero-art__bust">
        <PhilosopherBust region="서양" />
      </div>

      {/* 별 */}
      {[
        ['8%', '14%', 1], ['88%', '10%', 0.7], ['92%', '58%', 1], ['4%', '62%', 0.6], ['70%', '2%', 0.8], ['22%', '90%', 0.7],
      ].map(([left, top, s], i) => (
        <span key={i} className="hero-art__star" style={{ left, top, transform: `scale(${s})`, animationDelay: `${i * 0.6}s` }}>
          ✦
        </span>
      ))}

      {/* 말풍선 & 떠다니는 카드 */}
      <div className="hero-art__bubble">왜 그렇게 생각해?</div>
      <div className="hero-art__card hero-art__card--a">
        <span>⚖️</span> 의무 vs 결과
      </div>
      <div className="hero-art__card hero-art__card--b">
        <span>📚</span> 오늘의 질문
      </div>
    </div>
  )
}
