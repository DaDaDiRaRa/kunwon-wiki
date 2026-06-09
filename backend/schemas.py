from datetime import datetime
from typing import Optional
from pydantic import BaseModel


# ── Tag ───────────────────────────────────────────────────

class TagBase(BaseModel):
    id: int
    name: str
    model_config = {"from_attributes": True}


class TagResponse(BaseModel):
    id: int
    name: str
    article_count: int = 0
    model_config = {"from_attributes": True}


# ── Category ──────────────────────────────────────────────

class CategoryCreate(BaseModel):
    name: str
    description: Optional[str] = None
    icon: Optional[str] = None
    order_index: int = 0


class CategoryResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    icon: Optional[str]
    order_index: int
    article_count: int = 0

    model_config = {"from_attributes": True}


# ── Article ───────────────────────────────────────────────

class ArticleCreate(BaseModel):
    title: str
    content: str
    category_id: int
    tags: list[str] = []
    author_name: str = "익명"


class ArticleUpdate(BaseModel):
    title: str
    content: str
    category_id: int
    tags: list[str] = []
    author_name: str = "익명"


class ArticleListItem(BaseModel):
    """목록 응답 — content 제외"""
    id: int
    title: str
    category_id: int
    created_at: datetime
    updated_at: datetime
    view_count: int
    author_name: str = "익명"

    model_config = {"from_attributes": True}


class ArticleDetail(BaseModel):
    """상세 응답 — content 및 태그 포함"""
    id: int
    title: str
    content: str
    category_id: int
    created_at: datetime
    updated_at: datetime
    view_count: int
    author_name: str = "익명"
    tags: list[TagBase] = []

    model_config = {"from_attributes": True}


# ── Activity ──────────────────────────────────────────────

class ActivityItem(BaseModel):
    """최근 활동 피드 항목"""
    id: int
    title: str
    author_name: str
    category_name: str
    action: str       # "작성" or "수정"
    updated_at: datetime


# ── 공통 메시지 ─────────────────────────────────────────────

class MessageResponse(BaseModel):
    message: str


class HealthResponse(BaseModel):
    status: str
    database: str
