---
name: relis-rewrite-orchestrator
description: Orchestrate full ReLiS legacy-to-TypeScript rewrite planning and execution tracking. Use when Claude Code needs to decompose PHP/CodeIgniter ReLiS into PERN vertical slices, enforce parity coverage, plan weekly milestones, and prevent scope drift while moving fast.
---

# ReLiS Rewrite Orchestrator

## Objective
Drive end-to-end delivery of the ReLiS rewrite as a product rewrite (not line-by-line port) with strict parity accounting.

## Load Context First
Read these files before planning:
- `docs/context.md`
- `docs/domain-map.md`
- `docs/role-permissions.md`
- `docs/product-scope.md`
- `docs/relis-mvp-rebuild-plan.md`
- `docs/relis-16-week-execution-checklist.md`

If any file is missing, continue with available files and mark assumptions explicitly.

## Inputs Required
Collect or infer:
- Target stack confirmation: PostgreSQL, Express or Hono, React/Next, Node/Bun runtime.
- Delivery window (weeks/hours per week).
- MVP vs parity target by module.
- Non-functional priorities: security, performance, observability.

## Workflow
1. Build a feature-inventory matrix from legacy domains:
- Auth/RBAC
- Project workspace
- Import/dedupe
- Screening/conflicts
- QA
- Extraction/classification
- Reporting/export

2. For each feature, define:
- `parity_level`: `must-have`, `mvp-lite`, `defer`
- `risk_level`: `high`, `med`, `low`
- `owner_slice`: backend, frontend, db, integration
- `acceptance_test`: concrete user-visible behavior

3. Convert matrix into vertical slices that each include:
- DB schema changes + migration
- API endpoint(s)
- UI screens/actions
- audit/event logging
- tests (unit + integration + e2e smoke)

4. Produce a sprint/phase plan with strict WIP limits:
- Max 2 active slices at once
- No new slice before prior slice passes quality gate

5. Maintain a live status board in markdown:
- `todo`, `in_progress`, `blocked`, `done`
- explicit blockers and dependency links

## Required Outputs
Generate these artifacts when requested:
- `docs/rewrite-feature-matrix.md`
- `docs/rewrite-slice-plan.md`
- `docs/rewrite-risk-register.md`
- `docs/rewrite-decision-log.md`

## Output Contract
Every plan response must include:
1. Scope covered now
2. Assumptions
3. Deliverables
4. Acceptance criteria
5. What is intentionally deferred

## Fast-Execution Rules
- Prefer vertical slice completion over horizontal component completion.
- Prefer explicit typed contracts over dynamic behavior recreation.
- Preserve critical invariants (project isolation, auditability, conflict traceability).
- Reject ambiguous tickets; rewrite them into testable outcomes.

## Done Criteria
Mark slice done only if:
- Migration is applied and reversible.
- API contract is documented and tested.
- UI flow works with realistic seed data.
- Authorization checks are covered.
- Audit log events are emitted for sensitive actions.
