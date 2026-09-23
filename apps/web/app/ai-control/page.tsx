import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AIControlPage() {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims) return null;
  const { data: rows, error } = await supabase.from("v_ai_control_center").select("*").limit(20);
  return (
    <main className="simple-page">
      <a href="/">← Pusat Kendali</a>
      <p className="eyebrow">PUSAT KENDALI AI • TERKENDALI</p>
      <h1>Pantau pekerjaan AI tanpa melewati kewenangan manusia.</h1>
      <p className="lede">Tindakan berisiko tinggi tetap berada di balik persetujuan atau keputusan manusia. Halaman ini hanya untuk pemantauan.</p>
      {error ? <div className="empty-card"><strong>Data kendali AI tidak tersedia</strong><span>{error.message}</span></div> :
        rows?.length ? <div className="empty-card"><div className="tenant-list">{rows.map((r,i)=><article className="student-row" key={r.tenant_id ?? i}><div><strong>Organisasi {String(r.tenant_id).slice(0,8)}</strong><span>Antrean {r.queued_tasks ?? 0} · Menunggu persetujuan {r.awaiting_approval_tasks ?? 0} · Sedang dijalankan {r.executing_tasks ?? 0}</span></div><small>Berisiko tinggi: {r.high_risk_tasks ?? 0}</small></article>)}</div></div> :
        <div className="empty-card"><strong>Belum ada tugas AI</strong><span>Pusat kendali aktif, tetapi belum ada data tugas organisasi.</span></div>}
    </main>
  );
}
