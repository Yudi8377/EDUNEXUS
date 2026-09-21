# EDUNEXUS Release Validation Checklist

## Repository
- [ ] branch contains no secrets
- [ ] CI configuration is syntactically valid
- [ ] application typecheck passes
- [ ] application build passes

## Supabase
- [ ] schema health passes
- [ ] security advisor has no findings
- [ ] all exposed tenant tables retain RLS
- [ ] controlled RPC execution privileges are least-privilege
- [ ] Edge Functions enforce authenticated user and tenant membership
- [ ] production migration source is synchronized before release

## Safety
- [ ] ENGINE 06 regression suite passes
- [ ] guardian/delegated/driver/ride-hailing/self-release/emergency paths are covered
- [ ] mismatch/expired/revoked paths are fail-closed
- [ ] emergency path requires human decision
- [ ] one-time authorization race test passes
- [ ] audit and safety incident creation verified

## AI
- [ ] unknown actions block
- [ ] excessive risk blocks
- [ ] L5/L6 actions create human gates
- [ ] model allowlist enforced
- [ ] AI output cannot directly authorize safety actions
- [ ] AI model runs are auditable
- [ ] gateway credential is supplied only through secret storage

## Recovery
- [ ] backup exists
- [ ] backup integrity verified
- [ ] recovery test completed
- [ ] rollback plan tested
- [ ] deployment gate recorded
