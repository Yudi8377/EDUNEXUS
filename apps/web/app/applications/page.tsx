import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const iconFor = (code: string) => {
  const map: Record<string, string> = {
    "01": "◈", "02": "◇", "03": "◎", "04": "↻", "05": "＋", "06": "✦",
    "07": "▦", "08": "▣", "09": "◆", "10": "◌", "11": "▤", "12": "✧",
    "13": "♥", "14": "◒", "15": "♙", "16": "↳", "17": "Rp", "18": "▤",
  };
  return map[code] ?? "•";
};

export default async function ApplicationsPage() {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return null;

  const { data: apps, error } = await supabase
    .from("application_registry")
    .select("id,code,sequence_no,name,short_name,description,lifecycle_status,route,audience,capabilities")
    .order("sequence_no");

  if (error) {
    return <main className="workspace-error"><Link href="/">← Masuk</Link><h1>Workspace</h1><p>{error.message}</p></main>;
  }

  const activeApps = apps?.filter((app) => app.lifecycle_status !== "planned").length ?? 0;
  const plannedApps = (apps?.length ?? 0) - activeApps;

  return (
    <main className="bos-shell">
      <aside className="bos-sidebar">
        <Link href="/applications" className="bos-logo">
          <span className="bos-logo-mark">EX</span>
          <span><b>EDUNEXUS</b><small>Business OS</small></span>
        </Link>

        <div className="bos-nav-label">WORKSPACE</div>
        <nav className="bos-nav">
          <Link href="/applications" className="active"><i>⌂</i> Ringkasan</Link>
          <Link href="/applications"><i>▦</i> Semua aplikasi <em>{apps?.length ?? 0}</em></Link>
          <Link href="/students"><i>◎</i> Student 360</Link>
          <Link href="/teachers"><i>♙</i> Teacher</Link>
          <Link href="/reports"><i>▥</i> Laporan</Link>
        </nav>

        <div className="bos-nav-label">MANAGEMENT</div>
        <nav className="bos-nav">
          <Link href="/tenant"><i>⚙</i> Organisasi & akses</Link>
          <Link href="/applications/31"><i>▤</i> Dokumen & cetak</Link>
          <Link href="/applications/33"><i>◈</i> Control Center</Link>
        </nav>

        <div className="bos-sidebar-bottom">
          <div className="bos-status"><span /> Sistem aktif</div>
          <Link href="/tenant" className="bos-account">
            <span className="bos-avatar">AD</span>
            <span><b>Administrator</b><small>Akun & akses</small></span>
            <strong>›</strong>
          </Link>
        </div>
      </aside>

      <section className="bos-main">
        <header className="bos-header">
          <div className="bos-header-title">
            <button className="bos-mobile-menu" aria-label="Menu">☰</button>
            <div>
              <span className="bos-eyebrow">EDUNEXUS / RINGKASAN</span>
              <h1>Selamat datang kembali.</h1>
              <p>Kelola kegiatan sekolah, data, dokumen, dan pekerjaan harian dari satu tempat.</p>
            </div>
          </div>
          <div className="bos-header-actions">
            <label className="bos-search"><span>⌕</span><input placeholder="Cari aplikasi atau data…" /></label>
            <button className="bos-icon-button" aria-label="Notifikasi">♢</button>
            <Link href="/tenant" className="bos-profile">AD</Link>
          </div>
        </header>

        <div className="bos-content">
          <section className="bos-welcome">
            <div>
              <span className="bos-welcome-kicker">EDUCATION BUSINESS OPERATING SYSTEM</span>
              <h2>Satu ruang kerja untuk seluruh sekolah.</h2>
              <p>EDUNEXUS menghubungkan operasi sekolah, pembelajaran, keselamatan, administrasi, keuangan, dan AI dengan data yang saling terhubung.</p>
              <div className="bos-welcome-actions">
                <Link href="/applications/03">Buka Student 360 <span>→</span></Link>
                <Link href="/applications/31" className="secondary">Cetak dokumen</Link>
              </div>
            </div>
            <div className="bos-orb" aria-hidden="true">
              <div className="bos-orb-ring ring-1" /><div className="bos-orb-ring ring-2" />
              <div className="bos-orb-core">EX<small>OS</small></div>
              <span className="bos-orb-dot dot-1"/><span className="bos-orb-dot dot-2"/><span className="bos-orb-dot dot-3"/>
            </div>
          </section>

          <section className="bos-metrics" aria-label="Ringkasan">
            <article><span className="bos-metric-icon green">▦</span><div><small>APLIKASI</small><b>{apps?.length ?? 0}</b><p>Domain tersedia</p></div></article>
            <article><span className="bos-metric-icon blue">✓</span><div><small>AKTIF</small><b>{activeApps}</b><p>Siap digunakan</p></div></article>
            <article><span className="bos-metric-icon gold">◷</span><div><small>DISIAPKAN</small><b>{plannedApps}</b><p>Dalam pengembangan</p></div></article>
            <article><span className="bos-metric-icon purple">⌁</span><div><small>DATA</small><b>Terhubung</b><p>Workspace sekolah</p></div></article>
          </section>

          <section className="bos-section-head">
            <div><span>WORKSPACE</span><h2>Aplikasi sekolah</h2></div>
            <span>{apps?.length ?? 0} aplikasi tersedia</span>
          </section>

          <section className="bos-app-grid" aria-label="Aplikasi EDUNEXUS">
            {apps?.map((app) => (
              <Link href={`/applications/${app.code}`} key={app.id} className="bos-app-card">
                <div className="bos-app-card-top">
                  <span className="bos-app-icon">{iconFor(app.code)}</span>
                  <span className="bos-app-arrow">↗</span>
                </div>
                <small>APP {String(app.sequence_no).padStart(2, "0")}</small>
                <h3>{app.short_name || app.name}</h3>
                <p>{app.description}</p>
                <div className="bos-app-card-foot"><span>{app.audience || "Sekolah"}</span><b>Buka</b></div>
              </Link>
            ))}
          </section>

          <section className="bos-bottom-grid">
            <article className="bos-panel">
              <div className="bos-panel-head"><div><span>AKSES CEPAT</span><h3>Pekerjaan utama</h3></div><Link href="/applications">Lihat semua →</Link></div>
              <div className="bos-quick-list">
                <Link href="/applications/03"><span className="quick-icon">◎</span><div><b>Student 360</b><small>Data siswa, wali, kehadiran, pembelajaran</small></div><strong>›</strong></Link>
                <Link href="/applications/15"><span className="quick-icon">♙</span><div><b>HR</b><small>Data pegawai, kontrak, dan peristiwa HR</small></div><strong>›</strong></Link>
                <Link href="/applications/17"><span className="quick-icon">Rp</span><div><b>Finance</b><small>Operasi keuangan dan dokumen transaksi</small></div><strong>›</strong></Link>
                <Link href="/applications/32"><span className="quick-icon">▤</span><div><b>Reporting</b><small>Laporan operasional sekolah</small></div><strong>›</strong></Link>
              </div>
            </article>

            <article className="bos-panel bos-panel-dark">
              <span>EDUNEXUS INTELLIGENCE</span>
              <h3>Data terhubung.<br/>Keputusan lebih jelas.</h3>
              <p>Gunakan AI, workflow, reporting, dan dokumen dari workspace yang sama. Akses tetap mengikuti akun dan sekolah Anda.</p>
              <Link href="/applications/27">Buka AI Orchestrator →</Link>
            </article>
          </section>
        </div>
      </section>
    </main>
  );
}
