from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models.project import Project
from models.project_member import ProjectMember
from models.user import User
from schemas.project import ProjectCreate, ProjectResponse
from schemas.dashboard import ProjectMemberResponse
from auth.deps import get_current_user

router = APIRouter(prefix="/api", tags=["projects"])


@router.get("/projects", response_model=list[ProjectResponse])
def list_projects(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return db.query(Project).all()


@router.post("/projects", response_model=ProjectResponse, status_code=201)
def create_project(request: ProjectCreate, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    project = Project(project_name=request.project_name)
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


@router.delete("/projects/{project_id}", status_code=204)
def delete_project(project_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    db.delete(project)
    db.commit()


@router.get("/projects/{project_id}/members", response_model=list[ProjectMemberResponse])
def list_members(project_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return db.query(ProjectMember).filter(ProjectMember.project_id == project_id).all()


@router.post("/projects/{project_id}/members", response_model=ProjectMemberResponse, status_code=201)
def add_member(project_id: int, member: dict, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    if not db.query(Project).filter(Project.id == project_id).first():
        raise HTTPException(status_code=404, detail="Project not found")
    pm = ProjectMember(project_id=project_id, member_name=member.get("member_name", ""), role=member.get("role", "BA"))
    db.add(pm)
    db.commit()
    db.refresh(pm)
    return pm


@router.delete("/members/{member_id}", status_code=204)
def delete_member(member_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    member = db.query(ProjectMember).filter(ProjectMember.id == member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    db.delete(member)
    db.commit()


@router.get("/members", response_model=list[ProjectMemberResponse])
def list_all_members(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return db.query(ProjectMember).all()
