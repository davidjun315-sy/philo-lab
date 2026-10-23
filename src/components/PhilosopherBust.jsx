/**
 * 철학자 조각상 일러스트 (대표 이미지가 없을 때 사용)
 * region 에 따라 서양식(곱슬머리·수염) / 동양식(관·긴 수염) 실루엣을 그립니다.
 */
export default function PhilosopherBust({ region = '서양', symbol, className = '', title }) {
  const east = region === '동양'
  return (
    <svg className={`bust ${className}`} viewBox="0 0 200 220" role="img" aria-label={title || '철학자 조각상'}>
      <defs>
        <linearGradient id="marble" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fbf7ee" />
          <stop offset="1" stopColor="#d9cfbd" />
        </linearGradient>
        <linearGradient id="marbleShade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#efe6d4" />
          <stop offset="1" stopColor="#c8bba3" />
        </linearGradient>
      </defs>
      {/* 받침대 */}
      <rect x="52" y="192" width="96" height="20" rx="3" fill="url(#marbleShade)" />
      <rect x="62" y="182" width="76" height="12" rx="2" fill="url(#marble)" />
      {/* 어깨와 옷 주름 */}
      <path d="M40 184 C44 148 66 132 100 130 C134 132 156 148 160 184 Z" fill="url(#marble)" />
      <path d="M70 140 C82 156 92 170 96 184 M130 140 C118 158 108 170 104 184 M58 160 C70 166 78 174 82 184"
        stroke="#c9bca4" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* 목 */}
      <path d="M86 112 L86 134 Q100 140 114 134 L114 112 Z" fill="url(#marbleShade)" />
      {/* 얼굴 */}
      <ellipse cx="100" cy="80" rx="32" ry="38" fill="url(#marble)" />
      <path d="M86 78 q5 -3 10 0 M104 78 q5 -3 10 0" stroke="#b5a68c" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M100 82 l-3 12 h6" stroke="#c4b69c" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {east ? (
        <>
          {/* 관(冠)과 상투 */}
          <path d="M70 58 Q100 30 130 58 L126 64 Q100 50 74 64 Z" fill="#2a3552" />
          <rect x="90" y="26" width="20" height="20" rx="4" fill="#2a3552" />
          <rect x="84" y="44" width="32" height="5" rx="2" fill="#c9a54c" />
          {/* 긴 수염 */}
          <path d="M88 104 Q100 112 112 104 Q110 128 100 140 Q90 128 88 104 Z" fill="#e3d9c6" />
          <path d="M84 100 Q76 112 80 122 M116 100 Q124 112 120 122" stroke="#d3c7b0" strokeWidth="3" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          {/* 곱슬머리 */}
          {[
            [72, 62, 11], [84, 50, 12], [100, 45, 13], [116, 50, 12], [128, 62, 11], [68, 78, 8], [132, 78, 8],
          ].map(([cx, cy, r], i) => (
            <circle key={i} cx={cx} cy={cy} r={r} fill="#ece3d1" stroke="#d6cab3" strokeWidth="1.5" />
          ))}
          {/* 수염 */}
          <path d="M70 92 Q72 128 100 132 Q128 128 130 92 Q120 110 100 106 Q80 110 70 92 Z" fill="#e8dfcc" />
          {[[84, 116], [100, 122], [116, 116], [92, 126], [108, 126]].map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy} r="6" fill="#e2d8c3" stroke="#d3c7b0" strokeWidth="1" />
          ))}
        </>
      )}
      {symbol && (
        <text x="100" y="206" textAnchor="middle" fontSize="13" fontWeight="700" fill="#8a6d2b" fontFamily="'Noto Serif KR', serif">
          {symbol}
        </text>
      )}
    </svg>
  )
}
