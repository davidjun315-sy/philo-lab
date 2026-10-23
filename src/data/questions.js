/**
 * 오늘의 철학 질문 (데모 모드 데이터 + DB 초기값)
 * ------------------------------------------------------------------
 * Supabase 사용 시 관리자 페이지 → 오늘의 철학 질문 에서 추가·수정합니다.
 * 날짜에 따라 공개된 질문 중 하나가 자동으로 표시됩니다.
 * related: 관련 철학자 id (선택)
 */
export const dailyQuestions = [
  {
    id: 'q-happy-pig',
    question: '행복한 돼지와 불행한 소크라테스, 누가 더 행복할까?',
    hint: '밀의 질적 공리주의와 벤담의 양적 공리주의를 떠올려 보세요.',
    related: ['mill', 'bentham'],
    visibility: 'public',
  },
  {
    id: 'q-lie',
    question: '거짓말이 누군가의 생명을 구한다면, 거짓말은 옳은 행동일까?',
    hint: '칸트는 어떤 경우에도 거짓말을 해서는 안 된다고 보았습니다.',
    related: ['kant'],
    visibility: 'public',
  },
  {
    id: 'q-ai-responsibility',
    question: 'AI가 내린 결정으로 사고가 났다면, 책임은 누구에게 있을까?',
    hint: '도덕적 행위자가 되려면 어떤 조건이 필요할까요?',
    related: ['kant', 'aristotle'],
    visibility: 'public',
  },
  {
    id: 'q-human-nature',
    question: '사람은 본래 선하게 태어날까, 악하게 태어날까?',
    hint: '맹자와 순자의 대결!',
    related: ['mencius', 'xunzi'],
    visibility: 'public',
  },
  {
    id: 'q-gyges',
    question: '아무도 보지 않는다면, 나는 여전히 정직할까?',
    hint: '플라톤 『국가』의 "기게스의 반지" 이야기를 찾아보세요.',
    related: ['plato'],
    visibility: 'public',
  },
  {
    id: 'q-career',
    question: '내 진로를 스스로 선택하지 않는다면, 그것은 누구의 삶일까?',
    hint: '사르트르: 실존은 본질에 앞선다.',
    related: ['sartre'],
    visibility: 'public',
  },
  {
    id: 'q-less-desire',
    question: '더 많이 가지는 것과 더 적게 원하는 것, 무엇이 행복에 가까울까?',
    hint: '에피쿠로스와 노자는 비슷한 답을 했을지도 모릅니다.',
    related: ['epicurus', 'laozi'],
    visibility: 'public',
  },
]

export const getTodayQuestionIndex = (count, date = new Date()) => {
  if (!count) return 0
  const start = new Date(date.getFullYear(), 0, 0)
  const dayOfYear = Math.floor((date - start) / 86400000)
  return dayOfYear % count
}
