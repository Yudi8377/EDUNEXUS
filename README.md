# EDUNEXUS

**Autonomous, Cognitive and Evolvable Education Operating System**

EDUNEXUS is a secure, multi-tenant education operating system designed around human-governed autonomy, student safety, workflow orchestration, AI agents, provenance, knowledge graphs, digital twins, and evolvable platform engineering.

## Canonical product architecture

EDUNEXUS has **18 permanent Business Engines**:

1. Identity & Security
2. Consent & Data Sharing
3. Student 360
4. Education Continuity
5. SPMB / Admission
6. Student Safety
7. Learning Ecosystem
8. Learning Locker
9. Evidence & Provenance
10. Teacher Professional
11. Smart Classroom
12. Digital Credential
13. School Safety & Wellbeing
14. Counseling
15. HR
16. Payroll
17. Finance
18. Procurement

These 18 engines are the canonical product/business map. They are **not replaced** by the technical control-plane modules.

### Four-layer architecture

- **Business Engines:** ENGINE 01–18; the education capabilities EDUNEXUS delivers.
- **Cognitive & Governance Platform:** orchestration, AI autonomy/governance, workflow/approval, data governance, knowledge graph, digital twin/world model, event bus, self-healing, safety/policy, audit/provenance and observability.
- **Platform Infrastructure:** Supabase/PostgreSQL, Auth/RLS, Edge Functions, AI Gateway, storage/vector, notifications, APIs, deployment and recovery.
- **Applications:** School, Teacher, Parent, Student, Security, Counselor, HR, Finance, Procurement and Executive applications.

See:
- `docs/architecture/EDUNEXUS-BUSINESS-ENGINE-REGISTER.md`
- `docs/architecture/EDUNEXUS-MASTER-ARCHITECTURE.md`

## Engineering principles
- Human authority remains the final decision layer for high-impact actions.
- Student safety actions are fail-closed and auditable.
- Tenant isolation is mandatory; Row Level Security is the database boundary.
- AI providers are replaceable through an AI Gateway.
- Data provenance and auditability are first-class requirements.
- Hardware integrations use adapters rather than coupling the core domain to vendors.
- Changes require contract, security, regression, and deployment-gate validation.

## D+7 target
The first milestone is a **Demo/Pilot-Ready Vertical Slice**, not production completion of every planned engine.

The initial slice covers identity, tenant/school, students, teachers, guardians, classes, attendance, learning evidence, student safety/release verification, workflow and approvals, audit, reporting, and governed AI assistance.

## Repository
This repository is the canonical application and engineering source for EDUNEXUS.
- `apps/` — user-facing applications
- `packages/` — shared platform packages
- `supabase/` — database, migrations, edge functions, tests
- `engines/` — bounded domain/engine contracts
- `docs/` — architecture, security, safety, AI and deployment contracts
- `tests/` — cross-system validation

## Status
Foundation repository initialized. The Supabase project contains the canonical control-plane and business-engine registry. Database/control-plane foundations are synchronized into version-controlled migrations and contracts.

## Security
Do not commit credentials, service-role keys, API keys, student PII, production exports, or other secrets. Environment files are intentionally excluded from source control.
