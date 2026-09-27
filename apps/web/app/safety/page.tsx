"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import PrintButton from "@/components/print-button";

export default function SafetyPage() {
  const [form, setForm] = useState({ tenantId: "", studentId: "", authorizationId: "", name: "", phone: "", plate: "", token: "", eventType: "verify", lat: "", lng: "" });
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (key: string, value: string) => setForm((x) => ({ ...x, [key]: value }));
  async function submit(e: FormEvent) {
    e.preventDefault(); setBusy(true); setStatus("");
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setStatus("Autentikasi diperlukan."); setBusy(false); return; }
    const res = await fetch(process.env.NEXT_PUBLIC_SUPABASE_URL + "/functions/v1/edunexus-safety", {
      method: "POST",
      headers: { Authorization: "Bearer " + session.access_token, "Content-Type": "application/json" },
      body: JSON.stringify({
        tenant_id: form.tenantId, student_id: form.studentId, authorization_id: form.authorizationId,
        presented_person_name: form.name || null, presented_phone: form.phone || null,
        presented_vehicle_plate: form.plate || null, presented_token_hash: form.token || null,
        event_type: form.eventType, lat: form.lat ? Number(form.lat) : null, lng: form.lng ? Number(form.lng) : null,
        evidence: { source: "edunexus-web" }
      })
    });
    const data = await res.json().catch(() => ({}));
    setStatus(!res.ok ? (data.error ?? "Verifikasi gagal.") : "Hasil verifikasi: " + (data.verification?.verification_result ?? "diproses") + (data.approval_request ? " · persetujuan manual dibuat" : ""));
    setBusy(false);
  }
  return <main className="simple-page">
    <div className="page-tools"><Link href="/">← Pusat Kendali</Link><Link href="/applications/STUDENT_SAFETY">Aplikasi keselamatan</Link><PrintButton label="Cetak halaman" /></div>
    <p className="eyebrow">ENGINE 06 · STUDENT SAFETY</p>
    <h1>Verifikasi penjemputan siswa.</h1>
    <p className="lede">Verifikasi dijalankan oleh engine keselamatan dengan tenant access, authorization, audit, dan human approval gate. Kredensial tidak otomatis berarti izin.</p>
    <form className="onboarding-form" onSubmit={submit}>
      <section><h2>Konteks otorisasi</h2>
        <label>Organisasi ID<input required value={form.tenantId} onChange={e=>set("tenantId",e.target.value)} /></label>
        <label>ID Siswa<input required value={form.studentId} onChange={e=>set("studentId",e.target.value)} /></label>
        <label>ID Otorisasi Penjemputan<input required value={form.authorizationId} onChange={e=>set("authorizationId",e.target.value)} /></label>
        <label>Jenis kejadian<select value={form.eventType} onChange={e=>set("eventType",e.target.value)}><option value="verify">Verifikasi</option><option value="release">Release</option><option value="emergency">Darurat</option></select></label>
      </section>
      <section><h2>Data yang diperlihatkan</h2>
        <label>Nama<input value={form.name} onChange={e=>set("name",e.target.value)} /></label>
        <label>Nomor telepon<input value={form.phone} onChange={e=>set("phone",e.target.value)} /></label>
        <label>Plat kendaraan<input value={form.plate} onChange={e=>set("plate",e.target.value)} /></label>
        <label>Token/kredensial hash<input value={form.token} onChange={e=>set("token",e.target.value)} /></label>
      </section>
      <section><h2>Lokasi opsional</h2>
        <label>Latitude<input inputMode="decimal" value={form.lat} onChange={e=>set("lat",e.target.value)} /></label>
        <label>Longitude<input inputMode="decimal" value={form.lng} onChange={e=>set("lng",e.target.value)} /></label>
      </section>
      {status && <div className="auth-error" role="status">{status}</div>}
      <button disabled={busy}>{busy ? "Memverifikasi…" : "Verifikasi penjemputan"}</button>
    </form>
    <section className="safety-grid">
      <div className="empty-card"><strong>Gerbang persetujuan manusia</strong><span>Kasus manual review dapat menghasilkan workflow dan approval request sesuai risiko.</span></div>
      <div className="empty-card"><strong>Jejak audit</strong><span>Hasil verifikasi diteruskan ke event orchestration untuk audit dan pemantauan.</span></div>
    </section>
  </main>;
}