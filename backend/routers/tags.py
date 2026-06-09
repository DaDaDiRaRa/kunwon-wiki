from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import get_db
from models import Tag, ArticleTag
from schemas import TagResponse

router = APIRouter(prefix="/api/tags", tags=["tags"])


@router.get("", response_model=list[TagResponse])
def list_tags(db: Session = Depends(get_db)):
    """전체 태그 목록 반환 — article_count 내림차순"""
    rows = (
        db.query(Tag, func.count(ArticleTag.article_id).label("article_count"))
        .outerjoin(ArticleTag, ArticleTag.tag_id == Tag.id)
        .group_by(Tag.id)
        .order_by(func.count(ArticleTag.article_id).desc())
        .all()
    )

    result = []
    for tag, article_count in rows:
        item = TagResponse.model_validate(tag)
        item.article_count = article_count
        result.append(item)
    return result
