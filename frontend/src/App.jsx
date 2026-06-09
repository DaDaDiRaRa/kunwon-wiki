import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import HomePage from './pages/HomePage'
import ArticlePage from './pages/ArticlePage'
import ArticleEditPage from './pages/ArticleEditPage'
import CategoryPage from './pages/CategoryPage'

const NICKNAME_KEY = 'wiki_nickname'

// 닉네임 미설정 시 상단에 표시되는 배너
function NicknameBanner({ onSave }) {
  const [input, setInput] = useState('')

  const handleConfirm = () => {
    const name = input.trim()
    if (!name) { alert('이름을 입력해주세요.'); return }
    onSave(name)
  }

  return (
    <div className="bg-accent/10 border-b border-accent/30 px-6 py-3 flex items-center gap-3 flex-wrap">
      <span className="text-text-primary text-sm flex-1 min-w-[200px]">
        안녕하세요! 위키에서 사용할 이름을 입력해주세요
      </span>
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
          placeholder="닉네임"
          maxLength={20}
          autoFocus
          className="bg-bg-card border border-border-subtle text-text-primary text-sm
            px-3 py-1.5 rounded-lg outline-none focus:border-accent transition-colors w-36"
        />
        <button
          onClick={handleConfirm}
          className="px-4 py-1.5 bg-accent hover:bg-accent-hover text-white text-sm
            font-semibold rounded-lg transition-colors whitespace-nowrap"
        >
          확인
        </button>
      </div>
    </div>
  )
}

function App() {
  const [nickname, setNickname] = useState(
    () => localStorage.getItem(NICKNAME_KEY) || ''
  )

  const handleSaveNickname = (name) => {
    localStorage.setItem(NICKNAME_KEY, name)
    setNickname(name)
  }

  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-bg-base">
        <Sidebar nickname={nickname} onNicknameChange={handleSaveNickname} />

        {/* 사이드바 너비(240px)만큼 밀어내기 */}
        <div className="flex-1 ml-60 flex flex-col min-h-screen">
          {/* 닉네임 미설정 시 배너 표시 */}
          {!nickname && <NicknameBanner onSave={handleSaveNickname} />}

          <main className="flex-1 overflow-auto">
            <Routes>
              <Route path="/"             element={<HomePage />} />
              <Route path="/category/:id" element={<CategoryPage />} />
              <Route path="/article/:id"  element={<ArticlePage />} />
              <Route path="/edit/new"     element={<ArticleEditPage />} />
              <Route path="/edit/:id"     element={<ArticleEditPage />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  )
}

export default App
