-- EDUNEXUS ENGINE 02 consent governance hardening
create or replace function private.validate_consent_subject(p_tenant_id uuid,p_subject_type text,p_subject_id uuid) returns void
language plpgsql security definer set search_path=private,public as $$
begin
 if p_subject_type='student' then
  if not exists(select 1 from public.students where id=p_subject_id and tenant_id=p_tenant_id and status='active') then raise exception 'SUBJECT_NOT_FOUND'; end if;
 elsif p_subject_type='guardian' then
  if not exists(select 1 from public.guardians where id=p_subject_id and tenant_id=p_tenant_id and status='active') then raise exception 'SUBJECT_NOT_FOUND'; end if;
 elsif p_subject_type='employee' then
  if not exists(select 1 from public.teachers where id=p_subject_id and tenant_id=p_tenant_id and status='active') then raise exception 'SUBJECT_NOT_FOUND'; end if;
 elsif p_subject_type='user' then
  if not exists(select 1 from public.tenant_memberships where tenant_id=p_tenant_id and user_id=p_subject_id and status='active') then raise exception 'SUBJECT_NOT_FOUND'; end if;
 else raise exception 'INVALID_SUBJECT_TYPE'; end if;
end $$;
revoke execute on function private.validate_consent_subject(uuid,text,uuid) from public,anon,authenticated;
create or replace function private.approve_data_sharing(p_request_id uuid,p_decision text,p_decision_by uuid,p_evidence jsonb default '{}'::jsonb) returns uuid
language plpgsql security definer set search_path=private,public as $$
declare r public.data_sharing_requests%rowtype; v_role text; v_id uuid;
begin
 if p_decision_by<>auth.uid() then raise exception 'ACTOR_MISMATCH'; end if;
 select * into r from public.data_sharing_requests where id=p_request_id for update;
 if not found then raise exception 'REQUEST_NOT_FOUND'; end if;
 if not private.is_tenant_member(r.tenant_id) then raise exception 'TENANT_ACCESS_DENIED'; end if;
 select role_code into v_role from public.tenant_memberships where tenant_id=r.tenant_id and user_id=auth.uid() and status='active' limit 1;
 if v_role not in ('TENANT_ADMIN','SCHOOL_ADMIN') then raise exception 'APPROVAL_ROLE_REQUIRED'; end if;
 if r.status<>'pending' then raise exception 'REQUEST_NOT_PENDING'; end if;
 if p_decision not in ('approved','denied') then raise exception 'INVALID_DECISION'; end if;
 if p_decision='approved' and r.policy_id is not null then
  if not exists(select 1 from public.consent_policies where id=r.policy_id and tenant_id=r.tenant_id and status='active') then raise exception 'POLICY_NOT_ACTIVE'; end if;
  perform private.validate_consent_subject(r.tenant_id,r.subject_type,r.subject_id);
 end if;
 update public.data_sharing_requests set status=p_decision,decision_by=auth.uid(),decision_at=now(),evidence=coalesce(evidence,'{}'::jsonb)||coalesce(p_evidence,'{}'::jsonb),updated_at=now() where id=r.id returning id into v_id;
 insert into public.audit_events(tenant_id,actor_user_id,action_code,entity_type,entity_id,severity,source,payload) values(r.tenant_id,auth.uid(),'data_sharing.'||p_decision,'data_sharing_request',v_id,'info','engine_02',jsonb_build_object('subject_type',r.subject_type,'recipient_type',r.recipient_type,'purpose',r.purpose));
 return v_id;
end $$;
create or replace function private.revoke_data_sharing(p_request_id uuid,p_decision_by uuid,p_evidence jsonb default '{}'::jsonb) returns uuid
language plpgsql security definer set search_path=private,public as $$
declare r public.data_sharing_requests%rowtype; v_role text;
begin
 if p_decision_by<>auth.uid() then raise exception 'ACTOR_MISMATCH'; end if;
 select * into r from public.data_sharing_requests where id=p_request_id for update;
 if not found then raise exception 'REQUEST_NOT_FOUND'; end if;
 if not private.is_tenant_member(r.tenant_id) then raise exception 'TENANT_ACCESS_DENIED'; end if;
 select role_code into v_role from public.tenant_memberships where tenant_id=r.tenant_id and user_id=auth.uid() and status='active' limit 1;
 if v_role not in ('TENANT_ADMIN','SCHOOL_ADMIN') then raise exception 'APPROVAL_ROLE_REQUIRED'; end if;
 if r.status<>'approved' then raise exception 'REQUEST_NOT_APPROVED'; end if;
 update public.data_sharing_requests set status='revoked',decision_by=auth.uid(),decision_at=now(),evidence=coalesce(evidence,'{}'::jsonb)||coalesce(p_evidence,'{}'::jsonb),updated_at=now() where id=r.id;
 insert into public.audit_events(tenant_id,actor_user_id,action_code,entity_type,entity_id,severity,source,payload) values(r.tenant_id,auth.uid(),'data_sharing.revoked','data_sharing_request',r.id,'warning','engine_02',jsonb_build_object('subject_type',r.subject_type,'recipient_type',r.recipient_type));
 return r.id;
end $$;
revoke execute on function private.approve_data_sharing(uuid,text,uuid,jsonb) from public,anon,authenticated;
revoke execute on function private.revoke_data_sharing(uuid,uuid,jsonb) from public,anon,authenticated;
grant execute on function private.approve_data_sharing(uuid,text,uuid,jsonb) to service_role;
grant execute on function private.revoke_data_sharing(uuid,uuid,jsonb) to service_role;