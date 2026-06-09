from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models import Article, Category
from schemas import ActivityItem

router = APIRouter(prefix="/api/activities", tags=["activities"])


@router.get("", response_model=list[ActivityItem])
def list_activities(db: Session = Depends(get_db)):
    """최근 생성·수정된 글 20개 반환 — updated_at 내림차순"""
    rows = (
        db.query(Article, Category.name.label("category_name"))
        .join(Category, Category.id == Article.category_id)
        .order_by(Article.updated_at.desc())
        .limit(20)
        .all()
    )

    result = []
    for article, category_name in rows:
        # created_at과 updated_at의 차이가 5초 이내면 새 글 작성, 그 외는 수정
        diff = abs((article.updated_at - article.created_at).total_seconds())
        action = "작성" if diff <= 5 else "수정"
        result.append(ActivityItem(
            id=article.id,
            title=article.title,
            author_name=article.author_name or "익명",
            category_name=category_name,
            action=action,
            updated_at=article.updated_at,
        ))
    return result
