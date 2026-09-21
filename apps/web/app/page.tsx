import Link from "next/link";

export default function HomePage() {
  return (
    <main className="shell">
      <aside className="rail">
        <div className="brand"><div className="brand-mark">E</div><div><strong>EDUNEXUS</strong><span>Education OS</span></div></div>
        <nav className="nav"><Link className="nav-active" href="/">Overview</Link><Link href="/students">Students</Link><Link href="/safety">Safety</Link><Link href="/">Learning</Link><Link href="/">AI Control</Link><Link href="/">Reports</Link></nav>
        <div className="rail-footer">● Foundation online<small>D+7 vertical slice</small></div>
      </aside>
      <section className="workspace">
        <header className="topbar"><div><p className="eyebrow">EDUNEXUS / COMMAND CENTER</p><h1>Good afternoon.</h1></div><span className="tenant">Demo tenant · Pilot</span></header>
        <div className="content">
          <section className="hero"><div><span className="pill">AUTONOMOUS • GOVERNED • AUDITABLE</span><h2>One operating layer for a safer, smarter school.</h2><p>EDUNEXUS connects student data, school workflows, safety controls and governed AI without giving automation authority it does not have.</p><div className="hero-actions"><Link className="primary" href="/students">Open Student 360 →</Link><Link className="secondary" href="/safety">Review Safety Engine</Link></div></div><div className="hero-orbit" aria-hidden="true"><div className="orbit-ring ring-a"/><div className="orbit-ring ring-b"/><div className="orbit-core">EX<br/><span>OS</span></div></div></section>
          <section className="metric-grid">{[["Students","—","Connect school data"],["Attendance","—","No live records yet"],["Safety","Ready","Engine 06 verified"],["AI tasks","—","Gateway not configured"]].map(([a,b,c])=><article className="metric" key={a}><span>{a}</span><strong>{b}</strong><small>{c}</small></article>)}</section>
          <div className="section-head"><div><p className="eyebrow">FOUNDATION</p><h3>Core capabilities</h3></div><span>Live architecture</span></div>
          <section className="capability-grid">{[["01","Identity & Security","Tenant isolation, RBAC, audit"],["03","Student 360","Academic and engagement context"],["06","Student Safety","Pickup verification + human gate"],["27","AI Autonomy","Governed agents and approvals"]].map(([a,b,c])=><article className="capability" key={a}><span>{a}</span><div><h4>{b}</h4><p>{c}</p></div><b>↗</b></article>)}</section>
          <section className="notice"><b>!</b><div><strong>AI reasoning is intentionally gated.</strong><p>The AI Gateway is prepared but no production credential is configured. Safety, high-risk actions and authorization remain human-controlled.</p></div><Link href="/">View governance →</Link></section>
        </div>
      </section>
    </main>
  );
}