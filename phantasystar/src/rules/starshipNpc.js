import { ABILITIES } from './skills.js';

const int = (v) => Math.trunc(Number(v) || 0);

export const NPC_SHIP_ABILITIES = [
  { id: 'pilotDex', label: 'P-DEX', role: 'Pilot', ability: 'dexterity' },
  { id: 'pilotWis', label: 'P-WIS', role: 'Pilot', ability: 'wisdom' },
  { id: 'techInt', label: 'T-INT', role: 'Technician', ability: 'intelligence' },
  { id: 'techWis', label: 'T-WIS', role: 'Technician', ability: 'wisdom' },
  { id: 'gunnerDex', label: 'G-DEX', role: 'Gunner', ability: 'dexterity' },
  { id: 'gunnerWis', label: 'G-WIS', role: 'Gunner', ability: 'wisdom' },
];

export const NPC_SHIP_ABILITY_IDS = NPC_SHIP_ABILITIES.map((a) => a.id);

export const getNpcShipAbility = (id) =>
  NPC_SHIP_ABILITIES.find((a) => a.id === id) ?? null;

export const npcShipAbilityTitle = (id) => {
  const entry = getNpcShipAbility(id);
  if (!entry) return '';
  const ability = ABILITIES.find((a) => a.id === entry.ability)?.name ?? entry.ability;
  return `${entry.role}'s ${ability}`;
};

export const npcShipAbilityText = (mod) =>
  `${int(mod) >= 0 ? '+' : '\u2212'}${Math.abs(int(mod))}`;

export const npcManeuverSaveDC = (pilotingBonus) => 8 + int(pilotingBonus);
