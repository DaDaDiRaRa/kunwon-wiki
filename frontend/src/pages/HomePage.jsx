import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
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

// 상대 시간 표시 ("방금 전", "N분 전", ...)
function timeAgo(dateStr) {
  const date = new Date(dateStr + 'Z')
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60)   return '방금 전'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}분 전`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}시간 전`
  return `${Math.floor(seconds / 86400)}일 전`
}

function HomePage() {
  const [articles, setArticles]       = useState([])
  const [categories, setCategories]   = useState([])
  const [loading, setLoading]         = useState(true)
  const [search, setSearch]           = useState('')
  const [activities, setActivities]   = useState([])
  const [activitiesOpen, setActivitiesOpen] = useState(true)
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  const tagFilter = searchParams.get('tag') || ''

  const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c.name]))

  useEffect(() => {
    client
      .get('/api/categories')
      .then((res) => setCategories(res.data))
      .catch((err) => console.error('카테고리 로딩 실패:', err))
  }, [])

  // 최근 활동 피드 로딩 (마운트 시 1회)
  useEffect(() => {
    client
      .get('/api/activities')
      .then((res) => setActivities(res.data.slice(0, 10)))
      .catch((err) => console.error('활동 피드 로딩 실패:', err))
  }, [])

  // 글 목록 로딩 — 검색어·태그 필터 변경 시마다
  useEffect(() => {
    setLoading(true)
    const params = {}
    if (search)    params.search = search
    if (tagFilter) params.tag    = tagFilter
    client
      .get('/api/articles', { params })
      .then((res) => setArticles(res.data))
      .catch((err) => console.error('글 목록 로딩 실패:', err))
      .finally(() => setLoading(false))
  }, [search, tagFilter])

  const handleSearch = useCallback((keyword) => setSearch(keyword), [])
  const clearTagFilter = () => setSearchParams({})

  return (
    <div className="p-8">
      {/* 헤더 */}
      {tagFilter ? (
        <div className="flex items-center gap-3 mb-6">
          <h1 className="text-2xl font-bold text-text-primary">
            <span className="text-accent">#{tagFilter}</span> 태그의 글
          </h1>
          <button
            onClick={clearTagFilter}
            className="text-xs px-2.5 py-1 text-text-secondary border border-border-subtle
              rounded-full hover:bg-bg-hover hover:text-text-primary transition-colors"
          >
            ✕ 필터 해제
          </button>
        </div>
      ) : (
        <h1 className="text-2xl font-bold text-text-primary mb-6">전체 글</h1>
      )}

      {/* 검색바 */}
      <div className="max-w-2xl mb-6">
        <SearchBar onSearch={handleSearch} />
      </div>

      {/* 최근 활동 피드 */}
      {activities.length > 0 && (
        <div className="max-w-2xl mb-8">
          {/* 섹션 헤더 */}
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-widest">
              최근 활동
            </h2>
            <button
              onClick={() => setActivitiesOpen((prev) => !prev)}
              className="text-xs text-text-secondary hover:text-text-primary transition-colors"
            >
              {activitiesOpen ? '접기 ▲' : '펼치기 ▼'}
            </button>
          </div>

          {activitiesOpen && (
            <div className="bg-bg-card border border-border-subtle rounded-xl overflow-hidden divide-y divide-border-subtle">
              {activities.map((activity, idx) => (
                <div
                  key={`${activity.id}-${idx}`}
                  onClick={() => navigate(`/article/${activity.id}`)}
                  className="px-4 py-2.5 flex items-start gap-2 cursor-pointer
                    hover:bg-bg-hover transition-colors group"
                >
                  {/* action 배지 */}
                  <span
                    className={`flex-shrink-0 text-[10px] px-1.5 py-0.5 rounded-full font-medium mt-0.5
                      ${activity.action === '작성'
                        ? 'bg-green-500/15 text-green-400'
                        : 'bg-blue-500/15 text-blue-400'
                      }`}
                  >
                    {activity.action}
                  </span>

                  {/* 본문 */}
                  <p className="flex-1 text-xs text-text-secondary leading-relaxed min-w-0">
                    <span className="text-text-primary font-medium">
                      {activity.author_name}
                    </span>
                    님이{' '}
                    <span className="text-accent group-hover:underline truncate">
                      {activity.title}
                    </span>
                    을(를) {activity.action}했습니다
                  </p>

                  {/* 시간 */}
                  <span className="flex-shrink-0 text-[10px] text-text-secondary mt-0.5">
                    {timeAgo(activity.updated_at)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

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
            {tagFilter
              ? `#${tagFilter} 태그가 달린 글이 없습니다.`
              : search
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
