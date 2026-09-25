"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

type AppRecord = {
  id: string;
  code: string;
  sequence_no: number;
  name: string;
  short_name: string | null;
  description: string | null;
  lifecycle_status: string | null;
  route: string | null;
  audience: string | null;
  capabilities: unknown;
};

const iconFor = (code: string) => {
  const map: Record<string, string> = {
    "01":"◈","02":"◇","03":"◎","04":"↻","05":"＋","06":"✦","07":"▦","08":"▣","09":"◆",
    "10":"◌","11":"▤","12":"✧","13":"♥","14":"◒","15":"♙","16":"↳","17":"Rp","18":"▤",
  };
  return map[code] ?? "•";
};

const statusLabel = (status: string | null) => {
  if (status === "planned") return "Disiapkan";
  if (status === "active") return "Aktif";
  if (status === "pilot") return "Pilot";
  return status || "Tersedia";
};

export default function EnterpriseDashboard({ apps }: { apps: AppRecord[] }) {
  const [tab, setTab] = useState<"overview" | "apps" | "insights">("overview");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("Semua");
  const [dense, setDense] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      setFavorites(JSON.parse(localStorage.getItem("edunexus:favorites") || "[]"));
    } catch {}
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "/" && !["INPUT","TEXTAREA"].includes((event.target as HTMLElement)?.tagName)) {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const toggleFavorite = (code: string) => {
    const next = favorites.includes(code) ? favorites.filter((x) => x !== code) : [...favorites, code];
    setFavorites(next);
    localStorage.setItem("edunexus:favorites", JSON.stringify(next));
  };

  const active = apps.filter((a) => a.lifecycle_status !== "planned").length;
  const planned = apps.length - active;
  const audiences = Array.from(new Set(apps.map((a) => a.audience || "Sekolah"))).sort();
  const filters = ["Semua", ...audiences];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return apps.filter((app) => {
      const matchesFilter = filter === "Semua" || (app.audience || "Sekolah") === filter;
      const haystack = [app.code, app.name, app.short_name, app.description, app.audience].join(" ").toLowerCase();
      return matchesFilter && (!q || haystack.includes(q));
    });
  }, [apps, filter, query]);

  const statusCounts = apps.reduce<Record<string, number>>((acc, app) => {
    const key = app.lifecycle_status || "other";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const maxStatus = Math.max(1, ...Object.values(statusCounts));

  const favoriteApps = apps.filter((a) => favorites.includes(a.code));

  return (
    <main className={`enterprise-shell ${dense ? "enterprise-dense" : ""}`}>
      <aside className="enterprise-sidebar">
        <Link href="/applications" className="enterprise-brand">
          <span className="enterprise-brand-mark">EX</span>
          <span><b>EDUNEXUS</b><small>Education Operating System</small></span>
        </Link>
        <div className="enterprise-nav-label">WORKSPACE</div>
        <nav className="enterprise-nav">
          <button className={tab === "overview" ? "active" : ""} onClick={() => setTab("overview")}><i>⌂</i> Ringkasan</button>
          <button className={tab === "apps" ? "active" : ""} onClick={() => setTab("apps")}><i>▦</i> Aplikasi <em>{apps.length}</em></button>
          <Link href="/students"><i>◎</i> Student 360</Link>
          <Link href="/teachers"><i>♙</i> Teacher</Link>
          <Link href="/reports"><i>▥</i> Laporan</Link>
        </nav>
        <div className="enterprise-nav-label">MANAGEMENT</div>
        <nav className="enterprise-nav">
          <Link href="/tenant"><i>⚙</i> Organisasi & akses</Link>
          <Link href="/applications/31"><i>▤</i> Dokumen & cetak</Link>
          <Link href="/applications/33"><i>◈</i> Control Center</Link>
        </nav>
        <div className="enterprise-side-footer">
          <span className="enterprise-live"><i /> Sistem aktif</span>
          <Link href="/tenant" className="enterprise-user">
            <span>AD</span><div><b>Administrator</b><small>Akun & akses</small></div><strong>›</strong>
          </Link>
        </div>
      </aside>

      <section className="enterprise-main">
        <header className="enterprise-topbar">
          <div className="enterprise-title">
            <button className="enterprise-mobile-menu" aria-label="Buka menu">☰</button>
            <div><span>EDUNEXUS / CONTROL DESK</span><h1>{tab === "overview" ? "Ringkasan operasional" : tab === "apps" ? "Aplikasi sekolah" : "Analisis sistem"}</h1></div>
          </div>
          <div className="enterprise-actions">
            <label className="enterprise-search">
              <span>⌕</span><input ref={searchRef} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari aplikasi, modul, data…" aria-label="Cari aplikasi" />
              <kbd>/</kbd>
              {query && <button onClick={() => setQuery("")} aria-label="Hapus pencarian">×</button>}
            </label>
            <button className="enterprise-tool" onClick={() => setDense(!dense)} aria-pressed={dense} title="Ubah kepadatan tampilan">{dense ? "☷" : "≡"}</button>
            <Link href="/tenant" className="enterprise-profile">AD</Link>
          </div>
        </header>

        <div className="enterprise-content">
          <div className="enterprise-tabs" role="tablist" aria-label="Tampilan workspace">
            <button className={tab === "overview" ? "active" : ""} onClick={() => setTab("overview")}>Ringkasan</button>
            <button className={tab === "apps" ? "active" : ""} onClick={() => setTab("apps")}>Aplikasi</button>
            <button className={tab === "insights" ? "active" : ""} onClick={() => setTab("insights")}>Analisis</button>
          </div>

          {tab === "overview" && (
            <>
              <section className="enterprise-hero">
                <div className="enterprise-hero-copy">
                  <span>EXECUTIVE WORKSPACE</span>
                  <h2>Satu layar untuk memahami sekolah.</h2>
                  <p>Ringkasan dibuat untuk membaca kondisi operasional dengan cepat, lalu berpindah langsung ke pekerjaan yang perlu dilakukan.</p>
                  <div className="enterprise-hero-actions">
                    <button onClick={() => setTab("apps")}>Jelajahi aplikasi <b>→</b></button>
                    <button className="ghost" onClick={() => setTab("insights")}>Lihat analisis</button>
                  </div>
                </div>
                <div className="enterprise-hero-visual" aria-hidden="true">
                  <div className="signal-ring ring-one" /><div className="signal-ring ring-two" /><div className="signal-core"><b>EX</b><small>OS</small></div>
                  <i className="signal-dot dot-one" /><i className="signal-dot dot-two" /><i className="signal-dot dot-three" />
                </div>
              </section>

              <section className="enterprise-kpis" aria-label="Ringkasan sistem">
                <article><span className="kpi-icon green">▦</span><div><small>APLIKASI</small><b>{apps.length}</b><p>Terdaftar di workspace</p></div></article>
                <article><span className="kpi-icon blue">✓</span><div><small>AKTIF</small><b>{active}</b><p>Dapat digunakan</p></div></article>
                <article><span className="kpi-icon amber">◷</span><div><small>DISELESAIKAN BERIKUTNYA</small><b>{planned}</b><p>Masih berstatus disiapkan</p></div></article>
                <article><span className="kpi-icon violet">★</span><div><small>FAVORIT ANDA</small><b>{favoriteApps.length}</b><p>Pintasan pribadi</p></div></article>
              </section>

              <div className="enterprise-section-title"><div><span>FOCUS</span><h2>Pekerjaan yang sering dibuka</h2></div><button onClick={() => setTab("apps")}>Kelola semua →</button></div>
              <section className="enterprise-focus-grid">
                {favoriteApps.length ? favoriteApps.slice(0,4).map((app) => (
                  <Link href={`/applications/${app.code}`} className="focus-card" key={app.id}><span>{iconFor(app.code)}</span><div><b>{app.short_name || app.name}</b><small>{statusLabel(app.lifecycle_status)} · {app.audience || "Sekolah"}</small></div><strong>→</strong></Link>
                )) : (
                  <button className="focus-empty" onClick={() => setTab("apps")}><span>☆</span><div><b>Belum ada pintasan pribadi</b><small>Tandai aplikasi dengan ☆ agar muncul di sini.</small></div><strong>Tambahkan →</strong></button>
                )}
              </section>

              <section className="enterprise-bottom-grid">
                <article className="enterprise-panel">
                  <div className="panel-head"><div><span>PORTFOLIO</span><h3>Komposisi aplikasi</h3></div><button onClick={() => setTab("insights")}>Analisis →</button></div>
                  <div className="mini-bars">
                    {Object.entries(statusCounts).map(([status,count]) => <div className="mini-bar-row" key={status}><span>{statusLabel(status)}</span><div><i style={{width:`${Math.max(8,(count/maxStatus)*100)}%`}} /></div><b>{count}</b></div>)}
                  </div>
                </article>
                <article className="enterprise-panel enterprise-panel-dark">
                  <span>EDUNEXUS INTELLIGENCE</span><h3>Baca data.<br/>Temukan pola.</h3><p>Workspace ini menjadi titik masuk ke Student 360, workflow, reporting, dokumen, dan AI tanpa mengubah sumber data operasional.</p><Link href="/applications/27">Buka AI Orchestrator →</Link>
                </article>
              </section>
            </>
          )}

          {tab === "apps" && (
            <>
              <section className="enterprise-page-intro"><div><span>APPLICATION CATALOG</span><h2>Seluruh aplikasi</h2><p>Pilih aplikasi berdasarkan kebutuhan. Gunakan pencarian atau filter untuk mempersempit tampilan.</p></div><div className="enterprise-result-count"><b>{filtered.length}</b><span>dari {apps.length} aplikasi</span></div></section>
              <div className="enterprise-filter-row">
                <div className="enterprise-filter-scroll">{filters.map((item) => <button key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>{item}</button>)}</div>
                {query && <span className="filter-note">Pencarian: “{query}”</span>}
              </div>
              <section className="enterprise-app-grid" aria-label="Katalog aplikasi">
                {filtered.map((app) => (
                  <article className="enterprise-app-card" key={app.id}>
                    <Link href={`/applications/${app.code}`} className="app-open"><span className="app-symbol">{iconFor(app.code)}</span><span className="app-go">↗</span><small>APP {String(app.sequence_no).padStart(2,"0")}</small><h3>{app.short_name || app.name}</h3><p>{app.description || "Workspace operasional EDUNEXUS."}</p></Link>
                    <div className="app-card-foot"><span>{statusLabel(app.lifecycle_status)}</span><button onClick={() => toggleFavorite(app.code)} aria-label={favorites.includes(app.code) ? "Hapus dari favorit" : "Tambahkan ke favorit"}>{favorites.includes(app.code) ? "★" : "☆"}</button></div>
                  </article>
                ))}
                {!filtered.length && <div className="enterprise-no-results"><b>Tidak ada aplikasi yang cocok.</b><span>Ubah pencarian atau filter untuk melihat hasil lain.</span><button onClick={() => {setQuery("");setFilter("Semua")}}>Reset pencarian</button></div>}
              </section>
            </>
          )}

          {tab === "insights" && (
            <>
              <section className="enterprise-page-intro"><div><span>OPERATIONAL ANALYSIS</span><h2>Analisis workspace</h2><p>Gunakan panel ini untuk membaca struktur portofolio aplikasi yang benar-benar terdaftar di EDUNEXUS.</p></div></section>
              <section className="insight-grid">
                <article className="insight-card insight-wide"><div className="insight-head"><div><span>STATUS PORTOFOLIO</span><h3>Distribusi aplikasi</h3></div><b>{apps.length} total</b></div>
                  <div className="bar-chart">{Object.entries(statusCounts).map(([status,count]) => <div className="bar-item" key={status}><div className="bar-value">{count}</div><div className="bar-track"><i style={{height:`${Math.max(12,(count/maxStatus)*100)}%`}} /></div><span>{statusLabel(status)}</span></div>)}</div>
                </article>
                <article className="insight-card"><div className="insight-head"><div><span>PERSONAL WORKSPACE</span><h3>Pintasan Anda</h3></div><b>{favoriteApps.length}</b></div><div className="favorite-summary">{favoriteApps.length ? favoriteApps.map(a => <Link href={`/applications/${a.code}`} key={a.id}>{iconFor(a.code)} {a.short_name || a.name}<span>→</span></Link>) : <p>Belum ada aplikasi yang ditandai favorit.</p>}</div></article>
                <article className="insight-card"><div className="insight-head"><div><span>READABILITY</span><h3>Mode tampilan</h3></div></div><div className="readability-controls"><button className={!dense ? "active":""} onClick={() => setDense(false)}><b>Standar</b><small>Ruang lebih lega untuk membaca</small></button><button className={dense ? "active":""} onClick={() => setDense(true)}><b>Padat</b><small>Lebih banyak informasi per layar</small></button></div></article>
              </section>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
