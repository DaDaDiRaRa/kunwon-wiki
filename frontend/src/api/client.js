import axios from 'axios'

// VITE_API_URL 환경변수 없으면 기본값 사용
// 개발 중에는 vite.config.js 프록시가 /api → localhost:8000 처리
const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
})

// 응답 에러 인터셉터
client.interceptors.response.use(
  (response) => response,
  (error) => {
    // 서버가 내려준 detail 메시지 우선, 없으면 기본 메시지
    const message =
      error.response?.data?.detail || '서버 오류가 발생했습니다'
    console.error('[API 오류]', message, error)
    return Promise.reject(new Error(message))
  },
)

export default client
