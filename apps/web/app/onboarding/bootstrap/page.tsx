"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function BootstrapPage() {
  const router = useRouter();
  const [organizationName, setOrganizationName] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

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
    router.replace("/tenant");
  }

  return (
    <main className="simple-page">
      <p className="eyebrow">AKTIVASI EDUNEXUS</p>
      <h1>Buat organisasi pertama Anda.</h1>
      <p className="lede">Akun Anda sudah terautentikasi. Langkah ini membuat organisasi EDUNEXUS pertama dan menetapkan Anda sebagai administrator organisasi.</p>
      <form className="onboarding-form" onSubmit={submit}>
        <label>Nama organisasi / sekolah<input value={organizationName} onChange={e => setOrganizationName(e.target.value)} placeholder="Contoh: Sekolah EDUNEXUS Indonesia" minLength={3} required /></label>
        {status && <div className="auth-error" role="status">{status}</div>}
        <button type="submit" disabled={busy}>{busy ? "Menyiapkan organisasi..." : "Buat organisasi & lanjutkan"}</button>
      </form>
    </main>
  );
}
