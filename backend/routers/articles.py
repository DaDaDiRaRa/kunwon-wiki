from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional

from database import get_db
from models import Article, Category, Tag, ArticleTag
from schemas import ArticleCreate, ArticleUpdate, ArticleDetail, ArticleListItem, MessageResponse, TagBase

router = APIRouter(prefix="/api/articles", tags=["articles"])


def _sync_tags(db: Session, article: Article, tag_names: list[str]):
    """태그 이름 목록으로 article의 태그를 교체 (소문자 정규화 + 중복 제거)"""
    # 기존 태그 연결 전부 삭제
    db.query(ArticleTag).filter(ArticleTag.article_id == article.id).delete(synchronize_session=False)

    seen: set[str] = set()
    for raw_name in tag_names:
        name = raw_name.lower().strip()
        if not name or name in seen:
            continue
        seen.add(name)

        # 태그가 없으면 자동 생성
        tag = db.query(Tag).filter(Tag.name == name).first()
        if not tag:
            tag = Tag(name=name)
            db.add(tag)
            db.flush()  # INSERT 후 id 확보
        db.add(ArticleTag(article_id=article.id, tag_id=tag.id))


def _load_tags(db: Session, article_id: int) -> list[TagBase]:
    """article_id에 연결된 TagBase 목록 반환"""
    tags = (
        db.query(Tag)
        .join(ArticleTag, ArticleTag.tag_id == Tag.id)
        .filter(ArticleTag.article_id == article_id)
        .all()
    )
    return [TagBase.model_validate(t) for t in tags]


@router.get("", response_model=list[ArticleListItem])
def list_articles(
    search: Optional[str] = Query(None, description="제목·본문 키워드 검색"),
    category_id: Optional[int] = Query(None, description="카테고리 필터"),
    tag: Optional[str] = Query(None, description="태그 이름으로 필터"),
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

    if tag:
        query = (
            query
            .join(ArticleTag, ArticleTag.article_id == Article.id)
            .join(Tag, Tag.id == ArticleTag.tag_id)
            .filter(Tag.name == tag.lower().strip())
        )

    articles = query.order_by(Article.updated_at.desc()).offset(skip).limit(limit).all()
    return articles


@router.get("/{article_id}", response_model=ArticleDetail)
def get_article(article_id: int, db: Session = Depends(get_db)):
    """글 상세 반환 — 호출 시 view_count +1, 태그 포함"""
    article = db.query(Article).filter(Article.id == article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="글을 찾을 수 없습니다")

    article.view_count += 1
    db.commit()
    db.refresh(article)

    detail = ArticleDetail.model_validate(article)
    detail.tags = _load_tags(db, article_id)
    return detail


@router.post("", response_model=ArticleDetail, status_code=201)
def create_article(body: ArticleCreate, db: Session = Depends(get_db)):
    """글 생성 — 존재하지 않는 category_id면 400"""
    category = db.query(Category).filter(Category.id == body.category_id).first()
    if not category:
        raise HTTPException(status_code=400, detail="존재하지 않는 카테고리입니다")

    article = Article(**body.model_dump(exclude={"tags"}))
    db.add(article)
    db.flush()  # id 확보 후 태그 연결
    _sync_tags(db, article, body.tags)
    db.commit()
    db.refresh(article)

    detail = ArticleDetail.model_validate(article)
    detail.tags = _load_tags(db, article.id)
    return detail


@router.put("/{article_id}", response_model=ArticleDetail)
def update_article(article_id: int, body: ArticleUpdate, db: Session = Depends(get_db)):
    """글 수정 — updated_at 자동 갱신, 태그 교체"""
    article = db.query(Article).filter(Article.id == article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="글을 찾을 수 없습니다")

    category = db.query(Category).filter(Category.id == body.category_id).first()
    if not category:
        raise HTTPException(status_code=400, detail="존재하지 않는 카테고리입니다")

    article.title       = body.title
    article.content     = body.content
    article.category_id = body.category_id
    article.author_name = body.author_name
    article.updated_at  = datetime.now(timezone.utc).replace(tzinfo=None)

    _sync_tags(db, article, body.tags)
    db.commit()
    db.refresh(article)

    detail = ArticleDetail.model_validate(article)
    detail.tags = _load_tags(db, article_id)
    return detail


@router.delete("/{article_id}", response_model=MessageResponse)
def delete_article(article_id: int, db: Session = Depends(get_db)):
    """글 삭제"""
    article = db.query(Article).filter(Article.id == article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="글을 찾을 수 없습니다")

    db.delete(article)
    db.commit()
    return {"message": "삭제되었습니다"}
