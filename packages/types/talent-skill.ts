export type SkillDomain = "character" | "talent_interest" | "soft_skill" | "hard_skill" | "life_skill";
export type EvidenceType = "assessment" | "project" | "mentor_review" | "certificate" | "achievement" | "portfolio" | "live_session";
export type GoalFamily = "technology" | "leadership" | "entrepreneurship" | "culinary" | "hospitality" | "creative" | "sports" | "public_personality" | "academic" | "career";

export interface TalentGoal {
  id: string;
  learnerId: string;
  title: string;
  family: GoalFamily;
  targetDate?: string;
  status: "draft" | "active" | "completed" | "paused";
}

export interface SkillEvidence {
  id: string;
  learnerId: string;
  domain: SkillDomain;
  evidenceType: EvidenceType;
  competencyId?: string;
  source: "student" | "mentor" | "teacher" | "provider" | "ai_assistant";
  humanReviewed: boolean;
  createdAt: string;
}
