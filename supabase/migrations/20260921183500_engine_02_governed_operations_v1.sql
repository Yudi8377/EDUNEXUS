-- ENGINE 02 governed operations
create or replace function private.create_consent_policy(p_tenant_id uuid,p_code text,p_version int,purpose text,p_data_categories jsonb,p_sharing_scope jsonb,p_required boolean,p_effective_from timestamptz,p_effective_until timestamptz,p_created_by uuid)
returns uuid language plpgsql security definer set search_path=private,public as $$ declare v_id uuid; begin
 if p_created_by <> auth.uid() then raise exception 'ACTOR_MISMATCH'; end if;
 if not private.is_tenant_member(p_tenant_id) then raise exception 'TENANT_ACCESS_DENIED'; end if;
 if not exists(select 1 from public.tenant_memberships where tenant_id=p_tenant_id and user_id=auth.uid() and status='active' and role_code in ('TENANT_ADMIN','SCHOOL_ADMIN')) then raise exception 'CONSENT_POLICY_ADMIN_REQUIRED'; end if;
 if trim(coalesce(p_code,''))='' then raise exception 'POLICY_CODE_REQUIRED'; end if;
 insert into public.consent_policies(tenant_id,code,version,purpose,data_categories,sharing_scope,required,effective_from,effective_until,created_by)
 values(p_tenant_id,trim(p_code),p_version,purpose,coalesce(p_data_categories,'[]'),coalesce(p_sharing_scope,'{}'),p_required,coalesce(p_effective_from,now()),p_effective_until,p_created_by) returning id into v_id;
 insert into public.audit_events(tenant_id,actor_user_id,action_code,entity_type,entity_id,severity,source,payload) values(p_tenant_id,auth.uid(),'consent.policy.create','consent_policy',v_id,'info','engine_02','{}');
 return v_id; end $$;

create or replace function private.record_consent(p_tenant_id uuid,p_policy_id uuid,p_subject_type text,p_subject_id uuid,p_decision text,p_evidence jsonb,p_provenance jsonb,p_granted_by uuid)
returns uuid language plpgsql security definer set search_path=private,public as $$ declare v_id uuid; begin
 if p_granted_by <> auth.uid() then raise exception 'ACTOR_MISMATCH'; end if;
 if not private.is_tenant_member(p_tenant_id) then raise exception 'TENANT_ACCESS_DENIED'; end if;
 if p_decision not in ('granted','denied','revoked') then raise exception 'INVALID_CONSENT_DECISION'; end if;
 if not exists(select 1 from public.consent_policies where id=p_policy_id and tenant_id=p_tenant_id and status='active') then raise exception 'POLICY_NOT_ACTIVE'; end if;
 insert into public.consent_records(tenant_id,policy_id,subject_type,subject_id,granted_by,decision,granted_at,revoked_at,evidence,provenance)
 values(p_tenant_id,p_policy_id,p_subject_type,p_subject_id,p_granted_by,p_decision,case when p_decision='granted' then now() end,case when p_decision='revoked' then now() end,coalesce(p_evidence,'{}'),coalesce(p_provenance,'{}')) returning id into v_id;
 insert into public.audit_events(tenant_id,actor_user_id,action_code,entity_type,entity_id,severity,source,payload) values(p_tenant_id,auth.uid(),'consent.record.'||p_decision,'consent_record',v_id,'info','engine_02',jsonb_build_object('policy_id',p_policy_id,'subject_type',p_subject_type));
 return v_id; end $$;

create or replace function private.request_data_sharing(p_tenant_id uuid,p_policy_id uuid,p_subject_type text,p_subject_id uuid,p_recipient_type text,p_recipient_reference text,p_purpose text,p_requested_categories jsonb,p_requester_user_id uuid)
returns uuid language plpgsql security definer set search_path=private,public as $$ declare v_id uuid; begin
 if p_requester_user_id <> auth.uid() then raise exception 'ACTOR_MISMATCH'; end if;
 if not private.is_tenant_member(p_tenant_id) then raise exception 'TENANT_ACCESS_DENIED'; end if;
 if p_policy_id is not null and not exists(select 1 from public.consent_policies where id=p_policy_id and tenant_id=p_tenant_id and status='active') then raise exception 'POLICY_NOT_ACTIVE'; end if;
 insert into public.data_sharing_requests(tenant_id,policy_id,subject_type,subject_id,requester_user_id,recipient_type,recipient_reference,purpose,requested_categories)
 values(p_tenant_id,p_policy_id,p_subject_type,p_subject_id,p_requester_user_id,p_recipient_type,p_recipient_reference,p_purpose,coalesce(p_requested_categories,'[]')) returning id into v_id;
 insert into public.audit_events(tenant_id,actor_user_id,action_code,entity_type,entity_id,severity,source,payload) values(p_tenant_id,auth.uid(),'data_sharing.request','data_sharing_request',v_id,'info','engine_02',jsonb_build_object('recipient_type',p_recipient_type,'purpose',p_purpose));
 return v_id; end $$;

revoke all on function private.create_consent_policy(uuid,text,int,text,jsonb,jsonb,boolean,timestamptz,timestamptz,uuid) from public,anon,authenticated;
revoke all on function private.record_consent(uuid,uuid,text,uuid,text,jsonb,jsonb,uuid) from public,anon,authenticated;
revoke all on function private.request_data_sharing(uuid,uuid,text,uuid,text,text,text,jsonb,uuid) from public,anon,authenticated;