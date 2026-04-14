from collections import OrderedDict
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from database import get_db
from models.kpi_metric import KpiMetric
from models.user import User
from schemas.kpi_metric import KpiMetricCreate, KpiMetricResponse, KpiGroup
from auth.deps import get_current_user, require_role

router = APIRouter(prefix="/api/kpi-metrics", tags=["kpi-metrics"])


@router.get("", response_model=list[KpiMetricResponse])
def list_metrics(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return db.query(KpiMetric).order_by(KpiMetric.display_order).all()


@router.get("/grouped")
def get_grouped(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    metrics = db.query(KpiMetric).order_by(KpiMetric.display_order).all()
    groups: dict[str, dict] = OrderedDict()
    kra_order = ["Lead Discovery", "Team Building", "Communication", "Prioritization", "Problem Solving", "Process Efficiency"]
    for m in metrics:
        if m.kra_name not in groups:
            groups[m.kra_name] = {"kra_weight": m.kra_weight, "metrics": []}
        groups[m.kra_name]["metrics"].append(KpiMetricResponse.model_validate(m).model_dump())
    sorted_groups = OrderedDict()
    for kra in kra_order:
        if kra in groups:
            sorted_groups[kra] = groups[kra]
    for kra, data in groups.items():
        if kra not in sorted_groups:
            sorted_groups[kra] = data
    return dict(sorted_groups)


@router.get("/status")
def get_status(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    count = db.query(KpiMetric).count()
    return {"has_data": count > 0, "count": count}


@router.get("/validate")
def validate_weights(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    kra_rows = db.query(KpiMetric.kra_name, KpiMetric.kra_weight).distinct().all()
    total_kra = sum(r[1] for r in kra_rows)
    total_metric = db.query(func.sum(KpiMetric.metric_weight)).scalar() or 0
    if total_kra != 100:
        return {"valid": False, "message": f"Total KRA weight must be 100%. Current: {total_kra}%"}
    if total_metric != 100:
        return {"valid": False, "message": f"Total metric weight must be 100%. Current: {total_metric}%"}
    return {"valid": True, "message": "All weights are valid (total = 100%)"}


@router.get("/{metric_id}", response_model=KpiMetricResponse)
def get_metric(metric_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    m = db.query(KpiMetric).filter(KpiMetric.id == metric_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Metric not found")
    return m


@router.post("", response_model=KpiMetricResponse, status_code=201)
def create_metric(data: KpiMetricCreate, db: Session = Depends(get_db), _: User = Depends(require_role("PD"))):
    m = KpiMetric(**data.model_dump())
    db.add(m)
    db.commit()
    db.refresh(m)
    return m


@router.put("/{metric_id}", response_model=KpiMetricResponse)
def update_metric(metric_id: int, data: KpiMetricCreate, db: Session = Depends(get_db), _: User = Depends(require_role("PD"))):
    m = db.query(KpiMetric).filter(KpiMetric.id == metric_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Metric not found")
    for key, value in data.model_dump().items():
        setattr(m, key, value)
    db.commit()
    db.refresh(m)
    return m


@router.delete("/{metric_id}", status_code=204)
def delete_metric(metric_id: int, db: Session = Depends(get_db), _: User = Depends(require_role("PD"))):
    m = db.query(KpiMetric).filter(KpiMetric.id == metric_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Metric not found")
    db.delete(m)
    db.commit()
