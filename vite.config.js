import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: './' 로 모든 에셋을 상대경로로 빌드합니다.
// GitHub Pages(https://<user>.github.io/philo-lab/)나 다른 하위 경로에서도
// 별도 설정 없이 동작하며, 라우팅은 HashRouter를 사용해 새로고침 404를 피합니다.
export default defineConfig({
  plugins: [react()],
  base: './',
})
