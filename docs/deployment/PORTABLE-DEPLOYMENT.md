# EDUNEXUS Portable Deployment

EDUNEXUS web is deployment-platform independent.

## Runtime contract
- Next.js standalone output
- Node.js 22 runtime
- Port 3000
- Supabase remains the backend/auth/data boundary
- No Vercel dependency

## Required public web environment
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Never put Supabase service-role credentials in the web container.

## Build
```bash
pnpm install --frozen-lockfile
pnpm --filter @edunexus/web build
```

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

A public URL requires a host/reverse proxy and DNS. No production DNS is changed automatically.
