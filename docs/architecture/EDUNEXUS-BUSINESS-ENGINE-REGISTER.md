# EDUNEXUS Business Engine Register

## Canonical rule

The **18 Business Engines are the permanent EDUNEXUS product architecture**. They are not replaced by the technical control-plane modules.

- Business Engines answer **what EDUNEXUS does for education**.
- Cognitive/Governance modules answer **how EDUNEXUS reasons, governs, audits and automates**.
- Platform infrastructure answers **how EDUNEXUS runs securely and reliably**.
- Applications answer **how people interact with EDUNEXUS**.

## Engine register

| # | Engine | Status | Primary domain |
|---|---|---|---|
| 01 | Identity & Security | Foundation | Security |
| 02 | Consent & Data Sharing | Planned | Data Governance |
| 03 | Student 360 | Integrated | Academic |
| 04 | Education Continuity | Planned | Academic Operations |
| 05 | SPMB / Admission | Planned | Admissions |
| 06 | Student Safety | Integrated | Safety |
| 07 | Learning Ecosystem | In Progress | Learning |
| 08 | Learning Locker | Planned | Student Learning |
| 09 | Evidence & Provenance | Foundation | Data Governance |
| 10 | Teacher Professional | In Progress | People & Academic |
| 11 | Smart Classroom | Planned | Smart Campus |
| 12 | Digital Credential | Planned | Credentials |
| 13 | School Safety & Wellbeing | Planned | School Safety |
| 14 | Counseling | Planned | Counseling |
| 15 | HR | Planned | People Operations |
| 16 | Payroll | Planned | Finance & People |
| 17 | Finance | Planned | Finance |
| 18 | Procurement | Planned | Procurement |

## Architecture layers

### A. Business Engines
ENGINE 01–18.

### B. Cognitive & Governance Platform
AI Autonomy, AI Governance, Workflow & Approval, Data Governance, Knowledge Graph, Digital Twin, Event Bus, Self-Healing, Safety/Policy Engine, Audit & Provenance, Observability.

### C. Platform Infrastructure
Supabase/PostgreSQL, RLS, Auth, Edge Functions, AI Gateway, Storage, Vector, Notifications, APIs, deployment and recovery.

### D. Applications
School, Teacher, Parent, Student, Security, Counselor, HR, Finance, Procurement and Executive applications.

## Implementation rule

Every new feature must identify:
1. Business Engine owner.
2. Technical module dependencies.
3. Contract(s).
4. Data model.
5. Authorization/RLS boundary.
6. Workflow/approval requirements.
7. Audit/provenance requirements.
8. AI policy, if AI is involved.
9. UI/application surface.
10. Acceptance and regression tests.

## Current vertical slice

The D+7 pilot slice spans:

School -> Teacher -> Class -> Student -> Guardian -> Attendance -> Learning Evidence -> Teacher AI Assistant -> Student 360 -> Pickup Authorization -> Security Verification -> Audit -> Reports.

The remaining engines stay in the master register and are implemented progressively; they are not removed or renamed merely because the pilot does not yet implement them.
