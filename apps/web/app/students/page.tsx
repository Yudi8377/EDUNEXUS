import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function StudentsPage() {
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
      <a href="/">← Command Center</a>
      <p className="eyebrow">STUDENT 360 • LIVE</p>
      <h1>Student context, in one place.</h1>
      <p className="lede">Tenant-scoped student context is read through the authenticated Supabase session and protected by database RLS.</p>

      {error ? (
        <div className="empty-card">
          <strong>Student data unavailable</strong>
          <span>{error.message}</span>
        </div>
      ) : students?.length ? (
        <div className="empty-card">
          <strong>{students.length} visible student record{students.length === 1 ? "" : "s"}</strong>
          <span>Showing the first 50 records visible to the current authenticated tenant context.</span>
          <div className="student-list">
            {students.map((student) => (
              <article key={student.student_id} className="student-row">
                <div>
                  <strong>{student.full_name}</strong>
                  <span>{student.status}</span>
                </div>
                <small>Attendance: {student.attendance_count ?? 0} · Evidence: {student.learning_evidence_count ?? 0}</small>
              </article>
            ))}
          </div>
        </div>
      ) : (
        <div className="empty-card">
          <strong>No student records visible</strong>
          <span>EDUNEXUS does not create synthetic pupil data. Create a real tenant, school and student through the governed onboarding flow.</span>
        </div>
      )}
    </main>
  );
}
