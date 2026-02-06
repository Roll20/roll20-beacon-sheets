import { config } from './config';

export const staticKeys = {
  // AC
  'armor-class': 'armor-class',
  'manual-armor-class': 'manual-armor-class',

  //Attacks
  attack: 'attack-modifier',
  'melee-attack': 'melee-attack-modifier',
  'ranged-attack': 'ranged-attack-modifier',
  'weapon-attack': 'weapon-attack-modifier',
  'melee-weapon-attack': 'melee-weapon-attack-modifier',
  'ranged-weapon-attack': 'ranged-weapon-attack-modifier',
  'melee-spell-attack': 'melee-spell-attack-modifier',
  'ranged-spell-attack': 'ranged-spell-attack-modifier',

  'attack-roll': 'attack-roll-modifier',
  'melee-attack-roll': 'melee-attack-roll-modifier',
  'ranged-attack-roll': 'ranged-attack-roll-modifier',
  'weapon-attack-roll': 'weapon-attack-roll-modifier',
  'melee-weapon-attack-roll': 'melee-weapon-attack-roll-modifier',
  'ranged-weapon-attack-roll': 'ranged-weapon-attack-roll-modifier',
  'melee-spell-attack-roll': 'melee-spell-attack-roll-modifier',
  'ranged-spell-attack-roll': 'ranged-spell-attack-roll-modifier',

  'attack-action-die': 'attack-action-die',
  'attack-action-die-min': 'attack-action-die-min',
  'melee-attack-action-die': 'melee-attack-action-die',
  'melee-attack-action-die-min': 'melee-attack-action-die-min',
  'ranged-attack-action-die': 'ranged-attack-action-die',
  'ranged-attack-action-die-min': 'ranged-attack-action-die-min',
  'weapon-attack-action-die': 'weapon-attack-action-die',
  'weapon-attack-action-die-min': 'weapon-attack-action-die-min',
  'melee-weapon-attack-action-die': 'melee-weapon-attack-action-die',
  'melee-weapon-attack-action-die-min': 'melee-weapon-attack-action-die-min',
  'ranged-weapon-attack-action-die': 'ranged-weapon-attack-action-die',
  'ranged-weapon-attack-action-die-min': 'ranged-weapon-attack-action-die-min',
  'melee-spell-attack-action-die': 'melee-spell-attack-action-die',
  'melee-spell-attack-action-die-min': 'melee-spell-attack-action-die-min',
  'ranged-spell-attack-action-die': 'ranged-spell-attack-action-die',
  'ranged-spell-attack-action-die-min': 'ranged-spell-attack-action-die-min',

  // HP
  'hit-points-max': 'hit-points-max',

  //Hit Dice
  'hit-dice-bonus': 'hit-dice-bonus-modifier', 
  'hit-dice-roll': 'hit-dice-roll-modifier',

  //Checks
  check: 'check-modifier',
  'check-roll': 'check-roll-modifier',
  'check-action-die': 'check-action-die',
  'check-action-die-min': 'check-action-die-min',

  // General
  initiative: 'initiative-modifier',
  'initiative-roll': 'initiative-roll-modifier',
  'initiative-action-die': 'initiative-action-die',
  'initiative-action-die-min': 'initiative-action-die-min',

  'proficiency-bonus': 'proficiency-bonus',

  // Spells
  'spell-attack': 'spell-attack-modifier',
  'spell-attack-roll': 'spell-attack-roll-modifier',
  'spell-attack-action-die': 'spell-attack-action-die',
  'spell-dc': 'spell-dc',

  //Saves
  saving: 'saving-modifier',
  'saving-roll': 'saving-roll-modifier',
  'saving-action-die': 'saving-action-die',
  'saving-action-die-min': 'saving-action-die-min',
  'saving-proficiency': 'saving-proficiency',
  'death-saving': 'death-saving-modifier',
  'death-saving-roll': 'death-saving-roll-modifier',
  'death-saving-action-die': 'death-saving-action-die',
  'death-saving-action-die-min': 'death-saving-action-die-min',

  //Death Saves
  'death-saves-max': 'death-saves-max',
  'death-saves-failures-max': 'death-saves-failures-max',
  'death-saves-successes-max': 'death-saves-successes-max',

  //Skills
  skill: 'skill-modifier',
  'skill-roll': 'skill-roll-modifier',
  'skill-action-die': 'skill-action-die',
  'skill-action-die-min': 'skill-action-die-min',
  'skill-proficiency': 'skill-proficiency',

  //Tools
  tools: 'tools-modifier',
  'tools-roll': 'tools-roll-modifier',
  'tools-action-die': 'tools-action-die',
  'tools-action-die-min': 'tools-action-die-min',
  'tools-proficiency': 'tools-proficiency',

  //Crit Range
  'crit-range': 'crit-range',
  'melee-crit-range': 'melee-crit-range',
  'ranged-crit-range': 'ranged-crit-range',
  'weapon-crit-range': 'weapon-crit-range',
  'spell-crit-range': 'spell-crit-range',
  'melee-weapon-crit-range': 'melee-weapon-crit-range',
  'ranged-weapon-crit-range': 'ranged-weapon-crit-range',
  'melee-spell-crit-range': 'melee-spell-crit-range',
  'ranged-spell-crit-range': 'ranged-spell-crit-range',

  //Damage
  damage: 'damage-modifier',
  'weapon-damage': 'weapon-damage-modifier',
  'spell-damage': 'spell-damage-modifier',
  'melee-damage': 'melee-damage-modifier',
  'ranged-damage': 'ranged-damage-modifier',
  'melee-weapon-damage': 'melee-weapon-damage-modifier',
  'ranged-weapon-damage': 'ranged-weapon-damage-modifier',
  'melee-spell-damage': 'melee-spell-damage-modifier',
  'ranged-spell-damage': 'ranged-spell-damage-modifier',

  'damage-roll': 'damage-roll-modifier',
  'weapon-damage-roll': 'weapon-damage-roll-modifier',
  'spell-damage-roll': 'spell-damage-roll-modifier',
  'melee-damage-roll': 'melee-damage-roll-modifier',
  'ranged-damage-roll': 'ranged-damage-roll-modifier',
  'melee-weapon-damage-roll': 'melee-weapon-damage-roll-modifier',
  'ranged-weapon-damage-roll': 'ranged-weapon-damage-roll-modifier',
  'melee-spell-damage-roll': 'melee-spell-damage-roll-modifier',
  'ranged-spell-damage-roll': 'ranged-spell-damage-roll-modifier',

  'carry-capacity': 'carry-capacity-multiplier',

  'speed': 'speed',
} as const;

