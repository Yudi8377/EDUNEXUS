import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PrintButton from "@/components/print-button";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ studentId: string }> };

const text = (v: unknown) => v === null || v === undefined || v === "" ? "—" : String(v);

export default async function Student360DetailPage({ params }: Props) {
  const { studentId } = await params;
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return null;

  const [{ data: student, error: studentError }, { data: attendance }, { data: evidence }, { data: guardians }, { data: incidents }] = await Promise.all([
    supabase.from("v_student_360").select("student_id,student_no,full_name,status,classes,attendance_count,learning_evidence_count").eq("student_id", studentId).maybeSingle(),
    supabase.from("attendance_records").select("*").eq("student_id", studentId).order("attendance_date",{ascending:false}).limit(8),
    supabase.from("learning_evidence").select("*").eq("student_id", studentId).order("created_at",{ascending:false}).limit(8),
    supabase.from("student_guardians").select("*, guardians(*)").eq("student_id", studentId).limit(10),
    supabase.from("safety_incidents").select("*").eq("student_id", studentId).order("created_at",{ascending:false}).limit(8),
  ]);

  if (!student && !studentError) notFound();

  return (
    <main className="nx-data-page nx-student-profile">
      <header className="nx-data-header nx-profile-header">
        <div>
          <Link href="/students">← Data Siswa</Link>
          <span className="eyebrow">STUDENT 360 · PROFIL TERHUBUNG</span>
          <h1>{text(student?.full_name)}</h1>
          <p>{student?.student_no ? `Nomor siswa · ${student.student_no}` : "Profil siswa"}</p>
        </div>
        <div className="nx-header-actions"><PrintButton /><Link className="nx-action-button" href="/onboarding/student">Daftarkan siswa</Link></div>
      </header>

      {studentError ? <div className="nx-data-error"><b>Profil siswa tidak dapat dimuat.</b><span>{studentError.message}</span></div> : student ? (
        <>
          <section className="nx-profile-identity">
            <div className="nx-profile-avatar">{student.full_name.split(/\s+/).slice(0,2).map(x=>x[0]).join("").toUpperCase()}</div>
            <div><span className="eyebrow">DATA UTAMA</span><h2>{student.full_name}</h2><p>{text(student.student_no)} · {text(student.classes)}</p></div>
            <div className="nx-profile-status"><strong>{text(student.status)}</strong><span>Status siswa</span></div>
          </section>

          <section className="nx-profile-stats">
            <div><strong>{student.attendance_count ?? 0}</strong><span>Catatan kehadiran</span></div>
            <div><strong>{student.learning_evidence_count ?? 0}</strong><span>Bukti belajar</span></div>
            <div><strong>{guardians?.length ?? 0}</strong><span>Wali terhubung</span></div>
            <div><strong>{incidents?.length ?? 0}</strong><span>Catatan keselamatan</span></div>
          </section>

          <div className="nx-student-grid">
            <section className="nx-command-card"><span className="eyebrow">IDENTITAS</span><h2>Informasi siswa</h2><div className="nx-detail-list">
              <div><span>Nomor siswa</span><b>{text(student.student_no)}</b></div><div><span>Nama lengkap</span><b>{text(student.full_name)}</b></div><div><span>Status</span><b>{text(student.status)}</b></div><div><span>Kelas aktif</span><b>{text(student.classes)}</b></div>
            </div></section>

            <section className="nx-command-card"><span className="eyebrow">KELUARGA</span><h2>Wali terhubung</h2><div className="nx-linked-list">
              {(guardians ?? []).map((g:any,i:number)=><div key={String(g.id ?? i)}><b>{g.guardians?.full_name ?? g.guardians?.name ?? "Wali siswa"}</b><span>{g.relationship ?? "Wali"}</span></div>)}{!guardians?.length&&<p>Belum ada wali yang terhubung.</p>}
            </div></section>

            <section className="nx-command-card"><span className="eyebrow">PEMBELAJARAN</span><h2>Bukti belajar terbaru</h2><div className="nx-linked-list">
              {(evidence ?? []).map((e:any,i:number)=><div key={String(e.id ?? i)}><b>{e.title ?? e.evidence_type ?? "Bukti belajar"}</b><span>{e.created_at ? new Date(e.created_at).toLocaleDateString("id-ID") : "—"}</span></div>)}{!evidence?.length&&<p>Belum ada bukti belajar.</p>}
            </div></section>

            <section className="nx-command-card"><span className="eyebrow">KEHADIRAN</span><h2>Aktivitas terbaru</h2><div className="nx-linked-list">
              {(attendance ?? []).map((a:any,i:number)=><div key={String(a.id ?? i)}><b>{a.attendance_date ?? a.date ?? "Tanggal"}</b><span>{a.status ?? a.attendance_status ?? "—"}</span></div>)}{!attendance?.length&&<p>Belum ada catatan kehadiran.</p>}
            </div></section>

            <section className="nx-command-card"><span className="eyebrow">KESELAMATAN</span><h2>Catatan terkait</h2><div className="nx-linked-list">
              {(incidents ?? []).map((x:any,i:number)=><div key={String(x.id ?? i)}><b>{x.title ?? x.incident_type ?? "Catatan keselamatan"}</b><span>{x.status ?? "Tercatat"}</span></div>)}{!incidents?.length&&<p>Tidak ada catatan keselamatan yang terkait.</p>}
            </div></section>
          </div>
        </>
      ) : null}
    </main>
  );
}
