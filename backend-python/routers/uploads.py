import os
import random
import re

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from config import settings
from database import get_db
from models.user import User
from auth.deps import get_current_user

router = APIRouter(prefix="/api/uploads", tags=["uploads"])


@router.post("")
async def upload_file(file: UploadFile = File(...), _: User = Depends(get_current_user)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file selected")

    contents = await file.read()
    if len(contents) > settings.UPLOAD_MAX_SIZE_MB * 1024 * 1024:
        raise HTTPException(status_code=400, detail=f"File size exceeds {settings.UPLOAD_MAX_SIZE_MB}MB")

    upload_dir = settings.UPLOAD_DIR
    os.makedirs(upload_dir, exist_ok=True)

    ext = os.path.splitext(file.filename)[1] if file.filename else ""
    unique_name = f"{int(__import__('time').time())}_{random.randint(0, 9999)}{ext}"
    filepath = os.path.join(upload_dir, unique_name)

    with open(filepath, "wb") as f:
        f.write(contents)

    return {"filename": unique_name, "original_filename": file.filename, "file_path": f"/uploads/{unique_name}", "file_size": len(contents), "content_type": file.content_type}


@router.get("")
def list_files(_: User = Depends(get_current_user)):
    upload_dir = settings.UPLOAD_DIR
    if not os.path.exists(upload_dir):
        return {"files": []}
    files = []
    for name in os.listdir(upload_dir):
        path = os.path.join(upload_dir, name)
        if os.path.isfile(path):
            files.append({"filename": name, "file_path": f"/uploads/{name}", "file_size": os.path.getsize(path), "last_modified": os.path.getmtime(path)})
    return {"files": files}


@router.delete("/{filename}")
def delete_file(filename: str, _: User = Depends(get_current_user)):
    if not re.match(r"^[a-zA-Z0-9._-]+$", filename):
        raise HTTPException(status_code=400, detail="Invalid filename")
    filepath = os.path.join(settings.UPLOAD_DIR, filename)
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="File not found")
    os.remove(filepath)
    return {"message": "File deleted successfully"}
