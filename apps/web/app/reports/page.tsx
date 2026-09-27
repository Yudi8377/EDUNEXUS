import Link from "next/link";
import PrintButton from "@/components/print-button";

const reports = [
  ["/students","Profil Siswa 360","Daftar siswa, status, kelas, kehadiran, dan bukti pembelajaran."],
  ["/teacher","Operasional Guru","Kelas aktif, siswa, kehadiran, dan bukti pembelajaran guru."],
  ["/attendance","Kehadiran","Pencatatan kehadiran melalui Edge Function dengan audit."],
  ["/learning","Bukti Pembelajaran","Pencatatan evidence yang menjadi sumber Student 360 dan AI."],
  ["/safety","Keselamatan Siswa","Verifikasi penjemputan, hasil verifikasi, dan human approval gate."],
  ["/tenant","Organisasi & Akses","Konteks tenant, membership, role, dan risiko akses."]
];

export default function ReportsPage() {
  return <main className="simple-page">
    <div className="page-tools"><Link href="/">← Pusat Kendali</Link><PrintButton label="Cetak pusat laporan" /></div>
    <p className="eyebrow">LAPORAN · OPERASIONAL</p>
    <h1>Pusat laporan EDUNEXUS.</h1>
    <p className="lede">Indeks keluaran operasional. Setiap laporan membuka modul sumber sehingga data dapat diperiksa, diproses, dan dicetak tanpa membuat angka sintetis.</p>
    <section className="report-grid">{reports.map(([href,title,desc]) => <Link className="report-card" href={href} key={href}><strong>{title}</strong><span>{desc}</span><b>Buka modul →</b></Link>)}</section>
  </main>;
}