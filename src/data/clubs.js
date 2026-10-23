/**
 * 동아리 데이터 (데모 모드 데이터 + DB 초기값)
 * ------------------------------------------------------------------
 * 동아리는 학년도마다 구성과 이름이 달라질 수 있으므로 "학년도별 동아리"로 관리합니다.
 *   academicYears  : 학년도 목록
 *   clubs          : 동아리 (academicYear 별로 따로 등록, 지난 동아리는 archived: true 로 보관)
 *   clubActivities : 활동 기록 (clubId 로 동아리와 연결)
 *
 * Supabase 사용 시 관리자 페이지 → 동아리 관리 에서 학년도·동아리·활동을 추가합니다.
 * 학년도가 바뀌어도 이전 기록은 삭제하지 않습니다. (동아리 삭제 대신 '보관')
 *
 * clubActivities 필드
 *   date           : 'YYYY.MM.DD'
 *   images         : 사진 경로 배열 (public/ 기준 또는 https URL) — 비어 있으면 자리표시
 *   studentOutputs : 학생 결과물 [{ title, type, author, url }]
 *   opinions       : 학생 의견 (익명 처리 권장)
 */

export const academicYears = [
  { year: 2026, label: '2026학년도', isCurrent: true },
  { year: 2025, label: '2025학년도', isCurrent: false },
]

const DEFAULT_TYPES = [
  { name: '철학 토론', icon: '🗣️' },
  { name: '영화와 철학', icon: '🎬' },
  { name: '사회문제 탐구', icon: '🔎' },
  { name: '윤리적 딜레마', icon: '⚖️' },
  { name: '독서토론', icon: '📚' },
  { name: '학생 발표', icon: '🎤' },
]

export const clubs = [
  {
    id: '2026-philosophy',
    academicYear: 2026,
    name: '철학·윤리 동아리',
    motto: '질문하는 사람이 세상을 바꾼다',
    description:
      '철학과 윤리, 사회 문제를 함께 질문하고 토론하는 동아리입니다. 영화와 책에서 질문을 찾고, 토론으로 생각을 단단하게 다듬고, 그 결과를 발표와 캠페인으로 나눕니다.',
    thumbnail: '',
    activityTypes: DEFAULT_TYPES,
    annualPlan: [
      { month: '3월', title: '오리엔테이션 · 나의 철학 질문 만들기' },
      { month: '4월', title: '영화와 철학 ① — 「트루먼 쇼」와 동굴의 비유' },
      { month: '5월', title: '철학 토론 — AI에게 인권을 인정해야 하는가?' },
      { month: '6월', title: '독서토론 — 『정의란 무엇인가』' },
      { month: '7월', title: '1학기 성과 발표회' },
      { month: '9월', title: '윤리적 딜레마 워크숍' },
      { month: '10월', title: '사회문제 탐구 — 기후 정의' },
      { month: '11월', title: '학생 발표 — 나의 인생 철학자' },
      { month: '12월', title: '연간 활동 아카이브 · 문집 제작' },
    ],
    relatedProjects: ['ai-judge', 'island-society'],
    active: true,
    archived: false,
    visibility: 'public',
    sortOrder: 0,
  },
  {
    id: '2026-social-issues',
    academicYear: 2026,
    name: '사회문제 탐구 동아리',
    motto: '문제를 발견하고, 근거로 말하고, 행동으로 바꾼다',
    description: '우리 학교와 지역의 사회 문제를 직접 조사하고, 통계와 인터뷰를 근거로 해결 방안을 제안하는 탐구 동아리입니다.',
    thumbnail: '',
    activityTypes: [
      { name: '사회문제 탐구', icon: '🔎' },
      { name: '캠페인', icon: '📣' },
      { name: '학생 발표', icon: '🎤' },
    ],
    annualPlan: [
      { month: '3월', title: '탐구 주제 정하기 · 모둠 구성' },
      { month: '5월', title: '설문·인터뷰 설계와 실시' },
      { month: '9월', title: '정책 제안서 작성' },
      { month: '11월', title: '교내 캠페인 · 결과 발표' },
    ],
    relatedProjects: ['golden-time'],
    active: true,
    archived: false,
    visibility: 'public',
    sortOrder: 1,
  },
  {
    id: '2025-debate',
    academicYear: 2025,
    name: '철학 토론 동아리',
    motto: '말로 생각을 단련하다',
    description: '2025학년도에 운영된 토론 중심 동아리입니다. 2026학년도에 철학·윤리 동아리로 개편되었습니다.',
    thumbnail: '',
    activityTypes: [
      { name: '철학 토론', icon: '🗣️' },
      { name: '독서토론', icon: '📚' },
    ],
    annualPlan: [
      { month: '4월', title: '토론 기초 — 논증의 구조' },
      { month: '9월', title: '교내 철학 토론 대회' },
    ],
    relatedProjects: [],
    active: false,
    archived: true,
    visibility: 'public',
    sortOrder: 0,
  },
]

