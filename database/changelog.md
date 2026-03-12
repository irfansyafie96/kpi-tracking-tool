# Database Changelog

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
