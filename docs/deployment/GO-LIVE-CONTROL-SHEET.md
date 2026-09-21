# EDUNEXUS Go-Live Control Sheet

Date: 2026-09-21
Branch: engineering/foundation-v1
Supabase project: fwjerzbsbnepbhbtynyyc

## Green
- Supabase project ACTIVE_HEALTHY
- Security Advisor: 0 findings
- RLS/security baseline verified
- GitHub CI remains the contract gate
- Next.js standalone runtime configured
- Vercel removed from deployment path
- No synthetic production data

## Controlled gates
1. `AI_GATEWAY_API_KEY` must be provisioned before live model reasoning.
2. A deployment host must be selected/configured for the standalone Node.js/Docker runtime.
3. Production domain/DNS is intentionally not altered automatically.
4. PR #1 merge remains a human approval gate.
5. Production tenant onboarding is performed through governed onboarding; no seed/demo records are inserted into production.

## Fail-closed behavior
Without `AI_GATEWAY_API_KEY`, governed learning assistance returns `AI_GATEWAY_NOT_CONFIGURED` rather than fabricating model output.

## Release sequence
1. Provision only required secrets through the selected host's secret manager.
2. Build/test the standalone web runtime.
3. Deploy the container or standalone Node.js build.
4. Browser smoke test authenticated and unauthenticated routes.
5. Run database/security/regression gates.
6. Human approves promotion/merge.
7. Attach production domain.
8. Onboard first real tenant through governed onboarding.
9. Run recovery/rollback verification.
