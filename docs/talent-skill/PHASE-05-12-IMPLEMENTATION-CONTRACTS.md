# Phase 05–12 Implementation Contracts

## Phase 05 — Persistence + Tenant/RLS
All learner, evidence, pathway, provider, mentor, school and parent records are tenant-owned. Authorization must be enforced server/database-side. Browser metadata is never an authority source. Every exposed table requires RLS and explicit membership/ownership predicates.

A real database migration is intentionally not executed in this change because the connected Supabase account is unavailable. The TypeScript contracts in `packages/types/talent-persistence.ts` are the source contract for the eventual SQL migration.

## Phase 06 — Skill Passport & Evidence
Evidence lifecycle: Draft → Submitted → AI Assisted (optional) → Human Review → Verified/Returned. AI-assisted evidence is never equivalent to verified competency. Historical entries remain immutable by version.

## Phase 07 — Provider/Mentor
Provider programs map to competency IDs. Mentor assignments are scoped to organization and learner. Mentor verification records preserve reviewer, rubric version, timestamp and evidence provenance.

## Phase 08 — AI + Live Performance
Adapters: Zoom, Google Meet, Microsoft Teams and native WebRTC. Allowed observations are task-relevant and observable. Forbidden inference includes emotion, mental health, personality, character, intelligence, protected traits and beauty/appearance scoring. Raw media retention is off by default. High-impact decisions require human review.

## Phase 09 — Parent/School
Parent access is consent- and scope-based; it is not unrestricted access to sensitive mentor notes. School access is organization/class scoped. Revocation must be auditable.

## Phase 10 — Security & AI Governance
Required controls: tenant isolation, RLS, least privilege, secure file access, audit events, rate limiting, backup/restore, consent lifecycle, retention/deletion, AI use-case registry, model/policy versioning, incident records and human override.

## Phase 11 — Pilot Acceptance
Minimum scenarios: goal creation, baseline/pathway, mentor review, evidence verification, parent visibility, provider evidence, safe AI feedback, live observation, prohibited inference rejection, cross-tenant denial, consent revocation, historical evidence integrity.

## Phase 12 — Production Readiness
Production gate blocks release on critical auth/RLS/consent/retention/secrets/AI-safety failures. Deployment order: build → contract tests → security tests → staging → smoke → pilot → controlled production → post-release verification.

## Non-negotiable
No AI observation becomes a consequential learner judgment without an appropriate human review path.
