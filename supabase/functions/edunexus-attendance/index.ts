import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
Deno.serve(async (req:Request)=>{
 if(req.method!=="POST") return new Response(JSON.stringify({error:"METHOD_NOT_ALLOWED"}),{status:405,headers:{"content-type":"application/json"}});
 const url=Deno.env.get("SUPABASE_URL")!, key=Deno.env.get("SUPABASE_ANON_KEY")!, admin=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
 const auth=req.headers.get("Authorization"); if(!auth) return new Response(JSON.stringify({error:"AUTH_REQUIRED"}),{status:401,headers:{"content-type":"application/json"}});
 const userClient=createClient(url,key,{global:{headers:{Authorization:auth}}}); const {data:{user}}=await userClient.auth.getUser();
 if(!user) return new Response(JSON.stringify({error:"AUTH_REQUIRED"}),{status:401,headers:{"content-type":"application/json"}});
 const body=await req.json(); const required=["tenant_id","student_id","class_id","attendance_date","status","source"]; if(required.some(k=>!body?.[k])) return new Response(JSON.stringify({error:"INVALID_INPUT"}),{status:400,headers:{"content-type":"application/json"}});
 const adminClient=createClient(url,admin);
 const {data,error}=await adminClient.rpc("record_attendance",{p_tenant_id:body.tenant_id,p_student_id:body.student_id,p_class_id:body.class_id,p_attendance_date:body.attendance_date,p_status:body.status,p_recorded_by:user.id,p_source:body.source,p_note:body.note??null});
 if(error) return new Response(JSON.stringify({error:error.message}),{status:400,headers:{"content-type":"application/json"}});
 return new Response(JSON.stringify({attendance_id:data}),{headers:{"content-type":"application/json"}});
});