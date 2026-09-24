"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function HomePage() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setAuthenticated(Boolean(data.user)));
  }, []);

  async function register(event: FormEvent) {
    event.preventDefault();
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
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent("/onboarding/bootstrap")}`,
      },
    });

    if (error) {
      setStatus(error.message);
      setBusy(false);
      return;
    }

    if (data.session) {
      window.location.href = "/onboarding/bootstrap";
      return;
    }

    setStatus("Akun berhasil dibuat. Periksa email Anda untuk verifikasi. Setelah verifikasi, EDUNEXUS akan membuka pembentukan organisasi pertama.");
    setBusy(false);
  }

  async function registerWithGoogle() {
    setGoogleBusy(true);
    setStatus("");
    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent("/onboarding/bootstrap")}`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
    if (error) {
      setStatus(error.message || "Pendaftaran dengan Google belum tersedia.");
      setGoogleBusy(false);
    }
  }

  if (authenticated === null) {
    return <main className="auth-shell"><section className="auth-card"><div className="eyebrow">EDUNEXUS</div><h1>Menyiapkan akses aman…</h1><p>Memeriksa sesi autentikasi.</p></section></main>;
  }

  if (!authenticated) {
    return (
      <main className="auth-shell">
        <section className="auth-card">
          <div className="eyebrow">AKSES AWAL EDUNEXUS</div>
          <h1>Daftar sebelum masuk ke sistem.</h1>
          <p>Mulai dengan membuat identitas EDUNEXUS. Setelah akun terverifikasi, Anda akan membuat organisasi pertama dan menjadi administrator organisasi tersebut.</p>

          <form className="auth-form" onSubmit={register}>
            <label>Email
              <input type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="nama@contoh.id" required />
            </label>
            <label>Kata sandi
              <input type="password" autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Minimal 8 karakter" required />
            </label>
            <label>Ulangi kata sandi
              <input type="password" autoComplete="new-password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Ulangi kata sandi" required />
            </label>

            {status && <div className="auth-error" role="status">{status}</div>}

            <button type="submit" disabled={busy || googleBusy}>
              {busy ? "Membuat akun…" : "Daftar & mulai EDUNEXUS"}
            </button>

            <div className="auth-divider" aria-hidden="true"><span>atau</span></div>

            <button type="button" className="google-button" onClick={registerWithGoogle} disabled={busy || googleBusy}>
              <span aria-hidden="true">G</span>
              {googleBusy ? "Menghubungkan ke Google…" : "Daftar dengan Google"}
            </button>
          </form>

          <div className="auth-footer">
            <span>Sudah memiliki akun?</span>
            <Link href="/auth/login">Masuk ke EDUNEXUS →</Link>
          </div>

          <div className="auth-security">
            <strong>AKSES AMAN</strong>
            <span>Identitas diverifikasi melalui Supabase Auth. Hak akses organisasi diberikan terpisah melalui role dan kebijakan keamanan EDUNEXUS.</span>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="shell">
      <aside className="rail">
        <div className="brand"><div className="brand-mark">E</div><div><strong>EDUNEXUS</strong><span>Sistem Operasi Pendidikan</span></div></div>
        <nav className="nav"><Link className="nav-active" href="/">Ringkasan</Link><Link href="/students">Siswa</Link><Link href="/safety">Keselamatan</Link><Link href="/teacher">Guru</Link><Link href="/attendance">Kehadiran</Link><Link href="/learning">Pembelajaran</Link><Link href="/ai-control">Kendali AI</Link><Link href="/reports">Laporan</Link><Link href="/tenant">Organisasi & Akses</Link><Link href="/schools">Sekolah</Link><Link href="/onboarding">Tambah Organisasi</Link></nav>
        <div className="rail-footer">● Fondasi aktif<small>Potongan vertikal D+7</small></div>
      </aside>
      <section className="workspace">
        <header className="topbar"><div><p className="eyebrow">EDUNEXUS / PUSAT KENDALI</p><h1>Selamat datang.</h1></div><div className="tenant"><span>Sesi aktif</span><Link href="/tenant">Akun & Akses</Link></div></header>
        <div className="content">
          <section className="hero"><div><span className="pill">OTONOM • TERKENDALI • DAPAT DIAUDIT</span><h2>Satu lapisan operasi untuk sekolah yang lebih aman dan cerdas.</h2><p>EDUNEXUS menghubungkan data siswa, alur kerja sekolah, kendali keselamatan, dan AI yang diawasi tanpa memberikan kewenangan yang tidak semestinya.</p><div className="hero-actions"><Link className="primary" href="/students">Buka Profil Siswa 360 →</Link><Link className="secondary" href="/safety">Tinjau Mesin Keselamatan</Link></div></div><div className="hero-orbit" aria-hidden="true"><div className="orbit-ring ring-a"/><div className="orbit-ring ring-b"/><div className="orbit-core">EX<br/><span>OS</span></div></div></section>
          <section className="metric-grid">{[["Siswa","—","Hubungkan data sekolah"],["Kehadiran","—","Belum ada data langsung"],["Keselamatan","Siap","Mesin 06 terverifikasi"],["Tugas AI","—","Gateway belum dikonfigurasi"]].map(([a,b,c])=><article className="metric" key={a}><span>{a}</span><strong>{b}</strong><small>{c}</small></article>)}</section>
          <div className="section-head"><div><p className="eyebrow">FONDASI</p><h3>Kemampuan inti</h3></div><span>Arsitektur langsung</span></div>
          <section className="capability-grid">{[["01","Identitas & Keamanan","Isolasi organisasi, RBAC, audit"],["03","Profil Siswa 360","Konteks akademik dan keterlibatan"],["06","Keselamatan Siswa","Verifikasi penjemputan + kendali manusia"],["27","Otonomi AI","Agen dengan tata kelola dan persetujuan"]].map(([a,b,c])=><article className="capability" key={a}><span>{a}</span><div><h4>{b}</h4><p>{c}</p></div><b>↗</b></article>)}</section>
          <section className="notice"><b>!</b><div><strong>Penalaran AI sengaja dibatasi.</strong><p>Gateway AI sudah disiapkan tetapi kredensial produksi belum dikonfigurasi. Keselamatan, tindakan berisiko tinggi, dan otorisasi tetap dikendalikan manusia.</p></div><Link href="/ai-control">Lihat tata kelola →</Link></section>
        </div>
      </section>
    </main>
  );
}
