# EDUNEXUS Portable Deployment

EDUNEXUS web is deployment-platform independent.

## Runtime contract
- Next.js standalone output
- Node.js 22 runtime
- Port 3000
- Supabase remains the backend/auth/data boundary
- No Vercel dependency
- Docker Compose is the canonical portable container path

## Required public web environment
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Never put Supabase service-role credentials in the web container.

## Build
```bash
pnpm install --frozen-lockfile
pnpm --filter @edunexus/web build
```

CI verifies that the standalone runtime contains:
- `apps/web/.next/standalone/apps/web/server.js`
- standalone `node_modules`
- `apps/web/.next/static`

## Run standalone
```bash
node apps/web/.next/standalone/apps/web/server.js
```

## Container
Build from repository root:
```bash
docker build -f apps/web/Dockerfile -t edunexus-web .
docker run --rm -p 3000:3000 --env-file .env.production edunexus-web
```

Or with Compose:
```bash
docker compose -f deploy/docker-compose.yml up -d --build
```

## Human-gated production deployment
`.github/workflows/production-deploy.yml` provides a provider-neutral SSH deployment path. It is intentionally manual and attached to the GitHub `production` environment.

Required GitHub Environment secrets:
- `DEPLOY_HOST`
- `DEPLOY_USER`
- `DEPLOY_PATH`
- `DEPLOY_SSH_KEY`

The target host must have:
- Docker Engine
- Docker Compose v2
- Git
- the repository checked out at `DEPLOY_PATH`
- the production environment variables required by Compose

The workflow deploys the exact Git commit selected by the workflow run. Configure GitHub Environment approval rules before using production.

A public URL requires a host/reverse proxy and DNS. No production DNS is changed automatically.
