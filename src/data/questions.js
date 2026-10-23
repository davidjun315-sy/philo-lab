/**
 * 오늘의 철학 질문
 * ------------------------------------------------------------------
 * 질문을 추가하려면 배열에 객체를 하나 더 넣으면 됩니다.
 * 날짜에 따라 자동으로 하나씩 순환하며 표시됩니다.
 * related: 관련 철학자 id (선택)
 */
export const dailyQuestions = [
  {
    question: '행복한 돼지와 불행한 소크라테스, 누가 더 행복할까?',
    hint: '밀의 질적 공리주의와 벤담의 양적 공리주의를 떠올려 보세요.',
    related: ['mill', 'bentham'],
  },
  {
    question: '거짓말이 누군가의 생명을 구한다면, 거짓말은 옳은 행동일까?',
    hint: '칸트는 어떤 경우에도 거짓말을 해서는 안 된다고 보았습니다.',
    related: ['kant'],
  },
  {
    question: 'AI가 내린 결정으로 사고가 났다면, 책임은 누구에게 있을까?',
    hint: '도덕적 행위자가 되려면 어떤 조건이 필요할까요?',
    related: ['kant', 'aristotle'],
  },
  {
    question: '사람은 본래 선하게 태어날까, 악하게 태어날까?',
    hint: '맹자와 순자의 대결!',
    related: ['mencius', 'xunzi'],
  },
  {
    question: '아무도 보지 않는다면, 나는 여전히 정직할까?',
    hint: '플라톤 『국가』의 "기게스의 반지" 이야기를 찾아보세요.',
    related: ['plato'],
  },
  {
    question: '내 진로를 스스로 선택하지 않는다면, 그것은 누구의 삶일까?',
    hint: '사르트르: 실존은 본질에 앞선다.',
    related: ['sartre'],
  },
  {
    question: '더 많이 가지는 것과 더 적게 원하는 것, 무엇이 행복에 가까울까?',
    hint: '에피쿠로스와 노자는 비슷한 답을 했을지도 모릅니다.',
    related: ['epicurus', 'laozi'],
  },
]

export const getTodayQuestionIndex = (date = new Date()) => {
  const start = new Date(date.getFullYear(), 0, 0)
  const dayOfYear = Math.floor((date - start) / 86400000)
  return dayOfYear % dailyQuestions.length
}
