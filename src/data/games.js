/**
 * PHILOSOPHY ARCADE — 게임 데이터 (데모 모드 데이터 + DB 초기값)
 * ------------------------------------------------------------------
 * ▶ 기존 외부 게임 연결 방법
 *   해당 게임의 `externalUrl` 에 https 주소 하나만 넣으면 "플레이하기" 버튼이 활성화됩니다.
 *   - Supabase 사용 시: 관리자 페이지 → 게임 관리 에서 수정 (코드 수정 불필요)
 *   - 데모 모드/초기값: 이 파일에서 수정
 *
 * 필드
 *   type          : 게임 종류 (GAME_TYPES)
 *   status        : 'live' | 'external'(외부 연결 예정) | 'coming'(준비 중) | 'planned'(예정 콘텐츠)
 *   internalRoute : PHILO LAB 내부 경로 (예: '/games/quiz/play') — 사이트 안에서 구현된 게임
 *   externalUrl   : 외부 게임 주소 (https://...)
 *   thumbnail     : 썸네일 이미지 (public/ 기준 경로 또는 https URL) — 없으면 아이콘 표시
 *   saveResult    : 결과를 PHILO LAB 계정에 저장할 수 있는 게임인지 (심리테스트 연동)
 *   visibility    : 'public' | 'students' | 'class' | 'admin'
 */

export const GAME_TYPES = ['심리테스트', '생존게임', '퀴즈', '딜레마', '대결', '추리', '예정 콘텐츠']

