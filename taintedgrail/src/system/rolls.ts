import type { DiceComponent } from '@/rolltemplates/rolltemplates';
import { useCharacterStore } from '@/sheet/stores/character/characterStore';
import { type AnyItem, type Spell, type Weapon } from '@/sheet/stores/inventory/inventoryStore';
import { useWaysStore, type WaysScore } from '@/sheet/stores/ways/waysStore';
import {
  capitalizeFirstLetter,
  domainToFriendlyName,
  friendlyNameToDomain,
  spellDisciplineToFriendlyName,
} from '@/utility/formattedNames';
import rollToChat from '@/utility/rollToChat';
import sendToChat from '@/utility/sendToChat';
import sendUserError from '@/utility/sendUserError';



// 1d10 + Way - Health Modifier
export const wayRoll = async (way: WaysScore) => {
  const { waysScores } = useWaysStore();
  const { rollHealthScore } = useCharacterStore();
  const score = waysScores[way];
  const healthModifier = rollHealthScore();
  const friendlyName = capitalizeFirstLetter(way);

  await rollToChat({
    title: `Way Roll: ${friendlyName}`,
    subtitle: '1d10 + Way - Health Modifier',
    allowCrit: true,
    components: [
      { label: 'Roll', sides: 10 },
      { label: `Way (${friendlyName})`, value: score },
      { label: 'Health Modifier', value: -healthModifier, negative: true },
    ],
  });
};

// 1d10 + Base + Bonus + Way - Penalty - Health Modifier
export const domainRoll = async (domain: string) => {
  const { rollHealthScore } = useCharacterStore();
  const { waysScores, domains } = useWaysStore();
  const foundDomain = domains[domain as keyof typeof domains];
  const base = foundDomain.base;
  const bonus = foundDomain.bonus;
  const wayScore = waysScores[foundDomain.way.title as WaysScore] || 0;
  const formattedWay = capitalizeFirstLetter(foundDomain.way.title);
  const penalty = foundDomain.penalty;
  const healthModifier = rollHealthScore();

  const friendlyName = domainToFriendlyName(domain);

  await rollToChat({
    title: `Domain Roll: ${friendlyName}`,
    subtitle: '1d10 + Base + Bonus + Way - Penalty - Health Modifier',
    allowCrit: true,
    components: [
      { label: 'Roll', sides: 10 },
      { label: 'Base', value: base },
      { label: 'Bonus', value: bonus },
      { label: `Way (${formattedWay})`, value: wayScore },
      { label: 'Penalty', value: -penalty, negative: true },
      { label: 'Health Modifier', value: -healthModifier, negative: true },
    ],
  });
};

//  1d10 + Base + Bonus + Way - Penalty - Health Modifier
export const disciplineRoll = async (discipline: string) => {
  const { waysScores, domains, getDisciplineByName } = useWaysStore();
  const disciplineObject = getDisciplineByName(discipline);
  if (!disciplineObject) return;

  const { rollHealthScore } = useCharacterStore();
  const healthModifier = rollHealthScore();

  const parentDomainName = getDisciplineByName(discipline)?.parentDomain;
  if (!parentDomainName) return;
  const formattedParentDomainName = domainToFriendlyName(parentDomainName);
  const parentDomain = domains[parentDomainName as keyof typeof domains];
  const bonus = parentDomain.bonus;
  const penalty = parentDomain.penalty;

  const associatedWay = parentDomain.way.title as WaysScore;
  const formattedWay = capitalizeFirstLetter(associatedWay);
  const wayScore = waysScores[associatedWay as WaysScore] || 0;

  const base = disciplineObject.base || 0;

  await rollToChat({
    title: `Discipline Roll: ${disciplineObject.name}`,
    subtitle: `1d10 + Base + Bonus + Way - Penalty - Health Modifier`,
    allowCrit: true,
    components: [
      { label: 'Roll', sides: 10 },
      { label: `Base (${disciplineObject.name})`, value: base },
      { label: `Bonus (${formattedParentDomainName})`, value: bonus },
      { label: `Way (${formattedWay})`, value: wayScore },
      { label: `Penalty (${formattedParentDomainName})`, value: penalty },
      { label: 'Health Modifier', value: -healthModifier, negative: true },
    ],
  });
};

// 1d10 + Combativeness + Close Combat - Health Modifier
export const parryRoll = async () => {
  const { rollHealthScore, fightingStance, potential } = useCharacterStore();
  const { waysScores, domains } = useWaysStore();
  const healthModifier = rollHealthScore();

  let subtitle = '1d10 + Combativeness + Close Combat - Health Modifier';
  let components: DiceComponent[] = [
    { label: 'Roll', sides: 10 },
    { label: 'Combativeness', value: waysScores.combativeness },
    { label: 'Close Combat', value: domains.closeCombat.base },
  ];

  // Add potential as stance modifier if in defensive stance.
  if (fightingStance === 'defensive') {
    subtitle = '1d10 + Combativeness + Close Combat + Stance Modifier - Health Modifier';
    components.push({ label: 'Stance Modifier', value: potential });
    components.push({ label: 'Health Modifier', value: -healthModifier, negative: true });
  } else {
    components.push({ label: 'Health Modifier', value: -healthModifier, negative: true });
  }

  await rollToChat({
    title: 'Parry Roll',
    subtitle: subtitle,
    allowCrit: true,
    components: components,
  });
};

