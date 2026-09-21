-- ENGINE 02: subject validation and request hardening
create or replace function private.record_consent(p_tenant_id uuid,p_policy_id uuid,p_subject_type text,p_subject_id uuid,p_decision text,p_evidence jsonb,p_provenance jsonb,p_granted_by uuid) returns uuid
language plpgsql security definer set search_path=private,public as $$
declare v_id uuid; v_policy public.consent_policies%rowtype;
begin
 if p_granted_by<>auth.uid() then raise exception 'ACTOR_MISMATCH'; end if;
 if not private.is_tenant_member(p_tenant_id) then raise exception 'TENANT_ACCESS_DENIED'; end if;
 if p_decision not in ('granted','denied','revoked') then raise exception 'INVALID_CONSENT_DECISION'; end if;
 select * into v_policy from public.consent_policies where id=p_policy_id and tenant_id=p_tenant_id and status='active';
 if not found then raise exception 'POLICY_NOT_ACTIVE'; end if;
 perform private.validate_consent_subject(p_tenant_id,p_subject_type,p_subject_id);
 if p_decision='revoked' and not exists(select 1 from public.consent_records where tenant_id=p_tenant_id and policy_id=p_policy_id and subject_type=p_subject_type and subject_id=p_subject_id and decision='granted') then raise exception 'NO_GRANTED_CONSENT_TO_REVOKE'; end if;
 insert into public.consent_records(tenant_id,policy_id,subject_type,subject_id,granted_by,decision,granted_at,revoked_at,evidence,provenance)
 values(p_tenant_id,p_policy_id,p_subject_type,p_subject_id,p_granted_by,p_decision,case when p_decision='granted' then now() end,case when p_decision='revoked' then now() end,coalesce(p_evidence,'{}'::jsonb),coalesce(p_provenance,'{}'::jsonb)) returning id into v_id;
 insert into public.audit_events(tenant_id,actor_user_id,action_code,entity_type,entity_id,severity,source,payload) values(p_tenant_id,auth.uid(),'consent.record.'||p_decision,'consent_record',v_id,case when p_decision='revoked' then 'warning' else 'info' end,'engine_02',jsonb_build_object('subject_type',p_subject_type,'policy_id',p_policy_id));
 return v_id;
end $$;

create or replace function private.request_data_sharing(p_tenant_id uuid,p_policy_id uuid,p_subject_type text,p_subject_id uuid,p_recipient_type text,p_recipient_reference text,p_purpose text,p_requested_categories jsonb,p_requester_user_id uuid) returns uuid
language plpgsql security definer set search_path=private,public as $$
declare v_id uuid; v_policy public.consent_policies%rowtype;
begin
 if p_requester_user_id<>auth.uid() then raise exception 'ACTOR_MISMATCH'; end if;
 if not private.is_tenant_member(p_tenant_id) then raise exception 'TENANT_ACCESS_DENIED'; end if;
 perform private.validate_consent_subject(p_tenant_id,p_subject_type,p_subject_id);
 if p_policy_id is not null then
  select * into v_policy from public.consent_policies where id=p_policy_id and tenant_id=p_tenant_id and status='active';
  if not found then raise exception 'POLICY_NOT_ACTIVE'; end if;
  if jsonb_typeof(coalesce(p_requested_categories,'[]'::jsonb))<>'array' then raise exception 'INVALID_REQUESTED_CATEGORIES'; end if;
  if exists(select 1 from jsonb_array_elements_text(coalesce(p_requested_categories,'[]'::jsonb)) x where not exists(select 1 from jsonb_array_elements_text(coalesce(v_policy.data_categories,'[]'::jsonb)) y where y=x)) then raise exception 'REQUESTED_CATEGORY_OUTSIDE_POLICY'; end if;
 end if;
 if nullif(trim(coalesce(p_purpose,'')),'') is null then raise exception 'PURPOSE_REQUIRED'; end if;
 insert into public.data_sharing_requests(tenant_id,policy_id,subject_type,subject_id,requester_user_id,recipient_type,recipient_reference,purpose,requested_categories)
 values(p_tenant_id,p_policy_id,p_subject_type,p_subject_id,p_requester_user_id,p_recipient_type,p_recipient_reference,p_purpose,coalesce(p_requested_categories,'[]'::jsonb)) returning id into v_id;
 insert into public.audit_events(tenant_id,actor_user_id,action_code,entity_type,entity_id,severity,source,payload) values(p_tenant_id,auth.uid(),'data_sharing.request','data_sharing_request',v_id,'info','engine_02',jsonb_build_object('recipient_type',p_recipient_type,'purpose',p_purpose));
 return v_id;
end $$;
revoke execute on function private.record_consent(uuid,uuid,text,uuid,text,jsonb,jsonb,uuid) from public,anon,authenticated;
revoke execute on function private.request_data_sharing(uuid,uuid,text,uuid,text,text,text,jsonb,uuid) from public,anon,authenticated;
grant execute on function private.record_consent(uuid,uuid,text,uuid,text,jsonb,jsonb,uuid) to service_role;
grant execute on function private.request_data_sharing(uuid,uuid,text,uuid,text,text,text,jsonb,uuid) to service_role;