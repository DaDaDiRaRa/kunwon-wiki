import { useState, useEffect } from 'react'

/**
 * 검색 인풋 — 500ms 디바운스 후 onSearch 콜백 호출
 * @param {{ onSearch: (keyword: string) => void }} props
 */
function SearchBar({ onSearch }) {
  const [value, setValue] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(value.trim())
    }, 500)
    return () => clearTimeout(timer)
  }, [value, onSearch])

  return (
    <div className="relative">
      {/* 검색 아이콘 */}
      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary text-sm pointer-events-none">
        🔍
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="글 제목이나 내용 검색..."
        className="w-full bg-bg-card border border-border-subtle text-text-primary
          placeholder-text-secondary rounded-lg pl-10 pr-4 py-2.5 text-sm
          outline-none focus:border-accent transition-colors"
      />
      {/* 검색어 지우기 버튼 */}
      {value && (
        <button
          onClick={() => setValue('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors text-xs"
        >
          ✕
        </button>
      )}
    </div>
  )
}

export default SearchBar
