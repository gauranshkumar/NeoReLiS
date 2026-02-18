---
name: relis-import-export-hardening
description: Build and verify deterministic paper import/export behavior for ReLiS rewrite. Use when Claude Code implements CSV/BibTeX ingestion, normalization, dedupe heuristics, import job reporting, and CSV/BibTeX export parity checks.
---

# ReLiS Import Export Hardening

## Objective
Deliver reliable ingestion and export pipelines with reproducible counts and transparent error reporting.

## Canonical Inputs
- `docs/product-scope.md`
- `docs/domain-map.md`
- import fixtures (CSV/BibTeX)
- dedupe policy: DOI, then title+year, then bibkey fallback

## Workflow
1. Import pipeline
- parse file
- normalize fields
- validate row-level constraints
- persist import job + row statuses

2. Dedupe engine
- deterministic key strategy and priority order
- track duplicate reason per dropped/merged record

3. Error reporting
- include row number, field, and reason
- provide actionable fix guidance in summary

4. Export pipeline
- CSV (all/included/excluded)
- included BibTeX
- stable schema and escaping rules

5. Verification
- golden fixture tests for import counts
- regression tests for dedupe behavior
- round-trip sanity test (import -> export -> reimport summary)

## Required Outputs
- parser and normalization modules
- dedupe service with test fixtures
- import summary API contract
- export generator modules + compatibility tests

## Quality Bar
- Same input file yields same result every run.
- Duplicate decisions are explainable and logged.
- Export format remains stable across releases.

## Done Criteria
- Import success/error counts are deterministic on fixtures.
- Dedupe tests cover DOI/title-year/bibkey branches.
- CSV/BibTeX exports validate against expected snapshots.
