---
name: relis-release-observability
description: Prepare ReLiS rewrite slices for release with operational telemetry, error handling standards, and rollout safety checks. Use when Claude Code implements logging, metrics, tracing basics, health checks, and release checklists for staging/production.
---

# ReLiS Release Observability

## Objective
Make every release diagnosable, reversible, and safe under real project workloads.

## Canonical Inputs
- slice implementation diff
- deployment environment config
- quality gate output

## Workflow
1. Logging standards
- structured logs with request IDs
- include actor, project, action, and result for critical workflows

2. Metrics and health
- API latency/error-rate metrics
- import and screening workflow counters
- readiness/liveness endpoints

3. Error contract
- consistent API error schema
- actionable error messages without sensitive leakage

4. Release checklist
- migration dry-run and rollback check
- smoke tests on staging
- verify dashboards/alerts before production cutover

5. Post-release verification
- monitor key success metrics for 24h
- confirm no spike in authz denials or workflow failures

## Required Outputs
- observability instrumentation changes
- release checklist document/runbook updates
- go/no-go summary with monitored signals

## Guardrails
- Never release schema changes without rollback plan.
- Never ship unstructured logs for core domain actions.
- Never ignore repeated 4xx/5xx anomalies post-release.

## Done Criteria
- On-call can trace any failed request via request ID.
- Core workflow metrics are visible and actionable.
- Release decision is documented with objective signals.
