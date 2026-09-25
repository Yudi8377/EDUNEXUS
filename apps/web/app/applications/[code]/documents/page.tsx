import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PrintButton from "@/components/print-button";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ code: string }> };

export default async function ApplicationDocumentsPage({ params }: Props) {
  const { code } = await params;
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return null;
  const { data: app } = await supabase.from("application_registry").select("id,name,print_documents").eq("code", code).maybeSingle();
  if (!app) notFound();
  const docs = app.print_documents ?? [];
  return <main className="nx-data-page">
    <header className="nx-data-header"><div><Link href={`/applications/${code}`}>← {app.name}</Link><span className="eyebrow">DOCUMENTS</span><h1>Dokumen & cetak</h1><p>Dokumen yang dapat disiapkan dari aplikasi ini.</p></div><PrintButton /></header>
    <nav className="nx-section-nav" aria-label="Navigasi aplikasi"><Link href={`/applications/${code}/data`}>Data</Link><Link href={`/applications/${code}/workflow`}>Workflow</Link><Link href={`/applications/${code}/documents`} className="active">Documents</Link><Link href={`/applications/${code}/access`}>Access</Link></nav>
    <section className="nx-document-list">{docs.length ? docs.map((doc:string) => <article className="nx-document-card" key={doc}><div><span className="nx-document-icon">DOC</span><h2>{doc}</h2><p>Gunakan dari modul data terkait setelah record dipilih.</p></div><PrintButton /></article>) : <div className="nx-data-empty"><h2>Belum ada dokumen terdaftar</h2><p>Dokumen cetak aplikasi ini akan ditambahkan ketika kebutuhan dokumen riil tersedia.</p></div>}</section>
  </main>;
}