import Link from "next/link";
import LogoutButton from "@/components/auth/logout-button";
import { createClient } from "@/lib/supabase/server";
export const dynamic = "force-dynamic";
export default async function TenantPage() {
  const supabase=await createClient(); const {data:{user}}=await supabase.auth.getUser(); if(!user)return null;
  const [{data:memberships},{data:roles}]=await Promise.all([
    supabase.from("tenant_memberships").select("tenant_id, role_code, status, tenants:tenant_id(code,name,tenant_type,status)").eq("status","active"),
    supabase.from("user_roles").select("id, tenant_id, role_id, roles:role_id(code,name,risk_level)")
  ]);
  return <main className="simple-page"><Link href="/">← Kembali ke Beranda</Link><p className="eyebrow">ORGANISASI & AKSES • LANGSUNG</p><h1>Organisasi, pengguna, dan hak akses.</h1><p className="lede">Kelola konteks organisasi dan peran yang tersedia bagi akun terautentikasi. Perubahan hak akses tetap mengikuti kebijakan keamanan database.</p><div className="empty-card"><strong>Akun saat ini</strong><span>{user.email}</span><div className="hero-actions"><LogoutButton /></div></div>
    <div className="hero-actions"><Link className="primary" href="/auth/register">Tambah pengguna / Buat akun</Link><Link className="secondary" href="/onboarding">Tambah organisasi</Link></div>
    <div className="empty-card"><strong>{memberships?.length??0} keanggotaan aktif</strong><div className="tenant-list">{memberships?.map(m=>{const t=Array.isArray(m.tenants)?m.tenants[0]:m.tenants;return <article className="student-row" key={m.tenant_id}><div><strong>{t?.name??"Organisasi"}</strong><span>{t?.code??"—"} · {t?.tenant_type??"—"}</span></div><small>{m.role_code}</small></article>})}</div>{!memberships?.length&&<span>Belum ada keanggotaan organisasi aktif untuk akun ini.</span>}</div>
    <div className="empty-card"><strong>Peran efektif</strong><div className="tenant-list">{roles?.map(r=>{const role=Array.isArray(r.roles)?r.roles[0]:r.roles;return <article className="student-row" key={r.id}><div><strong>{role?.name??role?.code??"Peran"}</strong><span>{role?.code??"—"}</span></div><small>Tingkat risiko: {role?.risk_level??"—"}</small></article>})}</div></div>
  </main>;
}