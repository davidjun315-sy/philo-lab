/**
 * 프로젝트 데이터
 * ------------------------------------------------------------------
 * 상세 경로: #/projects/<id>
 * outputs   : 학생 결과물 { title, author, type, url } — url 이 비어 있으면 "연결 예정"
 * materials : 관련 자료 { title, type, url }
 */

export const PROJECT_CATEGORIES = ['토론 프로젝트', '사회문제 프로젝트', '생각실험 프로젝트', '융합 프로젝트', '캠페인']

export const projects = [
  {
    id: 'ai-judge',
    title: 'AI 판사가 인간 판사를 대체해도 되는가?',
    category: '토론 프로젝트',
    subject: '현대 사회와 윤리',
    period: '4차시',
    status: '진행 예정',
    icon: '🤖',
    description:
      'AI 판결 보조 시스템이 실제로 도입되는 시대, 공정성과 효율성, 인간의 존엄과 책임이라는 관점에서 AI 판사 도입의 찬반을 논증합니다.',
    coreQuestions: [
      'AI의 판단은 인간보다 더 공정할 수 있는가?',
      '판결에 대한 책임은 누가 져야 하는가?',
      '정의로운 판결에 "공감"은 필요한가?',
    ],
    method: '자료 조사 → 입장 정하기 → 모둠별 입론서 작성 → 교차 조사식 토론 → 성찰',
    steps: [
      { title: '문제 인식', desc: 'AI 판결 사례와 기사 읽기' },
      { title: '관점 탐색', desc: '공리주의·의무론·덕 윤리 관점에서 쟁점 정리' },
      { title: '입론 준비', desc: '모둠별 찬반 입론서와 반박 예상 질문 작성' },
      { title: '토론', desc: 'CEDA 방식 교차 조사 토론' },
      { title: '성찰', desc: '나의 최종 입장과 바뀐 생각 기록' },
    ],
    outputs: [],
    materials: [
      { title: '토론 활동지', type: '학습지', url: '' },
      { title: '입론서 양식', type: '양식', url: '' },
    ],
    philosophers: ['kant', 'bentham', 'aristotle'],
  },
  {
    id: 'golden-time',
    title: '난치병 치료의 골든타임 확보 vs 체내 장기 적응 및 비가역적 부작용 위험성',
    category: '사회문제 프로젝트',
    subject: '현대 사회와 윤리 · 생명윤리',
    period: '5차시',
    status: '진행 예정',
    icon: '🧬',
    description:
      '신속 승인된 첨단 치료가 환자에게 희망이 되는 동시에, 장기적 안전성은 아직 검증되지 않았다면? 생명윤리의 원칙으로 치료 접근권과 안전성 사이의 균형점을 탐구합니다.',
    coreQuestions: [
      '검증되지 않은 치료를 선택할 권리는 보장되어야 하는가?',
      '환자의 자율성과 의료진의 해악 금지 원칙이 충돌할 때 무엇을 우선해야 하는가?',
      '사회는 위험을 어디까지 허용해야 하는가?',
    ],
    method: '사례 분석 → 생명윤리 4원칙 적용 → 이해관계자 역할극 → 정책 제안서 작성',
    steps: [
      { title: '사례 탐구', desc: '신속 승인 치료제와 부작용 사례 조사' },
      { title: '원칙 적용', desc: '자율성·악행 금지·선행·정의 원칙으로 분석' },
      { title: '역할극', desc: '환자, 의사, 규제 기관, 시민 입장에서 토의' },
      { title: '정책 제안', desc: '모둠별 정책 제안서 작성 및 발표' },
    ],
    outputs: [],
    materials: [{ title: '생명윤리 4원칙 정리 자료', type: '학습지', url: '' }],
    philosophers: ['kant', 'mill', 'bentham'],
  },
  {
    id: 'island-society',
    title: '무인도에 새로운 사회를 만든다면 어떤 규칙이 필요한가?',
    category: '생각실험 프로젝트',
    subject: '통합사회 · 윤리와 사상',
    period: '3차시',
    status: '진행 예정',
    icon: '🏝️',
    description:
      '학급 전체가 무인도에 표류했습니다. 식량 분배, 의사 결정, 갈등 해결… 우리는 어떤 규칙을 세울 것인가? 사회계약론과 정의론을 체험적으로 탐구하는 생각실험입니다.',
    coreQuestions: [
      '규칙이 없는 상태에서 사람들은 어떻게 행동할까?',
      '공정한 분배의 기준은 무엇인가?',
      '누가, 어떻게 결정해야 하는가?',
    ],
    method: '상황 제시 → 무지의 베일 활동 → 규칙 제정 회의 → 위기 이벤트 → 규칙 수정 및 성찰',
    steps: [
      { title: '표류', desc: '상황 카드와 자원 카드 배부' },
      { title: '무지의 베일', desc: '내 역할을 모른 채 규칙 제안하기' },
      { title: '헌법 제정', desc: '학급 회의로 무인도 헌법 완성' },
      { title: '위기 이벤트', desc: '예상치 못한 사건에 규칙 적용해 보기' },
      { title: '성찰', desc: '우리 사회의 규칙과 비교하기' },
    ],
    outputs: [],
    materials: [{ title: '상황 카드 세트', type: '활동 자료', url: '' }],
    philosophers: ['plato', 'xunzi', 'laozi'],
  },
]

export const getProject = (id) => projects.find((p) => p.id === id)
