# Deployment Gate

A deployment candidate must establish:
1. schema health
2. RLS/security health
3. master contract compliance
4. safety regression pass
5. AI policy regression pass
6. core integration pass
7. application build/typecheck pass
8. rollback/recovery readiness

Production credentials and irreversible production changes remain explicit human approval gates.
