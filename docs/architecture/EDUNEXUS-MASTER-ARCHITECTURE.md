# EDUNEXUS Master Architecture

## Four-layer model

```
EDUNEXUS
|
+-- A. BUSINESS ENGINES
|   +-- ENGINE 01 Identity & Security
|   +-- ENGINE 02 Consent & Data Sharing
|   +-- ENGINE 03 Student 360
|   +-- ENGINE 04 Education Continuity
|   +-- ENGINE 05 SPMB / Admission
|   +-- ENGINE 06 Student Safety
|   +-- ENGINE 07 Learning Ecosystem
|   +-- ENGINE 08 Learning Locker
|   +-- ENGINE 09 Evidence & Provenance
|   +-- ENGINE 10 Teacher Professional
|   +-- ENGINE 11 Smart Classroom
|   +-- ENGINE 12 Digital Credential
|   +-- ENGINE 13 School Safety & Wellbeing
|   +-- ENGINE 14 Counseling
|   +-- ENGINE 15 HR
|   +-- ENGINE 16 Payroll
|   +-- ENGINE 17 Finance
|   +-- ENGINE 18 Procurement
|
+-- B. COGNITIVE & GOVERNANCE PLATFORM
|   +-- Orchestration / AI Autonomy
|   +-- AI Governance
|   +-- Workflow & Approval
|   +-- Data Governance
|   +-- Knowledge Graph
|   +-- Digital Twin / World Model
|   +-- Event Bus
|   +-- Self-Healing
|   +-- Safety / Policy Engine
|   +-- Audit / Provenance
|   +-- Observability
|
+-- C. PLATFORM INFRASTRUCTURE
|   +-- Supabase / PostgreSQL
|   +-- Auth / RLS
|   +-- Edge Functions
|   +-- AI Gateway
|   +-- Storage / Vector
|   +-- Notification / API
|   +-- Deployment / Recovery
|
+-- D. APPLICATIONS
    +-- School
    +-- Teacher
    +-- Parent
    +-- Student
    +-- Security
    +-- Counselor
    +-- HR
    +-- Finance
    +-- Procurement
    +-- Executive
```

## Design invariant

The 18 business engines are the canonical product map. Technical modules may be shared by many engines and must not be promoted to substitute business engines.

## Governance invariant

High-impact AI and safety actions remain fail-closed and human-governed. Technical autonomy never overrides business authorization.

## Data invariant

Tenant isolation and RLS remain the database boundary. No engine may introduce a cross-tenant data path that bypasses authorization.

## Evolution invariant

New technology can be introduced underneath the business engines without renumbering or deleting the business engine register. Business capabilities can evolve while preserving stable engine contracts.
