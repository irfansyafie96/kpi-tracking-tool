from decimal import Decimal
from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from database import get_db
from models.evaluation import Evaluation
from models.evaluation_detail import EvaluationDetail
from models.project_member import ProjectMember
from models.user import User
from schemas.dashboard import DashboardSummary, ProjectSummary, MemberSummary, MemberScore
from auth.deps import get_current_user

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/summary", response_model=DashboardSummary)
def global_summary(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    evals = db.query(Evaluation).all()
    if not evals:
        return DashboardSummary(total_evaluations=0, average_score=0, rating_breakdown={})
    total = sum(float(e.final_score) for e in evals)
    avg = round(total / len(evals), 2)
    breakdown: dict[str, int] = {}
    for e in evals:
        breakdown[e.performance_rating] = breakdown.get(e.performance_rating, 0) + 1
    return DashboardSummary(total_evaluations=len(evals), average_score=avg, rating_breakdown=breakdown)


@router.get("/project/{project_id}", response_model=ProjectSummary)
def project_summary(project_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    members = db.query(ProjectMember).filter(ProjectMember.project_id == project_id).all()
    scores: list[MemberScore] = []
    for m in members:
        evals = db.query(Evaluation).filter(Evaluation.member_id == m.id).all()
        if evals:
            latest = evals[-1]
            scores.append(MemberScore(member_id=m.id, member_name=m.member_name, role=m.role, latest_score=latest.final_score, latest_rating=latest.performance_rating))
    return ProjectSummary(project_id=project_id, members_evaluated=len(scores), member_scores=scores)


@router.get("/member/{member_id}", response_model=MemberSummary)
def member_summary(member_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    evals = db.query(Evaluation).filter(Evaluation.member_id == member_id).all()
    if not evals:
        return MemberSummary(member_id=member_id, total_evaluations=0)
    latest = evals[-1]
    eval_ids = [e.id for e in evals]
    rows = db.query(EvaluationDetail.kra_name, func.avg(EvaluationDetail.percentage_score)).filter(EvaluationDetail.evaluation_id.in_(eval_ids)).group_by(EvaluationDetail.kra_name).all()
    kra_scores = {r[0]: round(float(r[1]), 2) for r in rows}
    return MemberSummary(
        member_id=member_id, total_evaluations=len(evals),
        latest_score=latest.final_score, latest_rating=latest.performance_rating,
        latest_evaluation_date=latest.evaluation_date, kra_scores=kra_scores,
    )


@router.get("/kra-scores/member/{member_id}")
def kra_scores_by_member(member_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    evals = db.query(Evaluation).filter(Evaluation.member_id == member_id).all()
    if not evals:
        return {}
    eval_ids = [e.id for e in evals]
    rows = db.query(EvaluationDetail.kra_name, func.avg(EvaluationDetail.percentage_score)).filter(EvaluationDetail.evaluation_id.in_(eval_ids)).group_by(EvaluationDetail.kra_name).all()
    return {r[0]: round(float(r[1]), 2) for r in rows}


@router.get("/kra-scores/evaluation/{evaluation_id}")
def kra_scores_by_evaluation(evaluation_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    rows = db.query(EvaluationDetail.kra_name, func.avg(EvaluationDetail.percentage_score)).filter(EvaluationDetail.evaluation_id == evaluation_id).group_by(EvaluationDetail.kra_name).all()
    return {r[0]: round(float(r[1]), 2) for r in rows}
