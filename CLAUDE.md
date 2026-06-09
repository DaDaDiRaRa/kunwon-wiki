# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

건원 사내 위키 시스템. 업무 SOP, AI 도구 활용법, 프로젝트 사례, 프롬프트 뱅크 등 전사 지식을 관리하는 내부 위키입니다. 두 개의 독립적인 서브시스템으로 구성됩니다.

1. **백엔드** (`backend/`) — FastAPI + SQLite REST API
2. **프론트엔드** (`frontend/`) — React + Vite SPA

---

## 명령어

### 백엔드

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

- API 문서: `http://localhost:8000/docs`
- 헬스체크: `http://localhost:8000/api/health`
- DB 파일: `backend/data/wiki.db` (최초 실행 시 자동 생성)
- 업로드 이미지: `backend/data/uploads/` (StaticFiles로 `/uploads` 경로에 서빙)

### 프론트엔드

```bash
cd frontend
npm install
npm run dev       # 개발 서버 (http://localhost:3000)
npm run build
```

---

## 아키텍처

### 백엔드 (`backend/`)

`main.py`가 진입점. startup 이벤트에서 `create_all` → `_migrate_add_author_name` → `_seed_categories` 순서로 실행됩니다.

**중요한 초기화 순서**: `StaticFiles` 마운트는 해당 디렉토리가 존재해야 하므로 `UPLOADS_DIR.mkdir(parents=True, exist_ok=True)`를 모듈 최상단(앱 초기화 전)에서 실행합니다.

**SQLite FK 제약**: `database.py`에서 `event.listens_for(engine, "connect")`로 모든 연결에 `PRAGMA foreign_keys=ON`을 설정합니다. 이것 없이는 CASCADE DELETE가 동작하지 않습니다.

**스키마 마이그레이션 패턴**: `create_all()`은 기존 테이블을 수정하지 않으므로, 컬럼 추가는 startup에서 `ALTER TABLE ... ADD COLUMN`을 try/except로 감싸 실행합니다 (이미 있으면 무시).

#### 데이터 모델 (`models.py`)

- `Category` — `order_index`로 정렬, `name` unique
- `Article` — `view_count`는 GET `/api/articles/{id}` 호출 시 자동 +1. `author_name`은 `default=`와 `server_default=` 모두 설정 (기존 글은 "익명")
- `Tag` — `name` unique (소문자로 저장)
- `ArticleTag` — Article↔Tag 다대다 조인 테이블. 양쪽 FK에 `ondelete="CASCADE"`. `Table()` 대신 명시적 모델 클래스 사용

`Article`의 `article_tags` relationship은 `cascade="all, delete-orphan"` 설정으로 글 삭제 시 태그 연결이 자동 제거됩니다.

#### 라우터 (`routers/`)

| 파일 | 엔드포인트 |
| --- | --- |
| `categories.py` | `GET/POST /api/categories`, `DELETE /api/categories/{id}` (글 있으면 400) |
| `articles.py` | CRUD + `?search=`, `?tag=`, `?category_id=`, `?skip=`/`?limit=` 필터 |
| `tags.py` | `GET /api/tags` — article_count 포함, 내림차순 정렬 |
| `uploads.py` | `POST /api/uploads/image` — 10MB 제한, jpg/png/gif/webp, uuid4 prefix로 저장 |
| `activities.py` | `GET /api/activities` — 최근 수정 글 20건, action: "작성"/"수정" 판별 |
| `main.py` | `GET /api/health` |

**태그 동기화 (`articles.py`)**: `_sync_tags(db, article, tag_names)` — 기존 ArticleTag 전체 삭제 후 재삽입. Tag가 없으면 새로 생성 후 `db.flush()`로 id 확보. `body.model_dump(exclude={"tags"})`로 태그를 Article 생성과 분리합니다.

**활동 판별**: `abs((updated_at - created_at).total_seconds()) <= 5`이면 "작성", 아니면 "수정".

#### 스키마 (`schemas.py`)

`ArticleDetail.tags: list[TagBase] = []` — `model_validate(article_orm)` 시 Article ORM에 `tags` 속성이 없으므로 기본값 `[]`로 처리. 엔드포인트에서 명시적으로 `detail.tags = _load_tags(...)` 설정.

---

### 프론트엔드 (`frontend/src/`)

React Router v6 SPA. 레이아웃: 고정 사이드바 240px + 우측 콘텐츠 영역(`ml-60`).

**라우트:**

- `/` — `HomePage` (전체 글 목록, 검색, 최근 활동 피드)
- `/category/:id` — `CategoryPage`
- `/article/:id` — `ArticlePage` (마크다운 렌더링, 이미지 라이트박스)
- `/edit/new` / `/edit/:id` — `ArticleEditPage`

**닉네임 상태 흐름**: `App.jsx`가 `localStorage('wiki_nickname')`를 읽어 `nickname` 상태로 관리. `Sidebar`에 props(`nickname`, `onNicknameChange`)로 전달. `ArticleEditPage`는 저장 시 `localStorage.getItem('wiki_nickname')`을 직접 읽음(prop 불필요). 닉네임 미설정 시 `NicknameBanner` 컴포넌트 표시.

**태그 필터**: `useSearchParams`로 URL `?tag=이름` 파라미터 상태 관리. `Sidebar`에서도 `new URLSearchParams(location.search).get('tag')`로 현재 태그 읽어 하이라이트.

**이미지 업로드 흐름**: MDEditor `extraCommands`에 커스텀 버튼 등록 → 숨겨진 `<input type="file" ref={fileInputRef}>` 클릭 트리거 → `POST /api/uploads/image` → 응답 URL을 본문 끝에 `![alt](url)` 형식으로 삽입. 에디터 래퍼 div에 `onDrop`/`onDragOver` 핸들러로 드래그앤드롭도 지원.

**이미지 라이트박스** (`ArticlePage`): `ReactMarkdown`의 `components.img`를 오버라이드해 클릭 시 `Lightbox` 컴포넌트 오픈. ESC 키 지원.

**Vite 프록시** (`vite.config.js`): 개발 시 `/api`와 `/uploads` 모두 `http://localhost:8000`으로 포워딩. 프로덕션에서 동일 오리진 서빙 시 프록시 불필요.

```js
proxy: {
  '/api':     { target: 'http://localhost:8000', changeOrigin: true },
  '/uploads': { target: 'http://localhost:8000', changeOrigin: true },
}
```

**API 클라이언트** (`api/client.js`): axios 인스턴스. 프로덕션 배포 시 `VITE_API_URL` 환경변수로 백엔드 URL 지정.

---

## 향후 구현 예정 기능

| 기능 | 난이도 |
| --- | --- |
| 글 댓글/토론 | ★★☆ |
| 수정 이력 + 버전 복원 | ★★★ |
| 글 즐겨찾기/북마크 | ★★☆ |
| 페이지 템플릿 | ★☆☆ |
| 목차(TOC) 자동 생성 | ★☆☆ |
| 글 간 내부 링크 (`[[글제목]]`) | ★★☆ |
