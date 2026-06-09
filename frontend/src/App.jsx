import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import HomePage from './pages/HomePage'
import ArticlePage from './pages/ArticlePage'
import ArticleEditPage from './pages/ArticleEditPage'
import CategoryPage from './pages/CategoryPage'

function App() {
  return (
    <BrowserRouter>
      {/* 전체 레이아웃: 좌측 고정 사이드바 + 우측 스크롤 콘텐츠 */}
      <div className="flex min-h-screen bg-bg-base">
        <Sidebar />
        {/* ml-60 = 사이드바 240px만큼 밀어내기 */}
        <main className="flex-1 ml-60 min-h-screen overflow-auto">
          <Routes>
            <Route path="/"              element={<HomePage />} />
            <Route path="/category/:id"  element={<CategoryPage />} />
            <Route path="/article/:id"   element={<ArticlePage />} />
            <Route path="/edit/new"      element={<ArticleEditPage />} />
            <Route path="/edit/:id"      element={<ArticleEditPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
