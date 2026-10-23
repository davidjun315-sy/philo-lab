/**
 * 나의 철학 프로필
 * ------------------------------------------------------------------
 * 로그인한 학생은 가장 최근 심리테스트 결과(test_results)로 프로필이 표시되고,
 * 게스트·결과가 없는 학생에게는 아래 데모 데이터가 "UI 데모"로 표시됩니다.
 *
 * 심리테스트 결과 연동 방법은 README 의 "심리테스트 결과 연동" 참고
 * (외부 테스트 → #/connect/test-result?... 로 이동 → 학생이 저장 버튼으로 계정에 저장)
 */

export const PROFILE_AXES = [
  { key: 'utilitarianism', label: '공리주의', color: 'gold', philosopherId: 'bentham' },
  { key: 'deontology', label: '의무론', color: 'navy', philosopherId: 'kant' },
  { key: 'virtue', label: '덕 윤리', color: 'green', philosopherId: 'aristotle' },
  { key: 'existentialism', label: '실존주의', color: 'rose', philosopherId: 'sartre' },
]

export const demoProfile = {
  source: 'demo',
  title: '행복을 계산하는 전략가',
  type: 'bentham',
  scores: { utilitarianism: 70, deontology: 40, virtue: 60, existentialism: 30 },
}

/** test_results 행 → 프로필 카드 데이터 */
export const profileFromResult = (result) =>
  result && {
    source: result.testId,
    title: '심리테스트 결과',
    type: result.philosopher || result.resultType,
    scores: result.scores,
    createdAt: result.createdAt,
  }
