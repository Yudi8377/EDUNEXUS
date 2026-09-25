import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ slug: string }> };

async function getSite(slug: string) {
  const supabase = await createClient();
  const { data: site, error } = await supabase.from("school_websites").select("*").eq("slug", slug).eq("status", "published").maybeSingle();
  if (error || !site) return null;
  const [programs, news, events, facilities, achievements, faqs, admission] = await Promise.all([
    supabase.from("school_website_programs").select("*").eq("school_id", site.school_id).eq("status", "published").order("sort_order"),
    supabase.from("school_website_news").select("*").eq("school_id", site.school_id).eq("status", "published").order("published_at", { ascending: false }).limit(3),
    supabase.from("school_website_events").select("*").eq("school_id", site.school_id).eq("status", "published").order("starts_at").limit(4),
    supabase.from("school_website_facilities").select("*").eq("school_id", site.school_id).eq("status", "published").order("sort_order"),
    supabase.from("school_website_achievements").select("*").eq("school_id", site.school_id).eq("status", "published").order("year", { ascending: false }),
    supabase.from("school_website_faqs").select("*").eq("school_id", site.school_id).eq("status", "published").order("sort_order"),
    supabase.from("school_website_admission").select("*").eq("school_id", site.school_id).eq("status", "published").order("created_at", { ascending: false }).limit(1).maybeSingle(),
  ]);
  return {
    site,
    programs: programs.data ?? [],
    news: news.data ?? [],
    events: events.data ?? [],
    facilities: facilities.data ?? [],
    achievements: achievements.data ?? [],
    faqs: faqs.data ?? [],
    admission: admission.data ?? null,
  };
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const data = await getSite(slug);
  return data ? { title: data.site.site_name, description: data.site.tagline ?? data.site.hero_text } : { title: "Website Sekolah — EDUNEXUS" };
}

