-- EDUNEXUS ENGINE 06/07/10: Learning + Safety Command Foundation v1
-- Applied to Supabase project fwjerzbsbnepbhbtynyc.
-- No synthetic production data is created.

create table if not exists public.learning_feedback (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  assignment_id uuid not null references public.learning_assignments(id) on delete cascade,
  submission_id uuid not null references public.learning_submissions(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  teacher_id uuid not null references public.teachers(id) on delete restrict,
  feedback_text text,
  rubric jsonb not null default '{}'::jsonb,
  score numeric,
  max_score numeric,
  generated_by_ai boolean not null default false,
  provenance jsonb not null default '{}'::jsonb,
  status text not null default 'draft' check (status in ('draft','submitted','acknowledged','closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, submission_id, teacher_id)
);

alter table public.learning_feedback enable row level security;
drop policy if exists learning_feedback_select on public.learning_feedback;
create policy learning_feedback_select on public.learning_feedback
for select to authenticated using ((select private.is_tenant_member(tenant_id)));
create index if not exists idx_learning_feedback_tenant_student on public.learning_feedback(tenant_id,student_id);
create index if not exists idx_learning_feedback_submission on public.learning_feedback(submission_id);
revoke insert, update, delete on public.learning_feedback from anon, authenticated;

create or replace function private.submit_learning_assignment(
  p_tenant_id uuid,p_assignment_id uuid,p_student_id uuid,
  p_content_text text default null,p_content_uri text default null
) returns uuid language plpgsql security definer set search_path=public,private as $$
declare v_id uuid; v_class uuid;
begin
  if auth.uid() is null or not private.is_tenant_member(p_tenant_id) then raise exception 'TENANT_ACCESS_DENIED'; end if;
  select class_id into v_class from public.learning_assignments
  where id=p_assignment_id and tenant_id=p_tenant_id and status in ('published','closed');
  if v_class is null then raise exception 'ASSIGNMENT_NOT_AVAILABLE'; end if;
  if not exists (select 1 from public.student_class_memberships scm
    where scm.tenant_id=p_tenant_id and scm.student_id=p_student_id
      and scm.class_id=v_class and scm.status='active') then raise exception 'STUDENT_NOT_IN_CLASS'; end if;
  if coalesce(length(trim(coalesce(p_content_text,''))),0)=0 and coalesce(length(trim(coalesce(p_content_uri,''))),0)=0 then
    raise exception 'SUBMISSION_CONTENT_REQUIRED';
  end if;
  insert into public.learning_submissions(
    tenant_id,assignment_id,student_id,submitted_at,content_uri,content_text,provenance,status
  ) values (
    p_tenant_id,p_assignment_id,p_student_id,now(),p_content_uri,p_content_text,
    jsonb_build_object('source','teacher_or_governed_workflow','submitted_by',auth.uid()),'submitted'
  ) on conflict do nothing returning id into v_id;
  if v_id is null then
    select id into v_id from public.learning_submissions
    where tenant_id=p_tenant_id and assignment_id=p_assignment_id and student_id=p_student_id
    order by created_at desc limit 1;
  end if;
  insert into public.audit_events(tenant_id,actor_user_id,action,entity_type,entity_id,metadata)
  values(p_tenant_id,auth.uid(),'learning.submission.submit','learning_submission',v_id,
         jsonb_build_object('assignment_id',p_assignment_id,'student_id',p_student_id));
  return v_id;
end $$;

create or replace function private.create_learning_feedback(
  p_tenant_id uuid,p_assignment_id uuid,p_submission_id uuid,p_student_id uuid,p_teacher_id uuid,
  p_feedback_text text default null,p_rubric jsonb default '{}'::jsonb,p_score numeric default null,
  p_max_score numeric default null,p_generated_by_ai boolean default false,
  p_provenance jsonb default '{}'::jsonb
) returns uuid language plpgsql security definer set search_path=public,private as $$
declare v_id uuid;
begin
  if auth.uid() is null or not private.is_tenant_member(p_tenant_id) then raise exception 'TENANT_ACCESS_DENIED'; end if;
  if not exists (
    select 1 from public.user_roles ur join public.roles r on r.id=ur.role_id
    where ur.user_id=auth.uid() and ur.tenant_id=p_tenant_id
      and r.code in ('TEACHER','SCHOOL_ADMIN','TENANT_ADMIN')
  ) then raise exception 'ROLE_NOT_AUTHORIZED'; end if;
  if not exists (select 1 from public.teachers t where t.id=p_teacher_id and t.tenant_id=p_tenant_id and t.status='active') then raise exception 'TEACHER_NOT_ACTIVE'; end if;
  if not exists (select 1 from public.teacher_class_assignments tca
    join public.learning_assignments a on a.class_id=tca.class_id and a.id=p_assignment_id
    where tca.tenant_id=p_tenant_id and tca.teacher_id=p_teacher_id and tca.status='active') then raise exception 'TEACHER_NOT_ASSIGNED'; end if;
  if not exists (select 1 from public.learning_submissions s
    where s.id=p_submission_id and s.assignment_id=p_assignment_id and s.student_id=p_student_id and s.tenant_id=p_tenant_id) then raise exception 'SUBMISSION_MISMATCH'; end if;
  if p_generated_by_ai and coalesce(p_provenance,'{}'::jsonb) = '{}'::jsonb then raise exception 'AI_PROVENANCE_REQUIRED'; end if;
  if p_score is not null and (p_max_score is null or p_max_score <= 0 or p_score < 0 or p_score > p_max_score) then raise exception 'INVALID_SCORE'; end if;
  insert into public.learning_feedback(
    tenant_id,assignment_id,submission_id,student_id,teacher_id,feedback_text,rubric,score,max_score,
    generated_by_ai,provenance,status
  ) values (
    p_tenant_id,p_assignment_id,p_submission_id,p_student_id,p_teacher_id,p_feedback_text,
    coalesce(p_rubric,'{}'::jsonb),p_score,p_max_score,p_generated_by_ai,coalesce(p_provenance,'{}'::jsonb),'submitted'
  ) on conflict (tenant_id,submission_id,teacher_id) do update set
    feedback_text=excluded.feedback_text,rubric=excluded.rubric,score=excluded.score,max_score=excluded.max_score,
    generated_by_ai=excluded.generated_by_ai,provenance=excluded.provenance,status='submitted',updated_at=now()
  returning id into v_id;
  insert into public.audit_events(tenant_id,actor_user_id,action,entity_type,entity_id,metadata)
  values(p_tenant_id,auth.uid(),'learning.feedback.create','learning_feedback',v_id,
         jsonb_build_object('assignment_id',p_assignment_id,'submission_id',p_submission_id,
                            'student_id',p_student_id,'generated_by_ai',p_generated_by_ai,'grade_mutation_by_ai',false));
  return v_id;
end $$;

revoke execute on function private.submit_learning_assignment(uuid,uuid,uuid,text,text) from public,anon,authenticated;
revoke execute on function private.create_learning_feedback(uuid,uuid,uuid,uuid,uuid,text,jsonb,numeric,numeric,boolean,jsonb) from public,anon,authenticated;
grant execute on function private.submit_learning_assignment(uuid,uuid,uuid,text,text) to service_role;
grant execute on function private.create_learning_feedback(uuid,uuid,uuid,uuid,uuid,text,jsonb,numeric,numeric,boolean,jsonb) to service_role;

drop view if exists public.v_student_learning_progress;
create view public.v_student_learning_progress with (security_invoker=true) as
select s.tenant_id,s.id as student_id,s.student_no,s.full_name,
       count(distinct a.id) filter (where a.status in ('published','closed')) as assignments,
       count(distinct sub.id) filter (where sub.status in ('submitted','reviewed','returned')) as submissions,
       count(distinct f.id) as feedback_items,count(distinct le.id) as evidence_items,
       max(sub.submitted_at) as last_submission_at,max(le.occurred_at) as last_evidence_at,
       avg(f.score) filter (where f.score is not null) as average_feedback_score
from public.students s
left join public.student_class_memberships scm on scm.student_id=s.id and scm.tenant_id=s.tenant_id and scm.status='active'
left join public.learning_assignments a on a.class_id=scm.class_id and a.tenant_id=s.tenant_id
left join public.learning_submissions sub on sub.assignment_id=a.id and sub.student_id=s.id and sub.tenant_id=s.tenant_id
left join public.learning_feedback f on f.submission_id=sub.id and f.tenant_id=s.tenant_id
left join public.learning_evidence le on le.student_id=s.id and le.tenant_id=s.tenant_id
where private.is_tenant_member(s.tenant_id)
group by s.tenant_id,s.id,s.student_no,s.full_name;

drop view if exists public.v_teacher_command_center;
create view public.v_teacher_command_center with (security_invoker=true) as
select t.tenant_id,t.id as teacher_id,t.employee_no,t.full_name,
       count(distinct tca.class_id) filter (where tca.status='active') as active_classes,
       count(distinct lp.id) filter (where lp.status in ('draft','submitted','approved')) as lesson_plans,
       count(distinct a.id) filter (where a.status in ('draft','published','closed')) as assignments,
       count(distinct sub.id) filter (where sub.status='submitted') as pending_submissions,
       count(distinct ob.id) as observations,count(distinct dr.id) as development_records,
       count(distinct f.id) filter (where f.status='submitted') as feedback_items
from public.teachers t
left join public.teacher_class_assignments tca on tca.teacher_id=t.id and tca.tenant_id=t.tenant_id
left join public.teacher_lesson_plans lp on lp.teacher_id=t.id and lp.tenant_id=t.tenant_id
left join public.learning_assignments a on a.teacher_id=t.id and a.tenant_id=t.tenant_id
left join public.learning_submissions sub on sub.assignment_id=a.id and sub.tenant_id=t.tenant_id
left join public.teacher_observations ob on ob.teacher_id=t.id and ob.tenant_id=t.tenant_id
left join public.teacher_development_records dr on dr.teacher_id=t.id and dr.tenant_id=t.tenant_id
left join public.learning_feedback f on f.teacher_id=t.id and f.tenant_id=t.tenant_id
where private.is_tenant_member(t.tenant_id)
group by t.tenant_id,t.id,t.employee_no,t.full_name;

drop view if exists public.v_student_safety_command_center;
create view public.v_student_safety_command_center with (security_invoker=true) as
select pa.tenant_id,pa.student_id,s.student_no,s.full_name,
       pa.id as authorization_id,pa.pickup_type,pa.authorized_person_name,pa.authorized_person_phone,
       pa.vehicle_plate,pa.provider_name,pa.trip_reference,pa.valid_from,pa.valid_until,pa.status as authorization_status,
       pa.one_time,max(sre.occurred_at) as last_release_event_at,
       max(ar.requested_at) filter (where ar.status='pending') as pending_approval_at,
       max(ar.status) filter (where ar.status='pending') as approval_status
from public.pickup_authorizations pa
join public.students s on s.id=pa.student_id and s.tenant_id=pa.tenant_id
left join public.student_release_events sre on sre.authorization_id=pa.id and sre.tenant_id=pa.tenant_id
left join public.approval_requests ar on ar.tenant_id=pa.tenant_id
where private.is_tenant_member(pa.tenant_id)
group by pa.tenant_id,pa.student_id,s.student_no,s.full_name,pa.id,pa.pickup_type,
pa.authorized_person_name,pa.authorized_person_phone,pa.vehicle_plate,pa.provider_name,pa.trip_reference,
pa.valid_from,pa.valid_until,pa.status,pa.one_time;
