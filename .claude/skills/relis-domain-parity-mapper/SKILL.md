---
name: relis-domain-parity-mapper
description: Extract and codify ReLiS legacy behavior into a TypeScript-ready domain spec. Use when Claude Code must analyze PHP controllers/models/config-driven logic, map states/invariants, and produce parity specs that engineering can implement safely.
---

# ReLiS Domain Parity Mapper

## Objective
Translate legacy behavior into explicit, testable domain contracts before implementation.

## Primary Sources
Prioritize:
- `docs/context.md`
- `docs/domain-map.md`
- `docs/role-permissions.md`
- `docs/product-scope.md`
Then inspect legacy code paths in `relis_app/controllers`, `relis_app/models`, `relis_app/libraries`, `relis_app/helpers` when available.

## Extraction Method
1. Pick one bounded context (for example Screening).
2. Identify entities, states, transitions, side effects.
3. Capture role-based permissions per action.
4. Capture data invariants and forbidden transitions.
5. Capture external dependencies (BibTeX parser, export formats, etc.).

## Spec Template
For each feature produce:
- `Feature`
- `User roles`
- `Preconditions`
- `State machine`
- `Commands` (write actions)
- `Queries` (read actions)
- `Validation rules`
- `Audit events`
- `Failure modes`
- `Parity tests`

## Required Outputs
Create or update:
- `docs/parity/<feature>.md`
- `docs/parity/open-questions.md`
- `docs/parity/parity-gaps.md`

## Output Quality Bar
- No vague language like "handle conflicts somehow".
- Every transition must include actor + condition + resulting state.
- Every write action must list required authorization check.
- Every important business action must define at least one audit event.

## Conflict Resolution Rules
When legacy behavior is unclear:
1. Mark as `unknown-legacy`.
2. Propose `mvp-policy` behavior.
3. Add a parity-risk note.
4. Continue; do not block entire rewrite.

## Done Criteria
A feature parity spec is complete when:
- A backend engineer can implement it without reading legacy PHP.
- A QA engineer can derive tests directly from the spec.
- Unknowns are isolated and tracked, not hidden.
