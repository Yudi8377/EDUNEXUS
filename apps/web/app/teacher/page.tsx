import { createClient } from "@/lib/supabase/server";
import PrintButton from "@/components/print-button";

export const dynamic = "force-dynamic";

type TeacherRow = {
  teacher_id: string;
  employee_no: string;
  teacher_name: string;
  teacher_status: string;
  active_tugas_count: number;
  active_class_count: number;
  visible_active_class_count: number;
  assigned_student_count: number;
  kehadiran_today_records: number;
  learning_evidence_30d: number;
  last_learning_evidence_at: string | null;
};

type KelasRow = {
  teacher_id: string;
  class_id: string;
  class_code: string;
  class_name: string;
  class_status: string;
  tugas_role: string;
  subject_code: string | null;
  student_count: number;
  attendance_today: number;
  learning_evidence_30d: number;
};

export default async function TeacherCommandCenterPage() {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims) return null;

  const [{ data: teachers, error: teacherError }, { data: classes, error: classError }] =
    await Promise.all([
      supabase
        .from("v_teacher_command_center")
        .select(
          "teacher_id,employee_no,teacher_name,teacher_status,active_tugas_count,active_class_count,visible_active_class_count,assigned_student_count,attendance_today_records,learning_evidence_30d,last_learning_evidence_at",
        )
        .limit(20),
      supabase
        .from("v_teacher_class_command")
        .select(
          "teacher_id,class_id,class_code,class_name,class_status,tugas_role,subject_code,student_count,attendance_today,learning_evidence_30d",
        )
        .limit(100),
    ]);

  if (teacherError || classError) {
    return (
      <main className="simple-page">
        <a href="/">← Pusat Kendali</a>
        <p className="eyebrow">OPERASI GURU</p>
        <h1>Pusat Kendali Guru</h1>
        <div className="empty-card">
          <strong>Data operasional guru tidak tersedia</strong>
          <span>{teacherError?.message ?? classError?.message}</span>
        </div>
      </main>
    );
  }

  const teacherRows = (teachers ?? []) as TeacherRow[];
  const classRows = (classes ?? []) as KelasRow[];
  const teacher = teacherRows[0];

  if (!teacher) {
    return (
      <main className="simple-page">
        <a href="/">← Pusat Kendali</a>
        <p className="eyebrow">OPERASI GURU • LIVE</p>
        <h1>Pusat Kendali Guru</h1>
        <p className="lede">
          Ruang operasional terkendali untuk kelas, kehadiran, bukti pembelajaran, dan dukungan pengajaran berbantuan AI.
        </p>
        <div className="empty-card">
          <strong>Belum ada akun guru yang disediakan.</strong>
          <span>
            Database aktif saat ini belum memiliki data guru. Tambahkan guru melalui proses onboarding yang dikendalikan
            operation; EDUNEXUS does not create synthetic personnel data.
          </span>
        </div>
      </main>
    );
  }

  const ownKelases = classRows.filter((row) => row.teacher_id === teacher.teacher_id);

  return (
    <main className="simple-page teacher-page">
      <a href="/">← Pusat Kendali</a>
      <p className="eyebrow">OPERASI GURU • LIVE</p>
      <div className="teacher-heading">
        <div>
          <h1>Pengajaran yang baik dimulai dari konteks yang jelas.</h1>
          <p className="lede">
            {teacher.teacher_name} · {teacher.employee_no}. One governed view across assigned classes, attendance and
            bukti pembelajaran.
          </p>
        </div>
        <span className="tenant">Guru {teacher.teacher_status}</span>
      </div>

      <section className="teacher-metrics">
        <article className="metric"><span>Siswa yang ditugaskan</span><strong>{teacher.assigned_student_count}</strong><small>Keanggotaan kelas aktif</small></article>
        <article className="metric"><span>Kelases</span><strong>{teacher.visible_active_class_count}</strong><small>Terlihat dalam kebijakan saat ini</small></article>
        <article className="metric"><span>Kehadiran hari ini</span><strong>{teacher.attendance_today_records}</strong><small>Catatan kehadiran</small></article>
        <article className="metric"><span>Bukti pembelajaran</span><strong>{teacher.learning_evidence_30d}</strong><small>30 hari terakhir</small></article>
      </section>

      <div className="section-head">
        <div><p className="eyebrow">KELAS SAYA</p><h3>Tampilan operasional kelas</h3></div>
        <span>{ownKelases.length} kelas</span>
      </div>

      {ownKelases.length ? (
        <section className="teacher-class-grid">
          {ownKelases.map((row) => (
            <article className="teacher-class-card" key={row.class_id}>
              <div className="teacher-class-top">
                <span>{row.class_code}</span>
                <small>{row.tugas_role.replaceAll("_", " ")}</small>
              </div>
              <h4>{row.class_name}</h4>
              <p>{row.subject_code ? `Mata pelajaran · ${row.subject_code}` : "Kelas tugas"}</p>
              <div className="teacher-class-stats">
                <span><b>{row.student_count}</b> siswa</span>
                <span><b>{row.attendance_today}</b> attendance</span>
                <span><b>{row.learning_evidence_30d}</b> bukti / 30 hari</span>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <div className="empty-card">
          <strong>Belum ada kelas aktif</strong>
          <span>Identitas guru tersedia, tetapi tidak ada penugasan kelas aktif yang terlihat berdasarkan kebijakan organisasi saat ini.</span>
        </div>
      )}

      <section className="teacher-ai-card">
        <div>
          <p className="eyebrow">ASISTEN AI TERKENDALI</p>
          <h3>Gunakan bukti. Pertahankan kewenangan manusia.</h3>
          <p>
            The learning assistant can prepare evidence-grounded instructional recommendations. It cannot mutate grades,
            directly act on students, or bypass high-impact review.
          </p>
        </div>
        <a className="primary" href="/learning">Buka Bukti Pembelajaran →</a>
      </section>
    </main>
  );
}
