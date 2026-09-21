import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function SchoolsPage() {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims) return null;
  const { data: schools, error } = await supabase.from("schools").select("id,tenant_id,code,name,address,phone,status").order("name");
  return (
    <main className="simple-page">
      <a href="/">← Command Center</a>
      <p className="eyebrow">SCHOOL DIRECTORY • LIVE</p>
      <h1>School operating contexts.</h1>
      <p className="lede">Schools are tenant-scoped. The browser never receives privileged database credentials.</p>
      {error ? <div className="empty-card"><strong>School data unavailable</strong><span>{error.message}</span></div> :
        schools?.length ? <div className="empty-card"><strong>{schools.length} visible school{schools.length===1?"":"s"}</strong><div className="tenant-list">{schools.map(s=><article className="student-row" key={s.id}><div><strong>{s.name}</strong><span>{s.code} · {s.status}</span></div><small>{s.address ?? "Address not recorded"}</small></article>)}</div></div> :
        <div className="empty-card"><strong>No school records visible</strong><span>EDUNEXUS does not seed fake schools. Create a real school through governed onboarding.</span></div>}
    </main>
  );
}
