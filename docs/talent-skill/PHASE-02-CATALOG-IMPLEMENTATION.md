# Phase 02 — Competency Catalog Implementation v1

Status: IMPLEMENTED ON FOUNDATION BRANCH

## Scope
This slice converts the Phase 2 competency framework into executable TypeScript contracts and a starter catalog.

## Included
- Versioned competency definitions.
- Five pillars: Character, Talent & Interest, Soft Skills, Hard Skills, Life Skills.
- Cross-domain hard skills including Technology, Culinary, Hospitality, Creative, and Business.
- Six mastery levels: Explore → Foundation → Developing → Proficient → Advanced → Applied/Portfolio.
- Observable indicators and evidence types.
- Safety classification per competency.
- Deterministic rubric scoring helper.
- Mandatory human-review flag for high-impact competencies.

## Safety invariant
The rubric scores observable learning evidence. It must not infer emotion, personality, character quality, intelligence, mental health, or sensitive traits from face, voice, or video.

## Next implementation slice
1. Persist catalog/version records.
2. Add tenant-scoped RLS policies.
3. Map goals to competency targets.
4. Add assessment/evidence workflows.
5. Connect approved AI observations to evidence drafts only; human review remains authoritative.
