import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PrintButton from "@/components/print-button";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ code: string; entityId: string }> };

function displayValue(value: unknown) {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export default async function ApplicationEntityPage({ params }: Props) {
  const { code, entityId } = await params;
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
        <header className="nx-data-header"><Link href={`/applications/${code}`}>← {app.name}</Link><PrintButton /></header>
        <section className="nx-data-empty"><span className="eyebrow">MODULE NOT ACTIVE</span><h1>{entity.entity_name}</h1><p>Modul ini sudah memiliki kontrak aplikasi, tetapi tabel domain belum diaktifkan. EDUNEXUS tidak menampilkan data fiktif dan tidak menganggap modul ini selesai sebelum schema, API, RLS, workflow, dan pengujian tersedia.</p></section>
      </main>
    );
  }

  const { data: rows, error } = await supabase.from(entity.table_name as any).select("*").limit(100);
  const records = (rows ?? []) as Record<string, unknown>[];
  const columns = records.length && records[0] ? Object.keys(records[0]).slice(0, 12) : [];

  return (
    <main className="nx-data-page">
      <header className="nx-data-header">
        <div><Link href={`/applications/${code}`}>← {app.name}</Link><span className="eyebrow">DATA MODULE</span><h1>{entity.entity_name}</h1><p>{entity.purpose}</p></div>
        <div className="nx-header-actions"><PrintButton /></div>
      </header>
      <div className="nx-data-toolbar"><div><strong>{records.length}</strong><span>record ditampilkan · maksimum 100</span></div><code>{entity.table_name}</code></div>
      {error ? <div className="nx-data-error"><b>Data tidak dapat dimuat.</b><span>{error.message}</span></div> : records.length ? (
        <div className="nx-data-table-wrap"><table className="nx-data-table"><thead><tr>{columns.map(c => <th key={c}>{c}</th>)}</tr></thead><tbody>{records.map((row, index) => <tr key={String(row.id ?? index)}>{columns.map(c => <td key={c}>{displayValue(row[c])}</td>)}</tr>)}</tbody></table></div>
      ) : <div className="nx-data-empty"><span className="eyebrow">NO RECORDS</span><h2>Belum ada data</h2><p>Tabel domain tersedia dan dapat diakses, tetapi belum memiliki record untuk tenant/session ini.</p></div>}
    </main>
  );
}
