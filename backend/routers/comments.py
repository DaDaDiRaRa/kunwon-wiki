from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import SessionLocal
from models import Article, Comment
from schemas import CommentCreate, CommentItem

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/api/articles/{article_id}/comments", response_model=list[CommentItem], tags=["comments"])
def list_comments(article_id: int, db: Session = Depends(get_db)):
    if not db.get(Article, article_id):
        raise HTTPException(status_code=404, detail="글을 찾을 수 없습니다.")
    return (
        db.query(Comment)
        .filter(Comment.article_id == article_id)
        .order_by(Comment.created_at.asc())
        .all()
    )


@router.post("/api/articles/{article_id}/comments", response_model=CommentItem, status_code=201, tags=["comments"])
def create_comment(article_id: int, body: CommentCreate, db: Session = Depends(get_db)):
    if not db.get(Article, article_id):
        raise HTTPException(status_code=404, detail="글을 찾을 수 없습니다.")
    if not body.content.strip():
        raise HTTPException(status_code=422, detail="댓글 내용을 입력해주세요.")
    comment = Comment(
        article_id=article_id,
        author_name=body.author_name.strip() or "익명",
        content=body.content.strip(),
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return comment


@router.delete("/api/comments/{comment_id}", status_code=204, tags=["comments"])
def delete_comment(comment_id: int, db: Session = Depends(get_db)):
    comment = db.get(Comment, comment_id)
    if not comment:
        raise HTTPException(status_code=404, detail="댓글을 찾을 수 없습니다.")
    db.delete(comment)
    db.commit()
