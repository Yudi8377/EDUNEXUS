"use client";

import Link from "next/link";

const pillars = [
  {title:"Character", text:"Kebiasaan, tanggung jawab, integritas, disiplin, dan refleksi perkembangan."},
  {title:"Talent & Interest", text:"Pemetaan minat dan potensi untuk menemukan arah pengembangan yang relevan."},
  {title:"Soft Skills", text:"Komunikasi, kolaborasi, leadership, presentasi, problem solving, dan interpersonal."},
  {title:"Hard Skills", text:"Kompetensi teknis lintas bidang: IT, culinary, hospitality, creative, sports, business, engineering, dan lainnya."},
  {title:"Life Skills", text:"Kemandirian, finansial dasar, decision making, safety, dan kesiapan hidup."},
  {title:"Skill Passport", text:"Bukti perkembangan berupa assessment, project, achievement, portfolio, dan mentor evidence."},
];

const goals = ["Technology","Future Leader","Entrepreneur","Culinary Entrepreneur","Hospitality","Creative Industry","Sports","Public Personality","Academic Excellence","Career Preparation"];

export default function TalentSkillPage(){
  return <main className="landing" style={{minHeight:"100vh"}}>
    <header className="landing-nav"><Link href="/" className="landing-brand"><span>EX</span><div><b>EDUNEXUS</b><small>Talent & Skill Platform</small></div></Link><div className="landing-nav-actions"><Link href="/applications">Applications</Link><Link href="/students">Students</Link></div></header>
    <section className="landing-hero" style={{paddingBottom:"3rem"}}>
      <div className="landing-copy"><div className="landing-kicker">TALENT & SKILL ECOSYSTEM</div><h1>Bangun <em>potensi</em>, bukan sekadar menyelesaikan kursus.</h1><p>Platform pengembangan berkelanjutan untuk siswa SMP, SMA/SMK, mahasiswa, hingga profesional—menghubungkan karakter, bakat, soft skill, hard skill, project, assessment, dan Skill Passport.</p><div className="landing-trust"><span>● Goal-based</span><span>● Evidence-based</span><span>● Human-in-the-loop</span><span>● Safety-first AI</span></div></div>
      <div className="landing-auth" style={{alignSelf:"center"}}><span className="eyebrow">DEVELOPMENT JOURNEY</span><h2>SMP → SMA/SMK → Universitas → Profesional</h2><p style={{opacity:.8}}>Satu rekam perkembangan yang dapat terus dibangun tanpa kehilangan konteks dan bukti kompetensi.</p><Link className="landing-submit" href="/onboarding">Mulai perjalanan →</Link></div>
    </section>
    <section className="landing-stats">{pillars.map(p=><div key={p.title}><b>{p.title}</b><span>{p.text}</span></div>)}</section>
    <section className="landing-stats"><div style={{gridColumn:"1/-1"}}><b>GOAL PATHWAYS</b><span>{goals.join(" · ")}</span><small>Goal menentukan roadmap; sistem tidak menjanjikan hasil kompetisi atau karier.</small></div></section>
    <section className="landing-stats"><div style={{gridColumn:"1/-1"}}><b>AI LIVE PERFORMANCE</b><span>Speech · Presentation · Participation · Turn-taking · Task-relevant movement · Interview/Role-play</span><small>Analisis hanya indikator yang dapat diamati dan relevan dengan tujuan belajar. Tidak ada diagnosis emosi, mental health, personality, atau character dari wajah/video.</small></div></section>
  </main>;
}
