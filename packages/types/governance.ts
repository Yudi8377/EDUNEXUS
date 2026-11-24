export type AIImpact="low"|"medium"|"high";
export interface AIUseCase{ id:string; name:string; purpose:string; allowed:boolean; impact:AIImpact; human_review_required:boolean; prohibited_uses:string[]; model_version?:string; policy_version:string; }
export interface ConsentRecord{ id:string; learner_id:string; scope:string; purpose:string; status:"granted"|"revoked"|"expired"; granted_at:string; revoked_at?:string; }
export interface AuditEvent{ id:string; organization_id?:string; actor_id?:string; action:string; resource_type:string; resource_id:string; created_at:string; metadata:Record<string,unknown>; }
export interface SecurityControl{ id:string; category:"auth"|"rls"|"consent"|"retention"|"ai"|"audit"|"secrets"|"backup"; requirement:string; critical:boolean; status:"pass"|"fail"|"not_tested"; evidence?:string; }
