import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import client from '../api/client'

const BOOKMARKS_KEY = 'wiki_bookmarks'

function loadBookmarks() {
  try { return JSON.parse(localStorage.getItem(BOOKMARKS_KEY) || '[]') }
  catch { return [] }
}

// 카테고리 이름에서 앞 이모지 제거 ("🚀 시작하기" → "시작하기")
function stripEmoji(name) {
  const idx = name.indexOf(' ')
  return idx !== -1 ? name.slice(idx + 1) : name
}

function Sidebar({ nickname, onNicknameChange }) {
  const [categories, setCategories]       = useState([])
  const [popularTags, setPopularTags]     = useState([])
  const [bookmarks, setBookmarks]         = useState(loadBookmarks)
  const [editingNickname, setEditingNickname] = useState(false)
  const [nicknameInput, setNicknameInput] = useState('')
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    client
      .get('/api/categories')
      .then((res) => setCategories(res.data))
      .catch((err) => console.error('카테고리 로딩 실패:', err))
  }, [])

  useEffect(() => {
    client
      .get('/api/tags')
      .then((res) => setPopularTags(res.data.slice(0, 10)))
      .catch((err) => console.error('태그 로딩 실패:', err))
  }, [])

  // ArticlePage에서 북마크 변경 시 CustomEvent를 받아 갱신
  useEffect(() => {
    const handler = () => setBookmarks(loadBookmarks())
    window.addEventListener('bookmarks-changed', handler)
    return () => window.removeEventListener('bookmarks-changed', handler)
  }, [])

  const currentCategoryId = location.pathname.startsWith('/category/')
    ? parseInt(location.pathname.split('/')[2])
    : null

  const activeTag = new URLSearchParams(location.search).get('tag')

  const handleConfirmNickname = () => {
    const name = nicknameInput.trim()
    if (!name) { alert('이름을 입력해주세요.'); return }
    onNicknameChange(name)
    setEditingNickname(false)
    setNicknameInput('')
  }

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
              <span className="flex items-center gap-2 min-w-0">
                <span className="flex-shrink-0 text-base leading-none">{cat.icon}</span>
                <span className="truncate">{stripEmoji(cat.name)}</span>
              </span>
              <span
                className={`flex-shrink-0 text-xs px-1.5 py-0.5 rounded-full ml-1
                  ${isActive ? 'bg-accent text-white' : 'bg-bg-base text-text-secondary'}`}
              >
                {cat.article_count}
              </span>
            </button>
          )
        })}

        {/* 인기 태그 섹션 */}
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

        {/* 즐겨찾기 섹션 */}
        {bookmarks.length > 0 && (
          <>
            <p className="px-4 pt-4 pb-1 text-xs text-text-secondary uppercase tracking-widest">
              즐겨찾기
            </p>
            {bookmarks.slice(0, 8).map((b) => {
              const isActive = location.pathname === `/article/${b.id}`
              return (
                <button
                  key={b.id}
                  onClick={() => navigate(`/article/${b.id}`)}
                  className={`w-full flex items-center gap-2 px-4 py-2 text-xs transition-colors text-left
                    border-l-2 pl-3.5
                    ${isActive
                      ? 'text-accent bg-bg-hover border-accent'
                      : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary border-transparent'
                    }`}
                >
                  <span className="flex-shrink-0 text-yellow-400">★</span>
                  <span className="truncate">{b.title}</span>
                </button>
              )
            })}
          </>
        )}
      </nav>

      {/* 닉네임 표시 영역 */}
      <div className="px-4 py-3 border-t border-border-subtle">
        {editingNickname ? (
          <div className="flex gap-1.5">
            <input
              type="text"
              value={nicknameInput}
              onChange={(e) => setNicknameInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleConfirmNickname()
                if (e.key === 'Escape') setEditingNickname(false)
              }}
              placeholder="새 닉네임"
              maxLength={20}
              autoFocus
              className="flex-1 min-w-0 bg-bg-base border border-border-subtle text-text-primary
                text-xs px-2 py-1.5 rounded-lg outline-none focus:border-accent transition-colors"
            />
            <button
              onClick={handleConfirmNickname}
              className="px-2.5 py-1.5 bg-accent hover:bg-accent-hover text-white text-xs
                rounded-lg transition-colors flex-shrink-0"
            >
              확인
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-secondary truncate">
              ✍️ {nickname || '익명'}
            </span>
            <button
              onClick={() => { setEditingNickname(true); setNicknameInput(nickname) }}
              className="text-xs text-text-secondary hover:text-accent transition-colors ml-2 flex-shrink-0"
            >
              변경
            </button>
          </div>
        )}
      </div>

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
