/**
 * 나의 철학 프로필 (UI 데모)
 * ------------------------------------------------------------------
 * 현재는 데모 데이터입니다. 향후 '윤리 사상가 심리테스트' 결과를 연동할 때는
 * 테스트 결과를 아래와 같은 형태로 변환해 ProfileCard 에 전달하면 됩니다.
 *
 *   { source: 'ethics-type-test', type: 'kant', scores: [{ key, value }] }
 *
 * 연동 예시: 심리테스트 결과 페이지에서
 *   localStorage.setItem('philolab.profile', JSON.stringify(profile))
 * 로 저장하면 src/components/ProfileCard.jsx 가 자동으로 읽어 표시합니다.
 * (같은 도메인 — 예: <user>.github.io — 에 배포된 경우)
 */

export const PROFILE_STORAGE_KEY = 'philolab.profile'

export const PROFILE_AXES = [
  { key: 'utilitarianism', label: '공리주의', color: 'gold', philosopherId: 'bentham' },
  { key: 'deontology', label: '의무론', color: 'navy', philosopherId: 'kant' },
  { key: 'virtue', label: '덕 윤리', color: 'green', philosopherId: 'aristotle' },
  { key: 'existentialism', label: '실존주의', color: 'rose', philosopherId: 'sartre' },
]

export const demoProfile = {
  source: 'demo',
  nickname: '생각하는 학생',
  type: 'bentham',
  title: '행복을 계산하는 전략가',
  scores: [
    { key: 'utilitarianism', value: 70 },
    { key: 'deontology', value: 40 },
    { key: 'virtue', value: 60 },
    { key: 'existentialism', value: 30 },
  ],
}
