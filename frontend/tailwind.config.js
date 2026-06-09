/** @type {import('tailwindcss').Config} */
export default {
  // Tailwind가 클래스를 스캔할 경로 (필수)
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      // KUNWON 디자인 시스템 컬러 토큰
      colors: {
        'bg-base':       '#0f1117',
        'bg-card':       '#1a1d27',
        'bg-hover':      '#22263a',
        'border-subtle': '#2a2d3e',
        'text-primary':  '#f0f0f0',
        'text-secondary':'#8b8fa8',
        'accent':        '#e60012',
        'accent-hover':  '#cc0010',
      },
      fontFamily: {
        sans: ['Pretendard', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
