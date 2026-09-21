# EDUNEXUS Go-Live Control Sheet

Date: 2026-09-21
Branch: engineering/foundation-v1
Supabase project: fwjerzbsbnepbhbtynyc

## Green
- Supabase project ACTIVE_HEALTHY
- Security Advisor: 0 findings
- 52 public tables with RLS
- 0 public SECURITY DEFINER functions
- 8 enabled AI agents
- 13 enabled AI action policies
- 15 registered modules
- 8 master contracts
- 7 active Edge Functions
- Platform JWT verification enabled for all current user-facing Edge Functions
- GitHub CI PASS
- pnpm lockfile committed
- No synthetic production data

## Controlled gates
1. AI_GATEWAY_API_KEY must be provisioned before live model reasoning.
2. Vercel project/environment must be connected and configured before public web production deployment.
3. Production domain/DNS is intentionally not altered automatically.
4. PR #1 merge remains a human approval gate.
5. Production tenant onboarding is performed through governed onboarding; no seed/demo records are inserted into the production database.

## Fail-closed behavior
Without AI_GATEWAY_API_KEY, governed learning assistance returns AI_GATEWAY_NOT_CONFIGURED rather than fabricating model output.

## Release sequence
1. Provision secrets through the platform secret manager.
2. Configure Vercel project and Supabase environment variables.
3. Deploy preview.
4. Browser smoke test authenticated and unauthenticated routes.
5. Run database/security/regression gates.
6. Human approves promotion/merge.
7. Attach production domain.
8. Onboard first real tenant through governed onboarding.
9. Run recovery/rollback verification.