export const games = [
  {
    id: 'ethics-personality-test',
    title: '윤리 사상가 심리테스트',
    tagline: '나는 어떤 철학자와 닮았을까?',
    type: '심리테스트',
    status: 'external',
    internalRoute: '',
    // ⬇⬇ 기존 '윤리 사상가 심리테스트' 배포 주소를 여기에 입력하세요. (예: 'https://<아이디>.github.io/<저장소>/')
    externalUrl: '',
    thumbnail: '',
    saveResult: true,
    icon: '🧭',
    accent: 'gold',
    featured: true,
    duration: '5분',
    players: '개인',
    description:
      '일상 속 선택 상황에 답하면서 나의 윤리적 사고방식이 어떤 사상가와 가장 가까운지 알아보는 테스트입니다. 별도 프로젝트로 제작되어 있으며, 곧 PHILO LAB과 연결됩니다.',
    howTo: ['상황 질문에 솔직하게 답한다', '나와 닮은 사상가 결과를 확인한다', '결과를 친구와 비교하고 이유를 이야기해 본다'],
    philosophers: ['kant', 'bentham', 'aristotle', 'confucius', 'sartre'],
    visibility: 'public',
  },
  {
    id: 'philosopher-survival',
    title: '철학자 생존게임',
    tagline: '철학자들과 살아남는 가상의 세계',
    type: '생존게임',
    status: 'external',
    internalRoute: '',
    // ⬇⬇ 기존 '철학자 생존게임' 배포 주소를 여기에 입력하세요.
    externalUrl: '',
    thumbnail: '',
    saveResult: false,
    icon: '🏝️',
    accent: 'green',
    featured: true,
    duration: '15~20분',
    players: '개인 / 모둠',
    description:
      '위기 상황이 닥친 가상의 세계에서 철학자들과 함께 선택을 내리며 살아남는 게임입니다. 별도 프로젝트로 제작되어 있으며, 곧 PHILO LAB과 연결됩니다.',
    howTo: ['함께할 철학자를 고른다', '위기 상황마다 선택을 내린다', '선택의 근거가 된 사상을 돌아본다'],
    philosophers: ['socrates', 'plato', 'aristotle', 'kant', 'mill', 'sartre'],
    visibility: 'public',
  },
  {
    id: 'ethics-dilemma',
    title: '윤리 딜레마',
    tagline: '당신의 선택은?',
    type: '딜레마',
    status: 'coming',
    internalRoute: '',
    externalUrl: '',
    thumbnail: '',
    saveResult: false,
    icon: '⚖️',
    accent: 'navy',
    featured: true,
    duration: '10분',
    players: '개인 / 학급',
    description:
      '트롤리 문제부터 AI·생명윤리까지, 정답이 없는 딜레마 앞에서 선택하고 다른 친구들의 선택과 비교해 보는 활동입니다.',
    howTo: ['딜레마 상황을 읽는다', '선택하고 이유를 쓴다', '사상가들의 관점과 비교한다'],
    philosophers: ['kant', 'bentham', 'mill'],
    visibility: 'public',
  },
  {
    id: 'philosopher-deathmatch',
    title: '철학자 데스매치',
    tagline: '역사 속 철학자들의 치열한 논쟁',
    type: '대결',
    status: 'coming',
    internalRoute: '',
    externalUrl: '',
    thumbnail: '',
    saveResult: false,
    icon: '⚔️',
    accent: 'gold',
    featured: true,
    duration: '20분',
    players: '모둠 대항',
    description:
      '두 철학자가 하나의 쟁점을 두고 맞붙습니다. 각 팀은 철학자의 입장이 되어 논거 카드를 내고, 청중의 판정으로 승부를 가립니다.',
    howTo: ['대결할 철학자와 쟁점을 뽑는다', '논거 카드로 주장과 반박을 펼친다', '청중 투표로 승자를 가린다'],
    philosophers: ['kant', 'bentham', 'mencius', 'xunzi'],
    visibility: 'public',
  },
  {
    id: 'philosopher-mystery',
    title: '철학자 추리게임',
    tagline: '단서를 모아 철학자의 생각을 추리하라',
    type: '추리',
    status: 'coming',
    internalRoute: '',
    externalUrl: '',
    thumbnail: '',
    saveResult: false,
    icon: '🔍',
    accent: 'green',
    featured: true,
    duration: '10분',
    players: '개인 / 모둠',
    description:
      '명언, 키워드, 일화 등 흩어진 단서를 모아 어떤 철학자인지, 그리고 그가 무엇을 주장했는지 추리합니다.',
    howTo: ['단서 카드를 하나씩 연다', '용의 철학자를 좁혀 간다', '최소한의 단서로 정답을 맞힌다'],
    philosophers: ['descartes', 'zhuangzi', 'heidegger'],
    visibility: 'public',
  },
  {
    id: 'kant-vs-bentham',
    title: '칸트 vs 벤담',
    tagline: '의무인가, 결과인가? 데스매치 1라운드',
    type: '대결',
    status: 'coming',
    internalRoute: '',
    externalUrl: '',
    thumbnail: '',
    saveResult: false,
    icon: '🥊',
    accent: 'navy',
    featured: false,
    duration: '15분',
    players: '모둠 대항',
    description: '거짓말, 트롤리 문제, 약속 지키기 — 의무론과 공리주의가 같은 상황에서 어떻게 다른 답을 내리는지 겨룹니다.',
    howTo: ['상황 카드를 뽑는다', '칸트 팀과 벤담 팀이 각자 판단과 근거를 낸다', '청중이 더 설득력 있는 쪽에 투표한다'],
    philosophers: ['kant', 'bentham'],
    visibility: 'public',
  },
  {
    id: 'philo-quiz',
    title: '철학 OX 스피드 퀴즈',
    tagline: '30초 안에 맞혀라!',
    type: '퀴즈',
    status: 'coming',
    internalRoute: '',
    externalUrl: '',
    thumbnail: '',
    saveResult: false,
    icon: '⏱️',
    accent: 'navy',
    featured: false,
    duration: '3분',
    players: '개인',
    description: '단원별 핵심 개념을 OX 퀴즈로 빠르게 점검합니다. 시험 대비용으로도 활용할 수 있습니다.',
    howTo: ['단원을 고른다', '제한 시간 안에 OX를 고른다', '틀린 문제 해설을 확인한다'],
    philosophers: [],
    visibility: 'public',
  },
  {
    id: 'comparative-advantage',
    title: '비교우위 무역 게임',
    tagline: '무엇을 만들고 무엇을 교환할까?',
    type: '예정 콘텐츠',
    status: 'planned',
    internalRoute: '',
    externalUrl: '',
    thumbnail: '',
    saveResult: false,
    icon: '🚢',
    accent: 'green',
    featured: false,
    duration: '15분',
    players: '모둠',
    description: '통합사회 「시장과 경제」 단원과 연계해 국가 역할을 맡아 생산·교환하며 비교우위를 체험합니다.',
    howTo: ['국가와 자원을 배정받는다', '생산 품목을 정한다', '교환 후 총생산량을 비교한다'],
    philosophers: [],
    visibility: 'public',
  },
  {
    id: 'island-society',
    title: '무인도 사회계약',
    tagline: '규칙 없는 섬, 무엇부터 정할까?',
    type: '예정 콘텐츠',
    status: 'planned',
    internalRoute: '',
    externalUrl: '',
    thumbnail: '',
    saveResult: false,
    icon: '📜',
    accent: 'gold',
    featured: false,
    duration: '20분',
    players: '학급',
    description: '무인도에 표류한 학급이 함께 살아갈 규칙을 정하며 사회계약론과 정의의 원리를 탐구합니다.',
    howTo: ['상황 카드를 확인한다', '규칙을 제안하고 투표한다', '규칙이 낳은 결과를 돌아본다'],
    philosophers: [],
    visibility: 'public',
  },
]

export const STATUS_LABEL = {
  live: '플레이 가능',
  external: '외부 게임 연결 예정',
  coming: '준비 중',
  planned: '예정 콘텐츠',
}

/** 내부 경로 또는 외부 URL 이 있으면 플레이 가능으로 취급합니다. */
export const isPlayable = (game) => Boolean(game?.internalRoute || game?.externalUrl)

export const gameStatusLabel = (game) => (isPlayable(game) ? STATUS_LABEL.live : STATUS_LABEL[game.status] || STATUS_LABEL.coming)
