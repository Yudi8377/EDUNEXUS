import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ slug: string }> };

export default async function AdmissionPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: site } = await supabase.from("school_websites").select("*").eq("slug", slug).eq("status","published").maybeSingle();
  if (!site) notFound();
  const { data: admission } = await supabase.from("school_website_admission").select("*").eq("school_id",site.school_id).eq("status","published").order("created_at",{ascending:false}).limit(1).maybeSingle();
  const { data: events } = await supabase.from("school_website_events").select("*").eq("school_id",site.school_id).eq("status","published").order("starts_at").limit(6);
  if (!admission) notFound();

  return <main className="school-admission-page" style={{"--school-primary":site.primary_color,"--school-accent":site.accent_color} as React.CSSProperties}>
    <header className="school-nav school-nav-light"><Link href={`/school/${site.slug}`} className="school-brand"><span className="school-mark">SN</span><span><b>{site.site_name}</b><small>{site.tagline}</small></span></Link><div className="school-nav-actions"><Link href={`/school/${site.slug}`} className="school-login">← Kembali ke website</Link><Link href="/" className="school-login">Portal EDUNEXUS</Link></div></header>
    <section className="admission-hero"><span className="school-section-label">Penerimaan peserta didik</span><h1>{admission.title}</h1><p>{admission.description}</p><div className="admission-status"><b>{admission.registration_open ? "Pendaftaran dibuka" : "Pendaftaran belum dibuka"}</b><span>{admission.registration_start} — {admission.registration_end}</span></div></section>
    <section className="admission-content"><div className="admission-main"><span className="school-section-label">Jalur penerimaan</span><h2>Pilih jalur yang sesuai.</h2><div className="admission-path-grid">{(admission.pathways ?? []).map((path:string,i:number)=><article key={path}><span>0{i+1}</span><h3>{path}</h3><p>Jalur ini dikonfigurasi sekolah dan akan terhubung ke proses SPMB EDUNEXUS untuk pendaftaran, dokumen, verifikasi, dan tahapan berikutnya.</p></article>)}</div><div className="admission-note"><b>Catatan</b><p>Halaman ini adalah kanal informasi publik. Data pribadi calon siswa tidak ditampilkan di website publik dan akan diproses melalui alur penerimaan yang terlindungi.</p></div></div><aside className="admission-aside"><div><span>Status</span><strong>{admission.registration_open ? "Dibuka" : "Belum dibuka"}</strong></div><div><span>Mulai</span><strong>{admission.registration_start}</strong></div><div><span>Berakhir</span><strong>{admission.registration_end}</strong></div><Link href="/" className="school-cta">Masuk ke EDUNEXUS <span>↗</span></Link></aside></section>
    <section className="admission-events"><div><span className="school-section-label">Agenda penerimaan</span><h2>Temui sekolah.</h2></div><div className="school-agenda-list">{(events??[]).map((item:any)=><article key={item.id}><div className="school-date"><b>{new Date(item.starts_at).getDate().toString().padStart(2,"0")}</b><span>{new Intl.DateTimeFormat("id-ID",{month:"short"}).format(new Date(item.starts_at))}</span></div><div><h3>{item.title}</h3><p>{item.description}</p><small>{new Intl.DateTimeFormat("id-ID",{hour:"2-digit",minute:"2-digit"}).format(new Date(item.starts_at))} · {item.location}</small></div></article>)}</div></section>
    <footer className="school-footer admission-footer"><div><b>{site.site_name}</b><p>{site.address}</p></div><Link href={`/school/${site.slug}`}>Website sekolah ↗</Link></footer>
  </main>
}