function dateID(value: string) {
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}
function timeID(value: string) {
  return new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

export default async function SchoolWebsite({ params }: Props) {
  const { slug } = await params;
  const data = await getSite(slug);
  if (!data) notFound();
  const { site, programs, news, events, facilities, achievements, faqs, admission } = data;

  return (
    <main className="school-site" style={{ "--school-primary": site.primary_color, "--school-accent": site.accent_color } as React.CSSProperties}>
      <header className="school-nav">
        <Link href={`/school/${site.slug}`} className="school-brand"><span className="school-mark">SN</span><span><b>{site.site_name}</b><small>{site.tagline}</small></span></Link>
        <nav aria-label="Navigasi sekolah">
          <a href="#tentang">Tentang</a><a href="#program">Program</a><a href="#fasilitas">Fasilitas</a><a href="#berita">Berita</a><a href="#agenda">Agenda</a>
        </nav>
        <div className="school-nav-actions"><Link href={`/school/${site.slug}/admission`} className="school-apply">Penerimaan</Link><Link href="/" className="school-login">Portal EDUNEXUS</Link></div>
      </header>

      <section className="school-hero">
        <div className="school-hero-copy">
          <span className="school-overline">SMA NUSANTARA MANDIRI · EDUNEXUS SCHOOL</span>
          <h1>{site.hero_title}</h1>
          <p>{site.hero_text}</p>
          <div className="school-hero-actions"><Link href={`/school/${site.slug}/admission`} className="school-cta">Lihat penerimaan <span>↗</span></Link><a href="#tentang" className="school-quiet-cta">Kenali sekolah <span>↓</span></a></div>
        </div>
        <div className="school-hero-visual" style={{ backgroundImage: `linear-gradient(180deg, rgba(10,28,21,.03), rgba(10,28,21,.62)), url("${site.hero_image_url}")` }}>
          <div className="school-hero-caption"><span>01</span><div><b>Ruang belajar yang hidup</b><small>Pengetahuan · Karakter · Masa depan</small></div></div>
        </div>
      </section>

      <section className="school-intro" id="tentang">
        <div className="school-section-label">Tentang sekolah</div>
        <div className="school-intro-main"><h2>{site.about_title}</h2><p>{site.about_text}</p><div className="school-contact-line"><span>● {site.address}</span><span>● {site.email}</span><span>● {site.phone}</span></div></div>
      </section>

      <section className="school-program-section" id="program">
        <div className="school-section-head"><div><span className="school-section-label">Cara kami belajar</span><h2>Program yang memberi ruang<br />untuk tumbuh.</h2></div><p>Website sekolah ini mengambil konten dari sumber data sekolah di EDUNEXUS. Konten dapat dikelola sekolah tanpa membuat data baru di tempat lain.</p></div>
        <div className="school-program-grid">{programs.map((item: any, i: number) => <article className="school-program-card" key={item.id}><div className="school-card-image" style={{ backgroundImage: `url("${item.image_url}")` }}><span>0{i + 1}</span></div><div className="school-card-body"><h3>{item.title}</h3><p>{item.summary}</p><details><summary>Lihat detail</summary><p>{item.detail}</p></details></div></article>)}</div>
      </section>

      <section className="school-facility-section" id="fasilitas">
        <div className="school-section-head"><div><span className="school-section-label">Lingkungan</span><h2>Tempat belajar<br />yang terasa nyata.</h2></div></div>
        <div className="school-facility-grid">{facilities.map((item: any) => <article key={item.id} className="school-facility-card"><div className="school-facility-image" style={{ backgroundImage: `url("${item.image_url}")` }} /><div><h3>{item.name}</h3><p>{item.description}</p></div></article>)}</div>
      </section>

      <section className="school-achievement-band"><div><span className="school-section-label">Jejak prestasi</span><h2>Prestasi lahir dari<br />proses yang konsisten.</h2></div><div className="school-achievement-list">{achievements.map((item: any) => <article key={item.id}><span>{item.year}</span><div><b>{item.title}</b><small>{item.category}</small><p>{item.description}</p></div></article>)}</div></section>

      <section className="school-news-section" id="berita">
        <div className="school-section-head"><div><span className="school-section-label">Kabar sekolah</span><h2>Yang sedang terjadi.</h2></div><span className="school-section-note">Informasi publik sekolah</span></div>
        <div className="school-news-grid">{news.map((item: any) => <article key={item.id} className="school-news-card"><div className="school-news-image" style={{ backgroundImage: `url("${item.image_url}")` }} /><div className="school-news-body"><small>{item.published_at ? dateID(item.published_at) : "Terbaru"}</small><h3>{item.title}</h3><p>{item.excerpt}</p><span>Baca cerita →</span></div></article>)}</div>
      </section>

      <section className="school-agenda-section" id="agenda"><div className="school-section-head"><div><span className="school-section-label">Agenda</span><h2>Temui kami<br />di kegiatan berikutnya.</h2></div></div><div className="school-agenda-list">{events.map((item: any) => <article key={item.id}><div className="school-date"><b>{new Date(item.starts_at).getDate().toString().padStart(2,"0")}</b><span>{new Intl.DateTimeFormat("id-ID",{month:"short"}).format(new Date(item.starts_at))}</span></div><div><h3>{item.title}</h3><p>{item.description}</p><small>{timeID(item.starts_at)} · {item.location}</small></div><span className="school-arrow">↗</span></article>)}</div></section>

      {admission && <section className="school-admission" id="penerimaan"><div className="school-admission-copy"><span className="school-section-label">Penerimaan peserta didik</span><h2>{admission.title}</h2><p>{admission.description}</p><div className="school-pathways">{(admission.pathways ?? []).map((path: string) => <span key={path}>{path}</span>)}</div><Link href={`/school/${site.slug}/admission`} className="school-cta">Lihat jalur & jadwal <span>↗</span></Link></div><div className="school-admission-side"><span>Status pendaftaran</span><b>{admission.registration_open ? "Dibuka" : "Belum dibuka"}</b><small>{admission.registration_start} — {admission.registration_end}</small></div></section>}

      <section className="school-faq-section"><div><span className="school-section-label">Pertanyaan</span><h2>Yang sering ditanyakan.</h2></div><div className="school-faq-list">{faqs.map((item: any) => <details key={item.id}><summary>{item.question}</summary><p>{item.answer}</p></details>)}</div></section>

      <footer className="school-footer"><div><div className="school-brand footer-brand"><span className="school-mark">SN</span><span><b>{site.site_name}</b><small>Bagian dari ekosistem EDUNEXUS</small></span></div><p>{site.tagline}</p></div><div className="school-footer-contact"><b>Hubungi sekolah</b><span>{site.address}</span><span>{site.phone}</span><span>{site.email}</span>{site.maps_url && <a href={site.maps_url}>Buka lokasi ↗</a>}</div><div className="school-footer-meta"><span>Website sekolah · EDUNEXUS</span><Link href="/">Portal EDUNEXUS ↗</Link></div></footer>
    </main>
  );
}
