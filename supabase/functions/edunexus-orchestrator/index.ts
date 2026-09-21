import { withSupabase } from "@supabase/server";

type Body={tenant_id:string;agent_code:string;task_type:string;action_code?:string;risk_level?:string;priority?:number;input_context?:Record<string,unknown>;plan?:Array<{action_code:string;risk_level:string;input_context?:Record<string,unknown>}>};
const rank=(v:string)=>({L0:0,L1:1,L2:2,L3:3,L4:4,L5:5,L6:6}[v as keyof object]??99);

export default {fetch:withSupabase({auth:"user"},async(req,ctx)=>{
 if(req.method!=="POST")return Response.json({error:"METHOD_NOT_ALLOWED"},{status:405});
 const b=await req.json() as Body;
 if(!b.tenant_id||!b.agent_code||!b.task_type)return Response.json({error:"tenant_id, agent_code and task_type are required"},{status:400});
 const uid=ctx.userClaims?.sub;if(!uid)return Response.json({error:"UNAUTHENTICATED"},{status:401});
 const db=ctx.supabaseAdmin;
 const {data:mem}=await db.from("tenant_memberships").select("tenant_id,user_id,status").eq("tenant_id",b.tenant_id).eq("user_id",uid).eq("status","active").maybeSingle();
 if(!mem)return Response.json({error:"TENANT_ACCESS_DENIED"},{status:403});
 const {data:agent}=await db.from("ai_agents").select("*").eq("code",b.agent_code).eq("enabled",true).maybeSingle();
 if(!agent)return Response.json({error:"AGENT_NOT_AVAILABLE"},{status:409});
 const plan=b.plan??[{action_code:b.action_code??b.task_type,risk_level:b.risk_level??agent.risk_level,input_context:b.input_context??{}}];
 const evals:any[]=[];let overall="AUTONOMOUS_ALLOWED";
 for(const s of plan){
   const {data:pol}=await db.from("ai_action_policies").select("*").eq("action_code",s.action_code).eq("enabled",true).or(`tenant_id.eq.${b.tenant_id},tenant_id.is.null`).order("policy_version",{ascending:false}).limit(1).maybeSingle();
   if(!pol){evals.push({...s,decision:"BLOCK",reason:"NO_ENABLED_POLICY"});overall="BLOCK";continue;}
   if(rank(s.risk_level)>rank(pol.risk_level)){evals.push({...s,decision:"BLOCK",reason:"REQUESTED_RISK_EXCEEDS_POLICY",policy_id:pol.id});overall="BLOCK";}
   else if(pol.autonomy_mode==="human_approval"||pol.autonomy_mode==="human_decision"||rank(pol.risk_level)>=4){evals.push({...s,decision:"HUMAN_GATE",reason:"POLICY_REQUIRES_HUMAN_GATE",policy_id:pol.id});if(overall!=="BLOCK")overall="HUMAN_GATE";}
   else evals.push({...s,decision:"AUTONOMOUS_ALLOWED",reason:"POLICY_ALLOWS_AUTONOMY",policy_id:pol.id});
 }
 const tr=plan.reduce((m,s)=>Math.max(m,rank(s.risk_level)),0);const risk=["L0","L1","L2","L3","L4","L5","L6"][Math.min(tr,6)];
 const status=overall==="BLOCK"?"cancelled":overall==="HUMAN_GATE"?"awaiting_approval":"planning";
 const {data:task,error}=await db.from("ai_agent_tasks").insert({agent_id:agent.id,tenant_id:b.tenant_id,task_type:b.task_type,priority:b.priority??50,status,risk_level:risk,input_context:b.input_context??{},plan:{steps:plan,evaluation:evals},result:{},verification:{},requested_by:uid}).select("id,status,risk_level,plan,created_at").single();
 if(error)return Response.json({error:"TASK_CREATE_FAILED",detail:error.message},{status:500});
 const {data:steps,error:stepError}=await db.from("ai_execution_steps").insert(plan.map((s,i)=>({task_id:task.id,step_no:i+1,action_code:s.action_code,risk_level:s.risk_level,status:evals[i].decision==="BLOCK"?"blocked":"planned",input_context:s.input_context??{},output_context:{},verification:{}}))).select("id,step_no,action_code,risk_level,status");
 if(stepError)return Response.json({error:"STEP_CREATE_FAILED",detail:stepError.message},{status:500});
 let approval:any=null;let workflow:any=null;
 if(overall==="HUMAN_GATE"){
   const {data:def}=await db.from("workflow_definitions").select("id,code,version").eq("code","AI_HUMAN_GATE").eq("status","active").or(`tenant_id.eq.${b.tenant_id},tenant_id.is.null`).order("version",{ascending:false}).limit(1).maybeSingle();
   if(!def)return Response.json({error:"HUMAN_GATE_WORKFLOW_NOT_FOUND"},{status:500});
   const gateStep=steps?.find((s:any)=>s.status==="planned"&&rank(s.risk_level)>=4)??steps?.[0];
   const wf=await db.from("workflow_instances").insert({tenant_id:b.tenant_id,workflow_definition_id:def.id,entity_type:"ai_agent_task",entity_id:task.id,status:"waiting_approval",requested_by:uid,context:{task_id:task.id,step_id:gateStep?.id??null,risk_level:risk,agent_code:b.agent_code}}).select("id").single();
   if(wf.error)return Response.json({error:"WORKFLOW_CREATE_FAILED",detail:wf.error.message},{status:500});
   workflow=wf.data;
   const ar=await db.from("approval_requests").insert({tenant_id:b.tenant_id,workflow_instance_id:workflow.id,requested_by:uid,required_role_code:risk==="L6"?"SCHOOL_ADMIN":"TENANT_ADMIN",risk_level:risk,status:"pending"}).select("id,status").single();
   if(ar.error)return Response.json({error:"APPROVAL_CREATE_FAILED",detail:ar.error.message},{status:500});
   approval=ar.data;
   if(gateStep?.id)await db.from("ai_execution_steps").update({status:"blocked",verification:{gate:"HUMAN_APPROVAL",approval_request_id:approval.id,workflow_instance_id:workflow.id}}).eq("id",gateStep.id);
 }
 await db.from("ai_orchestration_events").insert({task_id:task.id,tenant_id:b.tenant_id,event_type:overall==="BLOCK"?"blocked":overall==="HUMAN_GATE"?"approval_required":"planned",actor_type:"agent",actor_id:agent.id,payload:{user_id:uid,decision:overall,evaluation:evals,approval_request_id:approval?.id??null}});
 await db.from("audit_events").insert({tenant_id:b.tenant_id,actor_user_id:uid,action_code:"ai.orchestration.task_created",entity_type:"ai_agent_task",entity_id:task.id,severity:rank(risk)>=4?"high":"info",source:"edunexus-orchestrator",payload:{agent_code:b.agent_code,decision:overall,risk_level:risk,approval_request_id:approval?.id??null}});
 return Response.json({ok:true,task,decision:overall,evaluation:evals,approval_request:approval,workflow_instance:workflow});
})};