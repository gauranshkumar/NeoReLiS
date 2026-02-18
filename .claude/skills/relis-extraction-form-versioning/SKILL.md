---
name: relis-extraction-form-versioning
description: Build typed extraction/classification form schemas with versioning and entry workflows for ReLiS. Use when Claude Code implements manager form design, publish/lock semantics, reviewer submissions, revisions, and validation rules.
---

# ReLiS Extraction Form Versioning

## Objective
Support controlled evolution of extraction schemas while preserving historical entry integrity.

## Canonical Inputs
- `docs/domain-map.md`
- `docs/product-scope.md`
- extraction parity spec in `docs/parity/extraction.md` if available

## Workflow
1. Schema model
- support MVP field types: text/select/multi-select/number/boolean/date
- include required/optional, defaults, and validation constraints

2. Version lifecycle
- draft -> published -> locked
- allow new version creation without mutating locked versions

3. Entry workflow
- only included papers can receive extraction entries
- draft save, submit, validate states
- revision metadata for post-validation edits

4. Validation
- type-safe payload validation
- field-level error reporting

5. Traceability
- record who changed schema and when
- record who submitted/validated entry and when

## Required Outputs
- schema and entry domain models
- form publish/lock APIs
- entry submit/revise APIs
- UI forms bound to typed schema
- tests for version integrity and validation

## Guardrails
- Never mutate previously published schema versions in place.
- Never drop historical entry records on schema upgrades.
- Never allow extraction on excluded papers.

## Done Criteria
- Manager can publish a form version.
- Reviewer can complete entry for included paper.
- Historical entries remain readable after new schema version release.
