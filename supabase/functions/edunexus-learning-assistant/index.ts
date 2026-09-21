import { createClient } from "@supabase/supabase-js";

type Body={tenant_id:string;student_id:string;teacher_request:string;class_id?:string};

const cors={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type","Access-Control-Allow-Methods":"POST,OPTIONS"};

Deno.serve(async(req)=>{
  if(req.method==="OPTIONS") return new Response("ok",{headers:cors});
  if(req.method!=="POST") return Response.json({error:"METHOD_NOT_ALLOWED"},{status:405,headers:cors});

  const auth=req.headers.get("Authorization");
  if(!auth?.startsWith("Bearer ")) return Response.json({error:"UNAUTHENTICATED"},{status:401,headers:cors});

  const url=Deno.env.get("SUPABASE_URL")!;
  const anon=Deno.env.get("SUPABASE_ANON_KEY")!;
  const service=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const userDb=createClient(url,anon,{global:{headers:{Authorization:auth}}});
  const admin=createClient(url,service);
  const {data:{user},error:userError}=await userDb.auth.getUser();
  if(userError||!user) return Response.json({error:"UNAUTHENTICATED"},{status:401,headers:cors});

  const b=await req.json() as Body;
  if(!b.tenant_id||!b.student_id||!b.teacher_request?.trim())
    return Response.json({error:"tenant_id, student_id and teacher_request are required"},{status:400,headers:cors});

  const {data:mem}=await admin.from("tenant_memberships").select("role_code").eq("tenant_id",b.tenant_id).eq("user_id",user.id).eq("status","active").maybeSingle();
  if(!mem||!["TEACHER","SCHOOL_ADMIN","TENANT_ADMIN","COUNSELOR"].includes(mem.role_code))
    return Response.json({error:"TEACHER_ACCESS_DENIED"},{status:403,headers:cors});

  const {data:student}=await admin.from("students").select("id,tenant_id,school_id,student_no,full_name,status").eq("id",b.student_id).eq("tenant_id",b.tenant_id).maybeSingle();
  if(!student) return Response.json({error:"STUDENT_NOT_FOUND"},{status:404,headers:cors});

  const [{data:learning},{data:attendance}]=await Promise.all([
    admin.from("learning_evidence").select("id,title,evidence_type,score,max_score,provenance,occurred_at,created_at,teacher_id").eq("tenant_id",b.tenant_id).eq("student_id",b.student_id).order("created_at",{ascending:false}).limit(20),
    admin.from("attendance_records").select("attendance_date,status,source,note").eq("tenant_id",b.tenant_id).eq("student_id",b.student_id).order("attendance_date",{ascending:false}).limit(30)
  ]);

  const context={student,learning_evidence:learning??[],attendance:attendance??[],request:b.teacher_request,class_id:b.class_id??null,provenance:{source:"edunexus-learning-assistant",actor_user_id:user.id,generated_at:new Date().toISOString()}};

  const {data:agent}=await admin.from("ai_agents").select("id,code,risk_level").eq("code","KNOWLEDGE_AGENT").eq("enabled",true).maybeSingle();
  if(!agent) return Response.json({error:"KNOWLEDGE_AGENT_NOT_AVAILABLE"},{status:409,headers:cors});

  const {data:policy}=await admin.from("ai_action_policies").select("id,risk_level,autonomy_mode,rules").eq("action_code","learning.assist").eq("enabled",true).or(`tenant_id.eq.${b.tenant_id},tenant_id.is.null`).order("policy_version",{ascending:false}).limit(1).maybeSingle();
  if(!policy) return Response.json({error:"LEARNING_ASSIST_POLICY_NOT_CONFIGURED"},{status:409,headers:cors});

  const {data:task,error:taskError}=await admin.from("ai_agent_tasks").insert({
    tenant_id:b.tenant_id,agent_id:agent.id,task_type:"learning.assist",priority:40,status:"planning",
    risk_level:"L3",input_context:context,plan:{action_code:"learning.assist",policy_id:policy.id,mode:policy.autonomy_mode},
    result:{},verification:{},requested_by:user.id
  }).select("id,status,risk_level,created_at").single();
  if(taskError) return Response.json({error:"TASK_CREATE_FAILED",detail:taskError.message},{status:500,headers:cors});

  const {data:step,error:stepError}=await admin.from("ai_execution_steps").insert({
    task_id:task.id,step_no:1,action_code:"learning.assist",risk_level:"L3",status:"planned",
    input_context:context,output_context:{},verification:{provenance_required:true,no_grade_mutation:true}
  }).select("id,step_no,status").single();
  if(stepError) return Response.json({error:"STEP_CREATE_FAILED",detail:stepError.message},{status:500,headers:cors});

  await admin.from("ai_orchestration_events").insert({
    task_id:task.id,tenant_id:b.tenant_id,event_type:"planned",actor_type:"human",actor_id:user.id,
    payload:{action_code:"learning.assist",student_id:b.student_id,step_id:step.id,policy_id:policy.id}
  });
  await admin.from("audit_events").insert({
    tenant_id:b.tenant_id,actor_user_id:user.id,action_code:"learning.assist.requested",entity_type:"ai_agent_task",entity_id:task.id,
    severity:"info",source:"edunexus-learning-assistant",payload:{student_id:b.student_id,teacher_request:b.teacher_request,policy_id:policy.id}
  });

  const configured=Boolean(Deno.env.get("AI_GATEWAY_API_KEY"));
  return Response.json({
    ok:true,task,step,
    reasoning_status:configured?"READY_FOR_GATEWAY":"AI_GATEWAY_NOT_CONFIGURED",
    safety:{no_grade_mutation:true,no_direct_student_action:true,provenance_required:true,human_review_for_high_impact:true},
    context_summary:{learning_evidence_count:(learning??[]).length,attendance_count:(attendance??[]).length}
  },{status:configured?200:503,headers:{...cors,"Content-Type":"application/json"}});
});