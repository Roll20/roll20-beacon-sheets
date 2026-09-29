import { ABILITY_IDS, resolveSkills } from './skills.js';
import { normalizeProfessionStats, professionRow } from './profession.js';
import { armorContribution } from './armor.js';
import { normalizeProficiencies } from './proficiencies.js';
import { clampLevel, saveBonus, maxSkillRank, levelFromXp, fatePoints } from './progression.js';
import {
  savingThrow,
  skillModifier,
  passivePerception,
  defense,
  agility,
  techSaveDC,
  startingHp,
} from './derived.js';

const num = (v, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

export const INITIATE_TECH_ABILITIES = ['intelligence', 'wisdom', 'charisma'];

const blank = (v) => v === null || v === undefined || v === '';

export const normalizeSaveOptions = (options = {}) => ({
  bonus: Object.fromEntries(
    ABILITY_IDS.map((id) => [id, blank(options?.bonus?.[id]) ? 0 : num(options.bonus[id])]),
  ),
  deathSave: blank(options?.deathSave) ? 0 : num(options.deathSave),
  passivePerception: blank(options?.passivePerception) ? 0 : num(options.passivePerception),
});

export const normalizeTechOptions = (options = {}) => ({
  ability: options?.ability || '',
  attackMisc: blank(options?.attackMisc) ? 0 : num(options.attackMisc),
  saveDCMisc: blank(options?.saveDCMisc) ? 0 : num(options.saveDCMisc),
});

export const summarizeSheet = (sheet = {}) => {
  const abilities = sheet.abilities || {};
  const saveProficiencies = sheet.saveProficiencies || {};
  const skills = sheet.skills || {};
  const defenseParts = sheet.defenseParts || {};
  const hp = sheet.hp || {};
  const tp = sheet.tp || {};

  const professionStats = normalizeProfessionStats(sheet.professionStats);
  const level = clampLevel(sheet.level ?? 1);
  const row = professionRow(professionStats, level);

  const ability = (id) => num(abilities[id]);

  const techOptions = normalizeTechOptions(sheet.techOptions);
  const techAbility = techOptions.ability || professionStats.techAbility || null;
  const techAbilityMod = techAbility ? ability(techAbility) : 0;
  const techBonusValue = num(row.techBonus);

  const maxTP = num(row.maxTP);

  const armor = armorContribution(
    defenseParts,
    normalizeProficiencies(sheet.proficiencies),
    ability('strength'),
  );

  const defenseValue = defense({
    base: 10,
    armorBonus: armor.armorBonus,
    shieldBonus: armor.shieldBonus,
    dexMod: ability('dexterity'),
    armorType: defenseParts.armorType,
    techniqueMod: num(defenseParts.techniqueMod),
    miscMod: num(defenseParts.itemMisc),
  });

  const dex = ability('dexterity');
  let defenseDexApplied = dex;
  if (defenseParts.armorType === 'medium') defenseDexApplied = Math.min(dex, 2);
  else if (defenseParts.armorType === 'heavy') defenseDexApplied = 0;

  const saveOptions = normalizeSaveOptions(sheet.saveOptions);
  const saves = Object.fromEntries(
    ABILITY_IDS.map((id) => [
      id,
      savingThrow(ability(id), level, !!saveProficiencies[id]) + saveOptions.bonus[id],
    ]),
  );

  const skillRoster = resolveSkills(sheet);

  const skillTotals = Object.fromEntries(
    skillRoster.map((s) => {
      const entry = skills[s.id] || { ranks: 0, misc: 0 };
      return [s.id, skillModifier(ability(s.ability), num(entry.ranks), num(entry.misc))];
    }),
  );

  const { points: fateMax, die: fateDie } = fatePoints(level);

  return {
    professionStats,
    level,
    saveBonus: saveBonus(level),
    skillRankCap: maxSkillRank(level),
    levelForXp: levelFromXp(sheet.xp),

    attackBonus: num(row.attackBonus),
    techBonus: techBonusValue,
    techAbility,
    techAbilityMod,
    techOptions,
    maxTechRank: row.maxTechRank,
    advancedRank: row.advancedRank,
    techniquesKnown: row.techniquesKnown,

    techAttackPower: techAbility ? techAbilityMod + techBonusValue + techOptions.attackMisc : null,
    techSaveDC: techAbility ? techSaveDC(techAbilityMod, level, techOptions.saveDCMisc) : null,

    hp: {
      current: num(hp.current),
      max: num(hp.max),
      temp: num(hp.temp),
    },
    suggestedMaxHp: startingHp(professionStats.hitDie, ability('constitution')),
    tp: { current: num(tp.current), max: maxTP },
    maxTP,

    defense: defenseValue,
    defenseDexApplied,
    armor,
    agility: agility(dex, num(sheet.agilityMisc)),
    speed: num(sheet.speed) + num(sheet.speedMisc) - armor.speedPenalty,

    saves,
    saveOptions,
    deathSaveBonus: saveOptions.deathSave,
    skillRoster,
    skillTotals,
    passivePerception: passivePerception(skillTotals.perception ?? 0, saveOptions.passivePerception),

    fate: {
      max: fateMax,
      die: fateDie,
      remaining: Math.max(0, fateMax - num(sheet.fateSpent)),
    },

    hitDice: {
      total: level,
      die: professionStats.hitDie ? `d${professionStats.hitDie}` : '—',
      used: num(sheet.hitDiceUsed),
      remaining: Math.max(0, level - num(sheet.hitDiceUsed)),
    },
  };
};

export default summarizeSheet;
