-- EDUNEXUS business engine register v1
-- Canonical product architecture: ENGINE 01-18.
-- Technical modules remain supporting control-plane capabilities.

create table if not exists public.business_engine_registry (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  engine_no text not null unique,
  name text not null,
  layer text not null default 'Business Engine',
  status text not null check (status in ('planned','foundation','in_progress','pilot_ready','integrated','production')),
  risk_level text not null check (risk_level in ('L0','L1','L2','L3','L4','L5','L6')),
  owner_domain text not null,
  description text not null,
  scope jsonb not null default '{}'::jsonb,
  acceptance_criteria jsonb not null default '[]'::jsonb,
  current_implementation jsonb not null default '{}'::jsonb,
  contract_version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.business_engine_dependencies (
  id uuid primary key default gen_random_uuid(),
  engine_id uuid not null references public.business_engine_registry(id) on delete cascade,
  depends_on_engine_id uuid not null references public.business_engine_registry(id) on delete restrict,
  dependency_type text not null check (dependency_type in ('required','supporting','optional')),
  required_for text,
  created_at timestamptz not null default now(),
  unique(engine_id, depends_on_engine_id)
);

create table if not exists public.business_engine_modules (
  id uuid primary key default gen_random_uuid(),
  engine_id uuid not null references public.business_engine_registry(id) on delete cascade,
  module_id uuid not null references public.module_registry(id) on delete restrict,
  relationship text not null check (relationship in ('core','supporting','governance','infrastructure','intelligence')),
  required boolean not null default true,
  created_at timestamptz not null default now(),
  unique(engine_id,module_id)
);

alter table public.business_engine_registry enable row level security;
alter table public.business_engine_dependencies enable row level security;
alter table public.business_engine_modules enable row level security;

create policy business_engine_registry_select on public.business_engine_registry
for select to authenticated using (true);
create policy business_engine_dependencies_select on public.business_engine_dependencies
for select to authenticated using (true);
create policy business_engine_modules_select on public.business_engine_modules
for select to authenticated using (true);

revoke insert, update, delete on public.business_engine_registry from anon, authenticated;
revoke insert, update, delete on public.business_engine_dependencies from anon, authenticated;
revoke insert, update, delete on public.business_engine_modules from anon, authenticated;

create index if not exists idx_business_engine_status on public.business_engine_registry(status);
create index if not exists idx_business_engine_dep_engine on public.business_engine_dependencies(engine_id);
create index if not exists idx_business_engine_dep_depends on public.business_engine_dependencies(depends_on_engine_id);
create index if not exists idx_business_engine_modules_engine on public.business_engine_modules(engine_id);
create index if not exists idx_business_engine_modules_module on public.business_engine_modules(module_id);

-- Canonical engine seed data is maintained in the Supabase migration history.
-- The production seed is intentionally omitted here from this synchronization stub;
-- the live project is the verified source of truth for current status metadata.
