import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function TenantPage() {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims) return null;

  const [{ data: memberships }, { data: roles }] = await Promise.all([
    supabase.from("tenant_memberships").select("tenant_id, role_code, status, tenants:tenant_id(code,name,tenant_type,status)").eq("status","active"),
    supabase.from("user_roles").select("id, tenant_id, role_id, roles:role_id(code,name,risk_level)"),
  ]);

  return (
    <main className="simple-page">
      <a href="/">← Command Center</a>
      <p className="eyebrow">TENANT CONTROL • LIVE</p>
      <h1>Organizations and access context.</h1>
      <p className="lede">The application reads only tenant memberships exposed to the authenticated session. Authorization remains enforced by database policies.</p>
      <div className="empty-card">
        <strong>{memberships?.length ?? 0} active membership{memberships?.length === 1 ? "" : "s"}</strong>
        <div className="tenant-list">
          {memberships?.map((m) => {
            const tenant = Array.isArray(m.tenants) ? m.tenants[0] : m.tenants;
            return <article className="student-row" key={m.tenant_id}><div><strong>{tenant?.name ?? "Tenant"}</strong><span>{tenant?.code ?? "—"} · {tenant?.tenant_type ?? "—"}</span></div><small>{m.role_code}</small></article>;
          })}
        </div>
        {!memberships?.length && <span>No active tenant membership is visible for this account yet. Use the governed onboarding process rather than creating records directly from the client.</span>}
      </div>
      <div className="empty-card">
        <strong>Effective role bindings</strong>
        <div className="tenant-list">
          {roles?.map((r) => {
            const role = Array.isArray(r.roles) ? r.roles[0] : r.roles;
            return <article className="student-row" key={r.id}><div><strong>{role?.name ?? role?.code ?? "Role"}</strong><span>{role?.code ?? "—"}</span></div><small>{role?.risk_level ?? "—"}</small></article>;
          })}
        </div>
      </div>
    </main>
  );
}
