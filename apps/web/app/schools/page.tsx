import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function SchoolsPage() {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims) return null;
  const { data: schools, error } = await supabase.from("schools").select("id,tenant_id,code,name,address,phone,status").order("name");
  return (
    <main className="simple-page">
      <a href="/">← Pusat Kendali</a>
      <p className="eyebrow">DIREKTORI SEKOLAH • LANGSUNG</p>
      <h1>Konteks operasional sekolah.</h1>
      <p className="lede">Sekolah dibatasi berdasarkan organisasi. Peramban tidak pernah menerima kredensial basis data istimewa.</p>
      {error ? <div className="empty-card"><strong>Data sekolah tidak tersedia</strong><span>{error.message}</span></div> :
        schools?.length ? <div className="empty-card"><strong>{schools.length} sekolah yang terlihat{schools.length===1?"":"s"}</strong><div className="tenant-list">{schools.map(s=><article className="student-row" key={s.id}><div><strong>{s.name}</strong><span>{s.code} · {s.status}</span></div><small>{s.address ?? "Alamat not recorded"}</small></article>)}</div></div> :
        <div className="empty-card"><strong>Belum ada data sekolah yang terlihat</strong><span>EDUNEXUS tidak membuat data sekolah palsu. Buat sekolah nyata melalui pendaftaran terkendali.</span></div>}
    </main>
  );
}
