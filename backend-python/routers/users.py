from fastapi import APIRouter, Depends, HTTPException, status
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from database import get_db
from models.user import User, UserRole
from schemas.user import UserCreate, UserUpdate
from schemas.auth import UserResponse
from auth.deps import get_current_user, require_role

router = APIRouter(prefix="/api/users", tags=["users"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


@router.get("", response_model=list[UserResponse])
def list_users(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    users = db.query(User).all()
    return [UserResponse(id=u.id, email=u.email, name=u.name, role=u.role.value, created_at=u.created_at) for u in users]


@router.get("/{user_id}", response_model=UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserResponse(id=user.id, email=user.email, name=user.name, role=user.role.value, created_at=user.created_at)


@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(request: UserCreate, db: Session = Depends(get_db), _: User = Depends(require_role("PD"))):
    if db.query(User).filter(User.email == request.email).first():
        raise HTTPException(status_code=400, detail="Email already exists")
    try:
        role = UserRole(request.role)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid role")
    user = User(email=request.email, password_hash=pwd_context.hash(request.password), name=request.name, role=role)
    db.add(user)
    db.commit()
    db.refresh(user)
    return UserResponse(id=user.id, email=user.email, name=user.name, role=user.role.value, created_at=user.created_at)


@router.put("/{user_id}", response_model=UserResponse)
def update_user(user_id: int, request: UserUpdate, db: Session = Depends(get_db), _: User = Depends(require_role("PD"))):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if request.name:
        user.name = request.name
    if request.role:
        try:
            user.role = UserRole(request.role)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid role")
    if request.password:
        user.password_hash = pwd_context.hash(request.password)
    db.commit()
    db.refresh(user)
    return UserResponse(id=user.id, email=user.email, name=user.name, role=user.role.value, created_at=user.created_at)


@router.delete("/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db), _: User = Depends(require_role("PD"))):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()
    return {"message": "User deleted successfully"}
