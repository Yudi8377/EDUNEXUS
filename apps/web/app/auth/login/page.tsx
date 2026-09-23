"use client";

import { FormEvent, Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setMessage(error.message);
      setBusy(false);
      return;
    }

    window.location.assign(next);
  }

  return (
    <form onSubmit={submit} className="auth-form">
      <label>
        Email
        <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </label>
      <label>
        Password
        <input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </label>
      {message ? <div className="auth-error" role="alert">{message}</div> : null}
      <button type="submit" disabled={busy}>{busy ? "Verifying…" : "Sign in"}</button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <main className="auth-shell">
      <section className="auth-card">
        <div className="eyebrow">EDUNEXUS SECURE ACCESS</div>
        <h1>Sign in to your education operating layer.</h1>
        <p>Identity is verified by Supabase Auth. Tenant and role authorization remains enforced by EDUNEXUS RLS and policy controls.</p>

        <Suspense fallback={<div className="auth-form">Loading secure sign-in…</div>}>
          <LoginForm />
        </Suspense>

        <small>Production note: publishable credentials only. Never place a service-role key in browser code.</small>
      </section>
    </main>
  );
}
