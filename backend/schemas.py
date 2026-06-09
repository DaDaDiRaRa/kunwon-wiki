from datetime import datetime
from typing import Optional
from pydantic import BaseModel


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


class ArticleUpdate(BaseModel):
    title: str
    content: str
    category_id: int


class ArticleListItem(BaseModel):
    """목록 응답 — content 제외"""
    id: int
    title: str
    category_id: int
    created_at: datetime
    updated_at: datetime
    view_count: int

    model_config = {"from_attributes": True}


class ArticleDetail(BaseModel):
    """상세 응답 — content 포함"""
    id: int
    title: str
    content: str
    category_id: int
    created_at: datetime
    updated_at: datetime
    view_count: int

    model_config = {"from_attributes": True}


# ── 공통 메시지 ─────────────────────────────────────────────

class MessageResponse(BaseModel):
    message: str


class HealthResponse(BaseModel):
    status: str
    database: str
