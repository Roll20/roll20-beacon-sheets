import { clampLevel } from './progression.js';
import { ABILITY_IDS } from './skills.js';

export const RIDER_MODES = ['once', 'mark', 'always'];

const isObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

const normalizeDice = (dice) => {
  if (typeof dice === 'string') return dice.trim();
  if (isObject(dice) && typeof dice.column === 'string') return { column: dice.column };
  if (isObject(dice) && isObject(dice.byLevel)) {
    const byLevel = Object.fromEntries(Object.entries(dice.byLevel).filter(([k, v]) => /^lv\d+$/.test(k) && typeof v === 'string'));
    return { byLevel };
  }
  return '';
};

export const normalizeRider = (rider) => {
  if (!isObject(rider)) return null;
  const spend = rider.spend === 'uses' ? 'uses'
    : isObject(rider.spend) && Number(rider.spend.tp) > 0 ? { tp: Math.trunc(Number(rider.spend.tp)) } : '';
  return {
    dice: normalizeDice(rider.dice),
    mod: ABILITY_IDS.includes(rider.mod) ? rider.mod : '',
    type: typeof rider.type === 'string' ? rider.type : '',
    mode: RIDER_MODES.includes(rider.mode) ? rider.mode : 'once',
    kind: rider.kind === 'melee' || rider.kind === 'ranged' ? rider.kind : '',
    spend,
    pick: typeof rider.pick === 'string' ? rider.pick : '',
  };
};

export const normalizeFeatureRoll = (roll) => {
  if (!isObject(roll)) return null;
  const plus = (Array.isArray(roll.plus) ? roll.plus : isObject(roll.plus) ? Object.values(roll.plus) : [])
    .filter((p) => p === 'level' || p === 'halfLevel' || ABILITY_IDS.includes(p));
  const min = Number(roll.min);
  const lines = (Array.isArray(roll.lines) ? roll.lines : isObject(roll.lines) ? Object.values(roll.lines) : [])
    .filter(isObject)
    .map((l) => ({ label: typeof l.label === 'string' ? l.label : '', dice: normalizeDice(l.dice) }));
  return {
    dice: normalizeDice(roll.dice),
    lines,
    type: typeof roll.type === 'string' ? roll.type : '',
    plus,
    min: Number.isFinite(min) ? Math.trunc(min) : null,
    heal: roll.heal === 'self' ? 'self' : '',
    pick: typeof roll.pick === 'string' ? roll.pick : '',
  };
};

export const diceAt = (dice, { level = 1, professionStats = null } = {}) => {
  if (typeof dice === 'string') return dice;
  if (!isObject(dice)) return '';
  const l = clampLevel(level);
  if (dice.column) return professionStats?.levels?.[`lv${l}`]?.columns?.[dice.column]?.value ?? '';
  let best = '';
  let at = 0;
  for (const [k, v] of Object.entries(dice.byLevel ?? {})) {
    const step = Number(k.slice(2));
    if (step <= l && step > at) {
      at = step;
      best = v;
    }
  }
  return best;
};

const joinFormula = (dice, flat) => {
  const parts = [dice, flat ? String(flat) : ''].filter(Boolean);
  return parts.join(' + ').replace('+ -', '- ');
};

export const riderFormula = (rider, ctx = {}) => {
  const r = normalizeRider(rider);
  if (!r) return '';
  const mod = r.mod ? Math.trunc(Number(ctx.abilities?.[r.mod]) || 0) : 0;
  return joinFormula(diceAt(r.dice, ctx), mod);
};

export const featureRollFormula = (roll, ctx = {}) => {
  const r = normalizeFeatureRoll(roll);
  if (!r) return null;
  const level = clampLevel(ctx.level);
  const flat = r.plus.reduce((sum, p) => {
    if (p === 'level') return sum + level;
    if (p === 'halfLevel') return sum + Math.floor(level / 2);
    return sum + Math.trunc(Number(ctx.abilities?.[p]) || 0);
  }, 0);
  const dice = diceAt(r.dice, ctx);
  return { formula: joinFormula(dice, flat), dice, flat, min: r.min };
};

export const featureRollLines = (roll, ctx = {}) =>
  (normalizeFeatureRoll(roll)?.lines ?? [])
    .map((l) => ({ label: l.label, formula: diceAt(l.dice, ctx) }))
    .filter((l) => l.formula);

export const riderFits = (rider, attack = {}) => {
  const r = normalizeRider(rider);
  if (!r) return false;
  if (!r.kind) return true;
  return (attack.kind || 'melee') === r.kind;
};

export const riderType = (rider, attack = {}) => {
  const r = normalizeRider(rider);
  return r?.type === 'weapon' ? attack.damageType || '' : r?.type || '';
};

export const pickAllows = (part, feature) => !part?.pick || feature?.pick === part.pick;
