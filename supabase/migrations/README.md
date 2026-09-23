# Migration synchronization

Verified live migration history in the EDUNEXUS Supabase project:

- 20260921041853 edunexus_foundation_v1
- 20260921041920 harden_tenant_membership_helper
- 20260921042101 edunexus_core_domain_v1
- 20260921042115 edunexus_fk_performance_indexes
- 20260921042212 edunexus_workflow_ai_safety_v1
- 20260921042347 engine06_release_verification_v1
- 20260921043957 edunexus_orchestration_control_plane_v1
- 20260921044032 edunexus_orchestration_hardening_v1
- 20260921050744 edunexus_autonomous_engineering_test_001
- 20260921051128 edunexus_autonomous_test_001_contract_fix
- 20260921071218 autonomous_multi_agent_chain_v2
- 20260921071310 autonomous_fk_indexes_v1
- 20260921071401 ai_gateway_control_plane_v1
- 20260921071427 ai_gateway_fk_indexes_v1
- 20260921074156 ai_approval_hardening_v1
- 20260921074327 edunexus_reporting_views_v1
- 20260921082910 edunexus_operational_rpc_v1
- 20260921082941 edunexus_operational_rpc_wrappers_v1

This manifest records the live sequence. SQL source synchronization is intentionally separate so the repository never invents migration contents that were not retrieved from the source project.
