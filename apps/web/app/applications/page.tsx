import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const groups = [
  { label: "IDENTITAS & SISWA", min: 1, max: 6 },
  { label: "PEMBELAJARAN", min: 7, max: 12 },
  { label: "KESELAMATAN & KEHIDUPAN", min: 13, max: 16 },
  { label: "OPERASIONAL SEKOLAH", min: 17, max: 26 },
  { label: "INTELIJENSI & EKOSISTEM", min: 27, max: 33 },
];

function initials(name: string) {
  return name.replace(/[^A-Za-z0-9 ]/g, "").split(/\s+/).filter(Boolean).slice(0, 2).map(x => x[0]).join("").toUpperCase();
}

export default async function ApplicationsPage() {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return null;

  const { data: apps, error } = await supabase
    .from("application_registry")
    .select("id,code,sequence_no,name,short_name,description")
    .order("sequence_no");

  if (error) {
    return <main className="workspace-error"><Link href="/">← Masuk</Link><h1>EDUNEXUS</h1><p>{error.message}</p></main>;
  }

  return (
    <main className="nx-os">
      <aside className="nx-sidebar nx-sidebar-premium">
        <Link href="/applications" className="nx-brand nx-brand-premium">
          <span>EN</span>
          <div><b>EDUNEXUS</b><small>Intelligent Education OS</small></div>
        </Link>
        <div className="nx-sidebar-caption">RUANG KERJA</div>
        <Link href="/applications" className="nx-home-link active">⌂ <span>Beranda</span></Link>
        <div className="nx-sidebar-caption">APLIKASI</div>
        <nav className="nx-app-nav" aria-label="Aplikasi EDUNEXUS">
          {groups.map(group => {
            const items = (apps ?? []).filter(app => app.sequence_no >= group.min && app.sequence_no <= group.max);
            if (!items.length) return null;
            return (
              <div className="nx-nav-group" key={group.label}>
                <div className="nx-nav-group-label">{group.label}</div>
                {items.map(app => (
                  <Link href={`/applications/${app.code}`} key={app.id} className="nx-app-nav-item">
                    <span className="nx-app-glyph">{initials(app.short_name || app.name)}</span>
                    <span>{app.short_name || app.name}</span>
                  </Link>
                ))}
              </div>
            );
          })}
        </nav>
        <div className="nx-sidebar-foot nx-sidebar-foot-premium">
          <span><span className="nx-online-dot" /> Sistem aktif</span>
          <Link href="/tenant">Akun & akses</Link>
        </div>
      </aside>

      <section className="nx-main">
        <header className="nx-topbar nx-topbar-premium">
          <div>
            <span className="nx-kicker">EDUNEXUS / SCHOOL OS</span>
            <h1>Satu ruang kerja<br /><em>untuk seluruh sekolah.</em></h1>
            <p>Kelola siswa, pembelajaran, keselamatan, operasional, dan kecerdasan sekolah dari aplikasi yang saling terhubung.</p>
          </div>
          <div className="nx-header-actions">
            <span className="nx-live-badge"><span /> Live workspace</span>
            <Link className="nx-top-action" href="/tenant">Akun</Link>
          </div>
        </header>

        <div className="nx-command-strip">
          <div><strong>{apps?.length ?? 0}</strong><span>aplikasi kerja</span></div>
          <div><strong>01</strong><span>ruang terpadu</span></div>
          <div><strong>∞</strong><span>relasi data</span></div>
          <div className="nx-command-note">Pilih aplikasi untuk mulai bekerja. Data tetap mengikuti sesi dan aturan akses database.</div>
        </div>

        <section className="nx-app-hub">
          <div className="nx-hub-intro">
            <div><span className="nx-kicker">YOUR SCHOOL / TODAY</span><h2>Mulai dari pekerjaan yang ingin diselesaikan.</h2></div>
            <span className="nx-hub-rule" />
          </div>

          <div className="nx-app-grid">
            {(apps ?? []).map((app) => (
              <Link href={`/applications/${app.code}`} key={app.id} className="nx-app-card">
                <div className="nx-app-card-top"><span>{String(app.sequence_no).padStart(2, "0")}</span><span className="nx-card-arrow">↗</span></div>
                <div className="nx-app-card-glyph">{initials(app.short_name || app.name)}</div>
                <h3>{app.name}</h3>
                <p>{app.description}</p>
                <div className="nx-app-card-foot"><span>Buka ruang kerja</span><span>→</span></div>
              </Link>
            ))}
          </div>
        </section>

        <footer className="nx-os-footer">
          <span>EDUNEXUS</span><span>Operational Education OS · {apps?.length ?? 0} applications</span>
        </footer>
      </section>
    </main>
  );
}
