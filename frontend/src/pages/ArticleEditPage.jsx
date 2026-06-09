import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import MDEditor from '@uiw/react-md-editor'
import client from '../api/client'

// ── 페이지 템플릿 정의 ─────────────────────────────────────────
const TEMPLATES = [
  {
    id: 'blank',
    name: '빈 문서',
    icon: '📄',
    content: '',
  },
  {
    id: 'sop',
    name: '업무 SOP',
    icon: '📋',
    content: `## 개요

이 절차의 목적과 적용 범위를 간략히 설명하세요.

## 사전 준비

- [ ]
- [ ]

## 절차

### 1단계:

### 2단계:

### 3단계:

## 주의사항

>

## 관련 문서

-
`,
  },
  {
    id: 'ai-tool',
    name: 'AI 도구 가이드',
    icon: '🛠',
    content: `## 도구 소개

| 항목 | 내용 |
| --- | --- |
| 도구명 |  |
| 용도 |  |
| 접속 방법 |  |
| 요금제 |  |

## 주요 기능

## 사용법

### 기본 사용

### 활용 팁

## 프롬프트 예시

\`\`\`
프롬프트를 여기에 작성하세요.
\`\`\`

## 한계 / 주의사항

## 참고 링크

-
`,
  },
  {
    id: 'prompt',
    name: '프롬프트',
    icon: '💬',
    content: `## 용도

이 프롬프트를 언제, 어떤 목적으로 사용하는지 설명하세요.

## 프롬프트

\`\`\`
여기에 프롬프트를 작성하세요.
\`\`\`

## 변수 설명

| 변수 | 설명 | 예시 |
| --- | --- | --- |
| {변수명} |  |  |

## 출력 예시

## 사용 팁

`,
  },
  {
    id: 'project',
    name: '프로젝트 사례',
    icon: '📁',
    content: `## 프로젝트 개요

| 항목 | 내용 |
| --- | --- |
| 프로젝트명 |  |
| 발주처 |  |
| 기간 |  |
| 담당자 |  |

## 배경 및 목적

## 진행 과정

### 주요 이슈

### 해결 방법

## 결과

## 핵심 노하우

> 다음 프로젝트에서 가장 활용하기 좋은 점:

## 참고 자료

`,
  },
  {
    id: 'tech-doc',
    name: '기술 문서',
    icon: '🔧',
    content: `## 개요

## 환경 / 요구사항

| 항목 | 버전/사양 |
| --- | --- |
|  |  |

## 설치 및 설정

\`\`\`bash
# 명령어를 여기에 작성하세요
\`\`\`

## 주요 기능

## 트러블슈팅

| 증상 | 원인 | 해결 방법 |
| --- | --- | --- |
|  |  |  |

## 변경 이력

| 날짜 | 변경 내용 | 작성자 |
| --- | --- | --- |
|  |  |  |
`,
  },
  {
    id: 'meeting',
    name: '회의록',
    icon: '📝',
    content: `## 회의 정보

| 항목 | 내용 |
| --- | --- |
| 일시 |  |
| 참석자 |  |
| 장소/방식 |  |

## 안건

1.
2.

## 논의 내용

### 안건 1

### 안건 2

## 결정 사항

- [ ]
- [ ]

## 다음 회의

`,
  },
]

// 이미지 업로드 툴바 버튼 아이콘
function ImageUploadIcon({ uploading }) {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
      {uploading ? (
        <text x="1" y="12" fontSize="10" fill="currentColor">···</text>
      ) : (
        <>
          <path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" />
          <path d="M2.002 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2h-12zm12 1a1 1 0 0 1 1 1v6.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12V3a1 1 0 0 1 1-1h12z" />
        </>
      )}
    </svg>
  )
}

