import { useState, useEffect, useMemo } from 'react'
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

function timeAgo(dateStr) {
  const date = new Date(dateStr + 'Z')
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60)    return '방금 전'
  if (seconds < 3600)  return `${Math.floor(seconds / 60)}분 전`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}시간 전`
  return `${Math.floor(seconds / 86400)}일 전`
}

// ── 북마크 localStorage 헬퍼 ───────────────────────────────
const BOOKMARKS_KEY = 'wiki_bookmarks'

function loadBookmarks() {
  try { return JSON.parse(localStorage.getItem(BOOKMARKS_KEY) || '[]') }
  catch { return [] }
}
function saveBookmarks(list) {
  localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(list))
  window.dispatchEvent(new CustomEvent('bookmarks-changed'))
}

// ── TOC 파싱 ──────────────────────────────────────────────

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w가-힣\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

function childrenToText(children) {
  if (typeof children === 'string') return children
  if (Array.isArray(children)) return children.map(childrenToText).join('')
  if (children && typeof children === 'object' && children.props) {
    return childrenToText(children.props.children)
  }
  return ''
}

function parseHeadings(content) {
  if (!content) return []
  const result = []
  let inCode = false
  for (const line of content.split('\n')) {
    if (line.startsWith('```')) { inCode = !inCode; continue }
    if (inCode) continue
    const m = line.match(/^(#{1,3})\s+(.+)$/)
    if (m) {
      const text = m[2].trim()
      result.push({ level: m[1].length, text, id: slugify(text) })
    }
  }
  return result
}

function makeHeading(Tag) {
  return function HeadingWithId({ children, node, ...rest }) {
    return <Tag id={slugify(childrenToText(children))} {...rest}>{children}</Tag>
  }
}

// ── 서브 컴포넌트 ─────────────────────────────────────────

function MarkdownImage({ src, alt, onOpen }) {
  return (
    <img
      src={src}
      alt={alt || ''}
      className="max-w-full h-auto rounded-lg my-2 cursor-zoom-in hover:opacity-90 transition-opacity"
      onClick={() => onOpen(src)}
    />
  )
}

function Lightbox({ src, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <img
        src={src}
        alt="원본 이미지"
        className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />
      <button
        className="absolute top-4 right-5 text-white text-4xl leading-none
          hover:text-gray-300 transition-colors"
        onClick={onClose}
        aria-label="닫기"
      >
        ×
      </button>
    </div>
  )
}

// ── 메인 컴포넌트 ─────────────────────────────────────────

