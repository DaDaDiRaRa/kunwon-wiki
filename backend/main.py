import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from database import Base, engine, check_db_connection
from models import Category, Tag, ArticleTag  # noqa: F401 — 테이블 등록용 import
from models import Article                    # noqa: F401
from routers import categories, articles, tags
from schemas import HealthResponse

load_dotenv()

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

# ── 라우터 등록 ────────────────────────────────────────────
app.include_router(categories.router)
app.include_router(articles.router)
app.include_router(tags.router)


# ── 시작 이벤트 ────────────────────────────────────────────
@app.on_event("startup")
def on_startup():
    """DB 테이블 생성 + 초기 카테고리 시드"""
    Base.metadata.create_all(bind=engine)
    _seed_categories()


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
