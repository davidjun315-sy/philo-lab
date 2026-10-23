/** 공개 범위 정의 — DB(can_view 함수)와 같은 규칙을 사용합니다. */
export const VISIBILITY = {
  public: { label: '전체 공개', short: '공개', tone: 'green', desc: '게스트 포함 누구나' },
  students: { label: '학생 공개', short: '학생', tone: 'navy', desc: '로그인한 학생' },
  class: { label: '학급 지정', short: '학급', tone: 'rose', desc: '지정한 학급의 학생' },
  admin: { label: '교사 전용', short: '교사', tone: 'gold', desc: '관리자만' },
}

export const VISIBILITY_OPTIONS = Object.entries(VISIBILITY).map(([value, v]) => ({ value, label: v.label }))

/**
 * 현재 사용자가 콘텐츠를 볼 수 있는지 (화면 표시용).
 * ※ Supabase 모드에서는 DB 의 Row Level Security 가 실제 접근을 막고, 이 함수는 데모 모드에서만 필터로 사용됩니다.
 */
export const canView = (item, viewer) => {
  const vis = item?.visibility || 'public'
  if (vis === 'public') return true
  if (viewer?.isAdmin) return true
  if (vis === 'students') return Boolean(viewer?.isStudent)
  if (vis === 'class') return Boolean(viewer?.isStudent && (item.classIds || []).some((id) => viewer.classIds?.includes(id)))
  return false
}
