"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setStatus("");
    if (password !== confirm) {
      setStatus("Konfirmasi kata sandi tidak sama.");
      return;
    }
    if (password.length < 8) {
      setStatus("Kata sandi minimal 8 karakter.");
      return;
    }

    setBusy(true);
    const s = createClient();
    const { data, error } = await s.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent("/onboarding/bootstrap")}`,
      },
    });

    if (error) {
      setStatus(error.message);
    } else if (data.session) {
      window.location.href = "/onboarding/bootstrap";
      return;
    } else {
      setStatus("Akun berhasil dibuat. Periksa email Anda untuk verifikasi. Setelah verifikasi, EDUNEXUS akan membuka proses pembentukan organisasi pertama.");
    }
    setBusy(false);
  }

  async function signUpWithGoogle() {
    setGoogleBusy(true);
    setStatus("");
    const s = createClient();
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent("/onboarding/bootstrap")}`;
    const { error } = await s.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
    if (error) {
      setStatus("Pendaftaran dengan Google belum tersedia. Silakan gunakan email dan kata sandi.");
      setGoogleBusy(false);
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <Link href="/auth/login" className="secondary">← Kembali ke Masuk</Link>
        <div className="eyebrow">PENDAFTARAN EDUNEXUS</div>
        <h1>Buat akun pengguna.</h1>
        <p>Buat identitas pengguna terlebih dahulu. Akun baru tidak langsung memperoleh akses organisasi sampai proses pembentukan organisasi dan peran selesai.</p>
        <form className="auth-form" onSubmit={submit}>
          <label>Email<input type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} required /></label>
          <label>Kata sandi<input type="password" autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} required /></label>
          <label>Ulangi kata sandi<input type="password" autoComplete="new-password" value={confirm} onChange={e => setConfirm(e.target.value)} required /></label>
          {status && <div className="auth-error" role="status">{status}</div>}
          <button disabled={busy || googleBusy}>{busy ? "Membuat akun..." : "Buat akun"}</button>
          <div className="auth-divider" aria-hidden="true"><span>atau</span></div>
          <button type="button" className="google-button" onClick={signUpWithGoogle} disabled={busy || googleBusy}>
            <span aria-hidden="true">G</span>{googleBusy ? "Menghubungkan ke Google..." : "Daftar dengan Google"}
          </button>
        </form>
      </section>
    </main>
  );
}
