# Progress

## What Works

### Core Features (v4.0 - FastAPI + React)
- [x] JWT-based authentication with login page
- [x] Role-based access control (PM, PD, BA, QA)
- [x] Protected routes with role-based redirects
- [x] Project creation and management
- [x] BA/QA member management within projects
- [x] 18-metric evaluation form with KRA grouping
- [x] Percentage-based scoring with inline rubrics
- [x] Automated score calculation (0-4.0 scale)
- [x] Performance rating assignment
- [x] Dashboard with radar chart visualization
- [x] Filter dashboard by project and employee
- [x] KPI framework customization (PD admin)
- [x] User management (PD admin CRUD)
- [x] Employee profile self-view (BA/QA)
- [x] Seed data (2 users + 18 KPI metrics)
- [x] File upload infrastructure

### UI Enhancements
- [x] KRA Weight Distribution card on KPI Setup page showing all KRAs with full-width divider line

### API Endpoints
- [x] Auth: login, me
- [x] Project CRUD + members
- [x] KPI metrics CRUD + grouped + validate + status
- [x] Evaluation submission + details
- [x] Dashboard: summary, project/{id}, member/{id}, kra-scores
- [x] File uploads: upload, list, delete

### Database
- [x] Schema with 6 tables (users, projects, project_members, kpi_metrics, evaluations, evaluation_details)
- [x] Foreign key relationships
- [x] PostgreSQL local install on port 5432

### Development Environment
- [x] Python 3.12 with venv
- [x] React 19 + Vite frontend
- [x] FastAPI backend running on port 8001
- [x] Frontend proxies /api to backend
- [x] Tailwind CSS 4 with shadcn/ui-style components

## What's Left to Build

### High Priority
- [ ] Employee document uploads - upload work documents to profile
- [ ] Evaluator access to employee documents - download documents before evaluating
- [ ] Fix score calculation - only average when ALL dropdowns properly selected

### Medium Priority
- [ ] Project-based survey questions (timeline, communication)
- [ ] Historical trend analysis
- [ ] PDF/Excel export

### Low Priority
- [ ] Email notifications
- [ ] Performance optimization for large datasets
- [ ] Dark mode

## Current Status

**Phase:** v4.0 Complete - Feature Development  
**Last Updated:** 2026-04-16

### Verified Working
- Backend: FastAPI on port 8001
- Frontend: React + Vite on port 4200
- PostgreSQL local install on port 5432
- JWT authentication working
- All CRUD operations functional
- Radar chart visualization working
- Role-based routing working

### Default Users
| Email | Password | Role |
|-------|----------|------|
| admin@kpi.com | admin123 | PD |
| pm@kpi.com | pm123 | PM |

## Evolution of Project Decisions

| Version | Date | Key Change |
|---------|------|------------|
| v4.0 | 2026-04-15 | FastAPI + React rewrite with JWT auth |
| v3.0 | 2026-04-13 | Angular + Spring Boot multi-page routing |
| v2.0 | 2026-03-18 | KPI framework moved to database for customization |
| v1.1 | 2026-03-17 | Changed from 1-4 scoring to percentage-based |
| v1.0 | 2026-03-12 | Initial 4-table schema |

## Tech Stack History

- **v1.x** - Angular + Spring Boot + MySQL
- **v2.x** - Angular + Spring Boot + PostgreSQL
- **v3.x** - Angular + Spring Boot (multi-page routing)
- **v4.x** - React + FastAPI + PostgreSQL (current)