export type EvidenceType="assessment"|"project"|"mentor_review"|"teacher_review"|"certificate"|"achievement"|"portfolio_artifact"|"live_session_observation";
export type EvidenceStatus="draft"|"submitted"|"ai_assisted"|"human_review"|"verified"|"returned";
export interface EvidenceRecord{ id:string; organization_id:string; learner_id:string; type:EvidenceType; status:EvidenceStatus; competency_id:string; source_uri?:string; ai_assisted:boolean; human_reviewer_id?:string; captured_at:string; retention_until?:string; }
export interface SkillPassportEntry{ id:string; learner_id:string; competency_id:string; level:string; evidence_ids:string[]; assessment_date:string; reviewer_id?:string; verification_status:"pending"|"verified"|"revoked"; version:number; reflection?:string; }
export interface PortfolioShare{ id:string; learner_id:string; passport_entry_ids:string[]; visibility:"private"|"organization"|"public"; consent_id?:string; expires_at?:string; }
