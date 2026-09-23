# ENGINE 06 — Student Safety Contract

Scope: student release and pickup verification for guardians, delegated persons, official drivers, ride-hailing, self-release and emergency flows.

Safety invariants:
- Card/QR/NFC is a credential signal, not authorization by itself.
- Authorization is tenant-scoped and time-bounded.
- Revoked, expired, inactive or mismatched authorizations cannot be silently approved.
- Missing identity evidence enters manual review where policy requires it.
- Emergency release requires an authorized human decision.
- One-time authorizations are consumed atomically.
- Material adverse verification outcomes are audited and can create safety incidents.

Current server contract: private.verify_student_release_v2.
Application entry point: edunexus-safety Edge Function.