const abilityKeys = config.abilities.reduce((acc, ability) => {
  acc[ability] = ability;
  return acc;
}, {} as Record<(typeof config.abilities)[number], (typeof config.abilities)[number]>);

const abilityModifierKeys = config.abilities.reduce((acc, ability) => {
  const key = `${ability}-check` as const;
  const value = `${ability}-check-modifier` as const;
  acc[key] = value;
  return acc;
}, {} as Record<`${(typeof config.abilities)[number]}-check`, `${(typeof config.abilities)[number]}-check-modifier`>);

const abilityModifierRollKeys = config.abilities.reduce((acc, ability) => {
  const key = `${ability}-check-roll` as const;
  const value = `${ability}-check-roll-modifier` as const;
  acc[key] = value;
  return acc;
}, {} as Record<`${(typeof config.abilities)[number]}-check-roll`, `${(typeof config.abilities)[number]}-check-roll-modifier`>);

const abilityModifierActionDieKeys = config.abilities.reduce((acc, ability) => {
  const key = `${ability}-check-action-die` as const;
  const value = `${ability}-check-action-die` as const;
  acc[key] = value;
  return acc;
}, {} as Record<`${(typeof config.abilities)[number]}-check-action-die`, `${(typeof config.abilities)[number]}-check-action-die`>);

const abilityModifierActionDieMinKeys = config.abilities.reduce((acc, ability) => {
  const key = `${ability}-check-action-die-min` as const;
  const value = `${ability}-check-action-die-min` as const;
  acc[key] = value;
  return acc;
}, {} as Record<`${(typeof config.abilities)[number]}-check-action-die-min`, `${(typeof config.abilities)[number]}-check-action-die-min`>);

const savingThrowKeys = config.abilities.reduce((acc, ability) => {
  const key = `${ability}-saving` as const;
  const value = `${ability}-saving-modifier` as const;
  acc[key] = value;
  return acc;
}, {} as Record<`${(typeof config.abilities)[number]}-saving`, `${(typeof config.abilities)[number]}-saving-modifier`>);

const savingRollKeys = config.abilities.reduce((acc, ability) => {
  const key = `${ability}-saving-roll` as const;
  const value = `${ability}-saving-roll-modifier` as const;
  acc[key] = value;
  return acc;
}, {} as Record<`${(typeof config.abilities)[number]}-saving-roll`, `${(typeof config.abilities)[number]}-saving-roll-modifier`>);

const savingActionDieKeys = config.abilities.reduce((acc, ability) => {
  const key = `${ability}-saving-action-die` as const;
  const value = `${ability}-saving-action-die` as const;
  acc[key] = value;
  return acc;
}, {} as Record<`${(typeof config.abilities)[number]}-saving-action-die`, `${(typeof config.abilities)[number]}-saving-action-die`>);

const savingActionDieMinKeys = config.abilities.reduce((acc, ability) => {
  const key = `${ability}-saving-action-die-min` as const;
  const value = `${ability}-saving-action-die-min` as const;
  acc[key] = value;
  return acc;
}, {} as Record<`${(typeof config.abilities)[number]}-saving-action-die-min`, `${(typeof config.abilities)[number]}-saving-action-die-min`>);

const savingThrowProficiencyKeys = config.abilities.reduce((acc, ability) => {
  const key = `${ability}-saving-proficiency` as const;
  const value = `${ability}-saving-proficiency` as const;
  acc[key] = value;
  return acc;
}, {} as Record<`${(typeof config.abilities)[number]}-saving-proficiency`, `${(typeof config.abilities)[number]}-saving-proficiency`>);

