import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import client from '../api/client'

// 카테고리 이름에서 앞 이모지 제거 ("🚀 시작하기" → "시작하기")
function stripEmoji(name) {
  const idx = name.indexOf(' ')
  return idx !== -1 ? name.slice(idx + 1) : name
}

function Sidebar() {
  const [categories, setCategories] = useState([])
  const [popularTags, setPopularTags] = useState([])
  const navigate = useNavigate()
  const location = useLocation()

  // 카테고리 목록 로딩
  useEffect(() => {
    client
      .get('/api/categories')
      .then((res) => setCategories(res.data))
      .catch((err) => console.error('카테고리 로딩 실패:', err))
  }, [])

  // 인기 태그 상위 10개 로딩
  useEffect(() => {
    client
      .get('/api/tags')
      .then((res) => setPopularTags(res.data.slice(0, 10)))
      .catch((err) => console.error('태그 로딩 실패:', err))
  }, [])

  // 현재 선택된 카테고리 id 추출
  const currentCategoryId = location.pathname.startsWith('/category/')
    ? parseInt(location.pathname.split('/')[2])
    : null

  // 현재 활성화된 태그 필터 추출
  const activeTag = new URLSearchParams(location.search).get('tag')

  return (
    <aside className="w-60 min-h-screen bg-bg-card border-r border-border-subtle flex flex-col fixed left-0 top-0 z-10">
      {/* 로고 */}
      <div className="p-5 border-b border-border-subtle">
        <span
          className="text-text-primary font-bold text-lg cursor-pointer hover:text-accent transition-colors tracking-tight"
          onClick={() => navigate('/')}
        >
          KUNWON Wiki
        </span>
      </div>

      {/* 카테고리 + 태그 목록 */}
      <nav className="flex-1 overflow-y-auto py-2">
        <p className="px-4 pt-3 pb-1 text-xs text-text-secondary uppercase tracking-widest">
          카테고리
        </p>
        {categories.map((cat) => {
          const isActive = cat.id === currentCategoryId
          return (
            <button
              key={cat.id}
              onClick={() => navigate(`/category/${cat.id}`)}
              className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors text-left
                ${
                  isActive
                    ? 'text-accent bg-bg-hover border-l-2 border-accent pl-3.5'
                    : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary border-l-2 border-transparent pl-3.5'
                }`}
            >
              {/* 아이콘 + 이름 */}
              <span className="flex items-center gap-2 min-w-0">
                <span className="flex-shrink-0 text-base leading-none">
                  {cat.icon}
                </span>
                <span className="truncate">{stripEmoji(cat.name)}</span>
              </span>
              {/* 글 수 뱃지 */}
              <span
                className={`flex-shrink-0 text-xs px-1.5 py-0.5 rounded-full ml-1
                  ${isActive ? 'bg-accent text-white' : 'bg-bg-base text-text-secondary'}`}
              >
                {cat.article_count}
              </span>
            </button>
          )
        })}

        {/* 인기 태그 섹션 — 태그가 하나 이상 있을 때만 표시 */}
        {popularTags.length > 0 && (
          <>
            <p className="px-4 pt-4 pb-2 text-xs text-text-secondary uppercase tracking-widest">
              인기 태그
            </p>
            <div className="px-3 pb-3 flex flex-wrap gap-1.5">
              {popularTags.map((tag) => {
                const isActive = activeTag === tag.name
                return (
                  <button
                    key={tag.id}
                    onClick={() => navigate(`/?tag=${tag.name}`)}
                    className={`text-xs px-2.5 py-1 rounded-full transition-colors
                      ${
                        isActive
                          ? 'bg-accent text-white'
                          : 'bg-bg-base text-text-secondary border border-border-subtle hover:bg-accent/20 hover:text-accent'
                      }`}
                  >
                    #{tag.name}
                  </button>
                )
              })}
            </div>
          </>
        )}
      </nav>

      {/* 새 글 작성 버튼 (하단 고정) */}
      <div className="p-4 border-t border-border-subtle">
        <button
          onClick={() => navigate('/edit/new')}
          className="w-full py-2.5 bg-accent hover:bg-accent-hover text-white font-semibold rounded-lg transition-colors text-sm"
        >
          + 새 글 작성
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
