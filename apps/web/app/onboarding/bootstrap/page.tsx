"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function BootstrapPage() {
  const router = useRouter();
  const [organizationName, setOrganizationName] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("edunexus_bootstrap_draft");
      if (!raw) return;
      const draft = JSON.parse(raw) as { organizationName?: string };
      if (draft.organizationName) setOrganizationName(draft.organizationName);
    } catch {
      // Keep the form usable if a local draft is invalid.
    }
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setStatus("");
    const response = await fetch("/api/onboarding/bootstrap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ organizationName }),
    });
    const data = await response.json();
    if (!response.ok) {
      setStatus(data.error ?? "Organisasi gagal dibuat.");
      setBusy(false);
      return;
    }
    window.localStorage.removeItem("edunexus_bootstrap_draft");
    router.replace("/tenant");
  }

  return (
    <main className="simple-page">
      <p className="eyebrow">AKTIVASI EDUNEXUS</p>
      <h1>Konfirmasi organisasi & privilege.</h1>
      <p className="lede">Akun Anda sudah terautentikasi. Konfirmasikan organisasi pertama. Hak akses awal Anda ditetapkan sebagai <strong>Administrator Organisasi (TENANT_ADMIN)</strong>; role pengguna lain diberikan dari menu Organisasi & Akses setelah organisasi aktif.</p>
      <form className="onboarding-form" onSubmit={submit}>
        <section>
          <h2>Identitas akses</h2>
          <label>Hak akses awal
            <input value="Administrator Organisasi — TENANT_ADMIN" readOnly aria-readonly="true" />
          </label>
          <label>Nama organisasi / sekolah
            <input value={organizationName} onChange={e => setOrganizationName(e.target.value)} placeholder="Contoh: Sekolah EDUNEXUS Indonesia" minLength={3} required />
          </label>
        </section>
        {status && <div className="auth-error" role="status">{status}</div>}
        <button type="submit" disabled={busy}>{busy ? "Menyiapkan organisasi..." : "Konfirmasi & masuk ke EDUNEXUS"}</button>
      </form>
    </main>
  );
}
