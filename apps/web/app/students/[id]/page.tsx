import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PrintButton from "@/components/print-button";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function StudentDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return null;

  const { data: student, error } = await supabase
    .from("v_student_360")
    .select("student_id,student_no,full_name,status,classes,attendance_count,learning_evidence_count")
    .eq("student_id", id)
    .maybeSingle();

  if (error) {
    return (
      <main className="nx-data-page">
        <Link href="/students">← Data Siswa</Link>
        <span className="eyebrow">STUDENT 360 · ERROR</span>
        <h1>Profil siswa</h1>
        <div className="nx-data-error"><b>Profil tidak dapat dimuat.</b><span>{error.message}</span></div>
      </main>
    );
  }

  if (!student) notFound();

  return (
    <main className="nx-data-page">
      <header className="nx-data-header">
        <div>
          <Link href="/students">← Kembali ke Data Siswa</Link>
          <span className="eyebrow">STUDENT 360 · DETAIL</span>
          <h1>{student.full_name}</h1>
          <p>Profil operasional yang berasal dari database aktif dan tetap tunduk pada sesi serta kebijakan akses organisasi.</p>
        </div>
        <div className="nx-header-actions">
          <PrintButton label="Cetak profil" />
          <Link className="nx-action-button" href="/onboarding/student">+ Daftarkan siswa</Link>
        </div>
      </header>

      <section className="teacher-metrics">
        <article className="metric"><span>Nomor siswa</span><strong>{student.student_no ?? "—"}</strong><small>Identitas sekolah</small></article>
        <article className="metric"><span>Status</span><strong>{student.status ?? "—"}</strong><small>Status operasional</small></article>
        <article className="metric"><span>Kehadiran</span><strong>{student.attendance_count ?? 0}</strong><small>Total catatan yang terlihat</small></article>
        <article className="metric"><span>Bukti pembelajaran</span><strong>{student.learning_evidence_count ?? 0}</strong><small>Total bukti yang terlihat</small></article>
      </section>

      <section className="nx-workspace-grid">
        <article className="nx-command-card">
          <div className="nx-module-heading">
            <div><span className="eyebrow">KELAS</span><h2>Kelas siswa</h2><p>Penempatan kelas yang tersedia dari Student 360.</p></div>
          </div>
          <div className="nx-data-empty"><h2>{student.classes || "Belum ada kelas"}</h2><p>Relasi kelas ditampilkan dari sumber data yang sama; tidak ada kelas sintetis yang dibuat oleh aplikasi.</p></div>
        </article>
      </section>
    </main>
  );
}
