import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PrintButton from "@/components/print-button";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ code: string }> };

export default async function ApplicationWorkflowPage({ params }: Props) {
  const { code } = await params;
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return null;
  const { data: app } = await supabase.from("application_registry").select("id,name,description").eq("code", code).maybeSingle();
  if (!app) notFound();
  const { data: workflows } = await supabase.from("application_workflows").select("sequence_no,step_name,actor,input_description,output_description,requires_approval").eq("application_id", app.id).order("sequence_no");
  return <main className="nx-data-page">
    <header className="nx-data-header"><div><Link href={`/applications/${code}`}>← {app.name}</Link><span className="eyebrow">WORKFLOW</span><h1>Alur kerja</h1><p>Urutan pekerjaan yang digunakan aplikasi ini.</p></div><PrintButton /></header>
    <nav className="nx-section-nav" aria-label="Navigasi aplikasi"><Link href={`/applications/${code}/data`}>Data</Link><Link href={`/applications/${code}/workflow`} className="active">Workflow</Link><Link href={`/applications/${code}/documents`}>Documents</Link><Link href={`/applications/${code}/access`}>Access</Link></nav>
    <section className="nx-process-list">{(workflows ?? []).map(w => <article className="nx-process-card" key={w.sequence_no}><span>{String(w.sequence_no).padStart(2,"0")}</span><div><h2>{w.step_name}</h2><b>{w.actor}</b><p>{w.input_description}</p><small>Hasil: {w.output_description}{w.requires_approval ? " · memerlukan persetujuan" : ""}</small></div></article>)}</section>
  </main>;
}