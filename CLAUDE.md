# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

건원 사내 AI 활용 위키 시스템. 세 개의 독립적인 서브시스템으로 구성됩니다.

1. **백엔드** (`backend/`) — FastAPI + SQLite REST API
2. **프론트엔드** (`frontend/`) — React + Vite SPA
3. **MkDocs 정적 위키** (루트) — AI 워크플로우 지식 베이스 문서 사이트

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
- DB 파일 위치: `backend/data/wiki.db` (최초 실행 시 자동 생성)

### 프론트엔드

```bash
cd frontend
npm install
npm run dev       # 개발 서버 (http://localhost:3000)
npm run build     # 프로덕션 빌드
npm run preview   # 빌드 결과 미리보기
```

### MkDocs 정적 위키

```bash
pip install -r requirements.txt
mkdocs serve      # 로컬 미리보기
mkdocs build      # site/ 디렉토리로 빌드
```

---

## 아키텍처

### 백엔드 (`backend/`)

FastAPI 앱. `main.py`가 진입점이며 startup 이벤트에서 DB 테이블 생성과 초기 카테고리 시드를 수행합니다.

**데이터 모델** (`models.py`):
- `Category` — `order_index`로 정렬, 아티클 삭제 전에는 카테고리 삭제 불가
- `Article` — `view_count` 는 GET `/api/articles/{id}` 호출 시 +1 자동 증가

**라우터** (`routers/`):
- `categories.py` — `GET/POST /api/categories`, `DELETE /api/categories/{id}` (글 있으면 400)
- `articles.py` — CRUD + 키워드 검색(`search` 쿼리 파라미터), 카테고리 필터(`category_id`), 페이지네이션(`skip`/`limit`)

**스키마** (`schemas.py`): `ArticleListItem`은 `content` 제외(목록용), `ArticleDetail`은 `content` 포함(상세용).

DB URL은 `backend/.env`의 `DATABASE_URL`로 오버라이드 가능 (기본값: `sqlite:///./data/wiki.db`).

### 프론트엔드 (`frontend/src/`)

React Router v6 SPA. 레이아웃은 `App.jsx`에서 고정 사이드바(`ml-60`) + 우측 콘텐츠 영역으로 구성됩니다.

**라우트 구조:**
- `/` — HomePage (전체 카테고리 목록)
- `/category/:id` — CategoryPage (카테고리별 아티클 목록)
- `/article/:id` — ArticlePage (아티클 상세, 마크다운 렌더링)
- `/edit/new` — ArticleEditPage (새 글 작성)
- `/edit/:id` — ArticleEditPage (글 수정)

**API 통신** (`api/client.js`): axios 인스턴스. 개발 시에는 vite.config.js의 프록시가 `/api → http://localhost:8000` 으로 포워딩하므로 CORS 설정 불필요. 프로덕션 배포 시 `VITE_API_URL` 환경변수로 백엔드 URL을 지정합니다.

아티클 본문은 마크다운 형식으로 저장되며, 상세 페이지에서 `react-markdown` + `remark-gfm`으로 렌더링됩니다. 편집기는 `@uiw/react-md-editor`를 사용합니다.

### MkDocs 정적 위키 (`docs/`)

AI 워크플로우·프롬프트·파라미터 등 정적 지식 문서. `mkdocs.yml`에서 네비게이션 구조를 관리합니다. 빌드 결과물은 `site/`에 생성됩니다 (버전 관리 불필요).
