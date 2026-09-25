import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import EnterpriseDashboard from "@/components/enterprise-dashboard";

export const dynamic = "force-dynamic";

export default async function ApplicationsPage() {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return null;

  const { data: apps, error } = await supabase
    .from("application_registry")
    .select("id,code,sequence_no,name,short_name,description,lifecycle_status,route,audience,capabilities")
    .order("sequence_no");

  if (error) {
    return <main className="workspace-error"><Link href="/">← Masuk</Link><h1>Workspace</h1><p>{error.message}</p></main>;
  }

  return <EnterpriseDashboard apps={apps ?? []} />;
}
