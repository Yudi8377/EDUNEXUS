# EDUNEXUS Free-First Cloud Deployment

## Objective

EDUNEXUS remains aligned with the original **Rp0 free-first** strategy:

- GitHub remains the source of truth.
- Supabase remains the production database/auth/backend platform.
- Cloudflare Workers Free is the initial web runtime.
- No VPS is required for the pilot stage.
- No paid cloud commitment is required for this deployment path.
- Enterprise infrastructure is introduced only after the product generates revenue or the free-tier limits materially constrain operations.

## Why Cloudflare Workers Free

Cloudflare currently documents a Workers Free plan with 100,000 requests/day, 10 ms CPU time per invocation, and 128 MB memory. Static assets are free and unlimited. A `workers.dev` subdomain is available for getting started without a custom domain.

This is an initial pilot hosting target, subject to the documented free-tier limits and actual EDUNEXUS workload.

## Runtime architecture

```
User
  |
  v
Cloudflare Workers Free
  |
  | Next.js via OpenNext
  v
EDUNEXUS Web
  |
  v
Supabase
  |- PostgreSQL
  |- Auth
  |- RLS
  |- Storage
  `- Edge Functions
```

Cloudflare is only the web execution target. It does not replace Supabase or change the EDUNEXUS business/data architecture.

## Current compatibility

The EDUNEXUS web app uses Next.js 15. OpenNext currently supports the latest minors of Next.js 15 and 14, as well as Next.js 16.

The deployment adapter uses the Node.js runtime on Cloudflare Workers.

## Free-tier guard

Cloudflare currently documents a 3 MiB compressed Worker size limit on Workers Free. The deployment must stop if the generated artifact cannot fit within the Free plan.

We intentionally do not configure R2 cache, D1, KV, Durable Objects, paid Workers AI, or other paid services in this initial deployment.

## One-time Cloudflare setup

1. Create/sign in to a Cloudflare account.
2. Enable a `workers.dev` subdomain in Workers & Pages.
3. Create a scoped API token for Workers deployment.
4. Record the Cloudflare Account ID.
5. Add these GitHub repository secrets:

- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Never commit the Cloudflare API token.

## Deployment workflow

The repository contains:

`.github/workflows/cloudflare-deploy.yml`

It is **workflow_dispatch only** so production deployment remains a human-controlled gate.

The workflow checks out the selected commit, installs the existing locked workspace, adds the Cloudflare deployment toolchain only inside the CI workspace, builds with OpenNext, deploys with Wrangler/OpenNext, and prints deployment metadata.

No Vercel dependency is required.

## Environment variables

The Supabase public URL and public anon key are provided to the Next.js production build through GitHub Environment secrets. They are not committed to the repository.

Runtime secrets should be managed in Cloudflare rather than committed to Git.

## Enterprise upgrade path

When EDUNEXUS generates revenue, the same application can be upgraded without rebuilding its business architecture:

- Workers Free -> Workers Paid/Enterprise
- workers.dev -> owned production domain
- optional cache/storage services
- stronger observability and SLA
- higher capacity
- enterprise security/compliance controls

The upgrade is an infrastructure entitlement change, not a product rewrite.
