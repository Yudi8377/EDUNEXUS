"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

const roles = [
  { code: "tenant_admin", dbCode: "TENANT_ADMIN", label: "Administrator Organisasi", desc: "Administrasi organisasi dan pengelolaan akses." },
  { code: "school_admin", dbCode: "SCHOOL_ADMIN", label: "Administrator Sekolah", desc: "Administrasi sekolah sesuai kewenangan yang diberikan." },
  { code: "teacher", dbCode: "TEACHER", label: "Guru", desc: "Operasi pembelajaran dan data yang diberikan kepada guru." },
  { code: "staff", dbCode: "STAFF", label: "Staf", desc: "Operasi administrasi yang ditugaskan." },
  { code: "student", dbCode: "STUDENT", label: "Siswa", desc: "Akses pembelajaran dan data pribadi siswa." },
  { code: "parent", dbCode: "PARENT", label: "Orang tua/wali", desc: "Akses informasi anak sesuai kewenangan." },
  { code: "counselor", dbCode: "COUNSELOR", label: "Konselor", desc: "Akses layanan konseling sesuai kewenangan." },
  { code: "security_officer", dbCode: "SECURITY_OFFICER", label: "Petugas Keamanan", desc: "Kendali keselamatan dan verifikasi yang ditugaskan." },
];

type Tenant = { id: string; name: string; code: string; roleCode: string };

export default function AddUserPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [tenantId, setTenantId] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [roleCode, setRoleCode] = useState("teacher");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  async function loadTenants() {
    const res = await fetch("/api/tenant/users", { method: "GET" });
    const data = await res.json();
    if (!res.ok) { setStatus(data.error ?? "Organisasi gagal dimuat."); return; }
    setTenants(data.tenants ?? []);
    if (!tenantId && data.tenants?.[0]) setTenantId(data.tenants[0].id);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true); setStatus("");
    const res = await fetch("/api/tenant/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tenantId, email, fullName, roleCode }),
    });
    const data = await res.json();
    setStatus(data.message ?? data.error ?? "Operasi selesai.");
    setBusy(false);
    if (res.ok) { setEmail(""); setFullName(""); }
  }

  return (
    <main className="simple-page">
      <div className="page-tools">
        <Link href="/tenant">← Kembali ke Organisasi & Akses</Link>
      </div>
      <p className="eyebrow">PENGGUNA & HAK AKSES • TERKENDALI</p>
      <h1>Tambah pengguna & tetapkan privilege.</h1>
      <p className="lede">Pengguna baru menerima undangan melalui email. Pilih hanya privilege yang tersedia pada fondasi EDUNEXUS. Server memvalidasi kembali role sebelum akses diberikan.</p>

      {!tenants.length && (
        <button className="secondary" type="button" onClick={loadTenants}>Muat organisasi yang dapat dikelola</button>
      )}

      <form className="onboarding-form" onSubmit={submit}>
        <section>
          <h2>Identitas pengguna</h2>
          <label>Nama lengkap<input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Nama pengguna" /></label>
          <label>Email pengguna<input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="nama@contoh.id" required /></label>
        </section>
        <section>
          <h2>Organisasi & peran</h2>
          <label>Organisasi
            <select value={tenantId} onChange={e => setTenantId(e.target.value)} onFocus={loadTenants} required>
              <option value="">Pilih organisasi</option>
              {tenants.map(t => <option key={t.id} value={t.id}>{t.name} ({t.code})</option>)}
            </select>
          </label>
          <label>Privilege / peran
            <select value={roleCode} onChange={e => setRoleCode(e.target.value)}>
              {roles.map(r => <option key={r.code} value={r.code}>{r.label} · {r.dbCode}</option>)}
            </select>
          </label>
        </section>
        <div className="role-grid">
          {roles.map(r => <article className="report-card" key={r.code}><strong>{r.label}</strong><span>{r.desc}</span></article>)}
        </div>
        {status && <div className="auth-error" role="status">{status}</div>}
        <button type="submit" disabled={busy || !tenantId}>{busy ? "Mengirim undangan..." : "Tambah pengguna, privilege & kirim undangan"}</button>
      </form>
    </main>
  );
}
