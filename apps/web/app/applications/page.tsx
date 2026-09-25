import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ApplicationsPage() {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return null;

  const { data: apps, error } = await supabase
    .from("application_registry")
    .select("id,code,sequence_no,name,short_name,description,lifecycle_status,route,audience,capabilities")
    .order("sequence_no");

  if (error) {
    return <main className="workspace-error"><Link href="/">← Masuk</Link><h1>Application Workspace</h1><p>{error.message}</p></main>;
  }

  return (
    <main className="nx-workspace">
      <aside className="nx-sidebar">
        <Link href="/applications" className="nx-brand"><span>EN</span><div><b>EDUNEXUS</b><small>Education OS</small></div></Link>
        <div className="nx-sidebar-label">APPLICATIONS</div>
        <nav className="nx-app-nav">
          {apps?.map((app) => (
            <Link href={`/applications/${app.code}`} key={app.id} className="nx-app-nav-item">
              <span className="nx-app-code">{app.code}</span>
              <span>{app.short_name || app.name}</span>
            </Link>
          ))}
        </nav>
        <div className="nx-sidebar-foot">
          <span className="nx-online-dot" /> Session aktif
          <Link href="/tenant">Akun & akses</Link>
        </div>
      </aside>

      <section className="nx-main">
        <header className="nx-topbar">
          <div>
            <span className="eyebrow">EDUNEXUS / APPLICATION WORKSPACE</span>
            <h1>Daftar aplikasi</h1>
            <p>Buka aplikasi kerja, pilih modul data, jalankan proses, dan cetak dokumen. Ini adalah workspace operasional — bukan papan pengumuman.</p>
          </div>
          <Link className="nx-top-action" href="/tenant">Akun</Link>
        </header>

        <div className="nx-toolbar">
          <strong>{apps?.length ?? 0} aplikasi</strong>
          <span>Pilih aplikasi yang ingin dikerjakan. Detail teknis internal tidak ditampilkan di sini.</span>
        </div>

        <section className="nx-application-table" aria-label="Daftar aplikasi EDUNEXUS">
          <div className="nx-application-head"><span>Kode</span><span>Aplikasi</span><span>Fungsi</span><span /></div>
          {apps?.map((app) => (
            <Link href={`/applications/${app.code}`} key={app.id} className="nx-application-row">
              <span className="nx-code">{app.code}</span>
              <span className="nx-app-title"><b>{app.name}</b></span>
              <span className="nx-app-desc">{app.description}</span>
              <span className="nx-launch">Buka →</span>
            </Link>
          ))}
        </section>
      </section>
    </main>
  );
}
