# ReLiS Skills Index

## Quick Map (Task -> Skill)
| Task | Skill |
|---|---|
| Plan roadmap, slices, priorities | `relis-rewrite-orchestrator` |
| Convert legacy behavior to parity specs | `relis-domain-parity-mapper` |
| Implement slice end-to-end (DB/API/UI/tests) | `relis-pern-slice-implementer` |
| Security and release go/no-go review | `relis-migration-quality-gate` |
| Auth, roles, project isolation | `relis-auth-rbac-enforcer` |
| CSV/BibTeX import, dedupe, export stability | `relis-import-export-hardening` |
| Screening assignments/decisions/conflicts | `relis-screening-conflict-engine` |
| Extraction form schema/versioning/entries | `relis-extraction-form-versioning` |
| Deterministic fixtures and regression scenarios | `relis-test-fixture-harness` |
| Logging, metrics, rollout checks | `relis-release-observability` |

## Copy-Paste Prompt Templates
1. `Use relis-rewrite-orchestrator to generate rewrite-feature-matrix, slice plan, and risk register for next 2 weeks.`
2. `Use relis-domain-parity-mapper to produce parity spec for screening including states, transitions, role checks, and audit events.`
3. `Use relis-auth-rbac-enforcer to implement RBAC guards for /api/v1/projects/:projectId/* and add allow/deny tests for all 5 roles.`
4. `Use relis-pern-slice-implementer to implement the approved slice: project membership management with migrations, APIs, UI, and tests.`
5. `Use relis-import-export-hardening to implement deterministic dedupe (DOI -> title+year -> bibkey) and fixture-based import/export regression tests.`
6. `Use relis-screening-conflict-engine to implement assignment, reviewer decisions, conflict detection, and manager/validator resolution with audit trail.`
7. `Use relis-extraction-form-versioning to implement form schema v1 publish/lock and extraction entry submission with revision metadata.`
8. `Use relis-test-fixture-harness to create scenario fixtures covering project creation -> import -> screening -> extraction -> export.`
9. `Use relis-migration-quality-gate to run release gate on this diff and return verdict with sev1/sev2/sev3 findings and exact blockers.`
10. `Use relis-release-observability to add request-id logs, key workflow metrics, and release smoke checklist for staging cutover.`

## Recommended Execution Loop
1. Plan slice with `relis-rewrite-orchestrator`.
2. Lock behavior with `relis-domain-parity-mapper`.
3. Implement with `relis-pern-slice-implementer` + feature skill(s).
4. Add coverage with `relis-test-fixture-harness`.
5. Gate with `relis-migration-quality-gate`.
6. Prepare rollout with `relis-release-observability`.

