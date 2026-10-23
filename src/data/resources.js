/**
 * 교사자료 아카이브
 * ------------------------------------------------------------------
 * 파일 연결 방법
 *   - public/files/ 폴더에 파일을 넣고 fileUrl: 'files/파일명.pdf' 로 입력하거나
 *   - Google Drive 등 외부 링크를 fileUrl 에 입력하세요.
 *   fileUrl 이 비어 있으면 "파일 연결 예정"으로 표시됩니다.
 *
 * visibility (공개 범위 — Supabase 사용 시 DB 의 Row Level Security 로 실제 접근이 제한됩니다)
 *   'public'   : 누구나 (게스트 포함)
 *   'students' : 로그인한 학생
 *   'class'    : 지정한 학급 학생 (classIds)
 *   'admin'    : 교사(관리자) 전용
 * philosophers : 관련 철학자 id — 철학자 상세페이지의 "관련 자료"에 표시
 */

export const RESOURCE_CATEGORIES = [
  '수업지도안',
  '수행평가',
  '학습지',
  'PPT',
  '시험·평가',
  '연구수업',
  '공개수업',
  '수업 기록',
  '수업 성찰',
]

export { VISIBILITY } from './visibility'

export const resources = [
  {
    id: 'lp-kant',
    title: '칸트의 의무론 — 정언명령 탐구 수업지도안',
    category: '수업지도안',
    subject: '윤리와 사상',
    date: '2026.03.20',
    format: 'HWP',
    visibility: 'admin',
    fileUrl: '',
    description: '보편화 가능성 테스트를 모둠 활동으로 구성한 2차시 지도안',
    philosophers: ['kant'],
  },
  {
    id: 'pa-debate',
    title: 'AI 윤리 토론 수행평가 채점 기준표',
    category: '수행평가',
    subject: '현대 사회와 윤리',
    date: '2026.04.02',
    format: 'PDF',
    visibility: 'public',
    fileUrl: '',
    description: '논증의 타당성, 반박의 적절성, 태도 영역 루브릭',
    philosophers: [],
  },
  {
    id: 'ws-utilitarian',
    title: '벤담 vs 밀 — 공리주의 비교 학습지',
    category: '학습지',
    subject: '윤리와 사상',
    date: '2026.04.10',
    format: 'PDF',
    visibility: 'students',
    fileUrl: '',
    description: '양적·질적 공리주의 비교표와 사례 적용 문제',
    philosophers: ['bentham', 'mill'],
  },
  {
    id: 'ppt-east',
    title: '맹자와 순자 — 인간 본성 논쟁 PPT',
    category: 'PPT',
    subject: '윤리와 사상',
    date: '2026.03.28',
    format: 'PPTX',
    visibility: 'public',
    fileUrl: '',
    description: '성선설·성악설 비교 및 토론 발문 포함',
    philosophers: ['mencius', 'xunzi'],
  },
  {
    id: 'exam-midterm',
    title: '1학기 중간고사 대비 핵심 정리',
    category: '시험·평가',
    subject: '윤리와 사상',
    date: '2026.04.20',
    format: 'PDF',
    visibility: 'public',
    fileUrl: '',
    description: '서양 고대~근대 사상가 핵심 개념 요약',
    philosophers: ['socrates', 'plato', 'aristotle', 'kant', 'bentham', 'mill'],
  },
  {
    id: 'exam-bank',
    title: '중간고사 문항 정보표 및 이원목적분류표',
    category: '시험·평가',
    subject: '윤리와 사상',
    date: '2026.04.15',
    format: 'HWP',
    visibility: 'admin',
    fileUrl: '',
    description: '성취기준별 문항 배치 및 난이도',
    philosophers: [],
  },
  {
    id: 'research-class',
    title: '연구수업 — 게임 기반 철학 수업 설계',
    category: '연구수업',
    subject: '윤리와 사상',
    date: '2026.06.05',
    format: 'PDF',
    visibility: 'admin',
    fileUrl: '',
    description: '철학자 생존게임을 활용한 수업 설계안과 협의록',
    philosophers: [],
  },
  {
    id: 'open-class',
    title: '공개수업 — 무인도 사회계약 생각실험',
    category: '공개수업',
    subject: '통합사회',
    date: '2026.05.22',
    format: 'PDF',
    visibility: 'public',
    fileUrl: '',
    description: '학부모 공개수업 지도안 및 활동 자료',
    philosophers: [],
  },
  {
    id: 'record-0512',
    title: '수업 기록 — 트롤리 딜레마 토론',
    category: '수업 기록',
    subject: '윤리와 사상',
    date: '2026.05.12',
    format: '기록',
    visibility: 'admin',
    fileUrl: '',
    description: '학생 반응, 선택 비율, 인상적인 발언 기록',
    philosophers: ['kant', 'bentham'],
  },
  {
    id: 'reflection-1',
    title: '1학기 수업 성찰 — 질문이 살아 있는 교실',
    category: '수업 성찰',
    subject: '공통',
    date: '2026.07.18',
    format: '글',
    visibility: 'admin',
    fileUrl: '',
    description: '게임과 토론 중심 수업의 성과와 개선점',
    philosophers: [],
  },
]
