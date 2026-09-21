import { withSupabase } from "@supabase/server";

type Body={approval_id:string;decision:"approved"|"rejected";note?:string};

export default {fetch:withSupabase({auth:"user"},async(req,ctx)=>{
  if(req.method!=="POST") return Response.json({error:"METHOD_NOT_ALLOWED"},{status:405});
  const b=await req.json() as Body;
  if(!b.approval_id||!["approved","rejected"].includes(b.decision)) return Response.json({error:"approval_id and valid decision are required"},{status:400});
  const uid=ctx.userClaims?.sub;if(!uid)return Response.json({error:"UNAUTHENTICATED"},{status:401});
  const db=ctx.supabaseAdmin;
  const {data:reqRow,error:reqError}=await db.from("approval_requests").select("id,tenant_id,required_role_code,status,workflow_instance_id").eq("id",b.approval_id).maybeSingle();
  if(reqError||!reqRow)return Response.json({error:"APPROVAL_NOT_FOUND"},{status:404});
  if(reqRow.status!=="pending")return Response.json({error:"APPROVAL_NOT_PENDING"},{status:409});
  const {data:mem}=await db.from("tenant_memberships").select("tenant_id,user_id,status").eq("tenant_id",reqRow.tenant_id).eq("user_id",uid).eq("status","active").maybeSingle();
  if(!mem)return Response.json({error:"TENANT_ACCESS_DENIED"},{status:403});
  const {data:roles}=await db.from("user_roles").select("role_id,roles!inner(code)").eq("user_id",uid).eq("tenant_id",reqRow.tenant_id);
  const roleCodes=(roles??[]).map((r:any)=>r.roles?.code).filter(Boolean);
  const roleAllowed=roleCodes.includes("PLATFORM_ADMIN")||roleCodes.includes("TENANT_ADMIN")||roleCodes.includes(reqRow.required_role_code);
  if(!roleAllowed)return Response.json({error:"APPROVAL_ROLE_DENIED",required_role:reqRow.required_role_code},{status:403});
  const {data:resolved,error:resolveError}=await db.rpc("resolve_ai_approval",{p_approval_id:b.approval_id,p_decision:b.decision,p_decision_by:uid,p_note:b.note??null});
  if(resolveError)return Response.json({error:"APPROVAL_RESOLUTION_FAILED",detail:resolveError.message},{status:500});
  return Response.json({ok:true,decision:b.decision,decision_by:uid,roles:roleCodes,result:resolved});
})};