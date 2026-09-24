import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

const MANAGER_ROLES = new Set(["owner", "admin"]);
const ROLE_ORDER = ["owner", "admin", "manager", "teacher", "staff", "student", "parent"];

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = String(body.email ?? "").trim().toLowerCase();
    const fullName = String(body.fullName ?? "").trim();
    const tenantId = String(body.tenantId ?? "").trim();
    const roleCode = String(body.roleCode ?? "").trim();

    if (!email || !tenantId || !roleCode) {
      return NextResponse.json({ error: "Email, organisasi, dan peran wajib diisi." }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Format email tidak valid." }, { status: 400 });
    }
    if (!ROLE_ORDER.includes(roleCode)) {
      return NextResponse.json({ error: "Peran tidak dikenali." }, { status: 400 });
    }

    const sessionClient = await createSupabaseServerClient();
    const { data: { user: actor } } = await sessionClient.auth.getUser();
    if (!actor) return NextResponse.json({ error: "Sesi login tidak valid." }, { status: 401 });

    const { data: membership, error: membershipError } = await sessionClient
      .from("tenant_memberships")
      .select("tenant_id, role_code, status")
      .eq("tenant_id", tenantId)
      .eq("user_id", actor.id)
      .eq("status", "active")
      .maybeSingle();

    if (membershipError) {
      return NextResponse.json({ error: membershipError.message }, { status: 403 });
    }
    if (!membership || !MANAGER_ROLES.has(membership.role_code)) {
      return NextResponse.json({ error: "Anda tidak memiliki hak untuk menambah pengguna pada organisasi ini." }, { status: 403 });
    }

    if (membership.role_code === "admin" && roleCode === "owner") {
      return NextResponse.json({ error: "Administrator tidak dapat memberikan peran Pemilik." }, { status: 403 });
    }

    const admin = getAdminClient();
    if (!admin) {
      return NextResponse.json({
        error: "Fitur tambah pengguna belum aktif di server. Tambahkan secret SUPABASE_SECRET_KEY pada environment produksi."
      }, { status: 503 });
    }

    const { data: role, error: roleError } = await admin
      .from("roles")
      .select("id, code, name")
      .eq("code", roleCode)
      .maybeSingle();

    if (roleError) return NextResponse.json({ error: roleError.message }, { status: 500 });
    if (!role) return NextResponse.json({ error: "Peran belum tersedia pada database EDUNEXUS." }, { status: 409 });

    const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
      data: fullName ? { full_name: fullName } : undefined,
      redirectTo: process.env.NEXT_PUBLIC_SITE_URL
        ? `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/`
        : undefined,
    });

    if (inviteError || !invited.user) {
      return NextResponse.json({ error: inviteError?.message ?? "Undangan pengguna gagal dibuat." }, { status: 409 });
    }

    const userId = invited.user.id;
    const { error: membershipInsertError } = await admin
      .from("tenant_memberships")
      .insert({ user_id: userId, tenant_id: tenantId, role_code: roleCode, status: "active" });

    if (membershipInsertError) {
      await admin.auth.admin.deleteUser(userId);
      return NextResponse.json({ error: `Akun dibuat tetapi keanggotaan gagal: ${membershipInsertError.message}` }, { status: 500 });
    }

    const { error: roleInsertError } = await admin
      .from("user_roles")
      .insert({ user_id: userId, tenant_id: tenantId, role_id: role.id });

    if (roleInsertError) {
      await admin.from("tenant_memberships").delete().eq("user_id", userId).eq("tenant_id", tenantId);
      await admin.auth.admin.deleteUser(userId);
      return NextResponse.json({ error: `Akun dibuat tetapi hak akses gagal: ${roleInsertError.message}` }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      user: { id: userId, email, fullName, roleCode, roleName: role.name },
      message: `Undangan untuk ${email} berhasil dikirim. Peran: ${role.name ?? roleCode}.`,
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Terjadi kesalahan server." }, { status: 500 });
  }
}
