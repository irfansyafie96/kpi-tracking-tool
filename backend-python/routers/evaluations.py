from decimal import Decimal, ROUND_HALF_UP
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models.evaluation import Evaluation
from models.evaluation_detail import EvaluationDetail
from models.user import User
from schemas.evaluation import EvaluationSubmit, EvaluationResponse, EvaluationDetailResponse
from auth.deps import get_current_user

router = APIRouter(prefix="/api/evaluations", tags=["evaluations"])


@router.post("", response_model=EvaluationResponse, status_code=201)
def submit_evaluation(request: EvaluationSubmit, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    total_pct = sum(d.percentage_score for d in request.details)
    final_score = Decimal(str(total_pct)).divide(Decimal("25"), 2, rounding=ROUND_HALF_UP)
    value = float(final_score)
    if value >= 3.50:
        rating = "Outstanding"
    elif value >= 3.00:
        rating = "Good"
    elif value >= 2.00:
        rating = "Average"
    else:
        rating = "Poor"

    evaluation = Evaluation(member_id=request.member_id, evaluator_name=request.evaluator_name, final_score=final_score, performance_rating=rating)
    db.add(evaluation)
    db.commit()
    db.refresh(evaluation)

    for d in request.details:
        detail = EvaluationDetail(
            evaluation_id=evaluation.id, metric_id=d.metric_id, kra_name=d.kra_name,
            metric_name=d.metric_name, evidence_reviewed=d.evidence_reviewed,
            percentage_score=d.percentage_score, evidence_remarks=d.evidence_remarks,
            file_path=d.file_path,
        )
        db.add(detail)
    db.commit()
    return evaluation


@router.get("", response_model=list[EvaluationResponse])
def list_evaluations(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return db.query(Evaluation).all()


@router.get("/member/{member_id}", response_model=list[EvaluationResponse])
def list_by_member(member_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return db.query(Evaluation).filter(Evaluation.member_id == member_id).all()


@router.get("/{evaluation_id}", response_model=EvaluationResponse)
def get_evaluation(evaluation_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    ev = db.query(Evaluation).filter(Evaluation.id == evaluation_id).first()
    if not ev:
        raise HTTPException(status_code=404, detail="Evaluation not found")
    return ev


@router.get("/{evaluation_id}/details", response_model=list[EvaluationDetailResponse])
def get_details(evaluation_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return db.query(EvaluationDetail).filter(EvaluationDetail.evaluation_id == evaluation_id).all()
