"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Mode = "login" | "signup";

export default function HomePage() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [mode, setMode] = useState<Mode>("login");
  const [fullName, setFullName] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => setAuthenticated(Boolean(data.user)));
  }, []);

  function switchMode(next: Mode) {
    setMode(next);
    setStatus("");
  }

  function saveBootstrapDraft() {
    window.localStorage.setItem("edunexus_bootstrap_draft", JSON.stringify({
      fullName: fullName.trim(),
      organizationName: organizationName.trim(),
      privilege: "TENANT_ADMIN",
    }));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setStatus("");
    const supabase = createClient();

    if (mode === "signup") {
      if (fullName.trim().length < 2) return setStatus("Nama lengkap minimal 2 karakter.");
      if (organizationName.trim().length < 3) return setStatus("Nama organisasi / sekolah minimal 3 karakter.");
      if (password.length < 8) return setStatus("Kata sandi minimal 8 karakter.");
      if (password !== confirm) return setStatus("Konfirmasi kata sandi tidak sama.");
      saveBootstrapDraft();
      setBusy(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName.trim() },
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
      setStatus("Akun berhasil dibuat. Periksa email untuk verifikasi. Setelah verifikasi, Anda akan diarahkan ke pembentukan organisasi pertama.");
      setBusy(false);
      return;
    }

    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setStatus("Email atau kata sandi tidak benar, atau akun belum dapat digunakan.");
      setBusy(false);
      return;
    }
    window.location.href = "/";
  }

  async function continueWithGoogle() {
    setGoogleBusy(true);
    setStatus("");
    if (mode === "signup") {
      if (fullName.trim().length < 2 || organizationName.trim().length < 3) {
        setStatus("Untuk pendaftaran Google, isi Nama lengkap dan Nama organisasi / sekolah terlebih dahulu.");
        setGoogleBusy(false);
        return;
      }
      saveBootstrapDraft();
    }
    const safeNext = mode === "signup" ? "/onboarding/bootstrap" : "/";
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(safeNext)}`;
    const { error } = await createClient().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
    if (error) {
      setStatus("Google belum dapat digunakan. Silakan coba lagi atau gunakan email dan kata sandi.");
      setGoogleBusy(false);
    }
  }

  if (authenticated === null) {
    return <main className="landing-loading"><div className="landing-loader">EDUNEXUS<br/><span>Menyiapkan akses aman…</span></div></main>;
  }

  if (!authenticated) {
    return (
      <main className="landing">
        <header className="landing-nav">
          <Link href="/" className="landing-brand"><span>EX</span><div><b>EDUNEXUS</b><small>Education Operating System</small></div></Link>
          <div className="landing-nav-actions">
            <a href="#tentang">Tentang EDUNEXUS</a>
            <a href="#fitur">Kemampuan</a>
            <Link href="/auth/forgot-password">Bantuan akses</Link>
          </div>
        </header>

        <section className="landing-hero">
          <div className="landing-copy">
            <div className="landing-kicker">SECURE EDUCATION OPERATING SYSTEM</div>
            <h1>Satu ruang kendali untuk <em>sekolah yang lebih cerdas.</em></h1>
            <p>EDUNEXUS menyatukan identitas, data siswa, kehadiran, keselamatan, pembelajaran, organisasi, laporan, dan AI dalam satu fondasi yang terkontrol.</p>
            <div className="landing-trust"><span>● Multi-tenant</span><span>● RBAC</span><span>● Audit-ready</span><span>● Human-controlled AI</span></div>
          </div>

          <section className="landing-auth" aria-label="Akses EDUNEXUS">
            <div className="landing-auth-head">
              <div><span className="eyebrow">WELCOME TO EDUNEXUS</span><h2>{mode === "login" ? "Masuk ke akun Anda." : "Mulai dengan akun baru."}</h2></div>
              <span className="secure-badge">● SECURE</span>
            </div>

            <div className="auth-tabs" role="tablist">
              <button className={mode === "login" ? "active" : ""} onClick={() => switchMode("login")} type="button">Sign In / Masuk</button>
              <button className={mode === "signup" ? "active" : ""} onClick={() => switchMode("signup")} type="button">Sign Up / Daftar</button>
            </div>

            <form className="landing-form" onSubmit={submit}>
              {mode === "signup" && <>
                <div className="landing-two-col">
                  <label>Nama lengkap<input type="text" autoComplete="name" value={fullName} onChange={e=>setFullName(e.target.value)} placeholder="Nama Anda" required /></label>
                  <label>Organisasi / sekolah<input type="text" value={organizationName} onChange={e=>setOrganizationName(e.target.value)} placeholder="Nama sekolah / organisasi" required /></label>
                </div>
              </>}
              <label>Email<input type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="nama@contoh.id" required /></label>
              <label>Kata sandi<input type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} value={password} onChange={e=>setPassword(e.target.value)} placeholder={mode === "login" ? "Masukkan kata sandi" : "Minimal 8 karakter"} required /></label>
              {mode === "signup" && <label>Ulangi kata sandi<input type="password" autoComplete="new-password" value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder="Ulangi kata sandi" required /></label>}
              {mode === "signup" && <div className="landing-role"><b>Privilege awal</b><span>Administrator Organisasi · TENANT_ADMIN</span><small>Role Guru, Staf, Siswa, dan Orang Tua diberikan setelah organisasi terbentuk melalui Organisasi & Akses.</small></div>}
              {status && <div className="auth-error" role="alert">{status}</div>}
              <button className="landing-submit" type="submit" disabled={busy || googleBusy}>{busy ? "Memproses…" : mode === "login" ? "Masuk ke EDUNEXUS →" : "Buat akun & lanjutkan →"}</button>
              {mode === "login" && <div className="landing-forgot"><Link href="/auth/forgot-password">Lupa kata sandi?</Link></div>}
            </form>

            <div className="auth-divider"><span>atau</span></div>
            <button type="button" className="google-button landing-google" onClick={continueWithGoogle} disabled={busy || googleBusy}><span>G</span>{googleBusy ? "Menghubungkan ke Google…" : mode === "login" ? "Sign In dengan akun Google" : "Sign Up dengan akun Google"}</button>

            <div className="landing-auth-foot"><span>{mode === "login" ? "Belum punya akun?" : "Sudah punya akun?"}</span><button type="button" onClick={() => switchMode(mode === "login" ? "signup" : "login")}>{mode === "login" ? "Daftar sekarang" : "Masuk sekarang"}</button></div>
            <small className="landing-security">🔒 Autentikasi dan privilege dipisahkan. Hak akses istimewa ditetapkan oleh server EDUNEXUS, bukan oleh data browser.</small>
          </section>
        </section>

        <section className="landing-stats" id="tentang"><div><b>01</b><span>Identitas & RBAC</span><small>Kontrol akses berbasis peran</small></div><div><b>03</b><span>Profil Siswa 360</span><small>Konteks akademik terpusat</small></div><div><b>06</b><span>Keselamatan</span><small>Verifikasi dan kendali manusia</small></div><div><b>27</b><span>AI Governance</span><small>AI dengan persetujuan terukur</small></div></section>
        <footer className="landing-footer"><b>EDUNEXUS</b><span>Education Operating System</span><span>© 2026 · Secure foundation</span></footer>
      </main>
    );
  }

  return <Dashboard />;
}

function Dashboard() {
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
