# BA/QA KPI Tracking Tool

A lightweight internal web application for Project Managers (PMs) to evaluate Business Analysts (BAs) and Quality Assurance (QAs) using a standardized 18-metric KPI framework. The system also provides a dashboard for Project Directors (PDs) to monitor overall performance across all projects.

## Features

- **Role-Based Access** - Self-select role (PM or PD) on landing screen
- **Project Management** - PD creates projects, PMs manage team members
- **18-Metric Evaluation Form** - Structured form grouped by 6 Key Result Areas (KRAs)
- **Inline Rubrics** - Percentage-based scoring guidelines for each metric
- **Automated Scoring** - Backend calculates weighted scores (0-4.0) and maps to performance ratings
- **Dashboard Visualization** - Radar chart showing KRA-wise performance breakdown
- **Filter & Search** - Filter dashboard by project and employee name
- **Toast Notifications** - User feedback for successful actions and errors

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Angular 17 + Bootstrap 5 |
| Backend | Spring Boot 4.0.3 + Java 21 |
| Database | MySQL |
| Charts | Chart.js with ng2-charts |

## Prerequisites

- Java Development Kit (JDK) 11 or higher
- Node.js and npm
- Angular CLI (`npm install -g @angular/cli`)
- MySQL Server

## Quick Start

### 1. Database Setup

Create the MySQL database:

```sql
CREATE DATABASE kpi_db;
```

Run the schema script from `database/schema.sql` or create tables manually:

```sql
CREATE TABLE projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE project_members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    member_name VARCHAR(255) NOT NULL,
    role ENUM('BA', 'QA') NOT NULL,
    FOREIGN KEY (project_id) REFERENCES projects(id)
);

CREATE TABLE evaluations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    member_id INT NOT NULL,
    evaluator_name VARCHAR(255) NOT NULL,
    final_score DECIMAL(3,2) NOT NULL,
    performance_rating VARCHAR(50) NOT NULL,
    evaluation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES project_members(id)
);

CREATE TABLE evaluation_details (
    id INT AUTO_INCREMENT PRIMARY KEY,
    evaluation_id INT NOT NULL,
    kra_name VARCHAR(100) NOT NULL,
    metric_name VARCHAR(255) NOT NULL,
    evidence_reviewed VARCHAR(255),
    percentage_score INT NOT NULL,
    evidence_remarks TEXT,
    FOREIGN KEY (evaluation_id) REFERENCES evaluations(id)
);
```

### 2. Backend Setup

```bash
cd backend
```

Configure database credentials in `src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/kpi_db
spring.datasource.username=root
spring.datasource.password=your_password
```

Run the backend:

```bash
mvn spring-boot:run
```

Backend runs at: http://localhost:8080/api

### 3. Frontend Setup

```bash
cd frontend
npm install
ng serve
```

Frontend runs at: http://localhost:4200

## KPI Framework

### Key Result Areas (KRAs) & Weights

| KRA | Weight | Metrics |
|-----|--------|---------|
| Lead Discovery | 20% | 4 |
| Team Building | 15% | 3 |
| Communication | 15% | 3 |
| Prioritization | 10% | 2 |
| Problem Solving | 20% | 3 |
| Process Efficiency | 20% | 3 |

### Scoring System

- PM enters percentage score (1-max weight) for each of 18 metrics
- Total percentage summed and divided by 25 = final score (0-4.0)
- Performance ratings:
  - 3.50 - 4.00: Outstanding
  - 3.00 - 3.49: Good
  - 2.00 - 2.99: Average
  - 1.00 - 1.99: Poor

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/projects | List all projects |
| POST | /api/projects | Create new project |
| GET | /api/projects/{id}/members | List members in project |
| POST | /api/projects/{id}/members | Add member to project |
| POST | /api/evaluations | Submit evaluation |
| GET | /api/dashboard/summary | Get global performance summary |
| GET | /api/dashboard/kra-scores/member/{id} | Get KRA-wise scores for radar chart |

## Project Structure

```
kpi-system/
├── .ai/                    # AI Memory Bank
├── backend/                # Spring Boot application
│   └── src/main/java/com/kpi/
│       ├── controller/     # REST Controllers
│       ├── service/        # Business Logic
│       ├── repository/     # Data Access
│       ├── model/          # Entity Classes
│       └── dto/            # Data Transfer Objects
├── frontend/              # Angular application
│   └── src/app/
│       ├── pages/          # Page components
│       ├── services/       # API services
│       └── models/         # TypeScript interfaces
└── database/              # SQL schema scripts
```

## User Flows

### Project Director (PD)
1. Enter as PD from landing screen
2. Create new projects
3. View global dashboard with filters
4. Analyze performance across all employees

### Project Manager (PM)
1. Enter as PM from landing screen
2. Select existing project
3. Add BA/QA team members
4. Fill out 18-metric evaluation form
5. Submit and view confirmation

## License

Internal use only.
