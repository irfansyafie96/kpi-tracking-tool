import json
from passlib.context import CryptContext

from database import engine, SessionLocal
from models import Base, User, KpiMetric
from models.user import UserRole

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

KPI_SEED = [
    ("Lead Discovery", 20, "% of requirements ready before dev starts", "BRD / FSD", 5, '{"1":"1% - Less than 20% requirements ready","2":"2% - 20-40% requirements ready","3":"3% - 41-60% requirements ready","4":"4% - 61-80% requirements ready","5":"5% - 81-100% requirements ready"}', False, 1),
    ("Lead Discovery", 20, "% of test scenarios identified before QA phase", "Test Script", 5, '{"1":"1% - Less than 20% identified","2":"2% - 20-40% identified","3":"3% - 41-60% identified","4":"4% - 61-80% identified","5":"5% - 81-100% identified"}', False, 2),
    ("Lead Discovery", 20, "Early risk logs", "Risk register / Redmine", 5, '{"1":"1% - No risk logs","2":"2% - Minimal risk logs","3":"3% - Adequate risk logs","4":"4% - Good risk logs","5":"5% - Comprehensive risk logs"}', False, 3),
    ("Lead Discovery", 20, "Stakeholder clarity feedback", "Stakeholder survey form", 5, '{"1":"1% - Very unclear","2":"2% - Somewhat unclear","3":"3% - Neutral","4":"4% - Mostly clear","5":"5% - Very clear"}', False, 4),
    ("Team Building", 15, "Collaboration with BA/dev", "Feedback from team", 5, '{"1":"1% - Poor collaboration","2":"2% - Below average","3":"3% - Average","4":"4% - Good","5":"5% - Excellent"}', False, 5),
    ("Team Building", 15, "Mentorship provided", "Evaluation Form", 5, '{"1":"1% - No mentorship","2":"2% - Minimal","3":"3% - Adequate","4":"4% - Good","5":"5% - Excellent"}', False, 6),
    ("Team Building", 15, "Support during crunch periods", "Based on observation", 5, '{"1":"1% - No support","2":"2% - Minimal","3":"3% - Some support","4":"4% - Good support","5":"5% - Exceptional"}', False, 7),
    ("Communication", 15, "Rework due to unclear requirements", "Defect re-open rate (ticket)", 5, '{"1":"1% - High rework","2":"2% - Moderate rework","3":"3% - Average rework","4":"4% - Low rework","5":"5% - Minimal rework"}', False, 8),
    ("Communication", 15, "Defect clarity", "Email/Redmine timestamps", 5, '{"1":"1% - Very unclear","2":"2% - Somewhat unclear","3":"3% - Adequate","4":"4% - Clear","5":"5% - Very clear"}', False, 9),
    ("Communication", 15, "Response time to questions", "Feedback from team", 5, '{"1":"1% - Very slow","2":"2% - Slow","3":"3% - Average","4":"4% - Fast","5":"5% - Very fast"}', False, 10),
    ("Prioritization", 10, "Risk-based prioritization", "SLA / Redmine priority", 5, '{"1":"1% - No prioritization","2":"2% - Poor","3":"3% - Average","4":"4% - Good","5":"5% - Excellent"}', False, 11),
    ("Prioritization", 10, "Handling scope changes", "CR Form / Redmine", 5, '{"1":"1% - Poor handling","2":"2% - Below average","3":"3% - Average","4":"4% - Good","5":"5% - Excellent"}', False, 12),
    ("Problem Solving", 20, "Escalation frequency", "Ticket / Redmine", 7, '{"1":"1% - Frequent escalations","2":"2% - Many escalations","3":"3% - Some escalations","4":"4% - Few escalations","5":"5% - Rare escalations","6":"6% - Minimal","7":"7% - None"}', False, 13),
    ("Problem Solving", 20, "Time taken to resolve blockers", "Escalation logs", 7, '{"1":"1% - Very slow","2":"2% - Slow","3":"3% - Average","4":"4% - Fast","5":"5% - Very fast","6":"6% - Quick","7":"7% - Immediate"}', False, 14),
    ("Problem Solving", 20, "Ability to negotiate requirement conflicts", "Meeting notes / Emails", 6, '{"1":"1% - Poor","2":"2% - Below average","3":"3% - Average","4":"4% - Good","5":"5% - Very good","6":"6% - Excellent"}', False, 15),
    ("Process Efficiency", 20, "Rework rate", "Ticket / Redmine", 7, '{"1":"1% - Very high","2":"2% - High","3":"3% - Moderate","4":"4% - Low","5":"5% - Very low","6":"6% - Minimal","7":"7% - None"}', False, 16),
    ("Process Efficiency", 20, "On-time documentation", "Documentation logs", 7, '{"1":"1% - Very late","2":"2% - Late","3":"3% - Sometimes late","4":"4% - Usually on time","5":"5% - On time","6":"6% - Early","7":"7% - Always early"}', False, 17),
    ("Process Efficiency", 20, "Test deliverable timeline", "QA cycle delays", 6, '{"1":"1% - Very delayed","2":"2% - Delayed","3":"3% - Sometimes delayed","4":"4% - Usually on time","5":"5% - On time","6":"6% - Ahead of schedule"}', False, 18),
]


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if db.query(User).count() == 0:
            users = [
                User(email="admin@kpi.com", password_hash=pwd_context.hash("admin123"), name="Admin User", role=UserRole.PD),
                User(email="pm@kpi.com", password_hash=pwd_context.hash("pm123"), name="Project Manager", role=UserRole.PM),
            ]
            db.add_all(users)
            db.commit()
            print("Seeded default users.")

        if db.query(KpiMetric).count() == 0:
            for kra_name, kra_weight, metric_name, evidence, metric_weight, rubric, req_file, order in KPI_SEED:
                db.add(KpiMetric(kra_name=kra_name, kra_weight=kra_weight, metric_name=metric_name, evidence=evidence, metric_weight=metric_weight, rubric_json=rubric, requires_file=req_file, display_order=order))
            db.commit()
            print("Seeded 18 KPI metrics.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
