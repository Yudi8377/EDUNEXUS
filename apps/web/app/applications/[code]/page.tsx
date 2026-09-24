import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ code: string }> };

export default async function ApplicationDetailPage({ params }: Props) {
  const { code } = await params;
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return null;

  const { data: app } = await supabase.from("application_registry").select("*").eq("code", code).maybeSingle();
  if (!app) notFound();

  const [{ data: entities }, { data: relations }, { data: workflows }, { data: permissions }] = await Promise.all([
    supabase.from("application_entities").select("id,entity_name,table_name,purpose,implementation_status,is_primary").eq("application_id", app.id).order("is_primary",{ascending:false}).order("entity_name"),
    supabase.from("application_relations").select("id,source_entity_id,target_entity_id,relation_type,source_column,target_column,cardinality_note").eq("application_id", app.id),
    supabase.from("application_workflows").select("sequence_no,step_name,actor,input_description,output_description,requires_approval").eq("application_id", app.id).order("sequence_no"),
    supabase.from("application_permissions").select("role_code,permission_code,permission_description").eq("application_id", app.id).order("role_code")
  ]);

  const entityMap = new Map((entities ?? []).map(e => [e.id, e.entity_name]));
  return (
    <main className="app-detail">
      <nav className="app-detail-nav"><Link href="/applications">← Semua aplikasi</Link><span>EDUNEXUS / {app.code}</span><Link href="/tenant">Akun & akses</Link></nav>
      <header className="app-detail-hero">
        <div><span className="app-index-no">{app.code}</span><span className="eyebrow">APPLICATION SPECIFICATION</span><h1>{app.name}</h1><p>{app.description}</p></div>
        <div className="app-lifecycle"><small>LIFECYCLE</small><strong>{app.lifecycle_status}</strong><span>Route: {app.route}</span></div>
      </header>

      <section className="app-detail-grid">
        <article className="spec-card"><span className="eyebrow">1 · KEBUTUHAN</span><h2>Kapabilitas aplikasi</h2><div className="spec-list">{(app.capabilities ?? []).map((x:string)=><div key={x}><b>✓</b>{x}</div>)}</div></article>
        <article className="spec-card"><span className="eyebrow">2 · PENGGUNA</span><h2>Peran yang dilayani</h2><div className="role-list">{(app.audience ?? []).map((x:string)=><span key={x}>{x}</span>)}</div><p className="spec-note">Hak akses runtime tetap mengikuti role database dan RLS. Registry ini menjelaskan kontrak aplikasi, bukan menggantikan authorization.</p></article>
      </section>

      <section className="spec-section"><div className="section-label"><span className="eyebrow">3 · DATA MODEL</span><h2>Entitas & tabel</h2><p>Setiap aplikasi memiliki entitas inti. Status <b>existing</b> berarti tabel sudah ada pada fondasi database; <b>planned</b> berarti kontrak sudah didefinisikan dan implementasi tabel/domain berikutnya belum dipalsukan sebagai selesai.</p></div>
        <div className="entity-table"><div className="entity-head"><span>Entitas</span><span>Tabel</span><span>Status</span><span>Peran</span></div>{(entities ?? []).map(e=><div className="entity-row" key={e.id}><span><b>{e.entity_name}</b><small>{e.purpose}</small></span><code>{e.table_name}</code><span className={`app-status status-${e.implementation_status}`}>{e.implementation_status}</span><span>{e.is_primary ? "Primary" : "Related"}</span></div>)}</div>
      </section>

      <section className="spec-section"><div className="section-label"><span className="eyebrow">4 · RELATIONAL CONTRACT</span><h2>Relasi database</h2><p>Relasi ditampilkan eksplisit agar implementasi domain berikutnya memakai cardinality dan foreign-key intent yang konsisten.</p></div>
        <div className="relation-list">{(relations ?? []).map(r=><article className="relation-row" key={r.id}><div><b>{entityMap.get(r.source_entity_id) ?? "Source"}</b><code>{r.source_column}</code></div><strong>{r.relation_type}</strong><div><b>{entityMap.get(r.target_entity_id) ?? "Target"}</b><code>{r.target_column}</code></div><p>{r.cardinality_note}</p></article>)}{!(relations ?? []).length&&<div className="empty-spec">Relasi akan ditambahkan bersama domain schema. Tidak ada relasi fiktif yang dibuat.</div>}</div>
      </section>

      <section className="spec-section"><div className="section-label"><span className="eyebrow">5 · WORKFLOW</span><h2>Alur kerja aplikasi</h2></div>
        <div className="workflow-list">{(workflows ?? []).map(w=><article key={w.sequence_no} className="workflow-row"><span>{String(w.sequence_no).padStart(2,"0")}</span><div><b>{w.step_name}</b><small>{w.actor}{w.requires_approval ? " · approval required" : ""}</small></div><p><b>Input:</b> {w.input_description}<br/><b>Output:</b> {w.output_description}</p></article>)}</div>
      </section>

      <section className="spec-section"><div className="section-label"><span className="eyebrow">6 · PERMISSION CONTRACT</span><h2>Hak akses awal</h2></div>
        <div className="permission-grid">{(permissions ?? []).map(p=><article key={p.role_code+p.permission_code}><b>{p.role_code}</b><span>{p.permission_code}</span><small>{p.permission_description}</small></article>)}</div>
      </section>

      <section className="spec-section"><div className="section-label"><span className="eyebrow">7 · OUTPUT</span><h2>Dokumen & cetak</h2></div>
        <div className="print-contract">{(app.print_documents ?? []).map((x:string)=><span key={x}>▣ {x}</span>)}</div>
      </section>

      <footer className="app-detail-footer"><Link href="/applications">← Kembali ke daftar 33 aplikasi</Link><span>Blueprint contract · data-first · RLS-aware · print-ready</span></footer>
    </main>
  );
}
