import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PrintButton from "@/components/print-button";
import DeleteRecordButton from "@/components/delete-record-button";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ code: string; entityId: string }>;
  searchParams: Promise<{ mode?: string; edit?: string; error?: string }>;
};

const IMMUTABLE_FIELDS = new Set(["id", "created_at", "updated_at"]);

function labelFor(name: string) {
  return name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function displayValue(value: unknown) {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function inputType(value: unknown) {
  if (typeof value === "boolean") return "checkbox";
  if (typeof value === "number") return "number";
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) return "date";
  return "text";
}

async function mutateRecord(formData: FormData) {
  "use server";

  const code = String(formData.get("_code") || "");
  const entityId = String(formData.get("_entityId") || "");
  const action = String(formData.get("_action") || "");
  const recordId = String(formData.get("_recordId") || "");
  const supabase = await createClient();

  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return;

  const { data: app } = await supabase.from("application_registry").select("id").eq("code", code).maybeSingle();
  const { data: entity } = await supabase
    .from("application_entities")
    .select("id,application_id,table_name,implementation_status")
    .eq("id", entityId)
    .maybeSingle();

  if (!app || !entity || entity.application_id !== app.id || entity.implementation_status !== "existing") return;

  const table = entity.table_name as any;
  const { data: sample } = await supabase.from(table).select("*").limit(1).maybeSingle();
  const sampleRecord = (sample ?? {}) as Record<string, unknown>;
  const columns = Object.keys(sampleRecord);

  if (!columns.length) return;

  const payload: Record<string, unknown> = {};
  const dataPayload: Record<string, unknown> = {};
  for (const column of columns) {
    if (IMMUTABLE_FIELDS.has(column) || column === "tenant_id") continue;
    const raw = formData.get(column);
    if (column === "data") continue;
    if (raw === null) {
      if (typeof sampleRecord[column] === "boolean") payload[column] = false;
      continue;
    }
    if (typeof raw === "string" && raw === "") {
      payload[column] = null;
      continue;
    }

    const reference = sampleRecord[column];
    if (typeof reference === "boolean") {
      payload[column] = raw === "true" || raw === "on";
    } else if (typeof reference === "number") {
      const numberValue = Number(raw);
      if (!Number.isNaN(numberValue)) payload[column] = numberValue;
    } else if (reference !== null && typeof reference === "object") {
      try { payload[column] = JSON.parse(String(raw)); } catch { payload[column] = String(raw); }
    } else {
      payload[column] = String(raw);
    }
  }

  for (const [key, value] of Array.from(formData.entries())) {
    if (!key.startsWith("data__")) continue;
    const field = key.slice(6);
    dataPayload[field] = String(value);
  }
  if (Object.keys(dataPayload).length) payload.data = dataPayload;

  if (action === "insert") {
    if (columns.includes("tenant_id")) {
      const { data: membership } = await supabase
        .from("tenant_memberships")
        .select("tenant_id")
        .eq("user_id", auth.user.id)
        .eq("status", "active")
        .maybeSingle();
      if (membership?.tenant_id) payload.tenant_id = membership.tenant_id;
    }
    const { error } = await supabase.from(table).insert(payload);
    if (error) redirect(`/applications/${code}/data/${entityId}?error=${encodeURIComponent(error.message)}`);
  }

  if (action === "update" && recordId) {
    const { error } = await supabase.from(table).update(payload).eq("id", recordId);
    if (error) redirect(`/applications/${code}/data/${entityId}?error=${encodeURIComponent(error.message)}`);
  }

  if (action === "delete" && recordId) {
    const { error } = await supabase.from(table).delete().eq("id", recordId);
    if (error) redirect(`/applications/${code}/data/${entityId}?error=${encodeURIComponent(error.message)}`);
  }

  redirect(`/applications/${code}/data/${entityId}`);
}

export default async function ApplicationEntityPage({ params, searchParams }: Props) {
  const { code, entityId } = await params;
  const { mode, edit, error: actionError } = await searchParams;
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return null;

  const [{ data: app }, { data: entity }] = await Promise.all([
    supabase.from("application_registry").select("id,code,name,short_name").eq("code", code).maybeSingle(),
    supabase.from("application_entities").select("id,application_id,entity_name,table_name,purpose,implementation_status,is_primary").eq("id", entityId).maybeSingle()
  ]);

  if (!app || !entity || entity.application_id !== app.id) notFound();

  if (entity.implementation_status !== "existing") {
    return (
      <main className="nx-data-page">
        <header className="nx-data-header">
          <div><Link href={`/applications/${code}`}>← {app.name}</Link><span className="eyebrow">MODUL BELUM AKTIF</span><h1>{entity.entity_name}</h1></div>
          <PrintButton />
        </header>
        <section className="nx-data-empty">
          <h2>Modul belum tersedia</h2>
          <p>Modul ini belum memiliki database operasional. EDUNEXUS tidak menampilkan data fiktif dan tidak membuka tombol transaksi sebelum schema, API, RLS, workflow, dan pengujian tersedia.</p>
        </section>
      </main>
    );
  }

  const { data: rows, error } = await supabase.from(entity.table_name as any).select("*").limit(100);
  const records = (rows ?? []) as Record<string, unknown>[];
  const columns = records.length && records[0] ? Object.keys(records[0]).slice(0, 12) : [];
  const [{ data: students }, { data: employees }, { data: guardians }, { data: teachers }] = await Promise.all([
    supabase.from("students").select("id,student_no,full_name").order("full_name").limit(200),
    supabase.from("employees").select("id,employee_no,full_name").order("full_name").limit(200),
    supabase.from("guardians").select("id,full_name").order("full_name").limit(200),
    supabase.from("teachers").select("id,employee_no,full_name").order("full_name").limit(200)
  ]);
  const relationOptions: Record<string, Array<{ value: string; label: string }>> = {
    student_id: (students ?? []).map((x) => ({ value: x.id, label: x.full_name + " (" + x.student_no + ")" })),
    employee_id: (employees ?? []).map((x) => ({ value: x.id, label: x.full_name + " (" + x.employee_no + ")" })),
    guardian_id: (guardians ?? []).map((x) => ({ value: x.id, label: x.full_name })),
    teacher_id: (teachers ?? []).map((x) => ({ value: x.id, label: x.full_name + " (" + x.employee_no + ")" }))
  };
  const editRecord = edit ? records.find((row) => String(row.id) === edit) : undefined;
  const sampleData = (records[0]?.data && typeof records[0].data === "object" && !Array.isArray(records[0].data) ? records[0].data : {}) as Record<string, unknown>;
  const editData = (editRecord?.data && typeof editRecord.data === "object" && !Array.isArray(editRecord.data) ? editRecord.data : sampleData) as Record<string, unknown>;
  const dataFields = Array.from(new Set([...Object.keys(sampleData), ...Object.keys(editData)]));
  const formColumns = columns.filter((column) => !IMMUTABLE_FIELDS.has(column) && column !== "tenant_id" && column !== "data");

  return (
    <main className="nx-data-page">
      <header className="nx-data-header">
        <div>
          <Link href={`/applications/${code}`}>← Kembali ke {app.name}</Link>
          <span className="eyebrow">DATA</span>
          <h1>{entity.entity_name}</h1>
          <p>{entity.purpose}</p>
        </div>
        <div className="nx-header-actions">
          <Link className="nx-top-action nx-action-primary" href={`/applications/${code}/data/${entityId}?mode=insert`}>+ Tambah</Link>
          <PrintButton />
        </div>
      </header>

      <nav className="nx-section-nav" aria-label="Navigasi modul">
        <Link href={`/applications/${code}/data/${entityId}`} className="active">Data</Link>
        <Link href={`/applications/${code}/workflow`}>Workflow</Link>
        <Link href={`/applications/${code}/documents`}>Documents</Link>
        <Link href={`/applications/${code}/access`}>Access</Link>
      </nav>

      {actionError ? <div className="nx-data-error"><b>Perubahan tidak berhasil.</b><span>{actionError}</span></div> : error ? (
        <div className="nx-data-error"><b>Data tidak dapat dimuat.</b><span>{error.message}</span></div>
      ) : mode === "insert" ? (
        <section className="nx-editor">
          <div className="nx-editor-head"><div><span className="eyebrow">INSERT</span><h2>Tambah {entity.entity_name}</h2><p>Isi data baru. Hak akses dan RLS database tetap menjadi pengaman transaksi.</p></div><Link href={`/applications/${code}/data/${entityId}`}>Batal</Link></div>
          {formColumns.length ? (
            <form action={mutateRecord} className="nx-record-form">
              <input type="hidden" name="_action" value="insert" /><input type="hidden" name="_code" value={code} /><input type="hidden" name="_entityId" value={entityId} />
              {formColumns.map((column) => <Field key={column} name={column} value={undefined} reference={records[0]?.[column]} options={optionsFor(column, relationOptions)} />)}
              {dataFields.length ? <fieldset className="nx-form-section"><legend>Detail data</legend>{dataFields.map((field) => <Field key={field} name={"data__"+field} value={undefined} reference={sampleData[field]} />)}</fieldset> : null}
              <button className="nx-save-button" type="submit">Simpan data</button>
            </form>
          ) : <div className="nx-data-empty"><h2>Form belum dapat dibuat</h2><p>Tabel belum memiliki contoh record untuk membaca bentuk kolom. Schema form perlu dibuat khusus untuk modul ini.</p></div>}
        </section>
      ) : editRecord ? (
        <section className="nx-editor">
          <div className="nx-editor-head"><div><span className="eyebrow">UPDATE</span><h2>Ubah {entity.entity_name}</h2><p>Perubahan diterapkan pada record yang dipilih dan tetap tunduk pada RLS.</p></div><Link href={`/applications/${code}/data/${entityId}`}>Batal</Link></div>
          <form action={mutateRecord} className="nx-record-form">
            <input type="hidden" name="_action" value="update" /><input type="hidden" name="_code" value={code} /><input type="hidden" name="_entityId" value={entityId} /><input type="hidden" name="_recordId" value={String(editRecord.id)} />
            {formColumns.map((column) => <Field key={column} name={column} value={editRecord[column]} reference={editRecord[column]} options={optionsFor(column)} />)}
            {dataFields.length ? <fieldset className="nx-form-section"><legend>Detail data</legend>{dataFields.map((field) => <Field key={field} name={"data__"+field} value={editData[field]} reference={editData[field]} />)}</fieldset> : null}
            <button className="nx-save-button" type="submit">Simpan perubahan</button>
          </form>
        </section>
      ) : (
        <>
          <div className="nx-data-toolbar">
            <div><strong>{records.length}</strong><span>record ditampilkan · maksimum 100</span></div>
            <span>Gunakan <b>Ubah</b> untuk update atau <b>Hapus</b> untuk menghapus satu record.</span>
          </div>
          {records.length ? (
            <div className="nx-data-table-wrap">
              <table className="nx-data-table">
                <thead><tr>{columns.map(c => <th key={c}>{labelFor(c)}</th>)}<th>Aksi</th></tr></thead>
                <tbody>
                  {records.map((row, index) => (
                    <tr key={String(row.id ?? index)}>
                      {columns.map(c => <td key={c}>{displayValue(row[c])}</td>)}
                      <td className="nx-row-actions">
                        {row.id ? <Link href={`/applications/${code}/data/${entityId}?edit=${row.id}`} className="nx-row-edit">Ubah</Link> : null}
                        {row.id ? (
                          <form action={mutateRecord}>
                            <input type="hidden" name="_action" value="delete" /><input type="hidden" name="_code" value={code} /><input type="hidden" name="_entityId" value={entityId} /><input type="hidden" name="_recordId" value={String(row.id)} />
                            <DeleteRecordButton />
                          </form>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="nx-data-empty"><span className="eyebrow">DATA KOSONG</span><h2>Belum ada record</h2><p>Gunakan tombol <b>+ Tambah</b> jika modul ini menyediakan form transaksi.</p></div>
          )}
        </>
      )}
    </main>
  );
}

function optionsFor(column: string, relationOptions: Record<string, Array<{ value: string; label: string }>>) {
  return relationOptions[column];
}

function Field({ name, value, reference, options }: { name: string; value: unknown; reference: unknown; options?: Array<{ value: string; label: string }> }) {
  const type = inputType(reference);
  if (type === "checkbox") {
    return <label className="nx-field nx-checkbox"><span>{labelFor(name)}</span><input name={name} type="checkbox" value="true" defaultChecked={Boolean(value)} /></label>;
  }
  const objectValue = reference !== null && typeof reference === "object";
  return (
    <label className="nx-field">
      <span>{labelFor(name)}</span>
      {options?.length ? <select name={name} defaultValue={value === undefined || value === null ? "" : String(value)}><option value="">Pilih {labelFor(name)}</option>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select> : objectValue ? <textarea name={name} defaultValue={value === undefined ? "" : JSON.stringify(value, null, 2)} /> : <input name={name} type={type} defaultValue={value === undefined || value === null ? "" : String(value)} />}
    </label>
  );
}
