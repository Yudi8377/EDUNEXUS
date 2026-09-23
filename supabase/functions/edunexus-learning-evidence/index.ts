import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
Deno.serve(async(req)=>{
 if(req.method!=="POST") return new Response(JSON.stringify({error:"METHOD_NOT_ALLOWED"}),{status:405,headers:{"content-type":"application/json"}});
 const url=Deno.env.get("SUPABASE_URL")!, anon=Deno.env.get("SUPABASE_ANON_KEY")!, service=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
 const authorization=req.headers.get("Authorization"); if(!authorization) return new Response(JSON.stringify({error:"AUTH_REQUIRED"}),{status:401,headers:{"content-type":"application/json"}});
 const userClient=createClient(url,anon,{global:{headers:{Authorization:authorization}}}); const {data:{user}}=await userClient.auth.getUser();
 if(!user) return new Response(JSON.stringify({error:"AUTH_REQUIRED"}),{status:401,headers:{"content-type":"application/json"}});
 const b=await req.json(); const required=["tenant_id","student_id","teacher_id","title","evidence_type"]; if(required.some(k=>!b?.[k])) return new Response(JSON.stringify({error:"INVALID_INPUT"}),{status:400,headers:{"content-type":"application/json"}});
 const admin=createClient(url,service);
 const {data,error}=await admin.rpc("create_learning_evidence",{p_tenant_id:b.tenant_id,p_student_id:b.student_id,p_teacher_id:b.teacher_id,p_title:b.title,p_evidence_type:b.evidence_type,p_score:b.score??null,p_max_score:b.max_score??null,p_evidence_uri:b.evidence_uri??null,p_provenance:b.provenance??{source:"edunexus-web",actor_id:user.id},p_occurred_at:b.occurred_at??new Date().toISOString()});
 if(error) return new Response(JSON.stringify({error:error.message}),{status:400,headers:{"content-type":"application/json"}});
 return new Response(JSON.stringify({evidence_id:data}),{headers:{"content-type":"application/json"}});
});