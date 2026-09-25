import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PrintButton from "@/components/print-button";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ code: string }> };

export default async function ApplicationDataPage({ params }: Props) {
  const { code } = await params;
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return null;
  const { data: app } = await supabase.from("application_registry").select("id,code,name,description").eq("code", code).maybeSingle();
  if (!app) notFound();
  const { data: entities } = await supabase.from("application_entities").select("id,entity_name,purpose,implementation_status,is_primary").eq("application_id", app.id).order("is_primary",{ascending:false}).order("entity_name");
  const active = (entities ?? []).filter(e => e.implementation_status === "existing");
  return <main className="nx-data-page">
    <header className="nx-data-header"><div><Link href={`/applications/${code}`}>← {app.name}</Link><span className="eyebrow">DATA</span><h1>Data {app.name}</h1><p>Pilih modul untuk bekerja dengan record nyata.</p></div><PrintButton /></header>
    <nav className="nx-section-nav" aria-label="Navigasi aplikasi"><Link href={`/applications/${code}/data`} className="active">Data</Link><Link href={`/applications/${code}/workflow`}>Workflow</Link><Link href={`/applications/${code}/documents`}>Documents</Link><Link href={`/applications/${code}/access`}>Access</Link></nav>
    <section className="nx-module-index">
      {active.map(e => <Link key={e.id} href={`/applications/${code}/data/${e.id}`} className="nx-module-card"><span className="nx-entity-icon">DB</span><div><h2>{e.entity_name}</h2><p>{e.purpose}</p></div><b>Buka →</b></Link>)}
      {!active.length && <div className="nx-data-empty"><h2>Belum ada modul data aktif</h2><p>Database operasional untuk aplikasi ini belum tersedia.</p></div>}
    </section>
  </main>;
}