create table if not exists public.application_registry (
 id uuid primary key default gen_random_uuid(), code text not null unique, sequence_no integer not null unique,
 name text not null, short_name text not null, description text not null,
 lifecycle_status text not null default 'planned' check (lifecycle_status in ('planned','foundation','building','pilot','released')),
 route text not null unique, audience text[] not null default '{}', capabilities text[] not null default '{}',
 print_documents text[] not null default '{}', created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.application_entities (
 id uuid primary key default gen_random_uuid(), application_id uuid not null references public.application_registry(id) on delete cascade,
 entity_name text not null, table_name text not null, purpose text not null,
 implementation_status text not null default 'planned' check (implementation_status in ('planned','existing','building','released')),
 is_primary boolean not null default false, unique(application_id,entity_name), unique(application_id,table_name)
);
create table if not exists public.application_relations (
 id uuid primary key default gen_random_uuid(), application_id uuid not null references public.application_registry(id) on delete cascade,
 source_entity_id uuid not null references public.application_entities(id) on delete cascade,
 target_entity_id uuid not null references public.application_entities(id) on delete cascade,
 relation_type text not null check (relation_type in ('1:1','1:N','N:1','N:N')),
 source_column text not null, target_column text not null, cardinality_note text not null,
 unique(application_id,source_entity_id,target_entity_id,source_column,target_column)
);
create table if not exists public.application_workflows (
 id uuid primary key default gen_random_uuid(), application_id uuid not null references public.application_registry(id) on delete cascade,
 sequence_no integer not null, step_name text not null, actor text not null, input_description text not null,
 output_description text not null, requires_approval boolean not null default false, unique(application_id,sequence_no)
);
create table if not exists public.application_permissions (
 id uuid primary key default gen_random_uuid(), application_id uuid not null references public.application_registry(id) on delete cascade,
 role_code text not null, permission_code text not null, permission_description text not null,
 unique(application_id,role_code,permission_code)
);
alter table public.application_registry enable row level security;
alter table public.application_entities enable row level security;
alter table public.application_relations enable row level security;
alter table public.application_workflows enable row level security;
alter table public.application_permissions enable row level security;
drop policy if exists "authenticated can read application registry" on public.application_registry;
create policy "authenticated can read application registry" on public.application_registry for select to authenticated using (true);
drop policy if exists "authenticated can read application entities" on public.application_entities;
create policy "authenticated can read application entities" on public.application_entities for select to authenticated using (true);
drop policy if exists "authenticated can read application relations" on public.application_relations;
create policy "authenticated can read application relations" on public.application_relations for select to authenticated using (true);
drop policy if exists "authenticated can read application workflows" on public.application_workflows;
create policy "authenticated can read application workflows" on public.application_workflows for select to authenticated using (true);
drop policy if exists "authenticated can read application permissions" on public.application_permissions;
create policy "authenticated can read application permissions" on public.application_permissions for select to authenticated using (true);
grant select on public.application_registry,public.application_entities,public.application_relations,public.application_workflows,public.application_permissions to authenticated;
