import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function SiswasPage() {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();

  if (!claims?.claims) {
    return null;
  }

  const { data: students, error } = await supabase
    .from("v_student_360")
    .select("student_id, full_name, status, classes, attendance_count, learning_evidence_count")
    .order("full_name", { ascending: true })
    .limit(50);

  return (
    <main className="simple-page">
      <a href="/">← Pusat Kendali</a>
      <p className="eyebrow">PROFIL SISWA 360 • LANGSUNG</p>
      <h1>Siswa context, in one place.</h1>
      <p className="lede">Data siswa dibatasi berdasarkan organisasi, dibaca melalui sesi Supabase terautentikasi, dan dilindungi RLS basis data.</p>

      {error ? (
        <div className="empty-card">
          <strong>Siswa data unavailable</strong>
          <span>{error.message}</span>
        </div>
      ) : students?.length ? (
        <div className="empty-card">
          <strong>{students.length} data siswa yang terlihat{students.length === 1 ? "" : "s"}</strong>
          <span>Menampilkan 50 data pertama yang terlihat dalam konteks organisasi akun saat ini.</span>
          <div className="student-list">
            {students.map((student) => (
              <article key={student.student_id} className="student-row">
                <div>
                  <strong>{student.full_name}</strong>
                  <span>{student.status}</span>
                </div>
                <small>Kehadiran: {student.attendance_count ?? 0} · Bukti: {student.learning_evidence_count ?? 0}</small>
              </article>
            ))}
          </div>
        </div>
      ) : (
        <div className="empty-card">
          <strong>Belum ada data siswa yang terlihat</strong>
          <span>EDUNEXUS tidak membuat data siswa fiktif. Buat organisasi, sekolah, dan siswa nyata melalui alur pendaftaran terkendali.</span>
        </div>
      )}
    </main>
  );
}
