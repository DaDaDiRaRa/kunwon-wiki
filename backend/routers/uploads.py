import uuid
import re
from pathlib import Path
from fastapi import APIRouter, File, UploadFile, HTTPException

UPLOAD_DIR = Path("./data/uploads")
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

router = APIRouter(prefix="/api/uploads", tags=["uploads"])


def _safe_filename(original: str) -> str:
    """원본 파일명에서 확장자를 분리하고, uuid 접두사를 붙인 안전한 파일명 반환"""
    original_path = Path(original)
    ext = original_path.suffix.lower()
    # 영숫자·하이픈·밑줄·점 외 문자는 밑줄로 치환
    stem = re.sub(r"[^\w\-.]", "_", original_path.stem)
    return f"{uuid.uuid4().hex}_{stem}{ext}"


@router.post("/image")
async def upload_image(file: UploadFile = File(...)):
    """이미지 파일 업로드 — 저장 후 URL 반환"""
    ext = Path(file.filename or "").suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="허용되지 않는 파일 형식입니다. (jpg, jpeg, png, gif, webp만 가능)",
        )

    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="파일 크기는 10MB를 초과할 수 없습니다.")

    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    filename = _safe_filename(file.filename or f"image{ext}")
    (UPLOAD_DIR / filename).write_bytes(contents)

    return {"url": f"/uploads/{filename}"}
