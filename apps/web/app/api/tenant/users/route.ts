import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

const ROLE_LABELS: Record<string, string> = {
  tenant_admin: "Administrator Organisasi",
  school_admin: "Administrator Sekolah",
  teacher: "Guru",
  staff: "Staf",
  student: "Siswa",
  parent: "Orang tua/wali",
  counselor: "Konselor",
  security_officer: "Petugas Keamanan",
};
const ROLE_CODES: Record<string, string> = {
  tenant_admin: "TENANT_ADMIN",
  school_admin: "SCHOOL_ADMIN",
  teacher: "TEACHER",
  staff: "STAFF",
  student: "STUDENT",
  parent: "PARENT",
  counselor: "COUNSELOR",
  security_officer: "SECURITY_OFFICER",
};

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false } });
}

async function getActor(request: NextRequest) {
  const sessionClient = await createSupabaseServerClient();
  const { data: { user: actor } } = await sessionClient.auth.getUser();
  if (!actor) return { actor: null, admin: null, error: "Sesi login tidak valid." };
  const admin = getAdminClient();
  if (!admin) return { actor, admin: null, error: "Fitur pengelolaan pengguna belum aktif di server." };
  return { actor, admin, error: null };
}

async function canManage(admin: ReturnType<typeof getAdminClient>, actorId: string, tenantId: string) {
  if (!admin) return false;
  const { data } = await admin
    .from("user_roles")
    .select("roles!inner(code)")
    .eq("user_id", actorId)
    .eq("tenant_id", tenantId);
  return Boolean(data?.some((row: any) => ["TENANT_ADMIN", "PLATFORM_ADMIN", "SCHOOL_ADMIN"].includes(row.roles?.code)));
}

export async function GET(request: NextRequest) {
  try {
    const { actor, admin, error } = await getActor(request);
    if (error || !actor || !admin) return NextResponse.json({ error: error ?? "Sesi login tidak valid." }, { status: 401 });

    const { data, error: queryError } = await admin
      .from("user_roles")
      .select("tenant_id, roles!inner(code), tenants!inner(id,name,status)")
      .eq("user_id", actor.id);

    if (queryError) return NextResponse.json({ error: queryError.message }, { status: 500 });

    const tenants = (data ?? [])
      .filter((row: any) => ["TENANT_ADMIN", "PLATFORM_ADMIN", "SCHOOL_ADMIN"].includes(row.roles?.code))
      .map((row: any) => ({
        id: row.tenants.id,
        name: row.tenants.name,
        code: row.tenants.id.slice(0, 8).toUpperCase(),
        roleCode: row.roles.code,
      }));
    return NextResponse.json({ tenants });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Terjadi kesalahan server." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = String(body.email ?? "").trim().toLowerCase();
    const fullName = String(body.fullName ?? "").trim();
    const tenantId = String(body.tenantId ?? "").trim();
    const requestedRole = String(body.roleCode ?? "").trim();

    if (!email || !tenantId || !requestedRole) return NextResponse.json({ error: "Email, organisasi, dan peran wajib diisi." }, { status: 400 });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "Format email tidak valid." }, { status: 400 });
    if (!ROLE_CODES[requestedRole]) return NextResponse.json({ error: "Peran tidak dikenali." }, { status: 400 });

    const { actor, admin, error } = await getActor(request);
    if (error || !actor || !admin) return NextResponse.json({ error: error ?? "Sesi login tidak valid." }, { status: 401 });
    if (!(await canManage(admin, actor.id, tenantId))) return NextResponse.json({ error: "Anda tidak memiliki hak untuk menambah pengguna pada organisasi ini." }, { status: 403 });
    const dbRoleCode = ROLE_CODES[requestedRole];
    const { data: role, error: roleError } = await admin.from("roles").select("id,code,name").eq("code", dbRoleCode).maybeSingle();
    if (roleError) return NextResponse.json({ error: roleError.message }, { status: 500 });
    if (!role) return NextResponse.json({ error: "Peran belum tersedia pada database EDUNEXUS." }, { status: 409 });

    const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
      data: fullName ? { full_name: fullName } : undefined,
      redirectTo: process.env.NEXT_PUBLIC_SITE_URL ? `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/` : undefined,
    });
    if (inviteError || !invited.user) return NextResponse.json({ error: inviteError?.message ?? "Undangan pengguna gagal dibuat." }, { status: 409 });

    const userId = invited.user.id;
    const { error: membershipInsertError } = await admin.from("tenant_memberships").insert({ user_id: userId, tenant_id: tenantId, status: "active" });
    if (membershipInsertError) {
      await admin.auth.admin.deleteUser(userId);
      return NextResponse.json({ error: `Akun dibuat tetapi keanggotaan gagal: ${membershipInsertError.message}` }, { status: 500 });
    }

    const { error: roleInsertError } = await admin.from("user_roles").insert({ user_id: userId, tenant_id: tenantId, role_id: role.id });
    if (roleInsertError) {
      await admin.from("tenant_memberships").delete().eq("user_id", userId).eq("tenant_id", tenantId);
      await admin.auth.admin.deleteUser(userId);
      return NextResponse.json({ error: `Akun dibuat tetapi hak akses gagal: ${roleInsertError.message}` }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      user: { id: userId, email, fullName, roleCode: requestedRole, roleName: ROLE_LABELS[requestedRole] },
      message: `Undangan untuk ${email} berhasil dikirim. Peran: ${ROLE_LABELS[requestedRole]}.`,
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Terjadi kesalahan server." }, { status: 500 });
  }
}
