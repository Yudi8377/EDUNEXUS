-- ENGINE 02 Consent & Data Sharing foundation
create table if not exists public.consent_policies (
 id uuid primary key default gen_random_uuid(),
 tenant_id uuid not null references public.tenants(id) on delete cascade,
 code text not null, version integer not null default 1, purpose text not null,
 data_categories jsonb not null default '[]'::jsonb, sharing_scope jsonb not null default '{}'::jsonb,
 required boolean not null default false, status text not null default 'active' check(status in ('draft','active','retired')),
 effective_from timestamptz not null default now(), effective_until timestamptz, created_by uuid,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(tenant_id,code,version)
);
create table if not exists public.consent_records (
 id uuid primary key default gen_random_uuid(), tenant_id uuid not null references public.tenants(id) on delete cascade,
 policy_id uuid not null references public.consent_policies(id) on delete restrict,
 subject_type text not null check(subject_type in ('student','guardian','employee','user')), subject_id uuid not null,
 granted_by uuid not null, decision text not null check(decision in ('granted','denied','revoked')),
 granted_at timestamptz, revoked_at timestamptz, evidence jsonb not null default '{}'::jsonb,
 provenance jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.data_sharing_requests (
 id uuid primary key default gen_random_uuid(), tenant_id uuid not null references public.tenants(id) on delete cascade,
 policy_id uuid references public.consent_policies(id) on delete restrict, subject_type text not null, subject_id uuid not null,
 requester_user_id uuid not null, recipient_type text not null, recipient_reference text, purpose text not null,
 requested_categories jsonb not null default '[]'::jsonb,
 status text not null default 'pending' check(status in ('pending','approved','denied','revoked','expired')),
 decision_by uuid, decision_at timestamptz, evidence jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index if not exists idx_consent_records_subject on public.consent_records(tenant_id,subject_type,subject_id);
create index if not exists idx_consent_requests_subject on public.data_sharing_requests(tenant_id,subject_type,subject_id);
alter table public.consent_policies enable row level security;
alter table public.consent_records enable row level security;
alter table public.data_sharing_requests enable row level security;
create policy consent_policies_select on public.consent_policies for select to authenticated using (private.is_tenant_member(tenant_id));
create policy consent_records_select on public.consent_records for select to authenticated using (private.is_tenant_member(tenant_id));
create policy data_sharing_requests_select on public.data_sharing_requests for select to authenticated using (private.is_tenant_member(tenant_id));
revoke insert,update,delete on public.consent_policies from anon,authenticated;
revoke insert,update,delete on public.consent_records from anon,authenticated;
revoke insert,update,delete on public.data_sharing_requests from anon,authenticated;
