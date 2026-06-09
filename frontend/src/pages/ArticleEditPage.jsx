import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import MDEditor from '@uiw/react-md-editor'
import client from '../api/client'

function ArticleEditPage() {
  const { id }   = useParams()
  const navigate = useNavigate()
  const isNew    = !id  // /edit/new → id가 undefined

  const [title, setTitle]         = useState('')
  const [content, setContent]     = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [categories, setCategories] = useState([])
  const [saving, setSaving]       = useState(false)
  const [loading, setLoading]     = useState(!isNew)

  // 카테고리 목록 로딩
  useEffect(() => {
    client
      .get('/api/categories')
      .then((res) => {
        setCategories(res.data)
        // 새 글 작성 모드: 첫 번째 카테고리를 기본 선택
        if (isNew && res.data.length > 0) {
          setCategoryId(String(res.data[0].id))
        }
      })
      .catch((err) => console.error('카테고리 로딩 실패:', err))
  }, [isNew])

  // 편집 모드: 기존 글 불러오기
  useEffect(() => {
    if (!isNew) {
      setLoading(true)
      client
        .get(`/api/articles/${id}`)
        .then((res) => {
          setTitle(res.data.title)
          setContent(res.data.content)
          setCategoryId(String(res.data.category_id))
        })
        .catch((err) => console.error('글 불러오기 실패:', err))
        .finally(() => setLoading(false))
    }
  }, [id, isNew])

  // 저장 핸들러
  const handleSave = async () => {
    if (!title.trim())    { alert('제목을 입력해주세요.'); return }
    if (!content.trim())  { alert('내용을 입력해주세요.'); return }
    if (!categoryId)      { alert('카테고리를 선택해주세요.'); return }

    setSaving(true)
    try {
      const body = {
        title:       title.trim(),
        content:     content.trim(),
        category_id: parseInt(categoryId),
      }
      const res = isNew
        ? await client.post('/api/articles', body)
        : await client.put(`/api/articles/${id}`, body)

      navigate(`/article/${res.data.id}`)
    } catch (err) {
      console.error('저장 실패:', err.message)
      alert(`저장 실패: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    isNew ? navigate('/') : navigate(`/article/${id}`)
  }

  // 편집 모드 로딩 중 스켈레톤
  if (loading) {
    return (
      <div className="p-8 max-w-4xl animate-pulse">
        <div className="h-7 bg-bg-card rounded w-1/4 mb-6" />
        <div className="h-12 bg-bg-card rounded mb-4" />
        <div className="h-10 bg-bg-card rounded mb-4" />
        <div className="h-96 bg-bg-card rounded" />
      </div>
    )
  }

  return (
    <div className="p-8 max-w-4xl">
      <h2 className="text-xl font-bold text-text-primary mb-6">
        {isNew ? '새 글 작성' : '글 편집'}
      </h2>

      {/* 제목 입력 */}
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="제목을 입력하세요"
        className="w-full bg-bg-card border border-border-subtle text-text-primary
          placeholder-text-secondary rounded-lg px-4 py-3 text-xl font-semibold
          outline-none focus:border-accent transition-colors mb-4"
      />

      {/* 카테고리 선택 */}
      <select
        value={categoryId}
        onChange={(e) => setCategoryId(e.target.value)}
        className="w-full bg-bg-card border border-border-subtle text-text-primary
          rounded-lg px-4 py-2.5 text-sm outline-none focus:border-accent
          transition-colors mb-4 cursor-pointer"
      >
        <option value="" disabled>카테고리 선택</option>
        {categories.map((cat) => (
          <option key={cat.id} value={String(cat.id)}>
            {cat.name}
          </option>
        ))}
      </select>

      {/* 마크다운 에디터 — data-color-mode="dark"로 다크 테마 */}
      {/* IME(한국어) 이슈 방지: onChange에서 value를 직접 setState */}
      <div data-color-mode="dark" className="mb-6">
        <MDEditor
          value={content}
          onChange={(val) => setContent(val ?? '')}
          height={450}
          preview="live"
        />
      </div>

      {/* 저장 / 취소 버튼 */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 bg-accent hover:bg-accent-hover text-white font-semibold
            rounded-lg transition-colors disabled:opacity-50 text-sm"
        >
          {saving ? '저장 중...' : '저장'}
        </button>
        <button
          onClick={handleCancel}
          disabled={saving}
          className="px-6 py-2.5 text-text-secondary border border-border-subtle
            hover:bg-bg-hover hover:text-text-primary rounded-lg transition-colors
            text-sm disabled:opacity-50"
        >
          취소
        </button>
      </div>
    </div>
  )
}

export default ArticleEditPage
