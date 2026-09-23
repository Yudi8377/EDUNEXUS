-- EDUNEXUS live foundation security policies
-- Applies the same RLS hardening verified in Supabase project wdvphqotlwloaayzpbng.

do $$
declare r record;
begin
 for r in
   select tablename from pg_tables
   where schemaname='public'
   and tablename in (
    'schools','students','guardians','student_guardians','teachers','classes','student_class_memberships',
    'teacher_class_assignments','attendance_records','learning_evidence','pickup_authorizations',
    'release_verifications','student_release_events','safety_policies','safety_incidents',
    'workflow_definitions','workflow_instances','approval_requests','ai_action_policies',
    'notification_events','learning_assignments','learning_submissions','learning_feedback',
    'teacher_lesson_plans','teacher_observations','teacher_development_records','audit_events',
    'ai_agent_tasks','ai_action_executions','ai_orchestration_events','ai_model_runs',
    'event_bus_events','knowledge_nodes','knowledge_edges','digital_twin_entities','self_healing_events',
    'self_healing_plans','simulation_scenarios','ai_memory','agent_messages','ai_agent_learning',
    'system_health_snapshots','user_roles'
   )
 loop
   execute format('drop policy if exists tenant_member_select on public.%I',r.tablename);
   execute format('create policy tenant_member_select on public.%I for select to authenticated using (private.is_tenant_member(tenant_id))',r.tablename);
 end loop;
end $$;

drop policy if exists tenant_member_select on public.tenant_memberships;
create policy tenant_member_select on public.tenant_memberships
for select to authenticated
using (user_id=auth.uid() or private.is_tenant_member(tenant_id));

drop policy if exists tenant_member_select on public.user_roles;
create policy tenant_member_select on public.user_roles
for select to authenticated
using (user_id=auth.uid() or private.is_tenant_member(tenant_id));

drop policy if exists authenticated_select on public.ai_agents;
create policy authenticated_select on public.ai_agents
for select to authenticated using (true);

drop policy if exists authenticated_select on public.module_registry;
create policy authenticated_select on public.module_registry
for select to authenticated using (true);

drop policy if exists authenticated_select on public.module_dependencies;
create policy authenticated_select on public.module_dependencies
for select to authenticated using (true);

drop policy if exists authenticated_select on public.contract_definitions;
create policy authenticated_select on public.contract_definitions
for select to authenticated using (true);

drop policy if exists authenticated_select on public.validation_suites;
create policy authenticated_select on public.validation_suites
for select to authenticated using (true);

create policy authenticated_select on public.ai_agent_tools
for select to authenticated using (true);

create policy authenticated_select on public.ai_execution_steps
for select to authenticated
using (exists(select 1 from public.ai_agent_tasks t
             where t.id=task_id and private.is_tenant_member(t.tenant_id)));

create policy authenticated_select on public.ai_prompt_registry
for select to authenticated using (active=true);

create policy authenticated_select on public.ai_tool_registry
for select to authenticated using (enabled=true);

create policy authenticated_select on public.system_change_log
for select to authenticated using (actor_user_id=auth.uid());

create policy authenticated_select on public.validation_runs
for select to authenticated using (true);
