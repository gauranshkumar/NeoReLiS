---
name: relis-pern-slice-implementer
description: Implement ReLiS rewrite vertical slices in full TypeScript PERN stack with strict contracts, migrations, tests, and UI integration. Use when Claude Code is actively coding backend/frontend/database changes for an approved slice.
---

# ReLiS PERN Slice Implementer

## Objective
Ship one production-ready vertical slice at a time across PostgreSQL + API + React UI.

## Prerequisites
Require an approved parity spec for the slice (`docs/parity/<feature>.md`).
If missing, stop implementation and create a minimal spec first.

## Slice Execution Checklist
1. Data model
- Define tables/relations with `project_id` boundaries.
- Add indexes for hot filters and joins.
- Write forward + rollback migrations.

2. Backend API (TypeScript)
- Define request/response schemas.
- Implement service layer with explicit domain transitions.
- Enforce RBAC middleware checks.
- Emit audit events for sensitive writes.

3. Frontend (TypeScript React/Next)
- Implement screens/forms with typed API client.
- Handle pending/error/empty states.
- Expose workflow state clearly (phase, assignment, conflict status).

4. Tests
- Unit: domain rules and transition guards.
- Integration: API + DB behavior.
- E2E smoke: critical happy path and one key negative path.

5. Operational readiness
- Seed realistic fixture data.
- Update env/config docs if needed.
- Add basic telemetry logs for key workflow actions.

## Required Output Format (for each implemented slice)
Return:
1. Files changed
2. Migration summary
3. Endpoints added/changed
4. UI routes/components added
5. Tests added and execution results
6. Remaining known gaps

## Engineering Rules
- Do not bypass types with `any` unless justified and tracked.
- Do not merge API and domain logic into controllers/routes.
- Do not ship endpoints without schema validation.
- Do not leave RBAC checks to frontend only.
- Do not introduce cross-project query paths.

## Done Criteria
A slice is done only if:
- All tests for the slice pass.
- Main user flow works end-to-end.
- Security checks are present and tested.
- Audit trail exists for sensitive operations.
- Parity checklist items are marked complete or explicitly deferred.
