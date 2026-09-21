import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AIControlPage() {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims) return null;
  const { data: rows, error } = await supabase.from("v_ai_control_center").select("*").limit(20);
  return (
    <main className="simple-page">
      <a href="/">← Command Center</a>
      <p className="eyebrow">AI CONTROL CENTER • GOVERNED</p>
      <h1>Observe AI work without bypassing human authority.</h1>
      <p className="lede">High-risk actions remain behind approval or human-decision gates. This surface is read-only.</p>
      {error ? <div className="empty-card"><strong>AI control data unavailable</strong><span>{error.message}</span></div> :
        rows?.length ? <div className="empty-card"><div className="tenant-list">{rows.map((r,i)=><article className="student-row" key={r.tenant_id ?? i}><div><strong>Tenant {String(r.tenant_id).slice(0,8)}</strong><span>Queued {r.queued_tasks ?? 0} · Approval {r.awaiting_approval_tasks ?? 0} · Executing {r.executing_tasks ?? 0}</span></div><small>High-risk: {r.high_risk_tasks ?? 0}</small></article>)}</div></div> :
        <div className="empty-card"><strong>No AI tasks yet</strong><span>The control plane is active, but no tenant task data is present.</span></div>}
    </main>
  );
}
