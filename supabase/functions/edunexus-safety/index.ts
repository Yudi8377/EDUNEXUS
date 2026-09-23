import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

type Body={tenant_id:string;student_id:string;authorization_id:string;presented_person_name?:string|null;presented_phone?:string|null;presented_vehicle_plate?:string|null;presented_token_hash?:string|null;event_type?:string;lat?:number|null;lng?:number|null;evidence?:Record<string,unknown>};

export default {fetch:withSupabase({auth:"user"},async(req,ctx)=>{
  if(req.method!=="POST")return Response.json({error:"METHOD_NOT_ALLOWED"},{status:405});
  const b=await req.json() as Body;
  if(!b.tenant_id||!b.student_id||!b.authorization_id)return Response.json({error:"tenant_id, student_id and authorization_id are required"},{status:400});
  const uid=ctx.userClaims?.sub;if(!uid)return Response.json({error:"UNAUTHENTICATED"},{status:401});
  const db=ctx.supabaseAdmin;
  const {data:mem}=await db.from("tenant_memberships").select("tenant_id,user_id,status").eq("tenant_id",b.tenant_id).eq("user_id",uid).eq("status","active").maybeSingle();
  if(!mem)return Response.json({error:"TENANT_ACCESS_DENIED"},{status:403});
  const {data:authz}=await db.from("pickup_authorizations").select("*").eq("id",b.authorization_id).eq("tenant_id",b.tenant_id).eq("student_id",b.student_id).maybeSingle();
  if(!authz)return Response.json({error:"AUTHORIZATION_NOT_FOUND"},{status:404});
  const {data:result,error}=await db.rpc("verify_student_release_v2",{p_tenant_id:b.tenant_id,p_student_id:b.student_id,p_authorization_id:b.authorization_id,p_presented_person_name:b.presented_person_name??null,p_presented_phone:b.presented_phone??null,p_presented_vehicle_plate:b.presented_vehicle_plate??null,p_presented_token_hash:b.presented_token_hash??null,p_event_type:b.event_type??"verify",p_lat:b.lat??null,p_lng:b.lng??null,p_evidence:b.evidence??{}});
  if(error)return Response.json({error:"SAFETY_VERIFICATION_FAILED",detail:error.message},{status:500});
  const row=Array.isArray(result)?result[0]:result;
  let approval_request=null,workflow_instance=null;
  if(row?.verification_result==="manual_review"){
    const {data:def}=await db.from("workflow_definitions").select("id,code,version").eq("code","STUDENT_SAFETY_RELEASE").eq("status","active").or(`tenant_id.eq.${b.tenant_id},tenant_id.is.null`).order("version",{ascending:false}).limit(1).maybeSingle();
    if(def){
      const risk=authz.pickup_type==="emergency"?"L6":"L5";
      const wf=await db.from("workflow_instances").insert({tenant_id:b.tenant_id,workflow_definition_id:def.id,entity_type:"student_release_verification",entity_id:row.verification_id,status:"waiting_approval",requested_by:uid,context:{student_id:b.student_id,authorization_id:b.authorization_id,verification_id:row.verification_id,incident_id:row.incident_id,pickup_type:authz.pickup_type,risk_level:risk}}).select("id").single();
      if(!wf.error){
        workflow_instance=wf.data;
        const ar=await db.from("approval_requests").insert({tenant_id:b.tenant_id,workflow_instance_id:workflow_instance.id,requested_by:uid,required_role_code:authz.pickup_type==="emergency"?"SCHOOL_ADMIN":"SECURITY_OFFICER",risk_level:risk,status:"pending"}).select("id,status").single();
        if(!ar.error)approval_request=ar.data;
      }
    }
  }
  await db.from("ai_orchestration_events").insert({tenant_id:b.tenant_id,event_type:row?.verification_result==="approved"?"verified":"approval_required",actor_type:"system",payload:{engine:"ENGINE_06",student_id:b.student_id,authorization_id:b.authorization_id,verification_id:row?.verification_id,result:row?.verification_result,reason:row?.verification_reason,approval_request_id:approval_request?.id??null,workflow_instance_id:workflow_instance?.id??null}});
  return Response.json({ok:true,engine:"ENGINE_06",verification:row,approval_request,workflow_instance});
})};