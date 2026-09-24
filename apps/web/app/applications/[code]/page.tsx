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

  const [{ data: entities }, { data: workflows }, { data: permissions }, { data: apps }] = await Promise.all([
    supabase.from("application_entities").select("id,entity_name,table_name,purpose,implementation_status,is_primary").eq("application_id", app.id).order("is_primary",{ascending:false}).order("entity_name"),
    supabase.from("application_workflows").select("sequence_no,step_name,actor,input_description,output_description,requires_approval").eq("application_id", app.id).order("sequence_no"),
    supabase.from("application_permissions").select("role_code,permission_code,permission_description").eq("application_id", app.id).order("role_code"),
    supabase.from("application_registry").select("id,code,name,short_name,sequence_no").order("sequence_no")
  ]);

  const activeEntities = (entities ?? []).filter(e => e.implementation_status === "existing");
  const plannedEntities = (entities ?? []).filter(e => e.implementation_status !== "existing");

  return (
    <main className="nx-workspace">
      <aside className="nx-sidebar">
        <Link href="/applications" className="nx-brand"><span>EN</span><div><b>EDUNEXUS</b><small>Education OS</small></div></Link>
        <div className="nx-sidebar-label">APPLICATIONS</div>
        <nav className="nx-app-nav">
          {apps?.map((item) => (
            <Link href={`/applications/${item.code}`} key={item.id} className={item.code === app.code ? "nx-app-nav-item active" : "nx-app-nav-item"}>
              <span className="nx-app-code">{item.code}</span>
              <span>{item.short_name || item.name}</span>
            </Link>
          ))}
        </nav>
        <div className="nx-sidebar-foot"><span className="nx-online-dot" /> Session aktif<Link href="/applications">Semua aplikasi</Link></div>
      </aside>

      <section className="nx-main">
        <header className="nx-topbar nx-app-header">
          <div>
            <span className="eyebrow">APPLICATION {app.code}</span>
            <h1>{app.name}</h1>
            <p>{app.description}</p>
          </div>
          <div className="nx-header-actions"><PrintButton /><Link className="nx-top-action" href="/tenant">Akun</Link></div>
        </header>

        <div className="nx-module-nav" aria-label="Navigasi aplikasi">
          <span className="active">Workspace</span>
          <span>Data</span>
          <span>Workflow</span>
          <span>Documents</span>
          <span>Access</span>
        </div>

        <section className="nx-workspace-grid">
          <article className="nx-command-card nx-command-card-primary">
            <div><span className="eyebrow">OPERATIONS</span><h2>Modul kerja</h2><p>Pilih data yang benar-benar tersedia untuk melihat record. Modul yang belum memiliki tabel domain tetap ditandai sebagai planned.</p></div>
            <div className="nx-entity-list">
              {activeEntities.map(entity => (
                <Link href={`/applications/${app.code}/data/${entity.id}`} key={entity.id} className="nx-entity-item">
                  <span className="nx-entity-icon">DB</span>
                  <span><b>{entity.entity_name}</b><small>{entity.purpose}</small></span>
                  <span className="nx-entity-action">Kelola →</span>
                </Link>
              ))}
              {!activeEntities.length && <div className="nx-empty">Belum ada tabel domain aktif untuk aplikasi ini. Kontrak aplikasinya sudah tersedia, implementasi database menjadi tahap berikutnya.</div>}
            </div>
          </article>

          <aside className="nx-side-stack">
            <article className="nx-command-card"><span className="eyebrow">APPLICATION STATE</span><h3>{app.lifecycle_status}</h3><p>{activeEntities.length} modul data aktif · {plannedEntities.length} modul direncanakan</p></article>
            <article className="nx-command-card"><span className="eyebrow">CAPABILITIES</span><div className="nx-capability-list">{(app.capabilities ?? []).map((x:string)=><span key={x}>✓ {x}</span>)}</div></article>
          </aside>
        </section>

        <section className="nx-section">
          <div className="nx-section-heading"><div><span className="eyebrow">PROCESS</span><h2>Alur kerja</h2></div><span>{workflows?.length ?? 0} langkah</span></div>
          <div className="nx-workflow-table">
            {(workflows ?? []).map(w => <div className="nx-workflow-line" key={w.sequence_no}><b>{String(w.sequence_no).padStart(2,"0")}</b><strong>{w.step_name}</strong><span>{w.actor}</span><small>{w.output_description}{w.requires_approval ? " · approval" : ""}</small></div>)}
          </div>
        </section>

        <section className="nx-section">
          <div className="nx-section-heading"><div><span className="eyebrow">ACCESS CONTROL</span><h2>Hak akses</h2></div><span>RLS tetap menjadi batas runtime</span></div>
          <div className="nx-permission-table">{(permissions ?? []).map(p => <div className="nx-permission-line" key={p.role_code+p.permission_code}><b>{p.role_code}</b><code>{p.permission_code}</code><span>{p.permission_description}</span></div>)}</div>
        </section>
      </section>
    </main>
  );
}
