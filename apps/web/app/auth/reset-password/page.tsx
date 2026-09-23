"use client";
import Link from "next/link";
import { FormEvent,useState } from "react";
import { createClient } from "@/lib/supabase/client";
export default function ResetPasswordPage(){
 const [password,setPassword]=useState(""),[confirm,setConfirm]=useState(""),[status,setStatus]=useState(""),[busy,setBusy]=useState(false);
 async function submit(e:FormEvent){e.preventDefault();if(password.length<8){setStatus("Kata sandi minimal 8 karakter.");return}if(password!==confirm){setStatus("Konfirmasi kata sandi tidak sama.");return}setBusy(true);const {error}=await createClient().auth.updateUser({password});setStatus(error?error.message:"Kata sandi berhasil diperbarui. Silakan masuk kembali.");setBusy(false)}
 return <main className="auth-shell"><section className="auth-card"><Link href="/auth/login" className="secondary">← Kembali ke Masuk</Link><div className="eyebrow">PEMULIHAN AKUN</div><h1>Buat kata sandi baru.</h1><form className="auth-form" onSubmit={submit}><label>Kata sandi baru<input type="password" autoComplete="new-password" value={password} onChange={e=>setPassword(e.target.value)} required /></label><label>Ulangi kata sandi<input type="password" autoComplete="new-password" value={confirm} onChange={e=>setConfirm(e.target.value)} required /></label>{status&&<div className="auth-error" role="status">{status}</div>}<button disabled={busy}>{busy?"Menyimpan...":"Simpan kata sandi"}</button></form></section></main>;
}