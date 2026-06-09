from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional

from database import get_db
from models import Article, Category
from schemas import ArticleCreate, ArticleUpdate, ArticleDetail, ArticleListItem, MessageResponse

router = APIRouter(prefix="/api/articles", tags=["articles"])


@router.get("", response_model=list[ArticleListItem])
def list_articles(
    search: Optional[str] = Query(None, description="제목·본문 키워드 검색"),
    category_id: Optional[int] = Query(None, description="카테고리 필터"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=200),
    db: Session = Depends(get_db),
):
    """글 목록 반환 — content 제외, updated_at 내림차순"""
    query = db.query(Article)

    if category_id is not None:
        query = query.filter(Article.category_id == category_id)

    if search:
        like = f"%{search}%"
        query = query.filter(
            Article.title.like(like) | Article.content.like(like)
        )

    articles = query.order_by(Article.updated_at.desc()).offset(skip).limit(limit).all()
    return articles


@router.get("/{article_id}", response_model=ArticleDetail)
def get_article(article_id: int, db: Session = Depends(get_db)):
    """글 상세 반환 — 호출 시 view_count +1"""
    article = db.query(Article).filter(Article.id == article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="글을 찾을 수 없습니다")

    article.view_count += 1
    db.commit()
    db.refresh(article)
    return article


@router.post("", response_model=ArticleDetail, status_code=201)
def create_article(body: ArticleCreate, db: Session = Depends(get_db)):
    """글 생성 — 존재하지 않는 category_id면 400"""
    category = db.query(Category).filter(Category.id == body.category_id).first()
    if not category:
        raise HTTPException(status_code=400, detail="존재하지 않는 카테고리입니다")

    article = Article(**body.model_dump())
    db.add(article)
    db.commit()
    db.refresh(article)
    return article


@router.put("/{article_id}", response_model=ArticleDetail)
def update_article(article_id: int, body: ArticleUpdate, db: Session = Depends(get_db)):
    """글 수정 — updated_at 자동 갱신"""
    article = db.query(Article).filter(Article.id == article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="글을 찾을 수 없습니다")

    category = db.query(Category).filter(Category.id == body.category_id).first()
    if not category:
        raise HTTPException(status_code=400, detail="존재하지 않는 카테고리입니다")

    article.title = body.title
    article.content = body.content
    article.category_id = body.category_id
    article.updated_at = datetime.now(timezone.utc).replace(tzinfo=None)

    db.commit()
    db.refresh(article)
    return article


@router.delete("/{article_id}", response_model=MessageResponse)
def delete_article(article_id: int, db: Session = Depends(get_db)):
    """글 삭제"""
    article = db.query(Article).filter(Article.id == article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="글을 찾을 수 없습니다")

    db.delete(article)
    db.commit()
    return {"message": "삭제되었습니다"}
