import { ABILITIES } from './skills.js';
import { DAMAGE_TYPES } from './damage.js';
import { rankLabel, tpCost } from './techniques.js';
import { withModifier } from './rolls.js';
import { sortFeatures } from './features.js';
import { weaponPropertyLabels } from './weapons.js';

const num = (v, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

const text = (v) => String(v ?? '').trim();

const abbr = (abilityId) => ABILITIES.find((a) => a.id === abilityId)?.abbr ?? '';

const signed = (n) => (n < 0 ? `${n}` : `+${n}`);

const damageText = (damage, type) => [text(damage), text(type)].filter(Boolean).join(' ');

export const resistanceLine = (resistances = {}) =>
  [
    ...DAMAGE_TYPES.filter((t) => resistances[t.id]).map((t) => t.name),
    text(resistances.other),
  ]
    .filter(Boolean)
    .join(', ');

export const statBlockSkills = (roster = []) =>
  roster
    .filter((s) => num(s.ranks) > 0 || num(s.misc) !== 0)
    .map((s) => ({ name: s.name, bonus: num(s.total) }));

const saveSentence = (abilityId, dc, effect) => {
  if (!abilityId) return '';
  const head = [`${abbr(abilityId)} save`, text(dc) ? `DC ${text(dc)}` : ''].filter(Boolean).join(' ');
  return text(effect) ? `${head}: ${text(effect)}` : head;
};

const sentences = (parts) =>
  parts
    .map(text)
    .filter(Boolean)
    .map((s) => (/[.!?]$/.test(s) ? s : `${s}.`))
    .join(' ');

export const weaponAction = (attack = {}, attackPower = 0) => {
  const critFrom = num(attack.critFrom, 20);
  const second = damageText(attack.damage2, attack.damage2Type);
  return {
    name: text(attack.name) || 'Attack',
    isAttack: attack.rollsToHit !== false,
    attackPower: attack.rollsToHit !== false ? num(attackPower) : '',
    range: text(attack.range),
    damage: text(attack.damage),
    damageType: text(attack.damageType),
    text: sentences([
      weaponPropertyLabels(attack).length ? `Properties: ${weaponPropertyLabels(attack).join(', ')}` : '',
      second ? `Plus ${second} damage` : '',
      critFrom < 20 ? `Critical hit on ${critFrom}–20` : '',
      text(attack.critExtra) ? `Critical hit adds ${text(attack.critExtra)}` : '',
      saveSentence(attack.saveAbility, attack.saveDC, attack.saveEffect),
      attack.isMastery && text(attack.mastery) ? `Mastery: ${text(attack.mastery)}` : '',
      text(attack.notes),
    ]),
  };
};

export const techniqueAction = (technique = {}, { techAttackPower, techSaveDC, techAbilityMod } = {}) => {
  const mod = technique.addAbilityMod ? num(techAbilityMod) : 0;
  const second = damageText(technique.damage2, technique.damage2Type);
  const cost = tpCost(technique.rank);
  const healing = withModifier(technique.healing, mod);
  return {
    name: text(technique.name) || 'Technique',
    isAttack: !!technique.attack,
    attackPower: technique.attack ? num(techAttackPower) : '',
    range: text(technique.range),
    damage: withModifier(technique.damage, mod),
    damageType: text(technique.damageType),
    text: sentences([
      [rankLabel(technique.rank), cost ? `${cost} TP` : ''].filter(Boolean).join(', '),
      second ? `Plus ${second} damage` : '',
      healing ? `Heals ${healing}` : '',
      saveSentence(technique.saveAbility, techSaveDC ?? '', technique.saveEffect),
    ]),
  };
};

export const techniquesTrait = (techniques = [], { techAttackPower, techSaveDC, maxTP } = {}) => {
  if (!techniques.length) return null;
  const head = sentences([
    [
      techAttackPower != null ? `Tech attack ${signed(num(techAttackPower))}` : '',
      techSaveDC != null ? `tech save DC ${techSaveDC}` : '',
      maxTP ? `${maxTP} TP` : '',
    ]
      .filter(Boolean)
      .join(', '),
  ]);
  const byRank = new Map();
  for (const t of techniques) {
    const label = rankLabel(num(t.rank));
    if (!byRank.has(label)) byRank.set(label, []);
    byRank.get(label).push(text(t.name));
  }
  const lines = [...byRank].map(([label, names]) => `${label}: ${names.join(', ')}`);
  return { name: 'Techniques', text: [head, ...lines].filter(Boolean).join('\n') };
};

export const statBlockFromCharacter = (source = {}) => {
  const hitDice = source.hitDice ?? {};
  const techniqueList = techniquesTrait(source.techniques ?? [], source);
  const sameName = (f) =>
    techniqueList && text(f.name).replace(/\.$/, '').toLowerCase() === 'techniques';
  const traits = [
    ...sortFeatures(source.features ?? [])
      .filter((f) => (text(f.name) || text(f.text)) && !sameName(f))
      .map((f) => ({ name: text(f.name) || 'Feature', text: text(f.text) })),
    techniqueList,
  ].filter(Boolean);

  const perAction = num(source.attacksPerAction, 1);
  const actions = [
    perAction > 1
      ? { name: 'Multiattack', isAttack: false, text: `Makes ${perAction} attacks with its Attack action.` }
      : null,
    ...(source.weapons ?? []).map((w) => weaponAction(w, w.attackPower)),
    ...(source.techAttacks ?? []).map((t) => techniqueAction(t, source)),
  ].filter(Boolean);

  return {
    patch: {
      size: source.size || undefined,
      tags: text(source.species),
      defense: num(source.defense, 10),
      defenseNote: [text(source.armorName), text(source.shieldName)].filter(Boolean).join(', '),
      hp: {
        current: num(source.hp?.current),
        max: num(source.hp?.max),
        temp: num(source.hp?.temp),
      },
      hitDice: num(hitDice.total) > 0 && hitDice.die && hitDice.die !== '—' ? `${num(hitDice.total)}${hitDice.die}` : '',
      speed: `${num(source.speed)} ft.`,
      initiative: num(source.agility),
      abilities: { ...(source.abilities ?? {}) },
      saveProficiencies: { ...(source.saveProficiencies ?? {}) },
      saveBonus: num(source.saveBonus),
      languages: text(source.languages),
      resistances: resistanceLine(source.resistances),
    },
    skills: statBlockSkills(source.skillRoster),
    traits,
    actions,
  };
};

export default statBlockFromCharacter;
