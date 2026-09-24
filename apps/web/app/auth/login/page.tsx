"use client";

import Link from "next/link";
import { FormEvent, Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setMessage("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setMessage("Email atau kata sandi tidak benar, atau akun belum dapat digunakan."); setBusy(false); return; }
    window.location.assign(next);
  }

  async function signInWithGoogle() {
    setGoogleBusy(true); setMessage("");
    const supabase = createClient();
    const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/";
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(safeNext)}`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
    if (error) {
      setMessage("Masuk dengan Google belum tersedia. Silakan coba lagi atau gunakan email dan kata sandi.");
      setGoogleBusy(false);
    }
  }

  return <form onSubmit={submit} className="auth-form">
    <label>Email<input type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} required /></label>
    <label>Kata sandi<input type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} required /></label>
    {message ? <div className="auth-error" role="alert">{message}</div> : null}
    <button type="submit" disabled={busy || googleBusy}>{busy ? "Memeriksa..." : "Masuk"}</button>
    <div className="auth-divider" aria-hidden="true"><span>atau</span></div>
    <button type="button" className="google-button" onClick={signInWithGoogle} disabled={busy || googleBusy}>
      <span aria-hidden="true">G</span>{googleBusy ? "Menghubungkan ke Google..." : "Masuk dengan Google"}
    </button>
    <div className="auth-links"><Link href="/auth/forgot-password">Lupa kata sandi?</Link><span>·</span><Link href="/auth/register">Buat akun</Link></div>
  </form>;
}

export default function LoginPage() {
  return <main className="auth-shell">
    <section className="auth-card">
      <Link href="/" className="secondary">← Kembali ke Beranda</Link>
      <div className="eyebrow">AKSES AMAN EDUNEXUS</div>
      <h1>Masuk ke sistem pendidikan EDUNEXUS.</h1>
      <p>Identitas diverifikasi melalui Supabase Auth. Hak akses organisasi dan peran tetap dikendalikan oleh kebijakan keamanan EDUNEXUS.</p>
      <Suspense fallback={<div className="auth-form">Memuat formulir masuk...</div>}><LoginForm /></Suspense>
      <small>Keamanan: hanya kredensial publik yang digunakan pada browser. Kunci layanan istimewa tidak pernah ditempatkan di kode klien.</small>
    </section>
  </main>;
}