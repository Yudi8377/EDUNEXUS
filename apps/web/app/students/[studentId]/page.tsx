import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PrintButton from "@/components/print-button";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ studentId: string }> };

export default async function Student360DetailPage({ params }: Props) {
  const { studentId } = await params;
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return null;

  const { data: student, error } = await supabase
    .from("v_student_360")
    .select("student_id, student_no, full_name, status, classes, attendance_count, learning_evidence_count")
    .eq("student_id", studentId)
    .maybeSingle();

  if (!student && !error) notFound();

  return (
    <main className="nx-data-page">
      <header className="nx-data-header">
        <div>
          <Link href="/students">← Data Siswa</Link>
          <span className="eyebrow">STUDENT 360 · RECORD</span>
          <h1>{student?.full_name ?? "Data siswa"}</h1>
          <p>{student?.student_no ? `Nomor siswa: ${student.student_no}` : "Detail record siswa"}</p>
        </div>
        <PrintButton />
      </header>

      {error ? (
        <div className="nx-data-error"><b>Record tidak dapat dimuat.</b><span>{error.message}</span></div>
      ) : student ? (
        <>
          <section className="nx-data-toolbar">
            <div><strong>{student.status ?? "—"}</strong><span>status siswa</span></div>
            <code>{student.student_id}</code>
          </section>
          <div className="nx-data-table-wrap">
            <table className="nx-data-table">
              <tbody>
                <tr><th>Nomor siswa</th><td>{student.student_no ?? "—"}</td></tr>
                <tr><th>Nama lengkap</th><td>{student.full_name}</td></tr>
                <tr><th>Status</th><td>{student.status ?? "—"}</td></tr>
                <tr><th>Kelas aktif</th><td>{student.classes || "—"}</td></tr>
                <tr><th>Jumlah catatan kehadiran</th><td>{student.attendance_count ?? 0}</td></tr>
                <tr><th>Bukti belajar</th><td>{student.learning_evidence_count ?? 0}</td></tr>
              </tbody>
            </table>
          </div>
          <section className="nx-data-empty">
            <span className="eyebrow">OPERATIONS</span>
            <h2>Aksi record</h2>
            <p>Perubahan master siswa tetap menggunakan alur pendaftaran/operasi yang memiliki validasi dan audit. EDUNEXUS tidak menyediakan tombol edit langsung yang melewati governance.</p>
            <Link className="nx-action-button" href="/onboarding/student">Daftarkan siswa baru</Link>
          </section>
        </>
      ) : null}
    </main>
  );
}
