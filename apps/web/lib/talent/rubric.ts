import type { CompetencyDefinition, MasteryLevel } from "../../../../packages/types/competency-catalog";

export interface RubricObservation {
  dimension: string;
  score: number;
  note?: string;
}

export interface RubricResult {
  level: MasteryLevel;
  score: number;
  nextLevel: MasteryLevel | null;
  humanReviewRequired: boolean;
}

const LEVELS: MasteryLevel[] = [
  "Explore",
  "Foundation",
  "Developing",
  "Proficient",
  "Advanced",
  "Applied/Portfolio",
];

export function scoreCompetency(
  competency: CompetencyDefinition,
  observations: RubricObservation[],
): RubricResult {
  const valid = observations.filter((item) => Number.isFinite(item.score) && item.score >= 0 && item.score <= 4);
  const average = valid.length ? valid.reduce((sum, item) => sum + item.score, 0) / valid.length : 0;
  const index = Math.min(LEVELS.length - 1, Math.floor(average / 4 * LEVELS.length));
  const level = LEVELS[index];

  return {
    level,
    score: Number(average.toFixed(2)),
    nextLevel: index < LEVELS.length - 1 ? LEVELS[index + 1] : null,
    humanReviewRequired: competency.safetyClass === "high_impact_review",
  };
}
