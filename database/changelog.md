# Database Changelog

## Version 1.1 (2026-03-17)

### Schema Change

Changed `score_given` to `percentage_score` to support percentage-based scoring:

```sql
ALTER TABLE evaluation_details 
CHANGE COLUMN score_given percentage_score INT NOT NULL;
```

### Reason
- PM now enters percentage (1-max weight) instead of 1-4 score
- Total percentages are summed and divided by 25 to get final 0-4.0 score

### Backend Changes
- `EvaluationDetail.java`: Renamed `scoreGiven` → `percentageScore`
- `EvaluationService.java`: Simplified calculation logic
- `EvaluationDetailRepository.java`: Added KRA aggregation queries
- `EvaluationDetailService.java`: Added KRA score methods
- `DashboardController.java`: Added KRA-score endpoints

### Frontend Changes
- `kpi-data.ts`: Updated rubrics to show percentage ranges
- `pm-evaluation.component.ts/html`: Changed radio buttons to number input

---

## Version 1.0 (2026-03-12)

### Initial Schema

Created 4 tables:

| Table | Description |
|-------|-------------|
| `projects` | Stores project names |
| `project_members` | BA/QA team members linked to projects |
| `evaluations` | Main evaluation records with scores |
| `evaluation_details` | 18 metric answers per evaluation |

### Notes
- Used `utf8mb4` charset for Unicode support
- Added `ON DELETE CASCADE` for referential integrity
- Added indexes on foreign keys for query performance

---

## Future Migrations (To Be Added Later)

When schema changes are needed, use Flyway or Liquibase:

### Flyway (Recommended)
```
database/migrations/
├── V1__initial_schema.sql
├── V2__add_column.sql
└── ...
```

### Liquibase (Alternative)
```
database/changelog/
├── changelog.xml
├── changesets/
│   ├── V1__initial_schema.xml
│   └── ...
```

---

## How to Update Schema

1. **Make a copy** of current `schema.sql` → `schema_vX.sql`
2. **Modify** `schema.sql` with new changes
3. **Update** `changelog.md` with description of changes

Example:
```
cp database/schema.sql database/schema_v1.sql
# Edit database/schema.sql
# Update changelog.md
```
