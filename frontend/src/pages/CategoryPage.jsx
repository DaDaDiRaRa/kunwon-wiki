import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import SearchBar from '../components/SearchBar'
import ArticleCard from '../components/ArticleCard'
import client from '../api/client'

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

// 카테고리 이름에서 이모지 제거
function stripEmoji(name) {
  const idx = name.indexOf(' ')
  return idx !== -1 ? name.slice(idx + 1) : name
}

function CategoryPage() {
  const { id } = useParams()
  const [category, setCategory] = useState(null)
  const [articles, setArticles] = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')

  // 카테고리 정보 로딩
  useEffect(() => {
    client
      .get('/api/categories')
      .then((res) => {
        const found = res.data.find((c) => c.id === parseInt(id))
        setCategory(found || null)
      })
      .catch((err) => console.error('카테고리 로딩 실패:', err))
  }, [id])

  // 해당 카테고리 글 로딩
  const fetchArticles = useCallback(
    async (keyword) => {
      setLoading(true)
      try {
        const params = { category_id: id }
        if (keyword) params.search = keyword
        const res = await client.get('/api/articles', { params })
        setArticles(res.data)
      } catch (err) {
        console.error('글 목록 로딩 실패:', err)
      } finally {
        setLoading(false)
      }
    },
    [id],
  )

  useEffect(() => {
    fetchArticles(search)
  }, [search, fetchArticles])

  const handleSearch = useCallback((keyword) => setSearch(keyword), [])

  return (
    <div className="p-8">
      {/* 카테고리 헤더 */}
      {category && (
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-4xl leading-none">{category.icon}</span>
            <h1 className="text-2xl font-bold text-text-primary">
              {stripEmoji(category.name)}
            </h1>
          </div>
          {category.description && (
            <p className="text-text-secondary text-sm mt-1 ml-14">
              {category.description}
            </p>
          )}
        </div>
      )}

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
              : '이 카테고리에 아직 글이 없습니다.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {articles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              categoryName={category?.name}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default CategoryPage
