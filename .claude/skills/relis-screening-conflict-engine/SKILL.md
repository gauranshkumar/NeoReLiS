---
name: relis-screening-conflict-engine
description: Implement ReLiS screening lifecycle, reviewer decisions, conflict detection, and resolution flows in TypeScript. Use when Claude Code builds phase setup, assignments, decision aggregation, conflict queues, and resolution audit trails.
---

# ReLiS Screening Conflict Engine

## Objective
Ship a traceable screening workflow with clear state transitions and conflict resolution authority.

## Canonical Inputs
- `docs/domain-map.md`
- `docs/role-permissions.md`
- screening parity spec in `docs/parity/screening.md` if available

## State Model
- `unassigned -> assigned -> in_review -> decided`
- disagreement branch: `decided -> conflict -> resolved`

## Workflow
1. Phase configuration
- define active phase and criteria
- enforce who can create/update phases

2. Assignment generation
- manual and round-robin options
- maintain assignment ownership and timestamps

3. Decision capture
- include/exclude/maybe + rationale
- prevent duplicate conflicting submissions by same reviewer

4. Conflict detection
- aggregate decisions by paper+phase
- raise conflict when configured disagreement rule is met

5. Resolution flow
- manager/validator/admin resolves with reason
- preserve original reviewer decisions immutably
- update final paper phase status

## Required Outputs
- state-transition guard functions
- assignment/decision/conflict APIs
- reviewer queue + conflict queue queries
- audit events for decision and resolution actions

## Test Requirements
- transition validation tests
- conflict detection integration tests
- unauthorized resolution denial tests

## Done Criteria
- Reviewer happy path works end-to-end.
- Conflict lifecycle is traceable from creation to resolution.
- Resolution authority is enforced by role.