const skillKeys = (Object.keys(config.skills) as Array<keyof typeof config.skills>).reduce((acc, skill) => {
  const key = skill;
  const value = `${skill}-modifier` as const;
  acc[key] = value;
  return acc;
}, {} as Record<keyof typeof config.skills, `${keyof typeof config.skills}-modifier`>);

const skillRollKeys = (Object.keys(config.skills) as Array<keyof typeof config.skills>).reduce((acc, skill) => {
  const key = `${skill}-roll` as const;
  const value = `${skill}-roll-modifier` as const;
  acc[key] = value;
  return acc;
}, {} as Record<`${keyof typeof config.skills}-roll`, `${keyof typeof config.skills}-roll-modifier`>);

const skillActionDieKeys = (Object.keys(config.skills) as Array<keyof typeof config.skills>).reduce((acc, skill) => {
  const key = `${skill}-action-die` as const;
  const value = `${skill}-action-die` as const;
  acc[key] = value;
  return acc;
}, {} as Record<`${keyof typeof config.skills}-action-die`, `${keyof typeof config.skills}-action-die`>);

const skillActionDieMinKeys = (Object.keys(config.skills) as Array<keyof typeof config.skills>).reduce((acc, skill) => {
  const key = `${skill}-action-die-min` as const;
  const value = `${skill}-action-die-min` as const;
  acc[key] = value;
  return acc;
}, {} as Record<`${keyof typeof config.skills}-action-die-min`, `${keyof typeof config.skills}-action-die-min`>);

const skillProficiencyKeys = (Object.keys(config.skills) as Array<keyof typeof config.skills>).reduce((acc, skill) => {
  const key = `${skill}-proficiency` as const;
  const value = `${skill}-proficiency` as const;
  acc[key] = value;
  return acc;
}, {} as Record<`${keyof typeof config.skills}-proficiency`, `${keyof typeof config.skills}-proficiency`>);

const passiveSkillKeys = (Object.keys(config.skills) as Array<keyof typeof config.skills>).reduce(
  (acc, skill) => {
    const key = `${skill}-passive` as const;
    const value = `${skill}-passive` as const;
    acc[key] = value;
    return acc;
  },
  {} as Record<`${keyof typeof config.skills}-passive`, `${keyof typeof config.skills}-passive`>,
);

const spellSlotKeys = {} as Record<string, string>;
for (let i = 1; i <= 9; i++) {
  spellSlotKeys[`spell-slots-${i}`] = `spell-slots-${i}`;
  spellSlotKeys[`pact-spell-slots-${i}`] = `pact-spell-slots-${i}`;
}

const senseKeys = config.senses.reduce((acc, sense) => {
  const key = `sense-${sense}` as const;
  const value = `sense-${sense}` as const;
  acc[key] = value;
  return acc;
}, {} as Record<`sense-${(typeof config.senses)[number]}`, `sense-${(typeof config.senses)[number]}`>);

const speedKeys = config.speeds.reduce((acc, speed) => {
  const key = `${speed}-speed` as const;
  acc[key] = `${speed}-speed` as const;
  return acc;
}, {} as Record<`${(typeof config.speeds)[number]}-speed`, `${(typeof config.speeds)[number]}-speed`>);

export const defenseKeys = {
  'damage-resistances': 'damage-resistances',
  'damage-immunities': 'damage-immunities',
  'damage-vulnerabilities': 'damage-vulnerabilities',
  'condition-immunities': 'condition-immunities',
} as const;

export const proficiencyKeys = {
  languages: 'languages',
  'armor-proficiencies': 'armor-proficiencies',
  'weapon-proficiencies': 'weapon-proficiencies',
} as const;

const hitDiceKeys = config.hitDieSize.reduce((acc, size) => {
  const cleanSize = size.replace('1', ''); 
  const key = `${cleanSize}-hit-dice` as const;
  acc[key] = key;
  return acc;
}, {} as Record<string, string>);

export const effectKeys = {
  ...staticKeys,
  ...abilityKeys,
  ...abilityModifierKeys,
  ...savingThrowKeys,
  ...savingThrowProficiencyKeys,
  ...skillProficiencyKeys,
  ...skillKeys,
  ...hitDiceKeys,
  ...abilityModifierRollKeys,
  ...savingRollKeys,
  ...skillRollKeys,
  ...passiveSkillKeys,
  ...abilityModifierActionDieKeys,
  ...savingActionDieKeys,
  ...skillActionDieKeys,
  ...spellSlotKeys,
  ...senseKeys,
  ...speedKeys,
  ...defenseKeys,
  ...proficiencyKeys,
  ...abilityModifierActionDieMinKeys,
  ...savingActionDieMinKeys,
  ...skillActionDieMinKeys,
};

export type EffectKey = keyof typeof effectKeys;
export type EffectValue = (typeof effectKeys)[keyof typeof effectKeys];

export type EffectValueWithPickers =  | '$picker:0' | '$picker:1' | '$picker:2' | '$picker:3' | '$picker:4' | '$picker:5' | '$picker:6' | '$picker:7' | '$picker:8' | '$picker:9';
