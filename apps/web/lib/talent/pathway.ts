import type { CompetencyDefinition } from "../../../../packages/types/competency-catalog";
import type { LearnerGoal, PathwayRecommendation } from "../../../../packages/types/goal-pathway";

export interface BaselineSignal {
  competencyId: string;
  currentLevel: string;
  evidenceCount: number;
  verified: boolean;
}

export function recommendCompetencies(
  goal: LearnerGoal,
  catalog: CompetencyDefinition[],
  baseline: BaselineSignal[],
): PathwayRecommendation[] {
  const baselineMap = new Map(baseline.map((item) => [item.competencyId, item]));
  const familyKeywords: Record<LearnerGoal["family"], string[]> = {
    Technology: ["Technology"],
    Leadership: ["Leadership", "Communication", "Collaboration"],
    Entrepreneurship: ["Business", "Communication"],
    Culinary: ["Culinary"],
    Hospitality: ["Hospitality", "Communication"],
    Creative: ["Creative", "Presentation"],
    Sports: ["Sports", "Self-management"],
    "Public Personality": ["Communication", "Presentation", "Language"],
    "Academic Excellence": ["Decision making", "Communication"],
    "Career Preparation": ["Communication", "Collaboration", "Decision making"],
  };

  const keywords = familyKeywords[goal.family];
  return catalog
    .filter((item) => keywords.some((keyword) =>
      item.subdomain.toLowerCase().includes(keyword.toLowerCase()) ||
      item.title.toLowerCase().includes(keyword.toLowerCase()) ||
      item.domain.toLowerCase().includes(keyword.toLowerCase()),
    ))
    .map((item): PathwayRecommendation | null => {
      const signal = baselineMap.get(item.id);
      if (!signal) {
        return {
          competencyId: item.id,
          reason: `Kompetensi relevan untuk tujuan "${goal.title}" dan belum memiliki baseline.`,
          priority: "high",
          evidenceGap: "baseline_missing",
        };
      }
      if (!signal.verified || signal.evidenceCount === 0) {
        return {
          competencyId: item.id,
          reason: "Baseline ada tetapi bukti belum terverifikasi.",
          priority: "medium",
          evidenceGap: "verification_missing",
        };
      }
      return null;
    })
    .filter((item): item is PathwayRecommendation => item !== null);
}
