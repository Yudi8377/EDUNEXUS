-- EDUNEXUS HR operational workspace
create table if not exists public.positions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id),
  code text not null, name text not null, department text,
  status text not null default 'active' check (status in ('active','inactive')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (tenant_id, code)
);
create table if not exists public.employees (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id),
  employee_no text not null, full_name text not null, email text, phone text,
  position_id uuid references public.positions(id),
  employment_status text not null default 'active' check (employment_status in ('active','inactive','on_leave','terminated')),
  hire_date date, birth_date date, address text, notes text,
  teacher_id uuid references public.teachers(id),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (tenant_id, employee_no)
);
create table if not exists public.employment_contracts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id),
  employee_id uuid not null references public.employees(id) on delete cascade,
  contract_no text not null, contract_type text not null, start_date date not null, end_date date,
  status text not null default 'active' check (status in ('draft','active','expired','terminated')),
  notes text, created_at timestamptz not null default now(),
  unique (tenant_id, contract_no)
);
create table if not exists public.hr_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id),
  employee_id uuid not null references public.employees(id) on delete cascade,
  event_type text not null, event_date date not null default current_date, title text not null,
  details text, status text not null default 'recorded' check (status in ('recorded','pending','completed','cancelled')),
  created_at timestamptz not null default now()
);
alter table public.positions enable row level security;
alter table public.employees enable row level security;
alter table public.employment_contracts enable row level security;
alter table public.hr_events enable row level security;
drop policy if exists "tenant_member_positions" on public.positions;
create policy "tenant_member_positions" on public.positions for all to authenticated using (private.is_tenant_member(tenant_id)) with check (private.is_tenant_member(tenant_id));
drop policy if exists "tenant_member_employees" on public.employees;
create policy "tenant_member_employees" on public.employees for all to authenticated using (private.is_tenant_member(tenant_id)) with check (private.is_tenant_member(tenant_id));
drop policy if exists "tenant_member_employment_contracts" on public.employment_contracts;
create policy "tenant_member_employment_contracts" on public.employment_contracts for all to authenticated using (private.is_tenant_member(tenant_id)) with check (private.is_tenant_member(tenant_id));
drop policy if exists "tenant_member_hr_events" on public.hr_events;
create policy "tenant_member_hr_events" on public.hr_events for all to authenticated using (private.is_tenant_member(tenant_id)) with check (private.is_tenant_member(tenant_id));
grant select, insert, update, delete on public.positions, public.employees, public.employment_contracts, public.hr_events to authenticated;

do $$
declare app_id uuid;
begin
  select id into app_id from public.application_registry where code='15';
  update public.application_entities set table_name='employees', purpose='Data induk pegawai dan profil kepegawaian', implementation_status='existing', is_primary=true where application_id=app_id and entity_name='employees';
  update public.application_entities set table_name='employment_contracts', purpose='Kontrak dan masa kerja pegawai', implementation_status='existing' where application_id=app_id and entity_name='employment_contracts';
  update public.application_entities set table_name='hr_events', purpose='Riwayat peristiwa dan aktivitas HR pegawai', implementation_status='existing' where application_id=app_id and entity_name='hr_events';
  update public.application_entities set table_name='positions', purpose='Master jabatan dan unit kerja', implementation_status='existing' where application_id=app_id and entity_name='positions';
end $$;

insert into public.positions (tenant_id,code,name,department)
select t.id,v.code,v.name,v.department from public.tenants t cross join (values
('DIR','Kepala Sekolah','Pimpinan'),('WAKASEK','Wakil Kepala Sekolah','Manajemen'),('TEACHER','Guru','Akademik'),('ADMIN','Administrasi','Operasional'),('COUNSELOR','Konselor','Kesiswaan')
) v(code,name,department) where t.id='fdc7e813-87c6-4ace-9709-b46d4a4356c0' on conflict (tenant_id,code) do nothing;

insert into public.employees (tenant_id,employee_no,full_name,email,phone,position_id,employment_status,hire_date,teacher_id,notes)
select 'fdc7e813-87c6-4ace-9709-b46d4a4356c0',v.employee_no,v.full_name,v.email,v.phone,p.id,'active',v.hire_date,v.teacher_id,v.notes
from (values
('EMP-0001','Dr. Andi Pratama','andi.pratama@edunexus.demo','081200000101','DIR','2018-07-01'::date,null::uuid,'Kepala sekolah'),
('EMP-0002','Siti Rahmawati','siti.rahmawati@edunexus.demo','081200000102','WAKASEK','2019-07-01'::date,null::uuid,'Wakil kepala sekolah'),
('EMP-0003','Budi Santoso','budi.santoso@edunexus.demo','081200000103','TEACHER','2020-07-01'::date,(select id from public.teachers where employee_no='TCH-001'),'Guru Matematika'),
('EMP-0004','Rina Maharani','rina.maharani@edunexus.demo','081200000104','TEACHER','2021-07-01'::date,(select id from public.teachers where employee_no='TCH-002'),'Guru Bahasa Indonesia'),
('EMP-0005','Dimas Kurniawan','dimas.kurniawan@edunexus.demo','081200000105','ADMIN','2022-01-10'::date,null::uuid,'Administrasi sekolah'),
('EMP-0006','Lestari Wulandari','lestari.wulandari@edunexus.demo','081200000106','COUNSELOR','2021-08-02'::date,null::uuid,'Konselor sekolah')
) v(employee_no,full_name,email,phone,position_code,hire_date,teacher_id,notes)
join public.positions p on p.tenant_id='fdc7e813-87c6-4ace-9709-b46d4a4356c0' and p.code=v.position_code
where not exists (select 1 from public.employees e where e.tenant_id='fdc7e813-87c6-4ace-9709-b46d4a4356c0' and e.employee_no=v.employee_no);

insert into public.employment_contracts (tenant_id,employee_id,contract_no,contract_type,start_date,end_date,status,notes)
select e.tenant_id,e.id,'CTR-'||right(e.employee_no,4),case when e.employee_no in ('EMP-0001','EMP-0002','EMP-0003','EMP-0004') then 'Tetap' else 'PKWT' end,e.hire_date,case when e.employee_no in ('EMP-0005','EMP-0006') then '2027-12-31'::date else null end,'active','Data demo EDUNEXUS'
from public.employees e where e.tenant_id='fdc7e813-87c6-4ace-9709-b46d4a4356c0' and not exists (select 1 from public.employment_contracts c where c.employee_id=e.id);

insert into public.hr_events (tenant_id,employee_id,event_type,event_date,title,details,status)
select e.tenant_id,e.id,v.event_type,v.event_date,v.title,v.details,v.status from public.employees e
cross join lateral (values ('ONBOARDING',e.hire_date,'Onboarding pegawai','Verifikasi dokumen dan pengenalan lingkungan sekolah','completed'),('PERFORMANCE',current_date - 20,'Evaluasi kinerja semester','Review target kerja dan catatan pengembangan','completed')) v(event_type,event_date,title,details,status)
where e.tenant_id='fdc7e813-87c6-4ace-9709-b46d4a4356c0' and not exists (select 1 from public.hr_events h where h.employee_id=e.id and h.event_type=v.event_type);
