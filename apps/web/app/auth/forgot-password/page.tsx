"use client";
import Link from "next/link";
import { FormEvent,useState } from "react";
import { createClient } from "@/lib/supabase/client";
export default function ForgotPasswordPage(){
 const [email,setEmail]=useState(""),[status,setStatus]=useState(""),[busy,setBusy]=useState(false);
 async function submit(e:FormEvent){e.preventDefault();setBusy(true);setStatus("");const s=createClient();const {error}=await s.auth.resetPasswordForEmail(email,{redirectTo:`${window.location.origin}/auth/reset-password`});setStatus(error?error.message:"Jika email terdaftar, instruksi pemulihan kata sandi akan dikirim.");setBusy(false)}
 return <main className="auth-shell"><section className="auth-card"><Link href="/auth/login" className="secondary">← Kembali ke Masuk</Link><div className="eyebrow">PEMULIHAN AKUN</div><h1>Lupa kata sandi?</h1><p>Masukkan email akun Anda. Kami akan mengirimkan instruksi pemulihan melalui Supabase Auth.</p><form className="auth-form" onSubmit={submit}><label>Email<input type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} required /></label>{status&&<div className="auth-error" role="status">{status}</div>}<button disabled={busy}>{busy?"Mengirim...":"Kirim instruksi"}</button></form></section></main>;
}