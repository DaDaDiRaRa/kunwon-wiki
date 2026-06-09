import os
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv

from database import Base, engine, check_db_connection
from models import Category, Tag, ArticleTag  # noqa: F401 — 테이블 등록용 import
from models import Article                    # noqa: F401
from routers import categories, articles, tags, uploads, activities
from schemas import HealthResponse

load_dotenv()

# StaticFiles 마운트 전에 디렉토리가 존재해야 함
UPLOADS_DIR = Path("./data/uploads")
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

# ── 앱 초기화 ──────────────────────────────────────────────
app = FastAPI(
    title="KUNWON 사내 위키 API",
    description="건원 사내 AI 위키 백엔드",
    version="1.0.0",
)

# CORS — 개발 중 전체 허용
allowed_origins = os.getenv("ALLOWED_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── 업로드 이미지 정적 서빙 ────────────────────────────────────
app.mount("/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")

# ── 라우터 등록 ────────────────────────────────────────────
app.include_router(categories.router)
app.include_router(articles.router)
app.include_router(tags.router)
app.include_router(uploads.router)
app.include_router(activities.router)


# ── 시작 이벤트 ────────────────────────────────────────────
@app.on_event("startup")
def on_startup():
    """DB 테이블 생성 + 마이그레이션 + 초기 카테고리 시드"""
    Base.metadata.create_all(bind=engine)
    _migrate_add_author_name()
    _seed_categories()


def _migrate_add_author_name():
    """author_name 컬럼이 없는 기존 DB에 컬럼 추가"""
    from sqlalchemy import text
    try:
        with engine.connect() as conn:
            conn.execute(text("ALTER TABLE articles ADD COLUMN author_name TEXT DEFAULT '익명'"))
            conn.commit()
    except Exception:
        pass  # 컬럼이 이미 존재하면 무시


def _seed_categories():
    """categories 테이블이 비어있을 때만 초기 데이터 삽입"""
    from database import SessionLocal

    SEED = [
        {"name": "🚀 시작하기",        "description": "이 위키 사용법과 입문 가이드",        "icon": "🚀", "order_index": 0},
        {"name": "🛠 AI 도구 카탈로그", "description": "AI 도구별 사용법과 활용 가이드",      "icon": "🛠", "order_index": 1},
        {"name": "📋 업무 SOP",        "description": "업무별 표준 절차와 체크리스트",        "icon": "📋", "order_index": 2},
        {"name": "💬 프롬프트 뱅크",    "description": "검증된 프롬프트 템플릿 모음",         "icon": "💬", "order_index": 3},
        {"name": "📁 프로젝트 사례",    "description": "공모전·심의·인허가 노하우 사례",      "icon": "📁", "order_index": 4},
        {"name": "🔧 개발·기술 문서",   "description": "앱 운영 매뉴얼과 의사결정 로그",      "icon": "🔧", "order_index": 5},
    ]

    db = SessionLocal()
    try:
        if db.query(Category).count() == 0:
            db.bulk_insert_mappings(Category, SEED)
            db.commit()
    finally:
        db.close()


# ── 헬스체크 ───────────────────────────────────────────────
@app.get("/api/health", response_model=HealthResponse, tags=["health"])
def health_check():
    db_status = "connected" if check_db_connection() else "error"
    return {"status": "ok", "database": db_status}
