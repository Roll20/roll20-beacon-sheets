import type { CharacterDraft } from '@/maker/draftModel';
import { philosophyById, classById, aspectById } from '@/maker/data';
import { selectedRace, selectedSubrace } from './selectors';

/**
 * Derives structured benefits from the character's chosen traits/features:
 * a flat "abilities gained" list, plus resistances / immunities / senses / speeds
 * scraped from racial trait text, and Rich-adjusted starting wealth.
 */

export interface AbilityEntry {
  source: string;
  name: string;
  description: string;
}

export interface TraitAggregation {
  abilities: AbilityEntry[];
  resistances: string[];
  immunities: string[];
  vulnerabilities: string[];
  senses: string[];
  extraSpeeds: string[];
  effectiveWealth: number | null;
}

const uniq = (arr: string[]) => [...new Set(arr.map((s) => s.trim()).filter(Boolean))];

function scrape(text: string, re: RegExp): string[] {
  const out: string[] = [];
  let m: RegExpExecArray | null;
  const r = new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g');
  while ((m = r.exec(text))) out.push(m[1]);
  return out;
}

const RICH_MULT: Record<number, number> = { 1: 1.15, 2: 1.3, 3: 1.45, 4: 1.6 };

export function traitAggregation(draft: CharacterDraft): TraitAggregation {
  const race = selectedRace(draft);
  const subrace = selectedSubrace(draft);
  const abilities: AbilityEntry[] = [];
  let text = '';

  if (race) {
    text += ' ' + race.senses + ' ' + race.movementSpeed;
    race.traits.forEach((t) => {
      abilities.push({ source: race.name, name: t.name, description: t.description });
      text += ' ' + t.description;
    });
  }
  if (subrace) {
    subrace.traits.forEach((t) => {
      abilities.push({ source: subrace.name, name: t.name, description: t.description });
      text += ' ' + t.description;
    });
  }

  // Philosophy features
  const phil = draft.philosophy.selectedPhilosophyId
    ? philosophyById[draft.philosophy.selectedPhilosophyId]
    : null;
  phil?.features.forEach((f) =>
    abilities.push({ source: phil.name, name: f.name, description: f.description }),
  );

  // Class features at or below the character's class level
  draft.classBuild.classes.forEach((c) => {
    const cls = classById[c.classId];
    if (!cls) return;
    cls.features
      .filter((f) => (f.level ?? 1) <= c.level)
      .forEach((f) =>
        abilities.push({ source: cls.name, name: f.name, description: f.description }),
      );
  });

  // Aspect features at or below the aspect level (= class level - 2)
  const primaryLevel = draft.classBuild.classes[0]?.level ?? 0;
  draft.classBuild.aspects.forEach((a) => {
    const asp = aspectById[a.aspectId];
    if (!asp) return;
    asp.features
      .filter((f) => f.level <= primaryLevel)
      .forEach((f) =>
        abilities.push({ source: asp.name, name: f.name, description: f.description }),
      );
  });

  const resistances = uniq(
    scrape(text, /resistance to ([A-Za-z, ]+?) damage/gi).flatMap((s) => s.split(/,|\band\b/)),
  );
  const immunities = uniq(
    scrape(text, /immunity to (?:the )?([A-Za-z, ]+?)(?: damage| Condition| Conditions)/gi).flatMap(
      (s) => s.split(/,|\band\b/),
    ),
  );
  const vulnerabilities = uniq(scrape(text, /vulnerab(?:le|ility) to ([A-Za-z]+) damage/gi));
  const senses = uniq(
    scrape(
      text,
      /(Darksight|Darkvision|Devilsight|Blindsight|Blindsense|Tremorsense|Truesight)(?:\s+\d+\s*(?:ft\.?|feet))?/gi,
    ),
  );
  const extraSpeeds = uniq(
    scrape(
      text,
      /(flying speed|fly speed|swim(?:ming)? speed|climb(?:ing)? speed|burrow(?:ing)? speed)/gi,
    ).map((s) => s.replace(/\s+/g, ' ')),
  );

  // Rich-adjusted wealth
  const rich = draft.background.selectedTraits.find((t) => t.traitId === 'rich');
  const base = draft.equipment.startingWealth;
  const effectiveWealth =
    base != null && rich ? Math.round(base * (RICH_MULT[rich.cost] ?? 1)) : base;

  return {
    abilities,
    resistances,
    immunities,
    vulnerabilities,
    senses,
    extraSpeeds,
    effectiveWealth,
  };
}
