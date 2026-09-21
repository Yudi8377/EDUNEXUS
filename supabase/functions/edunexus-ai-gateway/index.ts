import { withSupabase } from "@supabase/server";

type Body={task_id:string;agent_code:string;prompt:string;model_id?:string;purpose?:string;max_tokens?:number};
const ALLOWED_MODELS=new Set(["anthropic/claude-sonnet-4.6","openai/o4-mini","alibaba/qwen3-coder-next"]);

export default {fetch:withSupabase({auth:"user"},async(req,ctx)=>{
  if(req.method!=="POST")return Response.json({error:"METHOD_NOT_ALLOWED"},{status:405});
  const b=await req.json() as Body;
  if(!b.task_id||!b.agent_code||!b.prompt)return Response.json({error:"task_id, agent_code and prompt are required"},{status:400});
  const uid=ctx.userClaims?.sub;if(!uid)return Response.json({error:"UNAUTHENTICATED"},{status:401});
  const db=ctx.supabaseAdmin;
  const {data:task,error:taskError}=await db.from("ai_agent_tasks").select("id,tenant_id,agent_id,status,risk_level,task_type").eq("id",b.task_id).maybeSingle();
  if(taskError||!task)return Response.json({error:"TASK_NOT_FOUND"},{status:404});
  if(!task.tenant_id)return Response.json({error:"AI_CALL_REQUIRES_TENANT"},{status:409});
  const {data:mem}=await db.from("tenant_memberships").select("tenant_id,user_id,status").eq("tenant_id",task.tenant_id).eq("user_id",uid).eq("status","active").maybeSingle();
  if(!mem)return Response.json({error:"TENANT_ACCESS_DENIED"},{status:403});
  const {data:agent}=await db.from("ai_agents").select("id,code,enabled,autonomy_mode,risk_level").eq("code",b.agent_code).eq("enabled",true).maybeSingle();
  if(!agent)return Response.json({error:"AGENT_NOT_AVAILABLE"},{status:409});
  if(agent.id!==task.agent_id)return Response.json({error:"AGENT_TASK_MISMATCH"},{status:409});
  const {data:policy}=await db.from("ai_action_policies").select("*").eq("action_code","ai.reasoning.generate").eq("enabled",true).or(`tenant_id.eq.${task.tenant_id},tenant_id.is.null`).order("policy_version",{ascending:false}).limit(1).maybeSingle();
  if(!policy)return Response.json({error:"NO_REASONING_POLICY"},{status:409});
  const rank=(v:string)=>({L0:0,L1:1,L2:2,L3:3,L4:4,L5:5,L6:6}[v as keyof object]??99);
  if(rank(task.risk_level)>rank(policy.risk_level))return Response.json({error:"REASONING_RISK_EXCEEDS_POLICY"},{status:403});
  const modelId=b.model_id&&ALLOWED_MODELS.has(b.model_id)?b.model_id:"anthropic/claude-sonnet-4.6";
  const apiKey=Deno.env.get("AI_GATEWAY_API_KEY");
  if(!apiKey)return Response.json({error:"AI_GATEWAY_NOT_CONFIGURED",required_secret:"AI_GATEWAY_API_KEY",model_id:modelId,control_plane_ready:true},{status:503});
  const runStart=Date.now();
  const run=await db.from("ai_model_runs").insert({task_id:task.id,tenant_id:task.tenant_id,agent_id:agent.id,provider:modelId.split("/")[0],model_id:modelId,purpose:b.purpose??"agent_reasoning",status:"started"}).select("id").single();
  if(run.error)return Response.json({error:"MODEL_RUN_CREATE_FAILED"},{status:500});
  const response=await fetch("https://ai-gateway.vercel.sh/v1/chat/completions",{method:"POST",headers:{"Authorization":`Bearer ${apiKey}`,"Content-Type":"application/json"},body:JSON.stringify({model:modelId,messages:[{role:"system",content:`You are EDUNEXUS agent ${b.agent_code}. Follow EDUNEXUS safety and authorization policy. Produce structured, auditable reasoning. Never claim an action was executed unless the control plane confirms it.`},{role:"user",content:b.prompt}],max_tokens:b.max_tokens??2000})});
  const latency=Date.now()-runStart;
  const body=await response.json();
  if(!response.ok){await db.from("ai_model_runs").update({status:"failed",latency_ms:latency,error_code:`GATEWAY_HTTP_${response.status}`,result_metadata:{http_status:response.status},completed_at:new Date().toISOString()}).eq("id",run.data.id);return Response.json({error:"AI_GATEWAY_REQUEST_FAILED",status:response.status},{status:502});}
  const usage=body.usage??{};
  await db.from("ai_model_runs").update({status:"completed",latency_ms:latency,input_tokens:usage.prompt_tokens??null,output_tokens:usage.completion_tokens??null,total_tokens:usage.total_tokens??null,result_metadata:{finish_reason:body.choices?.[0]?.finish_reason??null},completed_at:new Date().toISOString()}).eq("id",run.data.id);
  await db.from("ai_orchestration_events").insert({task_id:task.id,tenant_id:task.tenant_id,event_type:"understood",actor_type:"agent",actor_id:agent.id,payload:{model_run_id:run.data.id,model_id:modelId,purpose:b.purpose??"agent_reasoning",latency_ms:latency}});
  return Response.json({ok:true,model_run_id:run.data.id,model_id:modelId,output:body.choices?.[0]?.message?.content??"",usage});
})};