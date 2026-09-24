-- EDUNEXUS read-model alignment for live project wdvphqotlwloaayzpbng
-- Safe, read-only views. No synthetic data and no RLS policy changes.

create or replace view public.v_student_360
with (security_invoker=true) as
select
  s.tenant_id,
  s.id as student_id,
  s.student_no,
  s.full_name,
  s.status,
  coalesce(string_agg(distinct c.code, ', ' order by c.code) filter (where c.id is not null), '') as classes,
  count(distinct ar.id) as attendance_count,
  count(distinct le.id) as learning_evidence_count
from public.students s
left join public.student_class_memberships scm
  on scm.student_id=s.id and scm.tenant_id=s.tenant_id and scm.status='active'
left join public.classes c
  on c.id=scm.class_id and c.tenant_id=s.tenant_id
left join public.attendance_records ar
  on ar.student_id=s.id and ar.tenant_id=s.tenant_id
left join public.learning_evidence le
  on le.student_id=s.id and le.tenant_id=s.tenant_id
where private.is_tenant_member(s.tenant_id)
group by s.tenant_id,s.id,s.student_no,s.full_name,s.status;

create or replace view public.v_teacher_command_center
with (security_invoker=true) as
select
  t.tenant_id,
  t.id as teacher_id,
  t.employee_no,
  t.full_name as teacher_name,
  t.status as teacher_status,
  count(distinct a.id) filter (where a.status in ('draft','published','closed')) as active_tugas_count,
  count(distinct tca.class_id) filter (where tca.status='active') as active_class_count,
  count(distinct tca.class_id) filter (where tca.status='active') as visible_active_class_count,
  count(distinct scm.student_id) filter (where tca.status='active' and scm.status='active') as assigned_student_count,
  count(distinct ar.id) filter (where ar.attendance_date=current_date) as attendance_today_records,
  count(distinct le.id) filter (where le.observed_at >= now() - interval '30 days') as learning_evidence_30d,
  max(le.observed_at) as last_learning_evidence_at
from public.teachers t
left join public.teacher_class_assignments tca
  on tca.teacher_id=t.id and tca.tenant_id=t.tenant_id
left join public.student_class_memberships scm
  on scm.class_id=tca.class_id and scm.tenant_id=t.tenant_id
left join public.attendance_records ar
  on ar.class_id=tca.class_id and ar.tenant_id=t.tenant_id
left join public.learning_evidence le
  on le.teacher_id=t.id and le.tenant_id=t.tenant_id
left join public.learning_assignments a
  on a.teacher_id=t.id and a.tenant_id=t.tenant_id
where private.is_tenant_member(t.tenant_id)
group by t.tenant_id,t.id,t.employee_no,t.full_name,t.status;

create or replace view public.v_teacher_class_command
with (security_invoker=true) as
select
  tca.tenant_id,
  tca.teacher_id,
  c.id as class_id,
  c.code as class_code,
  c.name as class_name,
  c.status as class_status,
  tca.assignment_role as tugas_role,
  tca.subject_code,
  count(distinct scm.student_id) filter (where scm.status='active') as student_count,
  count(distinct ar.id) filter (where ar.attendance_date=current_date) as attendance_today,
  count(distinct le.id) filter (where le.observed_at >= now() - interval '30 days') as learning_evidence_30d
from public.teacher_class_assignments tca
join public.classes c
  on c.id=tca.class_id and c.tenant_id=tca.tenant_id
left join public.student_class_memberships scm
  on scm.class_id=c.id and scm.tenant_id=tca.tenant_id
left join public.attendance_records ar
  on ar.class_id=c.id and ar.tenant_id=tca.tenant_id
left join public.learning_evidence le
  on le.class_id=c.id and le.tenant_id=tca.tenant_id
where private.is_tenant_member(tca.tenant_id)
group by tca.tenant_id,tca.teacher_id,c.id,c.code,c.name,c.status,tca.assignment_role,tca.subject_code;

create or replace view public.v_ai_control_center
with (security_invoker=true) as
select
  tenant_id,
  count(*) filter (where status='queued') as queued_tasks,
  count(*) filter (where status in ('awaiting_approval','pending_approval')) as awaiting_approval_tasks,
  count(*) filter (where status in ('executing','running')) as executing_tasks,
  count(*) filter (where risk_level in ('high','critical')) as high_risk_tasks
from public.ai_agent_tasks
where private.is_tenant_member(tenant_id)
group by tenant_id;
