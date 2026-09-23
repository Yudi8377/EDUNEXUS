"use client";

import { createClient } from "@/lib/supabase/client";

export default function LogoutButton() {
  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.assign("/auth/login");
  }

  return <button type="button" className="secondary" onClick={logout}>Keluar</button>;
}
