import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false } });
}

export async function POST(request: NextRequest) {
  try {
    const sessionClient = await createSupabaseServerClient();
    const { data: { user } } = await sessionClient.auth.getUser();
    if (!user) return NextResponse.json({ error: "Sesi login tidak valid." }, { status: 401 });

    const body = await request.json();
    const organizationName = String(body.organizationName ?? "").trim();
    if (organizationName.length < 3) return NextResponse.json({ error: "Nama organisasi minimal 3 karakter." }, { status: 400 });

    const admin = getAdminClient();
    if (!admin) return NextResponse.json({ error: "Bootstrap organisasi belum aktif di server. Tambahkan SUPABASE_SECRET_KEY." }, { status: 503 });

    const { data: existing } = await admin.from("user_roles").select("tenant_id, roles!inner(code)").eq("user_id", user.id).limit(1);
    if (existing?.length) return NextResponse.json({ error: "Akun ini sudah memiliki organisasi dan peran." }, { status: 409 });

    const { data: tenant, error: tenantError } = await admin.from("tenants").insert({ name: organizationName, status: "active" }).select("id,name").single();
    if (tenantError || !tenant) return NextResponse.json({ error: tenantError?.message ?? "Organisasi gagal dibuat." }, { status: 500 });

    const { data: role, error: roleError } = await admin.from("roles").select("id,code,name").eq("code", "TENANT_ADMIN").single();
    if (roleError || !role) {
      await admin.from("tenants").delete().eq("id", tenant.id);
      return NextResponse.json({ error: roleError?.message ?? "Role TENANT_ADMIN tidak tersedia." }, { status: 500 });
    }

    const { error: membershipError } = await admin.from("tenant_memberships").insert({ tenant_id: tenant.id, user_id: user.id, status: "active" });
    if (membershipError) {
      await admin.from("tenants").delete().eq("id", tenant.id);
      return NextResponse.json({ error: membershipError.message }, { status: 500 });
    }

    const { error: roleInsertError } = await admin.from("user_roles").insert({ tenant_id: tenant.id, user_id: user.id, role_id: role.id });
    if (roleInsertError) {
      await admin.from("tenant_memberships").delete().eq("tenant_id", tenant.id).eq("user_id", user.id);
      await admin.from("tenants").delete().eq("id", tenant.id);
      return NextResponse.json({ error: roleInsertError.message }, { status: 500 });
    }

    await admin.from("profiles").upsert({ id: user.id, full_name: String(user.user_metadata?.full_name ?? user.email ?? "Pengguna"), status: "active" });
    return NextResponse.json({ ok: true, tenantId: tenant.id, message: `Organisasi “${tenant.name}” berhasil dibuat. Anda menjadi administrator organisasi.` });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Terjadi kesalahan server." }, { status: 500 });
  }
}
