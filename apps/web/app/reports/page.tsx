import Link from "next/link";
import PrintButton from "@/components/print-button";

export default function ReportsPage() {
  return (
    <main className="simple-page">
      <div className="page-tools">
        <Link href="/">← Pusat Kendali</Link>
        <PrintButton label="Cetak pusat laporan" />
      </div>
      <p className="eyebrow">LAPORAN • TERKENDALI</p>
      <h1>Pusat laporan EDUNEXUS.</h1>
      <p className="lede">Akses cepat ke keluaran operasional yang dapat dicetak. Data berasal dari sistem nyata; EDUNEXUS tidak membuat angka atau data fiktif.</p>
      <section className="report-grid">
        <Link className="report-card" href="/students"><strong>Profil Siswa 360</strong><span>Daftar siswa, status, kehadiran, dan bukti pembelajaran.</span></Link>
        <Link className="report-card" href="/teacher"><strong>Laporan Guru</strong><span>Kelas aktif, siswa, kehadiran, dan bukti pembelajaran.</span></Link>
        <Link className="report-card" href="/attendance"><strong>Kehadiran</strong><span>Form pencatatan dan keluaran yang dapat dicetak.</span></Link>
        <Link className="report-card" href="/learning"><strong>Bukti Pembelajaran</strong><span>Form bukti pembelajaran dan keluaran yang dapat dicetak.</span></Link>
        <Link className="report-card" href="/tenant"><strong>Organisasi & Akses</strong><span>Keanggotaan dan peran efektif akun.</span></Link>
      </section>
    </main>
  );
}
