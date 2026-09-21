import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type TeacherRow = {
  teacher_id: string;
  employee_no: string;
  teacher_name: string;
  teacher_status: string;
  active_assignment_count: number;
  active_class_count: number;
  visible_active_class_count: number;
  assigned_student_count: number;
  attendance_today_records: number;
  learning_evidence_30d: number;
  last_learning_evidence_at: string | null;
};

type ClassRow = {
  teacher_id: string;
  class_id: string;
  class_code: string;
  class_name: string;
  class_status: string;
  assignment_role: string;
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
          "teacher_id,employee_no,teacher_name,teacher_status,active_assignment_count,active_class_count,visible_active_class_count,assigned_student_count,attendance_today_records,learning_evidence_30d,last_learning_evidence_at",
        )
        .limit(20),
      supabase
        .from("v_teacher_class_command")
        .select(
          "teacher_id,class_id,class_code,class_name,class_status,assignment_role,subject_code,student_count,attendance_today,learning_evidence_30d",
        )
        .limit(100),
    ]);

  if (teacherError || classError) {
    return (
      <main className="simple-page">
        <a href="/">← Command Center</a>
        <p className="eyebrow">TEACHER OPERATIONS</p>
        <h1>Teacher Command Center</h1>
        <div className="empty-card">
          <strong>Teacher operational data unavailable</strong>
          <span>{teacherError?.message ?? classError?.message}</span>
        </div>
      </main>
    );
  }

  const teacherRows = (teachers ?? []) as TeacherRow[];
  const classRows = (classes ?? []) as ClassRow[];
  const teacher = teacherRows[0];

  if (!teacher) {
    return (
      <main className="simple-page">
        <a href="/">← Command Center</a>
        <p className="eyebrow">TEACHER OPERATIONS • LIVE</p>
        <h1>Teacher Command Center</h1>
        <p className="lede">
          A governed operational surface for classes, attendance, learning evidence and AI-assisted teaching support.
        </p>
        <div className="empty-card">
          <strong>No teacher account is provisioned yet.</strong>
          <span>
            The live database currently contains no teacher records. Provision a teacher through the governed onboarding
            operation; EDUNEXUS does not create synthetic personnel data.
          </span>
        </div>
      </main>
    );
  }

  const ownClasses = classRows.filter((row) => row.teacher_id === teacher.teacher_id);

  return (
    <main className="simple-page teacher-page">
      <a href="/">← Command Center</a>
      <p className="eyebrow">TEACHER OPERATIONS • LIVE</p>
      <div className="teacher-heading">
        <div>
          <h1>Good teaching starts with clear context.</h1>
          <p className="lede">
            {teacher.teacher_name} · {teacher.employee_no}. One governed view across assigned classes, attendance and
            learning evidence.
          </p>
        </div>
        <span className="tenant">Teacher {teacher.teacher_status}</span>
      </div>

      <section className="teacher-metrics">
        <article className="metric"><span>Assigned students</span><strong>{teacher.assigned_student_count}</strong><small>Active class memberships</small></article>
        <article className="metric"><span>Classes</span><strong>{teacher.visible_active_class_count}</strong><small>Visible active assignments</small></article>
        <article className="metric"><span>Attendance today</span><strong>{teacher.attendance_today_records}</strong><small>Recorded attendance rows</small></article>
        <article className="metric"><span>Learning evidence</span><strong>{teacher.learning_evidence_30d}</strong><small>Last 30 days</small></article>
      </section>

      <div className="section-head">
        <div><p className="eyebrow">MY CLASSES</p><h3>Operational class view</h3></div>
        <span>{ownClasses.length} assignment(s)</span>
      </div>

      {ownClasses.length ? (
        <section className="teacher-class-grid">
          {ownClasses.map((row) => (
            <article className="teacher-class-card" key={row.class_id}>
              <div className="teacher-class-top">
                <span>{row.class_code}</span>
                <small>{row.assignment_role.replaceAll("_", " ")}</small>
              </div>
              <h4>{row.class_name}</h4>
              <p>{row.subject_code ? `Subject · ${row.subject_code}` : "Class assignment"}</p>
              <div className="teacher-class-stats">
                <span><b>{row.student_count}</b> students</span>
                <span><b>{row.attendance_today}</b> attendance</span>
                <span><b>{row.learning_evidence_30d}</b> evidence / 30d</span>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <div className="empty-card">
          <strong>No active class assignments</strong>
          <span>Teacher identity exists, but no active class assignment is visible under the current tenant policy.</span>
        </div>
      )}

      <section className="teacher-ai-card">
        <div>
          <p className="eyebrow">GOVERNED AI ASSISTANT</p>
          <h3>Use evidence. Keep authority human.</h3>
          <p>
            The learning assistant can prepare evidence-grounded instructional recommendations. It cannot mutate grades,
            directly act on students, or bypass high-impact review.
          </p>
        </div>
        <a className="primary" href="/learning">Open Learning Evidence →</a>
      </section>
    </main>
  );
}
