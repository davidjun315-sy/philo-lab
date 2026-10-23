/**
 * 콘텐츠 타입 레지스트리
 * ------------------------------------------------------------------
 * 하나의 정의로 다음을 모두 처리합니다.
 *   1) 관리자 페이지 편집 폼 (fields)
 *   2) 앱 객체(camelCase) ↔ DB 행(snake_case) 변환
 *   3) 데모 모드 초기 데이터 / DB seed 생성 (seed)
 *
 * 새 콘텐츠 종류를 추가하려면: DB 테이블 생성(마이그레이션) → 여기 정의 추가 → 관리자 메뉴 연결.
 *
 * field.type
 *   text | textarea | number | boolean | select | tags(쉼표 구분 배열) | lines(줄바꿈 배열)
 *   json | date('YYYY.MM.DD') | url | image | ref(다른 콘텐츠 id 배열)
 */
import { philosophers } from '../data/philosophers'
import { games, GAME_TYPES } from '../data/games'
import { dailyQuestions } from '../data/questions'
import { lessons, subjectMeta } from '../data/classes'
import { projects, PROJECT_CATEGORIES } from '../data/projects'
import { resources, RESOURCE_CATEGORIES } from '../data/resources'
import { clubs, clubActivities } from '../data/clubs'

const ID_PATTERN = /^[a-z0-9][a-z0-9-]{0,62}$/

const idField = { key: 'id', label: 'ID (영문 소문자·숫자·-)', type: 'text', required: true, pattern: ID_PATTERN, idField: true, help: '주소에 쓰입니다. 저장 후에는 바꾸지 않는 것이 좋습니다.' }
const sortField = { key: 'sortOrder', column: 'sort_order', label: '정렬 순서', type: 'number', default: 0 }

