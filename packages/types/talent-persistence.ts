export type TenantRole="owner"|"admin"|"mentor"|"teacher"|"parent"|"learner"|"provider"|"school"|"reviewer";
export interface Organization{ id:string; name:string; type:"platform"|"provider"|"school"|"community"; status:"active"|"suspended"; }
export interface Membership{ id:string; organization_id:string; user_id:string; role:TenantRole; status:"active"|"invited"|"suspended"; }
export interface TenantOwned{ organization_id:string; created_by:string; created_at:string; updated_at:string; }
export interface AuthorizationRule{ resource:string; actions:Array<"select"|"insert"|"update"|"delete">; roles:TenantRole[]; predicate:string; }
export const PERSISTENCE_RLS_RULES:AuthorizationRule[]=[
{resource:"organization",actions:["select"],roles:["owner","admin"],predicate:"membership.organization_id = row.id"},
{resource:"learner_profile",actions:["select"],roles:["owner","admin","mentor","teacher","parent","learner"],predicate:"membership grants scoped access; learner owns own profile"},
{resource:"evidence",actions:["select"],roles:["owner","admin","mentor","teacher","reviewer","learner"],predicate:"same organization plus evidence visibility scope"},
{resource:"evidence",actions:["insert"],roles:["mentor","teacher","learner"],predicate:"actor is assigned learner or self"},
{resource:"skill_passport_entry",actions:["update"],roles:["owner","admin","reviewer"],predicate:"verified entries cannot be reassigned across tenants"},
];
