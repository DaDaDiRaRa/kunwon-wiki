import { useNavigate } from 'react-router-dom'

// 날짜를 "2025년 6월 9일" 형식으로 포맷
function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr + 'Z').toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * @param {{ article: object, categoryName?: string }} props
 * categoryName: 부모 페이지에서 카테고리 이름을 넘겨주면 뱃지에 표시
 */
function ArticleCard({ article, categoryName }) {
  const navigate = useNavigate()

  return (
    <div
      onClick={() => navigate(`/article/${article.id}`)}
      className="bg-bg-card hover:bg-bg-hover border border-border-subtle rounded-xl p-5 cursor-pointer transition-colors group"
    >
      {/* 제목 */}
      <h3 className="text-text-primary font-semibold text-[15px] mb-3 line-clamp-2 leading-snug group-hover:text-white transition-colors">
        {article.title}
      </h3>

      {/* 메타 정보 */}
      <div className="flex items-center gap-2 flex-wrap text-xs text-text-secondary">
        {/* 카테고리 뱃지 */}
        <span className="border border-accent/50 text-accent px-2 py-0.5 rounded-full truncate max-w-[140px]">
          {categoryName || `카테고리 ${article.category_id}`}
        </span>
        {/* 수정일 */}
        <span>{formatDate(article.updated_at)}</span>
        {/* 조회수 */}
        <span className="flex items-center gap-0.5">
          <span>👁</span>
          <span>{article.view_count}</span>
        </span>
        {/* 작성자 */}
        <span className="flex items-center gap-0.5 ml-auto">
          <span>✍️</span>
          <span>{article.author_name || '익명'}</span>
        </span>
      </div>
    </div>
  )
}

export default ArticleCard
