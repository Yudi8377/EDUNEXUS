import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/auth/logout-button";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return <main className="shell">
    <aside className="rail">
      <div className="brand"><div className="brand-mark">E</div><div><strong>EDUNEXUS</strong><span>Sistem Operasi Pendidikan</span></div></div>
      <nav className="nav"><Link className="nav-active" href="/">Ringkasan</Link><Link href="/students">Siswa</Link><Link href="/safety">Keselamatan</Link><Link href="/teacher">Guru</Link><Link href="/ai-control">Kendali AI</Link><Link href="/reports">Laporan</Link><Link href="/tenant">Organisasi & Akses</Link><Link href="/schools">Sekolah</Link><Link href="/onboarding">Tambah Organisasi</Link></nav>
      <div className="rail-footer">● Fondasi aktif<small>Potongan vertikal D+7</small></div>
    </aside>
    <section className="workspace">
      <header className="topbar"><div><p className="eyebrow">EDUNEXUS / PUSAT KENDALI</p><h1>Selamat datang.</h1></div><div className="tenant">{user ? <><span>{user.email}</span><Link href="/tenant">Akun & Akses</Link><LogoutButton /></> : <><span>Mode publik</span><Link href="/auth/login">Masuk</Link></>}</div></header>
      <div className="content">
        <section className="hero"><div><span className="pill">OTONOM • TERKENDALI • DAPAT DIAUDIT</span><h2>Satu lapisan operasi untuk sekolah yang lebih aman dan cerdas.</h2><p>EDUNEXUS menghubungkan data siswa, alur kerja sekolah, kendali keselamatan, dan AI yang diawasi tanpa memberikan kewenangan yang tidak semestinya.</p><div className="hero-actions"><Link className="primary" href="/students">Buka Profil Siswa 360 →</Link><Link className="secondary" href="/safety">Tinjau Mesin Keselamatan</Link></div></div><div className="hero-orbit" aria-hidden="true"><div className="orbit-ring ring-a"/><div className="orbit-ring ring-b"/><div className="orbit-core">EX<br/><span>OS</span></div></div></section>
        <section className="metric-grid">{[["Siswa","—","Hubungkan data sekolah"],["Kehadiran","—","Belum ada data langsung"],["Keselamatan","Siap","Mesin 06 terverifikasi"],["Tugas AI","—","Gateway belum dikonfigurasi"]].map(([a,b,c])=><article className="metric" key={a}><span>{a}</span><strong>{b}</strong><small>{c}</small></article>)}</section>
        <div className="section-head"><div><p className="eyebrow">FONDASI</p><h3>Kemampuan inti</h3></div><span>Arsitektur langsung</span></div>
        <section className="capability-grid">{[["01","Identitas & Keamanan","Isolasi organisasi, RBAC, audit"],["03","Profil Siswa 360","Konteks akademik dan keterlibatan"],["06","Keselamatan Siswa","Verifikasi penjemputan + kendali manusia"],["27","Otonomi AI","Agen dengan tata kelola dan persetujuan"]].map(([a,b,c])=><article className="capability" key={a}><span>{a}</span><div><h4>{b}</h4><p>{c}</p></div><b>↗</b></article>)}</section>
        <section className="notice"><b>!</b><div><strong>Penalaran AI sengaja dibatasi.</strong><p>Gateway AI sudah disiapkan tetapi kredensial produksi belum dikonfigurasi. Keselamatan, tindakan berisiko tinggi, dan otorisasi tetap dikendalikan manusia.</p></div><Link href="/ai-control">Lihat tata kelola →</Link></section>
      </div>
    </section>
  </main>;
}