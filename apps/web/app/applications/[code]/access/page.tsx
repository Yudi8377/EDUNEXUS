import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PrintButton from "@/components/print-button";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ code: string }> };

export default async function ApplicationAccessPage({ params }: Props) {
  const { code } = await params;
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return null;
  const { data: app } = await supabase.from("application_registry").select("id,name").eq("code", code).maybeSingle();
  if (!app) notFound();
  const { data: permissions } = await supabase.from("application_permissions").select("role_code,permission_code,permission_description").eq("application_id", app.id).order("role_code").order("permission_code");
  return <main className="nx-data-page">
    <header className="nx-data-header"><div><Link href={`/applications/${code}`}>← {app.name}</Link><span className="eyebrow">ACCESS</span><h1>Hak akses</h1><p>Hak kerja yang didefinisikan untuk setiap peran aplikasi. RLS database tetap menjadi pengaman runtime.</p></div><PrintButton /></header>
    <nav className="nx-section-nav" aria-label="Navigasi aplikasi"><Link href={`/applications/${code}/data`}>Data</Link><Link href={`/applications/${code}/workflow`}>Workflow</Link><Link href={`/applications/${code}/documents`}>Documents</Link><Link href={`/applications/${code}/access`} className="active">Access</Link></nav>
    <section className="nx-access-list">{(permissions ?? []).map(p => <article className="nx-access-card" key={p.role_code+p.permission_code}><b>{p.role_code}</b><strong>{p.permission_code}</strong><p>{p.permission_description}</p></article>)}</section>
  </main>;
}