const CONTENT_TYPES = {
  philosophers: {
    table: 'philosophers',
    label: '철학자',
    icon: '📜',
    titleKey: 'name',
    subtitle: (p) => `${p.region} · ${p.era} · ${p.school || ''}`,
    seed: philosophers,
    order: ['sortOrder'],
    fields: [
      idField,
      { key: 'name', label: '이름', type: 'text', required: true },
      { key: 'nameEn', column: 'name_en', label: '영문 이름', type: 'text' },
      { key: 'region', label: '동양 / 서양', type: 'select', options: ['동양', '서양'], required: true },
      { key: 'era', label: '시대', type: 'select', options: ['고대', '중세', '근대', '현대'], required: true },
      { key: 'period', label: '생몰 연도', type: 'text' },
      { key: 'school', label: '학파·사상', type: 'text' },
      { key: 'symbol', label: '심볼 (한 글자)', type: 'text', maxLength: 4 },
      { key: 'quote', label: '대표 명언', type: 'textarea' },
      { key: 'keywords', label: '핵심 키워드 (쉼표로 구분)', type: 'tags' },
      { key: 'summary', label: '설명 (핵심 사상 요약)', type: 'textarea' },
      { key: 'ideas', label: '핵심 사상 (한 줄에 하나)', type: 'lines' },
      { key: 'stats', label: '능력치 JSON [{"label":"의무","value":5}]', type: 'json', default: [] },
      { key: 'related', label: '관련 철학자', type: 'ref', ref: 'philosophers' },
      { key: 'games', label: '관련 게임', type: 'ref', ref: 'games' },
      { key: 'dilemmas', label: '관련 딜레마 (한 줄에 하나)', type: 'lines' },
      { key: 'image', label: '대표 이미지', type: 'image' },
      { key: 'imageType', column: 'image_type', label: '이미지 종류', type: 'select', options: ['', 'photo', 'portrait', 'bust', 'painting', 'illustration'], optionLabels: { '': '(없음)', photo: '사진', portrait: '초상', bust: '흉상·조각', painting: '회화', illustration: '전통 이미지·삽화' } },
      { key: 'imageSource', column: 'image_source', label: '이미지 출처 URL', type: 'url' },
      { key: 'imageCreator', column: 'image_creator', label: '이미지 제작자', type: 'text' },
      { key: 'imageLicense', column: 'image_license', label: '이미지 라이선스', type: 'text', help: '예: Public domain, CC BY-SA 4.0 — 불명확하면 이미지를 넣지 마세요.' },
      sortField,
    ],
  },

  games: {
    table: 'games',
    label: '게임',
    icon: '🎮',
    titleKey: 'title',
    subtitle: (g) => `${g.type} · ${g.status}`,
    seed: games,
    order: ['sortOrder'],
    fields: [
      idField,
      { key: 'title', label: '게임명', type: 'text', required: true },
      { key: 'tagline', label: '한 줄 소개', type: 'text' },
      { key: 'description', label: '설명', type: 'textarea' },
      { key: 'type', label: '게임 종류', type: 'select', options: GAME_TYPES, required: true },
      { key: 'status', label: '상태', type: 'select', options: ['live', 'external', 'coming', 'planned'], optionLabels: { live: '플레이 가능', external: '외부 게임 연결 예정', coming: '준비 중', planned: '예정 콘텐츠' }, required: true },
      { key: 'externalUrl', column: 'external_url', label: '외부 주소 (https://)', type: 'url', help: '기존 심리테스트·생존게임 주소를 여기에 입력하면 바로 연결됩니다.' },
      { key: 'internalRoute', column: 'internal_route', label: '내부 주소 (예: /games/quiz/play)', type: 'text', pattern: /^$|^\// },
      { key: 'thumbnail', label: '썸네일', type: 'image' },
      { key: 'icon', label: '아이콘 (이모지)', type: 'text', maxLength: 8 },
      { key: 'accent', label: '강조 색', type: 'select', options: ['gold', 'green', 'navy'] },
      { key: 'featured', label: 'HOME 아케이드에 표시', type: 'boolean' },
      { key: 'saveResult', column: 'save_result', label: '결과 저장 지원 (심리테스트 연동)', type: 'boolean' },
      { key: 'duration', label: '소요 시간', type: 'text' },
      { key: 'players', label: '인원', type: 'text' },
      { key: 'howTo', column: 'how_to', label: '플레이 방법 (한 줄에 하나)', type: 'lines' },
      { key: 'philosophers', label: '등장 철학자', type: 'ref', ref: 'philosophers' },
      sortField,
    ],
  },

  questions: {
    table: 'daily_questions',
    label: '오늘의 철학 질문',
    icon: '❓',
    titleKey: 'question',
    subtitle: (q) => q.hint || '',
    seed: dailyQuestions,
    order: ['sortOrder'],
    fields: [
      idField,
      { key: 'question', label: '질문', type: 'textarea', required: true },
      { key: 'hint', label: '설명·힌트', type: 'textarea' },
      { key: 'related', label: '관련 철학자', type: 'ref', ref: 'philosophers' },
      sortField,
    ],
  },

  lessons: {
    table: 'lessons',
    label: '수업 콘텐츠',
    icon: '🏛️',
    titleKey: 'name',
    subtitle: (l) => `${subjectMeta.find((s) => s.id === l.subjectId)?.name || l.subjectId} · ${l.groupTitle}`,
    seed: lessons,
    order: ['subjectId', 'sortOrder'],
    fields: [
      idField,
      { key: 'subjectId', column: 'subject_id', label: '과목', type: 'select', options: subjectMeta.map((s) => s.id), optionLabels: Object.fromEntries(subjectMeta.map((s) => [s.id, s.name])), required: true },
      { key: 'groupTitle', column: 'group_title', label: '단원·그룹 (예: 서양 윤리)', type: 'text', required: true },
      { key: 'name', label: '주제명', type: 'text', required: true },
      { key: 'summary', label: '요약', type: 'textarea' },
      { key: 'philosopherId', column: 'philosopher_id', label: '연결 철학자', type: 'ref', ref: 'philosophers', single: true },
      { key: 'questions', label: '쟁점 질문 (한 줄에 하나)', type: 'lines' },
      { key: 'tools', label: '인터랙티브 도구 JSON [{"name":"기회비용 계산기","status":"planned"}]', type: 'json', default: [] },
      { key: 'sections', label: '수업 구조 내용 JSON {"activity":["..."],"quiz":["..."],"exam":"..."}', type: 'json', default: {} },
      sortField,
    ],
  },

  projects: {
    table: 'projects',
    label: '프로젝트',
    icon: '🧪',
    titleKey: 'title',
    subtitle: (p) => `${p.category} · ${p.subject || ''}`,
    seed: projects,
    order: ['sortOrder'],
    fields: [
      idField,
      { key: 'title', label: '프로젝트명', type: 'text', required: true },
      { key: 'category', label: '카테고리', type: 'select', options: PROJECT_CATEGORIES, required: true },
      { key: 'subject', label: '관련 과목', type: 'text' },
      { key: 'period', label: '기간 (예: 4차시)', type: 'text' },
      { key: 'status', label: '진행 상태', type: 'text' },
      { key: 'icon', label: '아이콘 (이모지)', type: 'text', maxLength: 8 },
      { key: 'description', label: '프로젝트 설명', type: 'textarea' },
      { key: 'coreQuestions', column: 'core_questions', label: '핵심 질문 (한 줄에 하나)', type: 'lines' },
      { key: 'method', label: '진행 방법', type: 'textarea' },
      { key: 'steps', label: '활동 단계 JSON [{"title":"","desc":""}]', type: 'json', default: [] },
      { key: 'outputs', label: '학생 결과물 JSON [{"title":"","author":"","type":"","url":""}]', type: 'json', default: [] },
      { key: 'materials', label: '관련 자료 JSON [{"title":"","type":"","url":""}]', type: 'json', default: [] },
      { key: 'philosophers', label: '관련 철학자', type: 'ref', ref: 'philosophers' },
      sortField,
    ],
  },

  resources: {
    table: 'resources',
    label: '교사자료',
    icon: '🗄️',
    titleKey: 'title',
    subtitle: (r) => `${r.category} · ${r.date || ''}`,
    seed: resources,
    order: ['-date'],
    defaultVisibility: 'admin',
    fields: [
      idField,
      { key: 'title', label: '자료명', type: 'text', required: true },
      { key: 'category', label: '분류', type: 'select', options: RESOURCE_CATEGORIES, required: true },
      { key: 'subject', label: '과목', type: 'text' },
      { key: 'date', label: '날짜 (YYYY.MM.DD)', type: 'date' },
      { key: 'format', label: '형식 (PDF, HWP …)', type: 'text' },
      { key: 'description', label: '설명', type: 'textarea' },
      { key: 'fileUrl', column: 'file_url', label: '파일', type: 'image', accept: '*', help: '파일 업로드(Supabase) 또는 https 링크' },
      { key: 'philosophers', label: '관련 철학자', type: 'ref', ref: 'philosophers' },
      sortField,
    ],
  },

  clubs: {
    table: 'clubs',
    label: '동아리',
    icon: '🌿',
    titleKey: 'name',
    subtitle: (c) => `${c.academicYear}학년도${c.archived ? ' · 보관됨' : ''}`,
    seed: clubs,
    order: ['-academicYear', 'sortOrder'],
    fields: [
      { ...idField, help: '예: 2027-philosophy (학년도를 앞에 붙이면 관리가 쉽습니다)' },
      { key: 'academicYear', column: 'academic_year', label: '학년도', type: 'year', required: true },
      { key: 'name', label: '동아리명', type: 'text', required: true },
      { key: 'motto', label: '슬로건', type: 'text' },
      { key: 'description', label: '동아리 소개', type: 'textarea' },
      { key: 'thumbnail', label: '대표 이미지', type: 'image' },
      { key: 'activityTypes', column: 'activity_types', label: '활동 유형 JSON [{"name":"철학 토론","icon":"🗣️"}]', type: 'json', default: [] },
      { key: 'annualPlan', column: 'annual_plan', label: '연간 운영 계획 JSON [{"month":"3월","title":""}]', type: 'json', default: [] },
      { key: 'relatedProjects', column: 'related_projects', label: '관련 프로젝트', type: 'ref', ref: 'projects' },
      { key: 'active', label: '운영 중', type: 'boolean', default: true },
      { key: 'archived', label: '지난 동아리로 보관', type: 'boolean', default: false },
      sortField,
    ],
  },

  clubActivities: {
    table: 'club_activities',
    label: '동아리 활동',
    icon: '🗓️',
    titleKey: 'title',
    subtitle: (a) => `${a.date} · ${a.type || ''}`,
    seed: clubActivities,
    order: ['-date'],
    fields: [
      { ...idField, help: '예: 2026-05-12-ai-rights' },
      { key: 'clubId', column: 'club_id', label: '동아리', type: 'ref', ref: 'clubs', single: true, required: true },
      { key: 'date', label: '날짜 (YYYY.MM.DD)', type: 'date', required: true },
      { key: 'title', label: '활동명', type: 'text', required: true },
      { key: 'type', label: '활동 유형', type: 'text' },
      { key: 'description', label: '활동 내용', type: 'textarea' },
      { key: 'images', label: '사진', type: 'images' },
      { key: 'studentOutputs', column: 'student_outputs', label: '학생 결과물 JSON [{"title":"","type":"","author":"","url":""}]', type: 'json', default: [] },
      { key: 'opinions', label: '학생 의견 (한 줄에 하나, 익명)', type: 'lines' },
      { key: 'result', label: '결과', type: 'textarea' },
      sortField,
    ],
  },
}

/** 모든 타입에 공통으로 붙는 공개 범위 필드 */
const COMMON_FIELDS = [
  { key: 'visibility', label: '공개 범위', type: 'visibility' },
  { key: 'classIds', column: 'class_ids', label: '공개 학급 (학급 지정 시)', type: 'classes' },
]

for (const def of Object.values(CONTENT_TYPES)) def.fields = [...def.fields, ...COMMON_FIELDS]

export const contentTypes = CONTENT_TYPES
export const CONTENT_TYPE_KEYS = Object.keys(CONTENT_TYPES)

const toSnake = (key) => key.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`)
export const columnOf = (field) => field.column || toSnake(field.key)

const emptyValue = (field) => {
  if (field.default !== undefined) return structuredClone(field.default)
  switch (field.type) {
    case 'tags':
    case 'lines':
    case 'images':
    case 'classes':
      return []
    case 'ref':
      return field.single ? '' : []
    case 'boolean':
      return false
    case 'number':
      return 0
    case 'year':
      return new Date().getFullYear()
    case 'visibility':
      return 'public'
    default:
      return ''
  }
}

/** 빠진 필드를 기본값으로 채운 새 객체 */
export const withDefaults = (type, item = {}) => {
  const def = CONTENT_TYPES[type]
  const out = { ...item }
  for (const f of def.fields) {
    if (out[f.key] === undefined || out[f.key] === null) out[f.key] = emptyValue(f)
  }
  if (!item.visibility) out.visibility = def.defaultVisibility || 'public'
  return out
}

export const newItem = (type) => withDefaults(type, {})

const dotDate = (v) => (v ? String(v).slice(0, 10).replace(/-/g, '.') : '')
const isoDate = (v) => (v ? String(v).replace(/\./g, '-') : null)

/** 앱 객체 → DB 행 */
export const toRow = (type, item) => {
  const row = {}
  for (const f of CONTENT_TYPES[type].fields) {
    let v = item[f.key]
    if (f.type === 'date') v = isoDate(v)
    else if (f.type === 'ref' && f.single) v = v || null
    else if ((f.type === 'text' || f.type === 'url' || f.type === 'image' || f.type === 'textarea') && v === '') v = null
    else if (f.key === 'imageType' && v === '') v = null
    row[columnOf(f)] = v
  }
  return row
}

/** DB 행 → 앱 객체 */
export const fromRow = (type, row) => {
  const item = {}
  for (const f of CONTENT_TYPES[type].fields) {
    let v = row[columnOf(f)]
    if (f.type === 'date') v = dotDate(v)
    item[f.key] = v
  }
  return withDefaults(type, item)
}

/** 정렬: order 키 목록 ('-' 접두사 = 내림차순) */
export const sortItems = (type, list) => {
  const keys = CONTENT_TYPES[type].order || []
  return [...list].sort((a, b) => {
    for (const k of keys) {
      const desc = k.startsWith('-')
      const key = desc ? k.slice(1) : k
      const av = a[key] ?? ''
      const bv = b[key] ?? ''
      if (av < bv) return desc ? 1 : -1
      if (av > bv) return desc ? -1 : 1
    }
    return 0
  })
}

/** 편집 폼 입력값 검증 → 오류 메시지 객체 */
export const validateItem = (type, item) => {
  const errors = {}
  for (const f of CONTENT_TYPES[type].fields) {
    const v = item[f.key]
    const empty = v === '' || v === null || v === undefined || (Array.isArray(v) && v.length === 0)
    if (f.required && empty) errors[f.key] = '필수 항목입니다'
    else if (f.pattern && typeof v === 'string' && !f.pattern.test(v)) errors[f.key] = '형식이 올바르지 않습니다'
    else if (f.maxLength && typeof v === 'string' && v.length > f.maxLength) errors[f.key] = `${f.maxLength}자 이하로 입력하세요`
    else if (f.type === 'url' && v && !/^https:\/\//.test(v)) errors[f.key] = 'https:// 로 시작하는 주소를 입력하세요'
    else if (f.type === 'date' && v && !/^\d{4}\.\d{2}\.\d{2}$/.test(v)) errors[f.key] = 'YYYY.MM.DD 형식으로 입력하세요'
  }
  if (item.visibility === 'class' && !(item.classIds || []).length) errors.classIds = '학급 지정 공개는 학급을 하나 이상 선택해야 합니다'
  return errors
}

/** 데모 모드·seed 용 초기 데이터 */
export const seedFor = (type) => CONTENT_TYPES[type].seed.map((item, i) => withDefaults(type, { sortOrder: i, ...item }))