function ArticlePage() {
  const { id }   = useParams()
  const navigate = useNavigate()

  const [article, setArticle]             = useState(null)
  const [category, setCategory]           = useState(null)
  const [loading, setLoading]             = useState(true)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [deleting, setDeleting]           = useState(false)
  const [lightboxSrc, setLightboxSrc]     = useState(null)

  // 북마크
  const [isBookmarked, setIsBookmarked]   = useState(false)

  // 댓글
  const [comments, setComments]             = useState([])
  const [commentInput, setCommentInput]     = useState('')
  const [submitting, setSubmitting]         = useState(false)

  const toc = useMemo(() => parseHeadings(article?.content), [article?.content])

  // 글 + 카테고리 로딩
  useEffect(() => {
    setLoading(true)
    client
      .get(`/api/articles/${id}`)
      .then((res) => {
        setArticle(res.data)
        return client.get('/api/categories').then((catRes) => {
          const found = catRes.data.find((c) => c.id === res.data.category_id)
          setCategory(found || null)
        })
      })
      .catch((err) => console.error('글 로딩 실패:', err))
      .finally(() => setLoading(false))
  }, [id])

  // 북마크 상태 동기화 (글이 로드된 후)
  useEffect(() => {
    if (article) {
      setIsBookmarked(loadBookmarks().some((b) => b.id === article.id))
    }
  }, [article?.id])

  // 댓글 로딩
  useEffect(() => {
    client
      .get(`/api/articles/${id}/comments`)
      .then((res) => setComments(res.data))
      .catch((err) => console.error('댓글 로딩 실패:', err))
  }, [id])

  const toggleBookmark = () => {
    const list = loadBookmarks()
    const updated = isBookmarked
      ? list.filter((b) => b.id !== article.id)
      : [...list, { id: article.id, title: article.title }]
    saveBookmarks(updated)
    setIsBookmarked(!isBookmarked)
  }

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

  const handleAddComment = async () => {
    if (!commentInput.trim()) return
    setSubmitting(true)
    try {
      const res = await client.post(`/api/articles/${id}/comments`, {
        author_name: localStorage.getItem('wiki_nickname') || '익명',
        content: commentInput.trim(),
      })
      setComments((prev) => [...prev, res.data])
      setCommentInput('')
    } catch (err) {
      alert(`댓글 등록 실패: ${err.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteComment = async (commentId) => {
    try {
      await client.delete(`/api/comments/${commentId}`)
      setComments((prev) => prev.filter((c) => c.id !== commentId))
    } catch (err) {
      alert(`댓글 삭제 실패: ${err.message}`)
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
    <>
      <div className="p-8 flex gap-10 items-start">
        {/* 본문 영역 */}
        <div className="flex-1 min-w-0 max-w-4xl">
          {/* 헤더: 제목 + 버튼 */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <h1 className="text-3xl font-bold text-text-primary leading-tight flex-1">
              {article.title}
            </h1>
            <div className="flex items-center gap-2 flex-shrink-0 mt-1">
              {/* 북마크 */}
              <button
                onClick={toggleBookmark}
                title={isBookmarked ? '북마크 해제' : '북마크'}
                className={`px-3 py-1.5 text-sm border rounded-lg transition-colors
                  ${isBookmarked
                    ? 'text-yellow-400 border-yellow-400/40 hover:bg-yellow-400/10'
                    : 'text-text-secondary border-border-subtle hover:bg-bg-hover hover:text-text-primary'
                  }`}
              >
                {isBookmarked ? '★' : '☆'}
              </button>
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
          <div className="flex items-center gap-3 flex-wrap text-xs text-text-secondary mb-3">
            {category && (
              <span className="border border-accent/50 text-accent px-2 py-0.5 rounded-full">
                {category.name}
              </span>
            )}
            <span>✍️ {article.author_name || '익명'}</span>
            <span>📅 {formatDate(article.created_at)}</span>
            <span>🔄 {formatDate(article.updated_at)}</span>
            <span>👁 {article.view_count}</span>
          </div>

          {/* 태그 칩 — 클릭 시 해당 태그 글 목록으로 이동 */}
          {article.tags && article.tags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap mb-4">
              {article.tags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => navigate(`/?tag=${tag.name}`)}
                  className="text-xs px-2.5 py-1 bg-accent/10 text-accent border border-accent/20
                    rounded-full hover:bg-accent/20 transition-colors"
                >
                  #{tag.name}
                </button>
              ))}
            </div>
          )}

          {/* 인라인 삭제 확인 UI */}
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

          {/* 마크다운 렌더링 — 헤딩에 id 부여, 이미지 클릭 시 라이트박스 오픈 */}
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
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                img({ src, alt }) {
                  return <MarkdownImage src={src} alt={alt} onOpen={setLightboxSrc} />
                },
                h1: makeHeading('h1'),
                h2: makeHeading('h2'),
                h3: makeHeading('h3'),
              }}
            >
              {article.content}
            </ReactMarkdown>
          </div>

          {/* 댓글 섹션 */}
          <div className="mt-12 border-t border-border-subtle pt-8">
            <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-widest mb-5">
              댓글{comments.length > 0 && ` (${comments.length})`}
            </h2>

            {/* 댓글 목록 */}
            {comments.length > 0 && (
              <div className="space-y-3 mb-6">
                {comments.map((c) => (
                  <div key={c.id} className="bg-bg-card border border-border-subtle rounded-xl px-4 py-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-text-primary">{c.author_name}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-text-secondary">{timeAgo(c.created_at)}</span>
                        <button
                          onClick={() => handleDeleteComment(c.id)}
                          className="text-[10px] text-text-secondary hover:text-red-400 transition-colors"
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-text-primary whitespace-pre-wrap leading-relaxed">
                      {c.content}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* 댓글 입력 */}
            <div className="flex gap-3 items-end">
              <textarea
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleAddComment()
                }}
                placeholder="댓글을 입력하세요… (Ctrl+Enter로 등록)"
                rows={3}
                maxLength={500}
                className="flex-1 bg-bg-card border border-border-subtle text-text-primary text-sm
                  rounded-xl px-4 py-3 outline-none focus:border-accent transition-colors
                  placeholder-text-secondary resize-none"
              />
              <button
                onClick={handleAddComment}
                disabled={!commentInput.trim() || submitting}
                className="px-4 py-2.5 bg-accent hover:bg-accent-hover text-white text-sm font-semibold
                  rounded-xl transition-colors disabled:opacity-40 flex-shrink-0"
              >
                {submitting ? '등록 중…' : '등록'}
              </button>
            </div>
          </div>
        </div>

        {/* 목차(TOC) — 헤딩 2개 이상, xl 화면(1280px+)에서만 표시 */}
        {toc.length >= 2 && (
          <aside className="hidden xl:block w-48 flex-shrink-0 self-start sticky top-8">
            <p className="text-[11px] font-semibold text-text-secondary uppercase tracking-widest mb-3">
              목차
            </p>
            <nav className="space-y-0.5">
              {toc.map((item, idx) => (
                <a
                  key={idx}
                  href={`#${item.id}`}
                  className={`block text-xs leading-relaxed text-text-secondary hover:text-accent
                    transition-colors py-0.5 truncate
                    ${item.level === 2 ? 'pl-3' : item.level === 3 ? 'pl-6' : ''}`}
                >
                  {item.text}
                </a>
              ))}
            </nav>
          </aside>
        )}
      </div>

      {/* 라이트박스 */}
      {lightboxSrc && (
        <Lightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
      )}
    </>
  )
}

export default ArticlePage
