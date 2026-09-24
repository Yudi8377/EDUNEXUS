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

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => setAuthenticated(Boolean(data.user)));
  }, []);

  useEffect(() => {
    if (authenticated) window.location.replace("/applications");
  }, [authenticated]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setStatus("");
    const supabase = createClient();
    if (mode === "signup") {
      if (fullName.trim().length < 2) return setStatus("Nama lengkap minimal 2 karakter.");
      if (organizationName.trim().length < 3) return setStatus("Nama organisasi / sekolah minimal 3 karakter.");
      if (password.length < 8) return setStatus("Kata sandi minimal 8 karakter.");
      if (password !== confirm) return setStatus("Konfirmasi kata sandi tidak sama.");
      localStorage.setItem("edunexus_bootstrap_draft", JSON.stringify({fullName:fullName.trim(),organizationName:organizationName.trim(),privilege:"TENANT_ADMIN"}));
      setBusy(true);
      const { data, error } = await supabase.auth.signUp({email,password,options:{data:{full_name:fullName.trim()},emailRedirectTo:`${window.location.origin}/auth/callback?next=${encodeURIComponent("/onboarding/bootstrap")}`}});
      if (error) { setStatus(error.message); setBusy(false); return; }
      if (data.session) { window.location.replace("/onboarding/bootstrap"); return; }
      setStatus("Akun dibuat. Periksa email untuk verifikasi.");
      setBusy(false);
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({email,password});
    if (error) { setStatus("Email atau kata sandi tidak benar, atau akun belum dapat digunakan."); setBusy(false); return; }
    window.location.replace("/applications");
  }

  if (authenticated === true) return <main className="landing-loading"><div className="landing-loader">EDUNEXUS<br/><span>Membuka Applications…</span></div></main>;
  if (authenticated === null) return <main className="landing-loading"><div className="landing-loader">EDUNEXUS<br/><span>Menyiapkan akses aman…</span></div></main>;

  return <main className="landing">
    <header className="landing-nav"><Link href="/" className="landing-brand"><span>EX</span><div><b>EDUNEXUS</b><small>Education Operating System</small></div></Link><div className="landing-nav-actions"><a href="#tentang">Tentang</a><a href="#arsitektur">Arsitektur</a><Link href="/auth/forgot-password">Bantuan akses</Link></div></header>
    <section className="landing-hero">
      <div className="landing-copy"><div className="landing-kicker">INTELLIGENT EDUCATION OPERATING SYSTEM</div><h1>33 aplikasi. <em>Satu sistem operasi pendidikan.</em></h1><p>EDUNEXUS menyatukan identitas, siswa, pembelajaran, keselamatan, HR, finance, transport, AI, perangkat, dokumen, reporting, dan Control Center dalam satu arsitektur.</p><div className="landing-trust"><span>● Multi-tenant</span><span>● RBAC / RLS</span><span>● Workflow</span><span>● Audit-ready</span></div></div>
      <section className="landing-auth" aria-label="Akses EDUNEXUS"><div className="landing-auth-head"><div><span className="eyebrow">ACCESS EDUNEXUS</span><h2>{mode==="login"?"Masuk ke aplikasi.":"Buat akun baru."}</h2></div><span className="secure-badge">● SECURE</span></div>
        <div className="auth-tabs"><button className={mode==="login"?"active":""} onClick={()=>{setMode("login");setStatus("")}} type="button">Masuk</button><button className={mode==="signup"?"active":""} onClick={()=>{setMode("signup");setStatus("")}} type="button">Daftar</button></div>
        <form className="landing-form" onSubmit={submit}>{mode==="signup"&&<div className="landing-two-col"><label>Nama lengkap<input value={fullName} onChange={e=>setFullName(e.target.value)} autoComplete="name" required/></label><label>Organisasi / sekolah<input value={organizationName} onChange={e=>setOrganizationName(e.target.value)} required/></label></div>}<label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email" required/></label><label>Kata sandi<input type="password" value={password} onChange={e=>setPassword(e.target.value)} autoComplete={mode==="login"?"current-password":"new-password"} required/></label>{mode==="signup"&&<label>Ulangi kata sandi<input type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} autoComplete="new-password" required/></label>}{status&&<div className="auth-error" role="alert">{status}</div>}<button className="landing-submit" type="submit" disabled={busy}>{busy?"Memproses…":mode==="login"?"Masuk →":"Buat akun →"}</button>{mode==="login"&&<div className="landing-forgot"><Link href="/auth/forgot-password">Lupa kata sandi?</Link></div>}</form>
        <div className="landing-auth-foot"><span>{mode==="login"?"Belum punya akun?":"Sudah punya akun?"}</span><button type="button" onClick={()=>setMode(mode==="login"?"signup":"login")}>{mode==="login"?"Daftar sekarang":"Masuk sekarang"}</button></div><small className="landing-security">Hak akses ditentukan oleh server EDUNEXUS dan kebijakan database, bukan data browser.</small>
      </section>
    </section>
    <section className="landing-stats" id="tentang"><div><b>33</b><span>Aplikasi</span><small>Domain operasional terpadu</small></div><div><b>01</b><span>Application Registry</span><small>Kontrak data terpusat</small></div><div><b>∞</b><span>Relasi</span><small>Entity dan workflow terhubung</small></div><div><b>01</b><span>Control Center</span><small>Administrasi platform</small></div></section>
    <section id="arsitektur" className="landing-stats"><div><b>DB</b><span>Data-first</span><small>Entitas + relasi eksplisit</small></div><div><b>FLOW</b><span>Workflow</span><small>Capture → Review → Execute → Verify</small></div><div><b>RLS</b><span>Security</span><small>Authorization tetap di database</small></div><div><b>PRINT</b><span>Documents</span><small>Output operasional siap cetak</small></div></section>
    <footer className="landing-footer"><b>EDUNEXUS</b><span>Blueprint-aligned Education Operating System</span><span>© 2026</span></footer>
  </main>;
}
