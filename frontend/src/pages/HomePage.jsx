import { useState, useEffect, useCallback } from 'react'
import SearchBar from '../components/SearchBar'
import ArticleCard from '../components/ArticleCard'
import client from '../api/client'

// 로딩 중 스켈레톤 카드
function SkeletonCard() {
  return (
    <div className="bg-bg-card border border-border-subtle rounded-xl p-5 animate-pulse">
      <div className="h-5 bg-bg-hover rounded w-3/4 mb-3" />
      <div className="flex gap-2">
        <div className="h-3 bg-bg-hover rounded w-24" />
        <div className="h-3 bg-bg-hover rounded w-20" />
      </div>
    </div>
  )
}

function HomePage() {
  const [articles, setArticles]     = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')

  // 카테고리 맵 (id → name) — ArticleCard에 이름 표시용
  const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c.name]))

  // 카테고리 목록 로딩 (한 번만)
  useEffect(() => {
    client
      .get('/api/categories')
      .then((res) => setCategories(res.data))
      .catch((err) => console.error('카테고리 로딩 실패:', err))
  }, [])

  // 글 목록 로딩 (검색어 변경 시마다)
  const fetchArticles = useCallback(async (keyword) => {
    setLoading(true)
    try {
      const params = {}
      if (keyword) params.search = keyword
      const res = await client.get('/api/articles', { params })
      setArticles(res.data)
    } catch (err) {
      console.error('글 목록 로딩 실패:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchArticles(search)
  }, [search, fetchArticles])

  const handleSearch = useCallback((keyword) => setSearch(keyword), [])

  return (
    <div className="p-8">
      {/* 헤더 */}
      <h1 className="text-2xl font-bold text-text-primary mb-6">전체 글</h1>

      {/* 검색바 */}
      <div className="max-w-2xl mb-8">
        <SearchBar onSearch={handleSearch} />
      </div>

      {/* 글 목록 */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-24 text-text-secondary">
          <p className="text-5xl mb-4">📭</p>
          <p className="text-base">
            {search
              ? `"${search}"에 대한 검색 결과가 없습니다.`
              : '아직 작성된 글이 없습니다. 첫 글을 작성해보세요!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {articles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              categoryName={categoryMap[article.category_id]}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default HomePage
