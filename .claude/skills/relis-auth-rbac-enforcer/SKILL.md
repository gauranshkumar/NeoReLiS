---
name: relis-auth-rbac-enforcer
description: Design and enforce authentication, authorization, and project isolation for ReLiS TypeScript APIs and UI flows. Use when Claude Code implements or reviews login/session flows, role checks, project-scoped access, and auditability for permission-sensitive actions.
---

# ReLiS Auth RBAC Enforcer

## Objective
Guarantee least-privilege access with strict `project_id` boundaries and auditable permission changes.

## Canonical Inputs
- `docs/role-permissions.md`
- `docs/product-scope.md`
- active endpoint definitions and route handlers

## Workflow
1. Define auth model
- session or JWT strategy
- token lifecycle and reset-ready model

2. Implement authorization model
- global roles vs project-scoped roles
- default deny policy
- route-level guard + service-level guard

3. Enforce isolation
- require `project_id` in all project-scoped reads/writes
- verify membership before domain action

4. Audit sensitive actions
- role/membership changes
- conflict resolution
- export initiation

5. Test matrix
- allow/deny tests for Admin, Manager, Reviewer, Validator, Viewer
- cross-project access denial tests

## Required Outputs
- RBAC middleware/guard implementation
- endpoint authorization map
- test cases proving deny-by-default and project isolation
- audit event list for permission-sensitive actions

## Non-Negotiable Rules
- Never rely on frontend for authorization.
- Never expose project data without membership check.
- Never allow self-escalation of roles.

## Done Criteria
- All permission-sensitive endpoints have allow/deny coverage.
- Cross-project leakage tests pass.
- Audit events emitted for role/membership mutations.
