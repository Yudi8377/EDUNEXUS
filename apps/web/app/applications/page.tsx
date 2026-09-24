import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ApplicationsPage() {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return null;

  const { data: apps, error } = await supabase
    .from("application_registry")
    .select("id,code,sequence_no,name,short_name,description,lifecycle_status,route,audience,capabilities,print_documents")
    .order("sequence_no");

  if (error) {
    return <main className="app-page"><Link href="/">← Masuk</Link><h1>Application Registry</h1><div className="app-error">{error.message}</div></main>;
  }

  return (
    <main className="app-page">
      <header className="app-header">
        <div><span className="eyebrow">EDUNEXUS / APPLICATIONS</span><h1>Education Operating System</h1><p>33 aplikasi operasional dalam satu platform. Pilih aplikasi untuk membuka navigasi kerja, kebutuhan data, relasi, workflow, hak akses, dan dokumen.</p></div>
        <Link className="app-home-link" href="/tenant">Akun & akses</Link>
      </header>
      <section className="app-index">
        {apps?.map((app) => (
          <Link className="app-index-item" href={`/applications/${app.code}`} key={app.id}>
            <span className="app-index-no">{app.code}</span>
            <span className="app-index-copy"><strong>{app.name}</strong><small>{app.description}</small></span>
            <span className={`app-status status-${app.lifecycle_status}`}>{app.lifecycle_status}</span>
            <span className="app-arrow">→</span>
          </Link>
        ))}
      </section>
      <footer className="app-footer"><span>EDUNEXUS · Blueprint-aligned application layer</span><span>Foundation tetap dipertahankan; aplikasi dibangun bertahap melalui kontrak data dan workflow.</span></footer>
    </main>
  );
}
