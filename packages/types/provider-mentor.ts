export interface ProviderProgram{ id:string; organization_id:string; title:string; competency_ids:string[]; age_bands:string[]; status:"draft"|"active"|"archived"; }
export interface MentorAssignment{ id:string; organization_id:string; mentor_id:string; learner_id:string; goal_id?:string; starts_at:string; ends_at?:string; status:"active"|"ended"; }
export interface MentorReview{ id:string; assignment_id:string; evidence_id:string; reviewer_id:string; rubric_version:string; score:number; feedback:string; verified:boolean; }
export interface IndustryChallenge{ id:string; organization_id:string; title:string; competency_ids:string[]; eligibility:string[]; age_safety:string; status:"draft"|"published"|"closed"; }
