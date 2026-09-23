# Live Integration Status

Repository: Yudi8377/EDUNEXUS
Supabase project: fwjerzbsbnepbhbtynyc
Region: ap-southeast-1

Active Edge Functions:
- edunexus-orchestrator — v2 — platform JWT verification disabled; deployed source uses Supabase user-auth wrapper and rejects missing user claims.
- edunexus-ai-gateway — v1 — platform JWT verification disabled; deployed source uses Supabase user-auth wrapper and rejects missing user claims.
- edunexus-approval — v1 — platform JWT verification enabled.
- edunexus-safety — v1 — platform JWT verification enabled.

Security follow-up:
The two functions with platform JWT verification disabled must remain in the security regression matrix. Do not alter production authentication settings or credentials without an explicit security change gate.

AI gateway state:
The control plane is ready, but real model execution remains disabled until AI_GATEWAY_API_KEY is intentionally configured.
