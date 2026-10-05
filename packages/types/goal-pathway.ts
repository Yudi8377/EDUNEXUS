import type { CompetencyDefinition } from "./competency-catalog";

export type GoalFamily =
  | "Technology"
  | "Leadership"
  | "Entrepreneurship"
  | "Culinary"
  | "Hospitality"
  | "Creative"
  | "Sports"
  | "Public Personality"
  | "Academic Excellence"
  | "Career Preparation";

export type GoalStatus = "draft" | "active" | "paused" | "completed" | "archived";

export interface LearnerGoal {
  id: string;
  learnerId: string;
  family: GoalFamily;
  title: string;
  targetDate?: string;
  motivation?: string;
  constraints?: string[];
  privacyLevel: "private" | "guardian" | "mentor" | "organization";
  status: GoalStatus;
  createdBy: string;
}

export interface PathwayStage {
  id: string;
  sequence: number;
  title: string;
  competencyTargetIds: string[];
  activityIds: string[];
  projectIds: string[];
  assessmentPoint: boolean;
  evidenceRequirements: string[];
  mentorReviewRequired: boolean;
}

export interface DevelopmentPathway {
  id: string;
  goalId: string;
  version: number;
  competencyTargets: Pick<CompetencyDefinition, "id" | "version" | "title" | "domain">[];
  stages: PathwayStage[];
  rationale: string[];
  status: "draft" | "active" | "completed" | "superseded";
}

export interface PathwayRecommendation {
  competencyId: string;
  reason: string;
  priority: "low" | "medium" | "high";
  evidenceGap: string;
}
