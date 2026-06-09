# KUNWON 사내 위키

건원 사내 AI 활용 위키 시스템입니다.

---

## Step 1 — 백엔드 실행

### 요구사항
- Python 3.11+

### 설치 및 실행

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 실행 후 확인

| URL | 설명 |
|-----|------|
| http://localhost:8000/api/health | 헬스체크 (DB 연결 상태 포함) |
| http://localhost:8000/docs | Swagger UI (전체 API 문서) |
| http://localhost:8000/redoc | ReDoc 문서 |

### 초기 데이터

최초 실행 시 다음 6개 카테고리가 자동으로 생성됩니다.

| 카테고리 | 설명 |
|---------|------|
| 🚀 시작하기 | 이 위키 사용법과 입문 가이드 |
| 🛠 AI 도구 카탈로그 | AI 도구별 사용법과 활용 가이드 |
| 📋 업무 SOP | 업무별 표준 절차와 체크리스트 |
| 💬 프롬프트 뱅크 | 검증된 프롬프트 템플릿 모음 |
| 📁 프로젝트 사례 | 공모전·심의·인허가 노하우 사례 |
| 🔧 개발·기술 문서 | 앱 운영 매뉴얼과 의사결정 로그 |

DB 파일은 `backend/data/wiki.db`에 자동 생성됩니다.