function ArticleEditPage() {
  const { id }   = useParams()
  const navigate = useNavigate()
  const isNew    = !id

  const [title, setTitle]           = useState('')
  const [content, setContent]       = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [categories, setCategories] = useState([])
  const [tags, setTags]             = useState([])
  const [tagInput, setTagInput]     = useState('')
  const [saving, setSaving]         = useState(false)
  const [loading, setLoading]       = useState(!isNew)
  const [uploading, setUploading]   = useState(false)
  // 새 글 작성 시에만 템플릿 선택 패널 표시
  const [showTemplates, setShowTemplates] = useState(isNew)

  const fileInputRef = useRef(null)

  // 카테고리 목록 로딩
  useEffect(() => {
    client
      .get('/api/categories')
      .then((res) => {
        setCategories(res.data)
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
          setTags(res.data.tags ? res.data.tags.map((t) => t.name) : [])
        })
        .catch((err) => console.error('글 불러오기 실패:', err))
        .finally(() => setLoading(false))
    }
  }, [id, isNew])

  // ── 이미지 업로드 ──────────────────────────────────────────

  const handleImageFile = async (file) => {
    if (!file || uploading) return
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.')
      return
    }

    const formData = new FormData()
    formData.append('file', file)

    setUploading(true)
    try {
      const res = await client.post('/api/uploads/image', formData)
      const { url } = res.data
      // 확장자 제거한 파일명을 alt 텍스트로 사용
      const altText = file.name.replace(/\.[^.]+$/, '')
      // 커서 위치 무관하게 본문 끝에 이미지 삽입
      setContent((prev) => {
        const separator = prev && !prev.endsWith('\n\n') ? '\n\n' : ''
        return `${prev}${separator}![${altText}](${url})\n`
      })
    } catch (err) {
      alert(`이미지 업로드 실패: ${err.message}`)
    } finally {
      setUploading(false)
      // 같은 파일 재선택 가능하도록 input 초기화
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  // 파일 input onChange
  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0]
    if (file) handleImageFile(file)
  }

  // 에디터 영역 드래그앤드롭
  const handleEditorDrop = (e) => {
    const files = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith('image/')
    )
    if (files.length === 0) return  // 이미지가 아니면 기본 동작 유지
    e.preventDefault()
    files.forEach((file) => handleImageFile(file))
  }

  const handleEditorDragOver = (e) => {
    // 이미지 파일 드래그 중일 때만 기본 동작 방지
    if (e.dataTransfer.types.includes('Files')) e.preventDefault()
  }

  // MDEditor 툴바에 추가할 이미지 업로드 커맨드
  const imageUploadCommand = {
    name: 'image-upload',
    keyCommand: 'image-upload',
    buttonProps: {
      'aria-label': '이미지 업로드',
      title: uploading ? '업로드 중...' : '이미지 업로드',
      disabled: uploading,
    },
    icon: <ImageUploadIcon uploading={uploading} />,
    execute: () => {
      if (!uploading) fileInputRef.current?.click()
    },
  }

  // ── 태그 입력 ──────────────────────────────────────────────

  const addTag = (raw) => {
    const name = raw.toLowerCase().replace(/,/g, '').trim()
    if (!name || tags.includes(name)) return
    setTags((prev) => [...prev, name])
  }

  const removeTag = (name) => setTags((prev) => prev.filter((t) => t !== name))

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(tagInput)
      setTagInput('')
    } else if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      removeTag(tags[tags.length - 1])
    }
  }

  const handleTagBlur = () => {
    if (tagInput.trim()) {
      addTag(tagInput)
      setTagInput('')
    }
  }

  // ── 저장 ──────────────────────────────────────────────────

  const handleSave = async () => {
    if (!title.trim())   { alert('제목을 입력해주세요.'); return }
    if (!content.trim()) { alert('내용을 입력해주세요.'); return }
    if (!categoryId)     { alert('카테고리를 선택해주세요.'); return }

    setSaving(true)
    try {
      const body = {
        title:       title.trim(),
        content:     content.trim(),
        category_id: parseInt(categoryId),
        tags,
        // localStorage에서 닉네임 읽어 자동 포함
        author_name: localStorage.getItem('wiki_nickname') || '익명',
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

      {/* 템플릿 선택 — 새 글 작성 시에만 표시 */}
      {isNew && (
        <div className="mb-4">
          {showTemplates ? (
            <div className="bg-bg-card border border-border-subtle rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-text-secondary uppercase tracking-widest">
                  템플릿으로 시작하기
                </span>
                <button
                  onClick={() => setShowTemplates(false)}
                  className="text-xs text-text-secondary hover:text-text-primary transition-colors"
                >
                  닫기 ✕
                </button>
              </div>
              <div className="flex gap-2 flex-wrap">
                {TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setContent(t.content)
                      setShowTemplates(false)
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 bg-bg-base border border-border-subtle
                      rounded-lg text-xs text-text-secondary hover:border-accent hover:text-accent
                      transition-colors"
                  >
                    <span>{t.icon}</span>
                    <span>{t.name}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowTemplates(true)}
              className="text-xs text-text-secondary border border-border-subtle rounded-lg
                px-3 py-1.5 hover:bg-bg-hover hover:text-text-primary transition-colors"
            >
              템플릿 선택 ▼
            </button>
          )}
        </div>
      )}

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

      {/* 태그 입력 */}
      <div
        className="flex flex-wrap items-center gap-1.5 bg-bg-card border border-border-subtle
          rounded-lg px-3 py-2 mb-4 focus-within:border-accent transition-colors min-h-[42px]"
      >
        {tags.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1 bg-accent/20 text-accent text-xs px-2.5 py-1 rounded-full"
          >
            #{tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="hover:text-white transition-colors leading-none ml-0.5"
            >
              ×
            </button>
          </span>
        ))}
        <input
          type="text"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleTagKeyDown}
          onBlur={handleTagBlur}
          placeholder={tags.length === 0 ? 'Enter 또는 쉼표로 태그 추가' : ''}
          className="flex-1 min-w-[160px] bg-transparent text-text-primary text-sm
            outline-none placeholder-text-secondary"
        />
      </div>

      {/* 숨겨진 파일 input — 툴바 버튼 클릭 시 트리거 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        className="hidden"
        onChange={handleFileInputChange}
      />

      {/* 마크다운 에디터 + 드래그앤드롭 */}
      <div
        data-color-mode="dark"
        className="mb-6"
        onDrop={handleEditorDrop}
        onDragOver={handleEditorDragOver}
      >
        <MDEditor
          value={content}
          onChange={(val) => setContent(val ?? '')}
          height={450}
          preview="live"
          extraCommands={[imageUploadCommand]}
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
