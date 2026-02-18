---
name: relis-test-fixture-harness
description: Build deterministic test fixtures and end-to-end scenario harnesses for ReLiS rewrite. Use when Claude Code needs reliable seed data, parity regression tests, and high-signal integration/e2e suites for rapid iteration.
---

# ReLiS Test Fixture Harness

## Objective
Create stable, repeatable test data and scenario coverage to accelerate safe delivery.

## Canonical Inputs
- `docs/domain-map.md`
- `docs/role-permissions.md`
- current DB schema and API contracts

## Workflow
1. Fixture design
- minimal fixtures for unit tests
- scenario fixtures for integration/e2e
- seeded users across all roles and at least two projects

2. Scenario packs
- project creation + membership
- import + dedupe
- screening + conflict + resolution
- extraction entry + export

3. Test utilities
- data factory helpers
- auth token/session helpers
- cleanup/reset utilities

4. Regression hooks
- snapshot expected counters and statuses
- gate on parity-critical flows

## Required Outputs
- fixture files and factories
- integration and e2e smoke suites
- test docs describing scenario intent and expected outcomes

## Quality Rules
- Deterministic seeds only.
- Avoid flaky time-based assertions without clock control.
- Keep fixtures small but semantically rich.

## Done Criteria
- One command runs core regression suite locally.
- Failures clearly identify broken domain rule or permission path.
- CI can run fixtures in isolated environments.
