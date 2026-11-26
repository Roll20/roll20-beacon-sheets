import { ref } from 'vue';
import { v4 as uuid } from 'uuid';
import rollToChat from '@/utility/rollToChat';
import sendToChat from '@/utility/sendToChat';
import getRollResult from '@/utility/getRollResult';
import type { DiceComponent } from '@/rolltemplates/rolltemplates';
import type { CharacterDraft } from '@/maker/draftModel';
import type { ArteDef, AttributeKey, ClassDef, WeaponDef } from '@/maker/types';
import { ATTRIBUTE_LABELS } from '@/maker/data/attributes';
import { draftModifiers, draftDerived } from './selectors';
import { skillRows } from './proficiency';
import { weaponLine } from './weapons';
import { casterInfo } from './casting';
import { arteMechanics } from './arteMechanics';

/**
 * Roll helpers for the Play sheet. Each builds dice components and posts them to
 * Roll20 chat via rollToChat (Beacon rolls server-side in the VTT). Offline, the
 * dev relay rolls locally and we record results in `rollHistory` for the in-app log.
 */

export interface RollRecord {
  id: string;
  title: string;
  subtitle?: string;
  total: number;
  parts: string;
  time: number;
  /** Optional long text (e.g. an Arte description) shown in the in-app log. */
  note?: string;
  /** A cast/info card carries no single total - the log hides the big number. */
  kind?: 'roll' | 'cast';
}

export const rollHistory = ref<RollRecord[]>([]);

const fmt = (n: number) => (n >= 0 ? `+${n}` : `${n}`);

async function perform(
  title: string,
  subtitle: string,
  components: DiceComponent[],
  traits: string[] = [],
) {
  let total = 0;
  try {
    total = await rollToChat({ title, subtitle, traits, allowHeroDie: false, components });
  } catch {
    // Fallback if no relay/roll available, roll locally so the sheet still works.
    total = components.reduce((sum, c) => {
      if (c.sides) {
        let v = 0;
        for (let i = 0; i < (c.count ?? 1); i++) v += Math.floor(Math.random() * c.sides) + 1;
        c.value = v;
      }
      return sum + (c.value ?? 0);
    }, 0);
  }
  const parts = components
    .map((c) => `${c.label ?? ''} ${c.value ?? ''}`.trim())
    .filter(Boolean)
    .join('  -  ');
  rollHistory.value.unshift({ id: uuid(), title, subtitle, total, parts, time: Date.now() });
  if (rollHistory.value.length > 40) rollHistory.value.pop();
  return total;
}

const d20 = (bonus: number): DiceComponent[] => [
  { label: 'd20', sides: 20 },
  { label: 'Modifier', value: bonus },
];

/** Manual roll mode set from the Play sheet (normal / advantage / disadvantage). */
export type RollMode = 'normal' | 'adv' | 'dis';
export const rollMode = ref<RollMode>('normal');

/** Conditions that impose disadvantage on d20 rolls (attacks, checks, saves). */
const DISADVANTAGE_CONDITIONS = new Set([
  'Poisoned',
  'Frightened',
  'Prone',
  'Restrained',
  'Blinded',
  'Enraged',
  'Exhausted',
]);

/** Combine the manual mode with any condition-imposed disadvantage (5e cancel rule). */
function effectiveMode(draft: CharacterDraft): RollMode {
  const conditionDis = draft.play.conditions.some((c) => DISADVANTAGE_CONDITIONS.has(c));
  const manual = rollMode.value;
  if (conditionDis && manual === 'adv') return 'normal';
  if (conditionDis) return 'dis';
  return manual;
}

/** A d20 roll honouring advantage/disadvantage (manual or from conditions). */
async function d20Roll(
  draft: CharacterDraft,
  title: string,
  subtitle: string,
  bonus: number,
  traits: string[],
) {
  const mode = effectiveMode(draft);
  if (mode === 'normal') return perform(title, subtitle, d20(bonus), traits);

  // Roll a pair of d20 (Beacon server-side when available, else local).
  let a = Math.floor(Math.random() * 20) + 1;
  let b = Math.floor(Math.random() * 20) + 1;
  try {
    const res = await getRollResult([
      { label: 'd20', sides: 20 },
      { label: 'd20', sides: 20 },
    ]);
    if (typeof res.components[0]?.value === 'number') a = res.components[0].value as number;
    if (typeof res.components[1]?.value === 'number') b = res.components[1].value as number;
  } catch {
    /* keep local pair */
  }
  const kept = mode === 'adv' ? Math.max(a, b) : Math.min(a, b);
  const tag = mode === 'adv' ? 'ADV' : 'DIS';
  const components: DiceComponent[] = [
    { label: `2d20 ${mode === 'adv' ? '^' : 'v'} (${a}, ${b})`, value: kept },
    { label: 'Modifier', value: bonus },
  ];
  return perform(title, `${subtitle} - ${tag}`, components, [...traits, tag]);
}

export function rollAttribute(draft: CharacterDraft, attr: AttributeKey) {
  const bonus = draftModifiers(draft)[attr];
  return d20Roll(draft, `${ATTRIBUTE_LABELS[attr]} Check`, fmt(bonus), bonus, ['Attribute']);
}

export function rollSkill(draft: CharacterDraft, skillName: string) {
  const row = skillRows(draft).find((r) => r.name === skillName);
  const bonus = row?.bonus ?? 0;
  return d20Roll(draft, `${skillName}`, `Talent Check ${fmt(bonus)}`, bonus, ['Talent']);
}

