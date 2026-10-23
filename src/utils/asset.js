/**
 * public/ 폴더의 파일 경로를 배포 경로(base)에 맞게 변환합니다.
 * 외부 URL(http/https)·data:/blob: URL 은 그대로 반환합니다.
 *   asset('images/kant.png') → './images/kant.png'
 */
export const asset = (path) => {
  if (!path) return ''
  if (/^((https?:)?\/\/|data:|blob:)/.test(path)) return path
  return `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`
}