// 1d10 + Combativeness + Domain/Discipline + Stance Modifier - Health Modifier
export const weaponRoll = async (item: Weapon) => {
  const { rollHealthScore } = useCharacterStore();
  const { potential, fightingStance } = useCharacterStore();
  const { waysScores, domains, getDisciplineByName } = useWaysStore();

  // Check if weapon has either domain or discipline. Discipline takes priority (but they really shouldn't have both).
  const hasDomain = !!item.domain;
  const hasDiscipline = !!item.discipline;

  const combativeness = waysScores.combativeness;
  const healthModifier = rollHealthScore();

  let scoreToUse = 0;
  let labelToUse = '';
  // Grab discipline score if it exists.
  if (hasDiscipline) {
    const disciplineObject = getDisciplineByName(item.discipline as string);
    if (disciplineObject) {
      scoreToUse = disciplineObject.base;
      labelToUse = `Discipline (${disciplineObject.name})`;
    }
  } else if (hasDomain) {
    const domainName = friendlyNameToDomain(item.domain as string);
    const domainObject = domains[domainName as keyof typeof domains];
    if (domainObject) {
      scoreToUse = domainObject.base;
      labelToUse = `Domain (${item.domain})`;
    }
  }

  // Stance Modifier
  // Standard = 0 | Offensive = Potential | Defensive = 0 - Potential
  let stanceModifier = 0;
  const currentFightingStance = capitalizeFirstLetter(fightingStance);
  if (fightingStance === 'defensive') stanceModifier = -potential;
  else if (fightingStance === 'offensive') stanceModifier = potential;

  let subtitle = `1d10 + Combativeness + ${labelToUse} - Health Modifier`;
  let components: DiceComponent[] = [
    { label: 'Roll', sides: 10 },
    { label: 'Combativeness', value: combativeness },
    { label: labelToUse, value: scoreToUse },
  ];

  // Add stance modifier if it's not 0.
  if (stanceModifier !== 0) {
    subtitle = `1d10 + Combativeness + ${labelToUse} ${stanceModifier < 0 ? '-' : '+'} Stance Modifier - Health Modifier`;
    components.push({ label: 'Health Modifier', value: -healthModifier, negative: true });
    components.push({ label: `Stance Modifier (${currentFightingStance})`, value: stanceModifier, negative: stanceModifier < 0 });
  } else {
    components.push({ label: 'Health Modifier', value: -healthModifier, negative: true });
  }

  await rollToChat({
    title: `Weapon Roll: ${item.name}`,
    subtitle: subtitle,
    allowCrit: true,
    components: components,
  });
};

// 1d10 + Discipline (base) + Way - Health Modifier
export const magicRoll = async (item: Spell) => {
  const { rollHealthScore } = useCharacterStore();
  const { waysScores, domains, getDisciplineByName } = useWaysStore();
  const healthModifier = rollHealthScore();

  const friendlySpellDiscipline = spellDisciplineToFriendlyName(item.discipline);
  const disciplineScore = getDisciplineByName(item.discipline)?.base || 0;

  // Get the parent domain of the spell discipline (which should always be magic, realistically)
  const parentDomain = getDisciplineByName(item.discipline)?.parentDomain;

  // It could be that the player (for some reason) removed the discipline needed from their sheet, but still has the spell.
  if (!parentDomain) {
    await sendUserError({
      title: `Unable to roll spell`,
      textContent: `You do not have the required discipline: ${friendlySpellDiscipline}`,
    });
    return;
  }

  // Get the way score for the parent domain (again, should always be Reason)
  const associatedWay = domains[parentDomain as keyof typeof domains].way.title as WaysScore;
  const formattedWay = capitalizeFirstLetter(associatedWay);
  const wayScore = waysScores[associatedWay] || 0;

  await rollToChat({
    title: `Magic Roll: ${item.name}`,
    subtitle: `1d10 + ${friendlySpellDiscipline} + ${formattedWay} - Health Modifier`,
    allowCrit: true,
    components: [
      { label: 'Roll', sides: 10 },
      { label: `Discipline (${friendlySpellDiscipline})`, value: disciplineScore },
      { label: `Way (${formattedWay})`, value: wayScore },
      { label: 'Health Modifier', value: -healthModifier, negative: true },
    ],
  });
};

export const sendItemToChat = async (item: AnyItem) => {
  await sendToChat({
    title: item.name,
    subtitle: item.type,
    textContent: item.description,
  });
};
