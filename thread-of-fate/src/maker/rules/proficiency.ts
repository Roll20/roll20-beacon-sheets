import type { CharacterDraft } from '@/maker/draftModel';
import { SKILLS } from '@/maker/data/attributes';
import { philosophyById, aspectById } from '@/maker/data';
import { draftModifiers } from './selectors';
import { proficiencyBonus } from './character';
import { totalLevel } from './selectors';

/** Proficiency tiers for skills/saves: PB multiplier 0-4. */
export type ProficiencyTier = 'none' | 'proficient' | 'expert' | 'masterful' | 'mythical';

export const TIER_MULT: Record<ProficiencyTier, number> = {
  none: 0,
  proficient: 1,
  expert: 2,
  masterful: 3,
  mythical: 4,
};

const SKILL_BY_LOWER = new Map(SKILLS.map((s) => [s.name.toLowerCase(), s]));

/** Resolve a free-text skill name to a canonical skill name (or null). */
function canonical(name: string): string | null {
  const hit = SKILL_BY_LOWER.get(name.trim().toLowerCase());
  return hit ? hit.name : null;
}

/**
 * Aggregate skill proficiency tiers from every source:
 * race picks, class picks, Background "Skill Training", and Philosophy grants
 * (which confer Expertise if already proficient).
 */
export function skillProficiencies(draft: CharacterDraft): Record<string, ProficiencyTier> {
  const proficient = new Set<string>();
  const expert = new Set<string>();

  const addProficient = (raw: string) => {
    const c = canonical(raw);
    if (c) proficient.add(c);
  };

  // Race + class skill choices
  draft.race.selectedSkills.forEach(addProficient);
  draft.classBuild.classSkills.forEach(addProficient);

  // Background: Skill Training trait details (comma/`and`-separated)
  draft.background.selectedTraits
    .filter((t) => t.traitId === 'skill-training')
    .forEach((t) => t.detail.split(/,|\band\b/).forEach(addProficient));

  // Philosophy grants, Expertise if already proficient, else Proficient
  const phil = draft.philosophy.selectedPhilosophyId
    ? philosophyById[draft.philosophy.selectedPhilosophyId]
    : null;
  const grantSkill = (raw: string, expertise: boolean) => {
    const c = canonical(raw);
    if (!c) return;
    if (expertise || proficient.has(c)) expert.add(c);
    else proficient.add(c);
  };
  (phil?.grantsSkills ?? []).forEach((s) => grantSkill(s, false));

  // Aspect features (at or below class level) that grant a talent, detected from
  // the actual grant phrasing "Proficiency in <Talent>" / "Expertise in <Talent>",
  // which avoids false matches on incidental words like "proficiency bonus/step".
  const primaryLevel = draft.classBuild.classes[0]?.level ?? 0;
  const grantTexts: string[] = [];
  draft.classBuild.aspects.forEach((a) => {
    aspectById[a.aspectId]?.features
      .filter((f) => f.level <= primaryLevel)
      .forEach((f) => grantTexts.push(f.description));
  });
  for (const s of SKILLS) {
    const name = s.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`(Proficiency|Expertise)\\s+in\\b[^.]{0,40}\\b${name}\\b`, 'i');
    for (const txt of grantTexts) {
      const m = txt.match(re);
      if (m) grantSkill(s.name, /Expertise/i.test(m[1]));
    }
  }

  const out: Record<string, ProficiencyTier> = {};
  SKILLS.forEach((s) => {
    out[s.name] = expert.has(s.name) ? 'expert' : proficient.has(s.name) ? 'proficient' : 'none';
  });
  return out;
}

export interface SkillRow {
  name: string;
  attribute: string;
  abbr: string;
  tier: ProficiencyTier;
  bonus: number;
}

const ATTR_ABBR: Record<string, string> = {
  might: 'MIG',
  instinct: 'INS',
  focus: 'FOC',
  conviction: 'CON',
  resonance: 'RES',
  presence: 'PRE',
};

export interface OtherProficiencies {
  weapons: string[];
  armor: string[];
  tools: string[];
  languages: string[];
  disciplines: string[];
}

/** Weapon/armor/tool/language/discipline proficiencies aggregated from Background traits. */
export function otherProficiencies(draft: CharacterDraft): OtherProficiencies {
  const detailsOf = (id: string) =>
    draft.background.selectedTraits
      .filter((t) => t.traitId === id)
      .map((t) => t.detail.trim())
      .filter(Boolean);
  // Class weapon/armor proficiencies (from the class definitions) feed in too via the sheet.
  return {
    weapons: detailsOf('weapon-training'),
    armor: detailsOf('armor-training'),
    tools: detailsOf('tool-training'),
    languages: ['Common', ...detailsOf('linguistic-training')],
    disciplines: detailsOf('extra-discipline'),
  };
}

/** Every skill with its proficiency tier and computed bonus (attr mod + PB x tier). */
export function skillRows(draft: CharacterDraft): SkillRow[] {
  const tiers = skillProficiencies(draft);
  const mods = draftModifiers(draft);
  const pb = proficiencyBonus(totalLevel(draft));
  return SKILLS.map((s) => {
    const tier = tiers[s.name];
    return {
      name: s.name,
      attribute: s.attribute,
      abbr: ATTR_ABBR[s.attribute] ?? s.attribute.slice(0, 3).toUpperCase(),
      tier,
      bonus: mods[s.attribute] + pb * TIER_MULT[tier],
    };
  });
}
