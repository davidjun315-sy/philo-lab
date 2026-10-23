/**
 * 수업(과목) 데이터
 * ------------------------------------------------------------------
 * subjects → groups → topics 구조입니다.
 * 주제 상세 경로: #/classes/<subjectId>/<topicId>
 *
 * topic 필드
 *   id, name, summary
 *   philosopherId : 철학자 도감과 연결 (윤리와 사상)
 *   questions     : 쟁점 질문 목록
 *   tools         : 향후 추가할 인터랙티브 도구 (시뮬레이터 등)
 *   sections      : 수업 구조별 콘텐츠 { [sectionKey]: string | string[] } — 비어 있으면 "준비 중"
 */

/** 각 주제 페이지가 공통으로 갖는 수업 구조 */
export const LESSON_SECTIONS = [
  { key: 'concepts', label: '핵심 개념', icon: '💡' },
  { key: 'explanation', label: '설명', icon: '📖' },
  { key: 'compare', label: '비교', icon: '⚖️' },
  { key: 'activity', label: '활동', icon: '✍️' },
  { key: 'game', label: '게임', icon: '🎮' },
  { key: 'quiz', label: '미니퀴즈', icon: '❓' },
  { key: 'exam', label: '시험 대비', icon: '📝' },
]

const thinker = (id, name) => ({ id, name, philosopherId: id })

