"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function OnboardingPage() {
  const [form,setForm]=useState({tenantCode:"",tenantName:"",tenantJenis:"school",schoolCode:"",schoolName:"",address:"",phone:""});
  const [status,setStatus]=useState("");
  const [busy,setBusy]=useState(false);

  function set(key:string,value:string){setForm(v=>({...v,[key]:value}));}

  async function submit(e:FormEvent){
    e.preventDefault(); setBusy(true); setStatus("");
    const supabase=createClient();
    const {data,error}=await supabase.rpc("create_tenant_with_school",{
      p_tenant_code:form.tenantCode,p_tenant_name:form.tenantName,p_tenant_type:form.tenantJenis,
      p_school_code:form.schoolCode,p_school_name:form.schoolName,p_school_address:form.address||null,p_school_phone:form.phone||null
    });
    if(error){setStatus(error.message);setBusy(false);return;}
    setStatus(`Pendaftaran selesai. Organisasi: ${data.tenant_id} · Sekolah: ${data.school_id}`);
    setBusy(false);
  }

  return <main className="simple-page">
    <a href="/">← Pusat Kendali</a><p className="eyebrow">PENDAFTARAN TERKENDALI</p>
    <h1>Daftarkan organisasi pendidikan nyata.</h1>
    <p className="lede">Operasi ini dibatasi untuk PLATFORM_ADMIN. Transaksi membuat organisasi, sekolah pertama, keanggotaan admin organisasi, dan catatan audit secara bersamaan.</p>
    <form className="onboarding-form" onSubmit={submit}>
      <section><h2>Organisasi</h2><label>Organisasi code<input value={form.tenantCode} onChange={e=>set("tenantCode",e.target.value)} required /></label><label>Organisasi name<input value={form.tenantName} onChange={e=>set("tenantName",e.target.value)} required /></label><label>Organisasi type<select value={form.tenantJenis} onChange={e=>set("tenantJenis",e.target.value)}><option value="school">School</option><option value="district">Distrik</option><option value="education_group">Grup pendidikan</option></select></label></section>
      <section><h2>Sekolah pertama</h2><label>Kode sekolah<input value={form.schoolCode} onChange={e=>set("schoolCode",e.target.value)} required /></label><label>Nama sekolah<input value={form.schoolName} onChange={e=>set("schoolName",e.target.value)} required /></label><label>Alamat<textarea value={form.address} onChange={e=>set("address",e.target.value)} /></label><label>Telepon<input value={form.phone} onChange={e=>set("phone",e.target.value)} /></label></section>
      {status && <div className="auth-error" role="status">{status}</div>}
      <button type="submit" disabled={busy}>{busy?"Membuat data terkendali…":"Buat organisasi + sekolah"}</button>
    </form>
  </main>;
}
