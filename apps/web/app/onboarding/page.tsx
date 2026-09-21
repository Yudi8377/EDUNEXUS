"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function OnboardingPage() {
  const [form,setForm]=useState({tenantCode:"",tenantName:"",tenantType:"school",schoolCode:"",schoolName:"",address:"",phone:""});
  const [status,setStatus]=useState("");
  const [busy,setBusy]=useState(false);

  function set(key:string,value:string){setForm(v=>({...v,[key]:value}));}

  async function submit(e:FormEvent){
    e.preventDefault(); setBusy(true); setStatus("");
    const supabase=createClient();
    const {data,error}=await supabase.rpc("create_tenant_with_school",{
      p_tenant_code:form.tenantCode,p_tenant_name:form.tenantName,p_tenant_type:form.tenantType,
      p_school_code:form.schoolCode,p_school_name:form.schoolName,p_school_address:form.address||null,p_school_phone:form.phone||null
    });
    if(error){setStatus(error.message);setBusy(false);return;}
    setStatus(`Onboarding complete. Tenant: ${data.tenant_id} · School: ${data.school_id}`);
    setBusy(false);
  }

  return <main className="simple-page">
    <a href="/">← Command Center</a><p className="eyebrow">GOVERNED ONBOARDING</p>
    <h1>Register a real education tenant.</h1>
    <p className="lede">This operation is restricted to PLATFORM_ADMIN. The transaction creates the tenant, first school, tenant-admin membership and audit record together.</p>
    <form className="onboarding-form" onSubmit={submit}>
      <section><h2>Organization</h2><label>Tenant code<input value={form.tenantCode} onChange={e=>set("tenantCode",e.target.value)} required /></label><label>Tenant name<input value={form.tenantName} onChange={e=>set("tenantName",e.target.value)} required /></label><label>Tenant type<select value={form.tenantType} onChange={e=>set("tenantType",e.target.value)}><option value="school">School</option><option value="district">District</option><option value="education_group">Education Group</option></select></label></section>
      <section><h2>First school</h2><label>School code<input value={form.schoolCode} onChange={e=>set("schoolCode",e.target.value)} required /></label><label>School name<input value={form.schoolName} onChange={e=>set("schoolName",e.target.value)} required /></label><label>Address<textarea value={form.address} onChange={e=>set("address",e.target.value)} /></label><label>Phone<input value={form.phone} onChange={e=>set("phone",e.target.value)} /></label></section>
      {status && <div className="auth-error" role="status">{status}</div>}
      <button type="submit" disabled={busy}>{busy?"Creating governed records…":"Create tenant + school"}</button>
    </form>
  </main>;
}