export const subjects = [
  {
    id: 'ethics-thought',
    name: '윤리와 사상',
    nameEn: 'Ethics & Thought',
    icon: '🏛️',
    accent: 'navy',
    description: '동서양 사상가들의 핵심 사상을 탐구하고, 나의 삶과 사회를 비추어 보는 과목',
    groups: [
      {
        title: '동양 윤리',
        topics: [
          thinker('confucius', '공자'),
          thinker('mencius', '맹자'),
          thinker('xunzi', '순자'),
          thinker('zhuxi', '주희'),
          thinker('wangyangming', '왕수인'),
          thinker('yihwang', '이황'),
          thinker('yii', '이이'),
          thinker('jeongyakyong', '정약용'),
          thinker('wonhyo', '원효'),
          thinker('uicheon', '의천'),
          thinker('jinul', '지눌'),
          thinker('laozi', '노자'),
          thinker('zhuangzi', '장자'),
        ],
      },
      {
        title: '서양 윤리',
        topics: [
          thinker('sophists', '소피스트'),
          thinker('socrates', '소크라테스'),
          thinker('plato', '플라톤'),
          thinker('aristotle', '아리스토텔레스'),
          thinker('epicurus', '에피쿠로스'),
          thinker('stoics', '스토아'),
          thinker('augustine', '아우구스티누스'),
          thinker('aquinas', '아퀴나스'),
          thinker('descartes', '데카르트'),
          thinker('spinoza', '스피노자'),
          thinker('bacon', '베이컨'),
          thinker('hume', '흄'),
          thinker('kant', '칸트'),
          thinker('bentham', '벤담'),
          thinker('mill', '밀'),
          thinker('kierkegaard', '키르케고르'),
          thinker('jaspers', '야스퍼스'),
          thinker('heidegger', '하이데거'),
          thinker('sartre', '사르트르'),
        ],
      },
    ],
  },
  {
    id: 'modern-ethics',
    name: '현대 사회와 윤리',
    nameEn: 'Ethics in Modern Society',
    icon: '🌐',
    accent: 'green',
    description: '생명·환경·정보·AI 등 오늘의 쟁점을 윤리적 관점으로 논쟁하고 판단하는 과목',
    groups: [
      {
        title: '쟁점 중심 주제',
        topics: [
          {
            id: 'bioethics',
            name: '생명윤리',
            summary: '삶과 죽음, 생명 과학 기술을 둘러싼 윤리적 쟁점',
            questions: ['유전자 편집은 어디까지 허용해야 하는가?', '인간에게 죽을 권리가 있는가?', '동물 실험은 정당화될 수 있는가?'],
          },
          {
            id: 'environmental-ethics',
            name: '환경윤리',
            summary: '자연과 인간, 미래 세대에 대한 책임',
            questions: ['자연은 인간을 위한 수단일 뿐인가?', '미래 세대를 위해 현재의 풍요를 포기해야 하는가?'],
          },
          {
            id: 'information-ethics',
            name: '정보윤리',
            summary: '디지털 시대의 표현의 자유, 프라이버시, 저작권',
            questions: ['잊힐 권리는 표현의 자유보다 우선하는가?', '익명성은 보호되어야 하는가?'],
          },
          {
            id: 'ai-ethics',
            name: 'AI 윤리',
            summary: '인공지능의 판단과 책임, 인간의 자리',
            questions: ['AI에게 도덕적 책임을 물을 수 있는가?', 'AI 판사가 인간 판사를 대체해도 되는가?', 'AI가 만든 작품의 저작권은 누구에게 있는가?'],
          },
          {
            id: 'social-justice',
            name: '사회 정의',
            summary: '분배 정의, 교정적 정의, 공정의 의미',
            questions: ['능력에 따른 분배는 공정한가?', '우대 정책은 역차별인가?'],
          },
          {
            id: 'work-ethics',
            name: '직업윤리',
            summary: '일의 의미와 직업인으로서의 책임',
            questions: ['내부 고발은 배신인가, 의무인가?', '일은 생계 수단일 뿐인가?'],
          },
          {
            id: 'culture-ethics',
            name: '문화윤리',
            summary: '예술, 대중문화, 다문화 사회의 윤리',
            questions: ['예술은 도덕적 기준에서 자유로워야 하는가?', '문화 상대주의에는 한계가 있는가?'],
          },
          {
            id: 'peace-ethics',
            name: '평화윤리',
            summary: '전쟁과 평화, 통일, 국제 분쟁',
            questions: ['정당한 전쟁은 존재하는가?', '해외 원조는 의무인가, 자선인가?'],
          },
        ],
      },
    ],
  },
  {
    id: 'integrated-social',
    name: '통합사회',
    nameEn: 'Integrated Social Studies',
    icon: '🧩',
    accent: 'gold',
    description: '인간·사회·환경을 하나로 엮어 보며 지속가능한 삶의 방식을 찾는 과목',
    groups: [
      {
        title: '핵심 주제',
        topics: [
          {
            id: 'happiness',
            name: '인간·사회·환경과 행복',
            summary: '행복의 의미와 행복한 삶을 위한 조건',
            questions: ['행복의 기준은 시대와 지역에 따라 다를까?'],
            tools: [{ name: '사회문제 선택형 활동', status: 'planned' }],
          },
          {
            id: 'nature-human',
            name: '자연환경과 인간',
            summary: '자연환경이 인간 생활에 미치는 영향과 인간의 대응',
            questions: ['기후 변화의 책임은 누구에게 더 클까?'],
          },
          {
            id: 'living-space',
            name: '생활공간과 사회',
            summary: '산업화·도시화·교통 통신의 발달과 생활공간의 변화',
            questions: ['도시화는 우리의 삶을 더 풍요롭게 했을까?'],
          },
          {
            id: 'human-rights',
            name: '인권',
            summary: '인권의 의미와 확장, 인권 문제의 해결',
            questions: ['인권은 국경을 넘어 보장되어야 하는가?'],
            tools: [{ name: '사회문제 선택형 활동', status: 'planned' }],
          },
          {
            id: 'market-economy',
            name: '시장과 경제',
            summary: '합리적 선택, 시장 경제, 국제 무역',
            questions: ['합리적 선택은 언제나 옳은 선택일까?'],
            tools: [
              { name: '비교우위 게임', status: 'planned' },
              { name: '기회비용 계산기', status: 'planned' },
              { name: '생산가능곡선 시뮬레이터', status: 'planned' },
            ],
          },
          {
            id: 'international-society',
            name: '국제사회',
            summary: '세계화, 국제 갈등과 협력, 평화',
            questions: ['세계화는 모두에게 이익일까?'],
          },
          {
            id: 'sustainable-society',
            name: '지속가능한 사회',
            summary: '미래 사회의 변화와 지속가능한 발전',
            questions: ['지속가능한 발전과 경제 성장은 함께할 수 있을까?'],
            tools: [{ name: '사회문제 선택형 활동', status: 'planned' }],
          },
        ],
      },
    ],
  },
]

export const getSubject = (id) => subjects.find((s) => s.id === id)

export const getTopic = (subjectId, topicId) => {
  const subject = getSubject(subjectId)
  if (!subject) return null
  for (const group of subject.groups) {
    const topic = group.topics.find((t) => t.id === topicId)
    if (topic) return { subject, group, topic }
  }
  return null
}

export const countTopics = (subject) => subject.groups.reduce((n, g) => n + g.topics.length, 0)
