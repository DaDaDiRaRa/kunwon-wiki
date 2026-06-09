from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import get_db
from models import Category, Article
from schemas import CategoryCreate, CategoryResponse, MessageResponse

router = APIRouter(prefix="/api/categories", tags=["categories"])


@router.get("", response_model=list[CategoryResponse])
def list_categories(db: Session = Depends(get_db)):
    """전체 카테고리 목록 반환 (글 수 포함, order_index 오름차순)"""
    rows = (
        db.query(Category, func.count(Article.id).label("article_count"))
        .outerjoin(Article, Article.category_id == Category.id)
        .group_by(Category.id)
        .order_by(Category.order_index)
        .all()
    )

    result = []
    for category, article_count in rows:
        item = CategoryResponse.model_validate(category)
        item.article_count = article_count
        result.append(item)
    return result


@router.post("", response_model=CategoryResponse, status_code=201)
def create_category(body: CategoryCreate, db: Session = Depends(get_db)):
    """카테고리 생성 — name 중복 시 400"""
    existing = db.query(Category).filter(Category.name == body.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="이미 존재하는 카테고리입니다")

    category = Category(**body.model_dump())
    db.add(category)
    db.commit()
    db.refresh(category)

    item = CategoryResponse.model_validate(category)
    item.article_count = 0
    return item


@router.delete("/{category_id}", response_model=MessageResponse)
def delete_category(category_id: int, db: Session = Depends(get_db)):
    """카테고리 삭제 — 글이 있으면 400"""
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="카테고리를 찾을 수 없습니다")

    article_count = db.query(Article).filter(Article.category_id == category_id).count()
    if article_count > 0:
        raise HTTPException(
            status_code=400,
            detail="카테고리에 글이 있어 삭제할 수 없습니다. 글을 먼저 이동하거나 삭제하세요.",
        )

    db.delete(category)
    db.commit()
    return {"message": "삭제되었습니다"}
