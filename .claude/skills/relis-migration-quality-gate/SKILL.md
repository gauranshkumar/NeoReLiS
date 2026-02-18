---
name: relis-migration-quality-gate
description: Validate each ReLiS rewrite increment against parity, security, data integrity, and release readiness. Use when Claude Code must review PRs, run verification gates, and decide go/no-go for deploying TypeScript PERN rewrite slices.
---

# ReLiS Migration Quality Gate

## Objective
Prevent fast delivery from creating silent parity regressions, security gaps, or data integrity failures.

## Gate Inputs
- Slice spec: `docs/parity/<feature>.md`
- Implementation diff
- Test output
- Migration scripts
- Role/permission mapping

## Gate Workflow
1. Parity checks
- Confirm each required behavior from parity spec is implemented or intentionally deferred.
- Verify state transitions match spec.

2. Security checks
- Verify authn/authz on all write endpoints.
- Verify project boundary enforcement (`project_id`) in queries.
- Verify input validation and output sanitization.

3. Data checks
- Validate migration forward/rollback locally.
- Confirm no destructive mutation of historical decisions.
- Confirm audit entries on membership/role/conflict actions.

4. Reliability checks
- Confirm integration tests for key workflows.
- Confirm at least one negative-path test for unauthorized/invalid action.
- Confirm import/export flows do not break existing formats.

5. Release verdict
- `go`, `go_with_conditions`, or `no_go`
- list blocking issues with severity and file references

## Severity Model
- `sev1`: data leak, auth bypass, irreversible data corruption
- `sev2`: broken core workflow, incorrect transition logic
- `sev3`: UX defects, non-critical missing observability

## Required Output
Produce a concise release gate report with:
1. Verdict
2. Findings by severity
3. Missing tests
4. Deferred parity items
5. Exact next fixes required

## Review Discipline
- Prefer evidence from tests and code paths over assumptions.
- Never approve on "looks good" without parity cross-check.
- If uncertain, mark as `risk-unverified` and block release.

## Done Criteria
Gate is complete when verdict is explicit, traceable to evidence, and actionable for immediate next commit.