export const clubActivities = [
  {
    id: '2026-05-12-ai-rights',
    clubId: '2026-philosophy',
    date: '2026.05.12',
    title: 'AI에게 인권을 인정해야 하는가?',
    type: '철학 토론',
    description: '감정을 표현하는 AI가 등장한 상황을 가정하고, 권리의 조건이 무엇인지 찬반 토론을 진행했다.',
    images: [],
    studentOutputs: [{ title: 'AI 인권 토론 입론서', type: '토론 자료', author: '찬성팀', url: '' }],
    opinions: [
      '고통을 느낄 수 있다면 권리를 줘야 한다고 생각했는데, "느낀다"는 걸 어떻게 확인하는지가 어려웠다.',
      '칸트의 관점에서는 이성적 존재라면 목적으로 대해야 하지 않을까?',
    ],
    result: '찬성 9 : 반대 13 — "권리 이전에 책임 주체를 먼저 정해야 한다"는 결론',
    visibility: 'public',
  },
  {
    id: '2026-04-21-truman',
    clubId: '2026-philosophy',
    date: '2026.04.21',
    title: '「트루먼 쇼」로 읽는 플라톤의 동굴',
    type: '영화와 철학',
    description: '영화 속 트루먼의 선택을 동굴의 비유와 연결해, 진실을 아는 것이 행복한지 이야기 나눴다.',
    images: [],
    studentOutputs: [{ title: '나만의 동굴 포스터', type: '포스터', author: '1모둠', url: '' }],
    opinions: ['진실을 모르고 행복한 것보다 진실을 알고 불행한 게 낫다는 의견이 많았다.'],
    result: '모둠별 "나만의 동굴" 포스터 제작',
    visibility: 'public',
  },
  {
    id: '2026-03-17-questions',
    clubId: '2026-philosophy',
    date: '2026.03.17',
    title: '나의 철학 질문 만들기',
    type: '학생 발표',
    description: '각자 평소 궁금했던 질문을 철학 질문으로 다듬어 발표하고 연간 탐구 주제를 정했다.',
    images: [],
    studentOutputs: [{ title: '철학 질문 카드 모음', type: '카드뉴스', author: '동아리 전체', url: '' }],
    opinions: ['"왜 공부해야 할까?"가 철학 질문이 될 수 있다는 게 신기했다.'],
    result: '연간 탐구 질문 12개 선정',
    visibility: 'public',
  },
  {
    id: '2026-05-20-survey',
    clubId: '2026-social-issues',
    date: '2026.05.20',
    title: '급식 잔반 문제 설문 조사',
    type: '사회문제 탐구',
    description: '전교생 대상 설문으로 잔반이 생기는 이유를 조사하고 결과를 분석했다.',
    images: [],
    studentOutputs: [],
    opinions: ['숫자로 보니 생각보다 문제가 훨씬 컸다.'],
    result: '응답 312명 — 정책 제안서 초안 작성',
    visibility: 'students',
  },
  {
    id: '2025-09-24-tournament',
    clubId: '2025-debate',
    date: '2025.09.24',
    title: '교내 철학 토론 대회',
    type: '철학 토론',
    description: '"동물에게도 권리가 있는가"를 주제로 8개 팀이 토너먼트 토론을 진행했다.',
    images: [],
    studentOutputs: [],
    opinions: ['반박을 준비하면서 상대 입장을 더 깊이 이해하게 됐다.'],
    result: '결승: 피터 싱어 팀 vs 칸트 팀',
    visibility: 'public',
  },
]
