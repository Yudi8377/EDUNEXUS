# EDUNEXUS Security Model

Supabase Row Level Security is the final database authorization boundary.

Rules:
1. Every exposed tenant table uses RLS.
2. Authorization never relies on client metadata.
3. Service-role credentials never enter browser/client code.
4. Sensitive mutations use controlled server-side operations.
5. High-risk AI actions require human approval or human decision.
6. Student release verification is fail-closed and fully audited.
7. Secrets are supplied only through deployment secret stores.
8. Security regression tests are mandatory before deployment.

Threat focus: tenant isolation, privilege escalation, credential replay, release mismatch, emergency abuse, AI policy bypass, audit tampering and secret leakage.
