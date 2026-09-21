# EDUNEXUS

**Autonomous, Cognitive and Evolvable Education Operating System**

EDUNEXUS is a secure, multi-tenant education operating system designed around human-governed autonomy, student safety, workflow orchestration, AI agents, provenance, knowledge graphs, digital twins, and evolvable platform engineering.

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
Foundation repository initialized. Database/control-plane foundations are maintained in the EDUNEXUS Supabase project and are being synchronized into version-controlled migrations and contracts.

## Security
Do not commit credentials, service-role keys, API keys, student PII, production exports, or other secrets. Environment files are intentionally excluded from source control.