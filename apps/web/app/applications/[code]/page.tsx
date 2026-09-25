import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PrintButton from "@/components/print-button";
import ApplicationContextMenu from "@/components/application-context-menu";

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
    <main className="nx-workspace">
      <aside className="nx-sidebar">
        <Link href="/applications" className="nx-brand"><span>EN</span><div><b>EDUNEXUS</b><small>Education OS</small></div></Link>
        <div className="nx-sidebar-label">APLIKASI</div>
        <nav className="nx-app-nav">
          {apps?.map((item) => (
            <Link href={`/applications/${item.code}`} key={item.id} className={item.code === app.code ? "nx-app-nav-item active" : "nx-app-nav-item"}>
              <span className="nx-app-code">{item.code}</span>
              <span>{item.short_name || item.name}</span>
            </Link>
          ))}
        </nav>
        <div className="nx-sidebar-foot"><span><span className="nx-online-dot" /> Sesi aktif</span><Link href="/applications">Semua aplikasi</Link></div>
      </aside>

      <section className="nx-main">
        <header className="nx-topbar nx-app-header">
          <div>
            <span className="eyebrow">EDUNEXUS</span>
            <h1>{app.name}</h1>
            <p>{app.description}</p>
          </div>
          <div className="nx-header-actions">
            <PrintButton />
            <ApplicationContextMenu code={app.code} />
            <Link className="nx-top-action" href="/tenant">Akun</Link>
          </div>
        </header>

        <section className="nx-workspace-grid nx-workspace-grid-wide">
          <article className="nx-command-card nx-command-card-primary">
            <div className="nx-module-heading">
              <div>
                <span className="eyebrow">DATA KERJA</span>
                <h2>Modul aplikasi</h2>
                <p>Pilih modul untuk melihat, menambah, mengubah, menghapus, dan mencetak data.</p>
              </div>
              <Link className="nx-data-launch" href={`/applications/${app.code}/data`}>Semua data <span>→</span></Link>
            </div>
            <div className="nx-entity-list">
              {activeEntities.map(entity => (
                <Link href={`/applications/${app.code}/data/${entity.id}`} key={entity.id} className="nx-entity-item">
                  <span className="nx-entity-icon">DB</span>
                  <span><b>{entity.entity_name}</b><small>{entity.purpose}</small></span>
                  <span className="nx-entity-action">Buka →</span>
                </Link>
              ))}
              {!activeEntities.length && <div className="nx-empty">Belum ada modul data aktif pada aplikasi ini. Modul akan dibuka setelah database operasional tersedia.</div>}
            </div>
          </article>
        </section>
      </section>
    </main>
  );
}
