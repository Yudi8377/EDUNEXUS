import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PrintButton from "@/components/print-button";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ code: string }> };

export default async function ApplicationWorkspacePage({ params }: Props) {
  const { code } = await params;
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return null;

  const { data: app } = await supabase.from("application_registry").select("*").eq("code", code).maybeSingle();
  if (!app) notFound();

  const [{ data: entities }, { data: apps }] = await Promise.all([
    supabase.from("application_entities").select("id,entity_name,table_name,purpose,implementation_status,is_primary").eq("application_id", app.id).order("is_primary",{ascending:false}).order("entity_name"),
    supabase.from("application_registry").select("id,code,name,short_name,sequence_no").order("sequence_no")
  ]);

  const activeEntities = (entities ?? []).filter(e => e.implementation_status === "existing");

  return (
    <main className="nx-os">
      <aside className="nx-sidebar nx-sidebar-premium">
        <Link href="/applications" className="nx-brand nx-brand-premium"><span>EN</span><div><b>EDUNEXUS</b><small>Intelligent Education OS</small></div></Link>
        <div className="nx-sidebar-caption">RUANG KERJA</div>
        <Link href="/applications" className="nx-home-link">⌂ <span>Beranda</span></Link>
        <div className="nx-sidebar-caption">APLIKASI</div>
        <nav className="nx-app-nav" aria-label="Aplikasi EDUNEXUS">
          {(apps ?? []).map(item => (
            <Link href={`/applications/${item.code}`} key={item.id} className={item.code === app.code ? "nx-app-nav-item active" : "nx-app-nav-item"}>
              <span className="nx-app-glyph">{String(item.sequence_no).padStart(2,"0")}</span>
              <span>{item.short_name || item.name}</span>
            </Link>
          ))}
        </nav>
        <div className="nx-sidebar-foot nx-sidebar-foot-premium"><span><span className="nx-online-dot" /> Sistem aktif</span><Link href="/tenant">Akun & akses</Link></div>
      </aside>

      <section className="nx-main">
        <header className="nx-topbar nx-topbar-premium nx-detail-topbar">
          <div>
            <Link href="/applications" className="nx-breadcrumb">EDUNEXUS / Semua aplikasi</Link>
            <span className="nx-kicker">RUANG KERJA / {String(app.sequence_no).padStart(2,"0")}</span>
            <h1>{app.name}</h1>
            <p>{app.description}</p>
          </div>
          <div className="nx-header-actions"><span className="nx-live-badge"><span /> Live workspace</span><PrintButton /><Link className="nx-top-action" href="/tenant">Akun</Link></div>
        </header>

        <nav className="nx-section-nav nx-main-section-nav" aria-label="Navigasi aplikasi">
          <Link href={`/applications/${app.code}`} className="active">Beranda</Link>
          <Link href={`/applications/${app.code}/data`}>Data</Link>
          <Link href={`/applications/${app.code}/workflow`}>Proses kerja</Link>
          <Link href={`/applications/${app.code}/documents`}>Dokumen</Link>
          <Link href={`/applications/${app.code}/access`}>Hak akses</Link>
        </nav>

        <section className="nx-context-line">
          <span className="nx-context-dot" /><span>{app.short_name || app.name}</span><i>→</i><span>Ruang kerja aktif</span><i>→</i><span>{activeEntities.length} modul data</span>
        </section>

        <section className="nx-workspace-grid nx-workspace-grid-premium">
          <article className="nx-command-card nx-command-card-primary nx-command-card-premium">
            <span className="nx-kicker">KERJA HARI INI</span>
            <h2>Modul yang bisa dikerjakan</h2>
            <p>Pilih data yang ingin Anda kelola. Setiap perubahan tetap mengikuti sesi pengguna dan aturan database.</p>
            <div className="nx-entity-list nx-entity-list-premium">
              {activeEntities.map(entity => (
                <Link href={`/applications/${app.code}/data/${entity.id}`} key={entity.id} className="nx-entity-item">
                  <span className="nx-entity-icon">{entity.is_primary ? "●" : "○"}</span>
                  <span><b>{entity.entity_name}</b><small>{entity.purpose}</small></span>
                  <span className="nx-entity-action">Kelola →</span>
                </Link>
              ))}
              {!activeEntities.length && <div className="nx-empty"><strong>Belum ada modul data operasional.</strong><br />Ruang ini akan aktif ketika tabel domain tersedia. Tidak ada data palsu yang ditampilkan sebagai data produksi.</div>}
            </div>
          </article>

          <aside className="nx-side-stack">
            <article className="nx-command-card nx-command-card-premium">
              <span className="nx-kicker">AKSI CEPAT</span>
              <h3>Kerjakan sekarang</h3>
              <div className="nx-quick-actions">
                <Link className="nx-action-primary" href={`/applications/${app.code}/data`}>Kelola data <span>→</span></Link>
                <Link href={`/applications/${app.code}/workflow`}>Lihat proses kerja <span>→</span></Link>
                <Link href={`/applications/${app.code}/documents`}>Buka dokumen & cetak <span>→</span></Link>
              </div>
            </article>
            <article className="nx-command-card nx-connection-card">
              <span className="nx-kicker">KONTEKS DATA</span>
              <h3>{activeEntities.length} modul</h3>
              <p>Data di ruang ini dapat terhubung dengan siswa, kelas, guru, wali, pembelajaran, keselamatan, dan proses lain sesuai relasi yang tersedia.</p>
            </article>
          </aside>
        </section>
      </section>
    </main>
  );
}