export function rollSave(draft: CharacterDraft, group: 'Body' | 'Mind' | 'Soul' | 'Concentration') {
  const s = draftDerived(draft).saves;
  const bonus =
    group === 'Body'
      ? s.body
      : group === 'Mind'
      ? s.mind
      : group === 'Soul'
      ? s.soul
      : s.concentration;
  return d20Roll(draft, `${group} Saving Throw`, fmt(bonus), bonus, ['Save']);
}

export function rollInitiative(draft: CharacterDraft) {
  const bonus = draftModifiers(draft).instinct;
  return d20Roll(draft, 'Initiative', fmt(bonus), bonus, ['Initiative']);
}

export function rollDeathSave() {
  return perform('Death Saving Throw', 'DC 10', [{ label: 'd20', sides: 20 }], ['Death']);
}

export function rollHitDie(cls: ClassDef, draft: CharacterDraft) {
  const conMod = draftModifiers(draft);
  const heal = Math.max(conMod.might, conMod.conviction);
  return perform(
    `Hit Die (1d${cls.hitDie})`,
    `Quick Rest heal ${fmt(heal)}`,
    [
      { label: `d${cls.hitDie}`, sides: cls.hitDie },
      { label: 'Recovery', value: heal },
    ],
    ['Rest'],
  );
}

function parseDamage(dmg: string): { count: number; sides: number; flat: number } | null {
  const m = /^(\d*)d(\d+)\s*([+-]\s*\d+)?/.exec(dmg.replace(/\s/g, ''));
  if (!m) return null;
  return {
    count: m[1] ? Number(m[1]) : 1,
    sides: Number(m[2]),
    flat: m[3] ? Number(m[3].replace(/\s/g, '')) : 0,
  };
}

export function rollWeaponAttack(draft: CharacterDraft, weapon: WeaponDef) {
  const wl = weaponLine(draft, weapon);
  return d20Roll(
    draft,
    `${weapon.name} - Attack`,
    `${wl.attribute} ${wl.attackText}`,
    wl.attackBonus,
    ['Attack'],
  );
}

export function rollWeaponDamage(draft: CharacterDraft, weapon: WeaponDef) {
  const wl = weaponLine(draft, weapon);
  const mod = draftModifiers(draft)[wl.attribute === 'Instinct' ? 'instinct' : 'might'];
  const parsed = parseDamage(weapon.damage);
  const components: DiceComponent[] = parsed
    ? [
        { label: `${parsed.count}d${parsed.sides}`, sides: parsed.sides, count: parsed.count },
        { label: 'Modifier', value: mod + parsed.flat },
      ]
    : [{ label: 'Damage', value: mod }];
  return perform(`${weapon.name}, Damage`, weapon.damageTypes, components, ['Damage']);
}

export function rollArteAttack(draft: CharacterDraft) {
  const ci = casterInfo(draft);
  return d20Roll(
    draft,
    'Arte Attack',
    `${fmt(ci.arteAttack)} - Save DC ${ci.arteSaveDC}`,
    ci.arteAttack,
    ['Arte'],
  );
}

// --- Casting an Arte: posts the full description card + the rolls it calls for ---

/**
 * Cast an Arte: post a rich description card to Roll20 chat (Tier, Aether, Range,
 * Cast time, Duration, Save DC / Attack), then auto-roll the attack and any effect
 * dice the text calls for. Everything is also recorded in the in-app log.
 */
export async function castArte(draft: CharacterDraft, arte: ArteDef) {
  const ci = casterInfo(draft);
  const { attack, save, dice, heals } = arteMechanics(arte);
  const tierLabel = arte.tier === 0 ? 'Cantrip' : `Tier ${arte.tier}`;

  const keyValues: Record<string, string> = { Tier: tierLabel, Aether: String(arte.aetherCost) };
  if (arte.range) keyValues.Range = arte.range;
  if (arte.castingTime) keyValues.Cast = arte.castingTime;
  if (arte.duration) keyValues.Duration = arte.duration;
  if (attack) keyValues.Attack = fmt(ci.arteAttack);
  if (save)
    keyValues.Save = save === 'Save' ? `DC ${ci.arteSaveDC}` : `${save} Save DC ${ci.arteSaveDC}`;

  // 1) The Arte description card to chat.
  try {
    await sendToChat({
      title: arte.name,
      subtitle: `${tierLabel} Arte - ${arte.school}`,
      keyValues,
      textContent: arte.description,
      traits: arte.sources,
    });
  } catch {
    /* offline / no relay - still recorded in the in-app log below */
  }

  // In-app cast entry (so the description is visible standalone, not just in Roll20).
  const facts = [
    `${arte.aetherCost} Aether`,
    arte.range,
    attack ? `Attack ${keyValues.Attack}` : '',
    save ? keyValues.Save : '',
  ]
    .filter(Boolean)
    .join('  -  ');
  rollHistory.value.unshift({
    id: uuid(),
    title: `✦ ${arte.name}`,
    subtitle: `${tierLabel} - ${arte.school}`,
    total: 0,
    parts: facts,
    note: arte.description,
    kind: 'cast',
    time: Date.now(),
  });
  if (rollHistory.value.length > 40) rollHistory.value.pop();

  // 2) Attack roll, if this Arte calls for one.
  if (attack)
    await d20Roll(draft, `${arte.name} - Attack`, 'Arte Attack', ci.arteAttack, ['Arte', 'Attack']);

  // 3) Effect dice (damage / healing) found in the text.
  if (dice) {
    await perform(
      `${arte.name} - ${heals ? 'Healing' : 'Damage'}`,
      `${dice.count}d${dice.sides}`,
      [{ label: `${dice.count}d${dice.sides}`, sides: dice.sides, count: dice.count }],
      ['Arte', heals ? 'Healing' : 'Damage'],
    );
  }
}
