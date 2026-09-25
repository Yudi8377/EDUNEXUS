-- EDUNEXUS School Website Engine v1
-- Public tenant-branded school website + admin-managed content.
create extension if not exists pgcrypto;

create table if not exists public.school_websites (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  slug text not null unique,
  status text not null default 'draft' check(status in('draft','published','archived')),
  site_name text not null, tagline text, hero_title text, hero_text text, hero_image_url text,
  about_title text, about_text text, address text, phone text, email text, maps_url text,
  instagram_url text, youtube_url text, facebook_url text,
  primary_color text not null default '#1e604b', accent_color text not null default '#55d7ae',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.school_website_programs (
  id uuid primary key default gen_random_uuid(), school_id uuid not null references public.schools(id) on delete cascade,
  title text not null, summary text, detail text, image_url text, sort_order int not null default 0,
  status text not null default 'published' check(status in('draft','published','archived')), created_at timestamptz not null default now()
);
create table if not exists public.school_website_news (
  id uuid primary key default gen_random_uuid(), school_id uuid not null references public.schools(id) on delete cascade,
  title text not null, slug text not null, excerpt text, body text, image_url text, published_at timestamptz,
  status text not null default 'draft' check(status in('draft','published','archived')), created_at timestamptz not null default now(),
  unique(school_id,slug)
);
create table if not exists public.school_website_events (
  id uuid primary key default gen_random_uuid(), school_id uuid not null references public.schools(id) on delete cascade,
  title text not null, description text, starts_at timestamptz not null, ends_at timestamptz, location text,
  status text not null default 'published' check(status in('draft','published','archived')), created_at timestamptz not null default now()
);
create table if not exists public.school_website_facilities (
  id uuid primary key default gen_random_uuid(), school_id uuid not null references public.schools(id) on delete cascade,
  name text not null, description text, image_url text, sort_order int not null default 0,
  status text not null default 'published' check(status in('draft','published','archived')), created_at timestamptz not null default now()
);
create table if not exists public.school_website_achievements (
  id uuid primary key default gen_random_uuid(), school_id uuid not null references public.schools(id) on delete cascade,
  title text not null, category text, year int, description text,
  status text not null default 'published' check(status in('draft','published','archived')), created_at timestamptz not null default now()
);
create table if not exists public.school_website_faqs (
  id uuid primary key default gen_random_uuid(), school_id uuid not null references public.schools(id) on delete cascade,
  question text not null, answer text not null, sort_order int not null default 0,
  status text not null default 'published' check(status in('draft','published','archived')), created_at timestamptz not null default now()
);
create table if not exists public.school_website_admission (
  id uuid primary key default gen_random_uuid(), school_id uuid not null references public.schools(id) on delete cascade,
  title text not null, description text, registration_url text, registration_open bool not null default false,
  registration_start date, registration_end date, pathways jsonb not null default '[]'::jsonb,
  status text not null default 'published' check(status in('draft','published','archived')), created_at timestamptz not null default now()
);

create index if not exists school_websites_school_idx on public.school_websites(school_id);
create index if not exists school_website_programs_school_idx on public.school_website_programs(school_id,status,sort_order);
create index if not exists school_website_news_school_idx on public.school_website_news(school_id,status,published_at desc);
create index if not exists school_website_events_school_idx on public.school_website_events(school_id,status,starts_at);
create index if not exists school_website_facilities_school_idx on public.school_website_facilities(school_id,status,sort_order);
create index if not exists school_website_achievements_school_idx on public.school_website_achievements(school_id,status,year desc);
create index if not exists school_website_faqs_school_idx on public.school_website_faqs(school_id,status,sort_order);
create index if not exists school_website_admission_school_idx on public.school_website_admission(school_id,status);

create or replace function public.school_website_member(p_school_id uuid)
returns boolean language sql stable security invoker set search_path=public
as $$ select exists(
  select 1 from public.tenant_memberships m
  join public.schools s on s.tenant_id=m.tenant_id
  where s.id=p_school_id and m.user_id=(select auth.uid()) and m.status='active'
); $$;

do $$
declare t text;
begin
 foreach t in array array['school_websites','school_website_programs','school_website_news','school_website_events','school_website_facilities','school_website_achievements','school_website_faqs','school_website_admission'] loop
  execute format('alter table public.%I enable row level security',t);
  execute format('revoke all on table public.%I from anon,authenticated',t);
  execute format('grant select on table public.%I to anon',t);
  execute format('grant select,insert,update,delete on table public.%I to authenticated',t);
 end loop;
end $$;

drop policy if exists school_website_public_select on public.school_websites;
create policy school_website_public_select on public.school_websites for select to anon using(status='published');
drop policy if exists school_website_member_select on public.school_websites;
create policy school_website_member_select on public.school_websites for select to authenticated using(public.school_website_member(school_id));
drop policy if exists school_website_member_insert on public.school_websites;
create policy school_website_member_insert on public.school_websites for insert to authenticated with check(public.school_website_member(school_id));
drop policy if exists school_website_member_update on public.school_websites;
create policy school_website_member_update on public.school_websites for update to authenticated using(public.school_website_member(school_id)) with check(public.school_website_member(school_id));
drop policy if exists school_website_member_delete on public.school_websites;
create policy school_website_member_delete on public.school_websites for delete to authenticated using(public.school_website_member(school_id));

do $$
declare t text;
begin
 foreach t in array array['school_website_programs','school_website_news','school_website_events','school_website_facilities','school_website_achievements','school_website_faqs','school_website_admission'] loop
  execute format('create policy %I on public.%I for select to anon using(status=''published'')',t||'_public_select',t);
  execute format('create policy %I on public.%I for select to authenticated using(public.school_website_member(school_id))',t||'_member_select',t);
  execute format('create policy %I on public.%I for insert to authenticated with check(public.school_website_member(school_id))',t||'_member_insert',t);
  execute format('create policy %I on public.%I for update to authenticated using(public.school_website_member(school_id)) with check(public.school_website_member(school_id))',t||'_member_update',t);
  execute format('create policy %I on public.%I for delete to authenticated using(public.school_website_member(school_id))',t||'_member_delete',t);
 end loop;
end $$;

-- Demo content for SNM-DEMO; all records are explicitly demo/public website content.
insert into public.school_websites(school_id,slug,status,site_name,tagline,hero_title,hero_text,hero_image_url,about_title,about_text,address,phone,email,maps_url,instagram_url,youtube_url)
select s.id,'sma-nusantara-mandiri','published','SMA Nusantara Mandiri','Sekolah yang menumbuhkan pengetahuan, karakter, dan masa depan.','Belajar hari ini. Menjadi pemimpin masa depan.','SMA Nusantara Mandiri menghadirkan pengalaman belajar yang terarah, aman, dan relevan—dengan ruang bagi prestasi, karakter, kreativitas, dan kesiapan menghadapi dunia.','https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1800&q=85','Tentang sekolah','Website demo EDUNEXUS: informasi publik, agenda, program, prestasi, fasilitas, dan penerimaan peserta didik dikelola sebagai satu sumber data.','Jl. Pendidikan Nusantara No. 1, Indonesia','021-555-0199','info@smanusantaromandiri.sch.id','https://maps.google.com/?q=SMA+Nusantara+Mandiri','https://instagram.com/','https://youtube.com/'
from public.schools s where s.code='SNM-DEMO'
on conflict(slug) do update set status=excluded.status,site_name=excluded.site_name,tagline=excluded.tagline,hero_title=excluded.hero_title,hero_text=excluded.hero_text,hero_image_url=excluded.hero_image_url,about_title=excluded.about_title,about_text=excluded.about_text,address=excluded.address,phone=excluded.phone,email=excluded.email,maps_url=excluded.maps_url,instagram_url=excluded.instagram_url,youtube_url=excluded.youtube_url,updated_at=now();

insert into public.school_website_programs(school_id,title,summary,detail,image_url,sort_order)
select s.id,v.title,v.summary,v.detail,v.image_url,v.sort_order from public.schools s cross join (values
('Kurikulum Berbasis Kompetensi','Pembelajaran yang menghubungkan pengetahuan, keterampilan, dan bukti belajar.','Pengalaman belajar yang terukur dan terdokumentasi.','https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=900&q=80',1),
('Kelas Digital & Smart Classroom','Ruang belajar yang memadukan guru, perangkat, dan sumber belajar digital.','Teknologi memperjelas pembelajaran tanpa menggantikan peran guru.','https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=900&q=80',2),
('Pengembangan Karakter & Kepemimpinan','Ruang bagi siswa untuk bertumbuh sebagai pribadi yang bertanggung jawab.','Organisasi, proyek, refleksi, dan kolaborasi menjadi bagian pengalaman sekolah.','https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=900&q=80',3)
)v(title,summary,detail,image_url,sort_order) where s.code='SNM-DEMO' and not exists(select 1 from public.school_website_programs p where p.school_id=s.id);

insert into public.school_website_news(school_id,title,slug,excerpt,body,image_url,published_at,status)
select s.id,v.title,v.slug,v.excerpt,v.body,v.image_url,v.published_at,'published' from public.schools s cross join (values
('Awal Tahun Ajaran: Ruang Belajar Baru','awal-tahun-ajaran-ruang-belajar-baru','Siswa dan guru memulai tahun ajaran dengan lingkungan belajar yang lebih terhubung.','Momentum untuk memperkuat budaya belajar, kolaborasi, dan kepedulian.','https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80',now()-interval '2 days'),
('Proyek Sains Siswa: Dari Kelas ke Kehidupan','proyek-sains-siswa','Proyek lintas mata pelajaran memberi siswa kesempatan memecahkan persoalan nyata.','Siswa menyusun pertanyaan, menguji gagasan, dan mempresentasikan hasilnya.','https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=80',now()-interval '8 days'),
('Perpustakaan Digital Mulai Diperluas','perpustakaan-digital-diperluas','Koleksi dan aktivitas literasi diperluas untuk pembelajaran mandiri.','Program literasi menggabungkan koleksi fisik, sumber digital, dan aktivitas membaca.','https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80',now()-interval '15 days')
)v(title,slug,excerpt,body,image_url,published_at) where s.code='SNM-DEMO' and not exists(select 1 from public.school_website_news n where n.school_id=s.id);

insert into public.school_website_events(school_id,title,description,starts_at,ends_at,location,status)
select s.id,v.title,v.description,v.starts_at::timestamptz,v.ends_at::timestamptz,v.location,'published' from public.schools s cross join (values
('Open School Day','Kunjungan calon siswa dan orang tua.','2026-10-03 08:00:00+07','2026-10-03 12:00:00+07','Kampus SMA Nusantara Mandiri'),
('Parent Learning Forum','Forum komunikasi sekolah dan orang tua tentang pendampingan belajar.','2026-10-10 09:00:00+07','2026-10-10 11:00:00+07','Aula Utama'),
('Student Project Showcase','Pameran karya dan proyek siswa lintas bidang.','2026-10-24 09:00:00+07','2026-10-24 14:00:00+07','Gedung Kreativitas')
)v(title,description,starts_at,ends_at,location) where s.code='SNM-DEMO' and not exists(select 1 from public.school_website_events e where e.school_id=s.id);

insert into public.school_website_facilities(school_id,name,description,image_url,sort_order)
select s.id,v.name,v.description,v.image_url,v.sort_order from public.schools s cross join (values
('Smart Classroom','Ruang belajar dengan perangkat presentasi dan konektivitas digital.','https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=900&q=80',1),
('Perpustakaan','Ruang literasi untuk membaca, riset, dan pembelajaran mandiri.','https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=900&q=80',2),
('Laboratorium Sains','Ruang praktik untuk eksperimen dan proyek berbasis bukti.','https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=900&q=80',3),
('Lapangan & Ruang Aktivitas','Area untuk olahraga, organisasi, dan komunitas sekolah.','https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=900&q=80',4)
)v(name,description,image_url,sort_order) where s.code='SNM-DEMO' and not exists(select 1 from public.school_website_facilities f where f.school_id=s.id);

insert into public.school_website_achievements(school_id,title,category,year,description,status)
select s.id,v.title,v.category,v.year,v.description,'published' from public.schools s cross join (values
('Finalis Olimpiade Sains Tingkat Provinsi','Akademik',2026,'Tim siswa mengikuti tahap final kompetisi sains tingkat provinsi.'),
('Juara 2 Debat Pelajar Regional','Bahasa & Kepemimpinan',2026,'Delegasi sekolah mengikuti kompetisi debat regional.'),
('Penghargaan Proyek Lingkungan Sekolah','Proyek & Lingkungan',2025,'Proyek siswa tentang pengelolaan lingkungan mendapat apresiasi.')
)v(title,category,year,description) where s.code='SNM-DEMO' and not exists(select 1 from public.school_website_achievements a where a.school_id=s.id);

insert into public.school_website_faqs(school_id,question,answer,sort_order)
select s.id,v.question,v.answer,v.sort_order from public.schools s cross join (values
('Bagaimana cara mendaftar ke sekolah?','Informasi penerimaan peserta didik tersedia pada bagian Penerimaan. Jalur dan jadwal mengikuti kebijakan sekolah.',1),
('Apakah orang tua dapat melihat informasi kegiatan sekolah?','Ya. Informasi publik tersedia di website, sedangkan informasi pribadi dan layanan orang tua berada di EDUNEXUS.',2),
('Apakah website terhubung dengan EDUNEXUS?','Ya. Konten publik, agenda, program, prestasi, fasilitas, dan penerimaan dirancang sebagai bagian ekosistem EDUNEXUS.',3)
)v(question,answer,sort_order) where s.code='SNM-DEMO' and not exists(select 1 from public.school_website_faqs f where f.school_id=s.id);

insert into public.school_website_admission(school_id,title,description,registration_url,registration_open,registration_start,registration_end,pathways,status)
select s.id,'Penerimaan Peserta Didik Baru','Informasi penerimaan peserta didik terhubung dengan alur SPMB sekolah.','/school/sma-nusantara-mandiri/admission',true,'2026-10-01','2026-12-20','["Domisili","Afirmasi","Prestasi","Mutasi"]'::jsonb,'published'
from public.schools s where s.code='SNM-DEMO' and not exists(select 1 from public.school_website_admission a where a.school_id=s.id);
