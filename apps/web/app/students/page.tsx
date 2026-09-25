import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import PrintButton from "@/components/print-button";

export const dynamic = "force-dynamic";

export default async function StudentsPage() {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return null;

  const { data: students, error } = await supabase
    .from("v_student_360")
    .select("student_id, student_no, full_name, status, classes, attendance_count, learning_evidence_count")
    .order("full_name", { ascending: true })
    .limit(100);

  return (
    <main className="nx-data-page">
      <header className="nx-data-header">
        <div>
          <Link href="/applications/STUDENT_360">← Student 360</Link>
          <span className="eyebrow">STUDENT 360 · OPERATIONAL MODULE</span>
          <h1>Data Siswa</h1>
          <p>Daftar siswa yang terlihat dalam tenant akun saat ini. Data berasal dari database aktif dan dibatasi oleh sesi serta RLS.</p>
        </div>
        <div className="nx-header-actions">
          <Link className="nx-action-button" href="/onboarding/student">+ Daftarkan siswa</Link>
          <PrintButton />
        </div>
      </header>
      <div className="nx-data-toolbar">
        <div><strong>{students?.length ?? 0}</strong><span>record ditampilkan · maksimum 100</span></div>
        <code>v_student_360</code>
      </div>
      {error ? (
        <div className="nx-data-error"><b>Data siswa tidak dapat dimuat.</b><span>{error.message}</span></div>
      ) : students?.length ? (
        <div className="nx-data-table-wrap">
          <table className="nx-data-table">
            <thead><tr><th>No. Siswa</th><th>Nama</th><th>Status</th><th>Kelas</th><th>Kehadiran</th><th>Bukti Belajar</th><th>Aksi</th></tr></thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.student_id}>
                  <td>{student.student_no ?? "—"}</td>
                  <td><strong>{student.full_name}</strong></td>
                  <td>{student.status ?? "—"}</td>
                  <td>{student.classes || "—"}</td>
                  <td>{student.attendance_count ?? 0}</td>
                  <td>{student.learning_evidence_count ?? 0}</td>
                  <td><Link href={`/students/${student.student_id}`}>Buka</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="nx-data-empty">
          <span className="eyebrow">NO RECORDS</span>
          <h2>Belum ada data siswa</h2>
          <p>EDUNEXUS tidak membuat data siswa fiktif. Gunakan alur pendaftaran terkendali untuk membuat record nyata.</p>
          <Link className="nx-action-button" href="/onboarding/student">Daftarkan siswa</Link>
        </div>
      )}
    </main>
  );
}
