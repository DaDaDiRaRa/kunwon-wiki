import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import client from '../api/client'

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr + 'Z').toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function ArticlePage() {
  const { id }     = useParams()
  const navigate   = useNavigate()
  const [article, setArticle]           = useState(null)
  const [category, setCategory]         = useState(null)
  const [loading, setLoading]           = useState(true)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [deleting, setDeleting]         = useState(false)

  useEffect(() => {
    setLoading(true)
    client
      .get(`/api/articles/${id}`)
      .then((res) => {
        setArticle(res.data)
        // 카테고리 이름 조회
        return client.get('/api/categories').then((catRes) => {
          const found = catRes.data.find((c) => c.id === res.data.category_id)
          setCategory(found || null)
        })
      })
      .catch((err) => console.error('글 로딩 실패:', err))
      .finally(() => setLoading(false))
  }, [id])

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await client.delete(`/api/articles/${id}`)
      navigate('/')
    } catch (err) {
      console.error('삭제 실패:', err.message)
      alert(err.message)
      setDeleting(false)
    }
  }

  // 로딩 스켈레톤
  if (loading) {
    return (
      <div className="p-8 max-w-4xl animate-pulse">
        <div className="h-9 bg-bg-card rounded w-2/3 mb-4" />
        <div className="h-4 bg-bg-card rounded w-1/3 mb-10" />
        <div className="space-y-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-4 bg-bg-card rounded w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (!article) {
    return (
      <div className="p-8 text-center text-text-secondary py-24">
        <p className="text-5xl mb-4">🔍</p>
        <p>글을 찾을 수 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-4xl">
      {/* 헤더: 제목 + 버튼 */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <h1 className="text-3xl font-bold text-text-primary leading-tight flex-1">
          {article.title}
        </h1>
        <div className="flex items-center gap-2 flex-shrink-0 mt-1">
          <button
            onClick={() => navigate(`/edit/${id}`)}
            className="px-4 py-1.5 text-sm text-text-secondary border border-border-subtle rounded-lg
              hover:bg-bg-hover hover:text-text-primary transition-colors"
          >
            편집
          </button>
          <button
            onClick={() => setDeleteConfirm(true)}
            className="px-4 py-1.5 text-sm text-red-400 border border-red-400/30 rounded-lg
              hover:bg-red-400/10 transition-colors"
          >
            삭제
          </button>
        </div>
      </div>

      {/* 메타 정보 한 줄 */}
      <div className="flex items-center gap-3 flex-wrap text-xs text-text-secondary mb-4">
        {category && (
          <span className="border border-accent/50 text-accent px-2 py-0.5 rounded-full">
            {category.name}
          </span>
        )}
        <span>작성: {formatDate(article.created_at)}</span>
        <span>수정: {formatDate(article.updated_at)}</span>
        <span>👁 {article.view_count}</span>
      </div>

      {/* 인라인 삭제 확인 UI (모달 아님) */}
      {deleteConfirm && (
        <div className="mb-6 p-4 bg-bg-card border border-red-400/30 rounded-xl flex items-center justify-between gap-4">
          <span className="text-text-primary text-sm">정말 삭제하시겠습니까?</span>
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={() => setDeleteConfirm(false)}
              disabled={deleting}
              className="px-3 py-1.5 text-xs text-text-secondary border border-border-subtle rounded-lg
                hover:bg-bg-hover transition-colors disabled:opacity-50"
            >
              취소
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-3 py-1.5 text-xs text-white bg-red-500 hover:bg-red-600 rounded-lg
                transition-colors disabled:opacity-50"
            >
              {deleting ? '삭제 중...' : '확인'}
            </button>
          </div>
        </div>
      )}

      {/* 구분선 */}
      <hr className="border-border-subtle mb-8" />

      {/* 마크다운 렌더링 (react-markdown + remark-gfm) */}
      <div className="
        prose prose-invert max-w-none
        prose-headings:text-text-primary prose-headings:font-bold
        prose-p:text-text-primary prose-p:leading-relaxed
        prose-a:text-accent prose-a:no-underline hover:prose-a:underline
        prose-strong:text-white
        prose-em:text-text-secondary
        prose-code:bg-bg-base prose-code:text-green-400 prose-code:rounded prose-code:px-1.5 prose-code:py-0.5 prose-code:text-sm prose-code:before:content-none prose-code:after:content-none
        prose-pre:bg-bg-base prose-pre:border prose-pre:border-border-subtle prose-pre:rounded-xl
        prose-blockquote:border-l-accent prose-blockquote:text-text-secondary prose-blockquote:not-italic
        prose-th:text-text-primary prose-td:text-text-secondary
        prose-hr:border-border-subtle
        prose-li:text-text-primary
        prose-ul:text-text-primary prose-ol:text-text-primary
      ">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {article.content}
        </ReactMarkdown>
      </div>
    </div>
  )
}

export default ArticlePage
