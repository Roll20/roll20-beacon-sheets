import { attackAbility, activeWeaponText, gradeNumber, weaponDamage } from './weapons.js';
import { weaponAction } from './statBlockFromCharacter.js';
import { monsterBonus } from './monsters.js';
import { withModifier } from './rolls.js';
import { normalizeCreatureTechnique, slugId } from './npcActions.js';

const int = (v) => {
  const n = parseInt(String(v ?? '').trim(), 10);
  return Number.isFinite(n) ? n : 0;
};

export const creatureWeaponAction = (attack = {}, { abilities = {}, cr = '', saveBonus = 0 } = {}) => {
  const mod = int(abilities[attackAbility(attack, abilities)]);
  const grade = gradeNumber(attack.grade);
  const { formula } = weaponDamage({ baseDamage: attack.baseDamage, gradeInUse: grade, abilityMod: mod });
  return weaponAction(
    {
      ...attack,
      damage: formula,
      isMastery: false,
      notes: activeWeaponText(attack.text, { gradeInUse: grade }).join(' '),
    },
    monsterBonus(mod, cr, true, saveBonus),
  );
};

const pageFields = (mapped = {}, abilityMod = 0) => {
  const f = mapped.fields ?? {};
  const x = mapped.extras ?? {};
  const mod = x.addAbilityMod ? int(abilityMod) : 0;
  return {
    id: mapped.id || slugId(f.name ?? mapped.name),
    name: f.name ?? mapped.name ?? '',
    castingTime: f.castingTime ?? '',
    range: f.range ?? '',
    duration: f.duration ?? '',
    attack: !!f.attack,
    saveAbility: f.saveAbility ?? '',
    saveEffect: x.saveEffect ?? '',
    damage: withModifier(x.damage, mod),
    damageType: x.damageType ?? '',
    healing: withModifier(x.healing, mod),
    text: f.text ?? [],
  };
};

export const creatureTechnique = (mapped = {}, { abilityMod = 0 } = {}) =>
  normalizeCreatureTechnique({ ...pageFields(mapped, abilityMod), rank: mapped.fields?.rank ?? '' });

export const refreshCreatureTechnique = (current = {}, mapped = {}, { abilityMod = 0 } = {}) =>
  normalizeCreatureTechnique({
    ...pageFields(mapped, abilityMod),
    _id: current._id,
    rank: current.rank,
    note: current.note,
    used: current.used,
  });
