/**
 * Chat output for Crucible entities: initiative, attacks, damage, saves, talents,
 * Artes, healing, recharge, phase transitions, loot, and GM notes.
 *
 * Everything routes through the existing Beacon utilities (rollToChat/sendToChat ->
 * dispatch.roll/dispatch.post) and the convergence roll templates, so a Crucible
 * roll card looks native next to a Thread of Fate PC's card.
 *
 * Output rules:
 *  - entity.roll20.defaultOutput 'gmWhisper' whispers everything to the GM.
 *  - concealName swaps the printed name for concealedAs.
 *  - hideMechanics drops DCs and to-hit maths from public cards.
 *  - gmOnly actions always whisper.
 */

import { createRollTemplate, type DiceComponent } from '@/rolltemplates/rolltemplates';
import { dispatchRef, initValues } from '@/relay/relay';
import type { Dispatch } from '@roll20-official/beacon-sdk';
import getRollResult from '@/utility/getRollResult';

import type { CrucibleEntitySchema } from '@/crucible/schemas/crucibleEntity.schema';
import { allActions } from '@/crucible/schemas/crucibleEntity.schema';
import type { CrucibleActionInstance } from '@/crucible/schemas/crucibleAction.schema';
import { SAVE_LABELS } from '@/crucible/schemas/crucibleCommon';
import type { CruciblePhase } from '@/crucible/schemas/cruciblePhase.schema';
import { arteById } from '@/maker/data';
import { fillPlaceholders, rollLine, areaLine } from './formatStatblock';
import { talentAttribute } from './computeCrucibleDerived';

export interface CrucibleRollOptions {
  /** Force a whisper regardless of the entity default. */
  whisper?: boolean;
  /** Force a secret GM roll (hidden even from the roller's log where supported). */
  secret?: boolean;
  customDispatch?: Dispatch;
}

interface PostArgs {
  entity: CrucibleEntitySchema;
  html: string;
  options: CrucibleRollOptions;
  gmOnly?: boolean;
}

const displayName = (entity: CrucibleEntitySchema): string =>
  entity.roll20.concealName && entity.roll20.concealedAs
    ? entity.roll20.concealedAs
    : entity.identity.name || 'Unknown Creature';

const shouldWhisper = (
  entity: CrucibleEntitySchema,
  options: CrucibleRollOptions,
  gmOnly?: boolean,
) => Boolean(options.whisper || gmOnly || entity.roll20.defaultOutput === 'gmWhisper');

async function post({ entity, html, options, gmOnly }: PostArgs) {
  const dispatch = options.customDispatch || (dispatchRef.value as Dispatch);
  await dispatch.post({
    characterId: initValues.character.id,
    content: html,
    options: {
      whisper: shouldWhisper(entity, options, gmOnly) ? 'gm' : undefined,
      secret: options.secret || undefined,
    },
  });
}

async function rollAndPost(
  entity: CrucibleEntitySchema,
  parameters: {
    title: string;
    subtitle?: string;
    keyValues?: Record<string, string | number | boolean>;
    textContent?: string | string[];
    traits?: string[];
    components: DiceComponent[];
  },
  options: CrucibleRollOptions,
  gmOnly?: boolean,
): Promise<number> {
  const dispatch = options.customDispatch || (dispatchRef.value as Dispatch);
  const { components, total } = await getRollResult(parameters.components, dispatch);
  const html = createRollTemplate({
    type: 'roll',
    parameters: {
      characterName: displayName(entity),
      ...parameters,
      components,
    },
  });
  await post({ entity, html, options, gmOnly });
  return total;
}

async function chatCard(
  entity: CrucibleEntitySchema,
  parameters: {
    title: string;
    subtitle?: string;
    keyValues?: Record<string, string | number | boolean>;
    textContent?: string | string[];
    traits?: string[];
  },
  options: CrucibleRollOptions,
  gmOnly?: boolean,
) {
  const html = createRollTemplate({
    type: 'chat',
    parameters: { characterName: displayName(entity), ...parameters },
  });
  await post({ entity, html, options, gmOnly });
}

// ---------------------------------------------------------------------------
// Rolls
// ---------------------------------------------------------------------------

export async function crucibleRollInitiative(
  entity: CrucibleEntitySchema,
  options: CrucibleRollOptions = {},
): Promise<number> {
  return rollAndPost(
    entity,
    {
      title: 'Initiative',
      subtitle: displayName(entity),
      components: [
        { sides: 20, count: 1, label: 'd20' },
        { label: 'Instinct', value: entity.derived.initiative, alwaysShowInBreakdown: true },
      ],
    },
    options,
  );
}

export async function crucibleRollTalent(
  entity: CrucibleEntitySchema,
  talentId: string,
  options: CrucibleRollOptions = {},
): Promise<number> {
  const bonus =
    entity.derived.talentBonuses[talentId] ??
    entity.derived.modifiers[talentAttribute(talentId)] ??
    0;
  return rollAndPost(
    entity,
    {
      title: `${talentId} Check`,
      components: [
        { sides: 20, count: 1, label: 'd20' },
        { label: talentId, value: bonus, alwaysShowInBreakdown: true },
      ],
    },
    options,
  );
}

export async function crucibleRollSave(
  entity: CrucibleEntitySchema,
  save: 'body' | 'mind' | 'soul',
  options: CrucibleRollOptions = {},
): Promise<number> {
  return rollAndPost(
    entity,
    {
      title: `${SAVE_LABELS[save]} Save`,
      components: [
        { sides: 20, count: 1, label: 'd20' },
        {
          label: `${SAVE_LABELS[save]} Save`,
          value: entity.derived.saves[save],
          alwaysShowInBreakdown: true,
        },
      ],
    },
    options,
  );
}

/** Attack roll for an action; damage follows on a second card. */
export async function crucibleUseAction(
  entity: CrucibleEntitySchema,
  actionId: string,
  options: CrucibleRollOptions = {},
): Promise<void> {
  const action = allActions(entity).find((a) => a.id === actionId);
  if (!action) return;

  const hide = entity.roll20.hideMechanics;
  const keyValues: Record<string, string | number | boolean> = {};
  if (action.actionPointCost) keyValues['AP'] = action.actionPointCost;
  if (action.recharge)
    keyValues['Recharge'] = `${action.recharge.min}${
      action.recharge.min < action.recharge.die ? `-${action.recharge.die}` : ''
    }`;
  if (action.area) keyValues['Area'] = areaLine(action);
  if (!hide && action.roll.type === 'save') keyValues['Save'] = rollLine(action, entity);

  const description = fillPlaceholders(action.description, entity);
  const effectLines = action.effects.map((e) =>
    [e.description || `${e.kind}: ${e.value}`, e.duration ? `(${e.duration})` : '']
      .filter(Boolean)
      .join(' '),
  );

  // Multiattack: post the card, then run each referenced action.
  if (action.multiattackOf?.length) {
    await chatCard(
      entity,
      { title: action.name, keyValues, textContent: [description, ...effectLines].filter(Boolean) },
      options,
      action.gmOnly,
    );
    for (const subId of action.multiattackOf) {
      await crucibleUseAction(entity, subId, options);
    }
    return;
  }

  if (action.roll.type === 'attack') {
    const attrMod = entity.derived.modifiers[action.roll.ability] ?? 0;
    const pb = action.roll.bonusFormula.includes('pb') ? entity.derived.proficiencyBonus : 0;
    const extra = /\+(\d+)$/.exec(action.roll.bonusFormula);
    await rollAndPost(
      entity,
      {
        title: action.name,
        subtitle: hide ? undefined : rollLine(action, entity),
        keyValues,
        textContent: [description, ...effectLines].filter(Boolean),
        components: [
          { sides: 20, count: 1, label: 'd20' },
          { label: 'Attribute', value: attrMod, alwaysShowInBreakdown: true },
          { label: 'Proficiency', value: pb, alwaysShowInBreakdown: true },
          ...(extra ? [{ label: 'Bonus', value: Number(extra[1]) }] : []),
        ],
      },
      options,
      action.gmOnly,
    );
  } else {
    await chatCard(
      entity,
      {
        title: action.name,
        subtitle: hide || action.roll.type === 'automatic' ? undefined : rollLine(action, entity),
        keyValues,
        textContent: [description, ...effectLines].filter(Boolean),
      },
      options,
      action.gmOnly,
    );
  }

  if (action.damage?.length) await crucibleRollDamage(entity, action, options);
  if (action.healing?.length) await crucibleApplyHealing(entity, action, options);
}

export async function crucibleRollDamage(
  entity: CrucibleEntitySchema,
  action: CrucibleActionInstance,
  options: CrucibleRollOptions = {},
): Promise<number> {
  const components: DiceComponent[] = [];
  for (const d of action.damage ?? []) {
    components.push({ sides: d.die, count: d.count, label: d.damageType });
    const abilityMod = d.abilityBonus ? entity.derived.modifiers[d.abilityBonus] ?? 0 : 0;
    const flat = d.flat + abilityMod;
    if (flat)
      components.push({ label: `${d.damageType} bonus`, value: flat, alwaysShowInBreakdown: true });
  }
  return rollAndPost(
    entity,
    {
      title: `${action.name} - Damage`,
      traits: [...new Set((action.damage ?? []).map((d) => d.damageType))],
      components,
    },
    options,
    action.gmOnly,
  );
}

export async function crucibleApplyHealing(
  entity: CrucibleEntitySchema,
  action: CrucibleActionInstance,
  options: CrucibleRollOptions = {},
): Promise<number> {
  const components: DiceComponent[] = [];
  for (const h of action.healing ?? []) {
    if (h.count > 0)
      components.push({ sides: h.die, count: h.count, label: h.temporary ? 'Temp HP' : 'Healing' });
    const abilityMod = h.abilityBonus ? entity.derived.modifiers[h.abilityBonus] ?? 0 : 0;
    const flat = h.flat + abilityMod;
    if (flat) components.push({ label: 'Bonus', value: flat, alwaysShowInBreakdown: true });
  }
  return rollAndPost(
    entity,
    { title: `${action.name} - Healing`, components },
    options,
    action.gmOnly,
  );
}

/** Show a save DC (optionally hidden from players). */
export async function crucibleShowSaveDc(
  entity: CrucibleEntitySchema,
  options: CrucibleRollOptions = {},
): Promise<void> {
  await chatCard(
    entity,
    {
      title: 'Save DC',
      keyValues: {
        'Effect DC': entity.derived.effectSaveDc,
        ...(entity.magic.isCaster ? { 'Arte DC': entity.derived.arteSaveDc } : {}),
      },
    },
    { ...options, whisper: options.whisper ?? entity.roll20.hideMechanics },
  );
}

/** Cast an Arte from the maker's Arte list, spending nothing (GM resource calls). */
export async function crucibleCastArte(
  entity: CrucibleEntitySchema,
  arteId: string,
  options: CrucibleRollOptions = {},
): Promise<void> {
  const arte = arteById[arteId];
  if (!arte) return;
  await chatCard(
    entity,
    {
      title: arte.name,
      subtitle: `Tier ${arte.tier} - ${arte.school}`,
      keyValues: {
        Aether: arte.aetherCost,
        Range: arte.range,
        Cast: arte.castingTime,
        Duration: arte.duration,
        ...(entity.roll20.hideMechanics
          ? {}
          : {
              'Arte DC': entity.derived.arteSaveDc,
              'Arte Attack': `+${entity.derived.arteAttack}`,
            }),
      },
      textContent: arte.description,
      traits: arte.sources,
    },
    options,
  );
}

/** Roll recharge dice for every spent recharge action; returns which came back. */
export async function crucibleRecharge(
  entity: CrucibleEntitySchema,
  spentActionIds: string[],
  options: CrucibleRollOptions = {},
): Promise<Record<string, boolean>> {
  const recovered: Record<string, boolean> = {};
  for (const id of spentActionIds) {
    const action = allActions(entity).find((a) => a.id === id);
    if (!action?.recharge) continue;
    const total = await rollAndPost(
      entity,
      {
        title: `Recharge - ${action.name}`,
        subtitle: `Recharges on ${action.recharge.min}+`,
        components: [{ sides: action.recharge.die, count: 1, label: `d${action.recharge.die}` }],
      },
      { ...options, whisper: true },
    );
    recovered[id] = total >= action.recharge.min;
  }
  return recovered;
}

/** Announce a phase transition; the GM-only notes whisper separately. */
export async function cruciblePhaseTransition(
  entity: CrucibleEntitySchema,
  phase: CruciblePhase,
  options: CrucibleRollOptions = {},
): Promise<void> {
  await chatCard(
    entity,
    {
      title: `${displayName(entity)} - ${phase.name}`,
      textContent: phase.transitionText || 'The fight changes.',
    },
    options,
  );
  if (phase.gmOnlyNotes) {
    await chatCard(
      entity,
      { title: `${phase.name} (GM)`, textContent: phase.gmOnlyNotes },
      { ...options, whisper: true },
      true,
    );
  }
}

/** Whisper the loot table to the GM. */
export async function crucibleLootCard(
  entity: CrucibleEntitySchema,
  options: CrucibleRollOptions = {},
): Promise<void> {
  const lines = [
    entity.loot.currency,
    ...entity.loot.entries.map(
      (l) =>
        `${l.name} - ${l.chance}%${l.quantity ? `, ${l.quantity}` : ''}${
          l.rarity ? ` (${l.rarity})` : ''
        }`,
    ),
    entity.loot.notes,
  ].filter(Boolean);
  await chatCard(
    entity,
    {
      title: `Loot - ${entity.identity.name}`,
      textContent: lines.length ? lines : ['No loot recorded.'],
    },
    { ...options, whisper: true },
    true,
  );
}

/** Whisper the entity's GM notes. */
export async function crucibleGmNote(
  entity: CrucibleEntitySchema,
  options: CrucibleRollOptions = {},
): Promise<void> {
  await chatCard(
    entity,
    {
      title: `GM - ${entity.identity.name}`,
      textContent: entity.identity.gmNotes || 'No GM notes.',
    },
    { ...options, whisper: true },
    true,
  );
}

/** Post the encounter threat report as a whispered GM card. */
export async function crucibleThreatReport(
  entity: CrucibleEntitySchema,
  reportText: string,
  options: CrucibleRollOptions = {},
): Promise<void> {
  await chatCard(
    entity,
    { title: 'Encounter Threat Report', textContent: reportText.split('\n') },
    { ...options, whisper: true },
    true,
  );
}

/** Description-only card for defenses/senses (the "Defenses" token action). */
export async function crucibleShowDefenses(
  entity: CrucibleEntitySchema,
  options: CrucibleRollOptions = {},
): Promise<void> {
  const d = entity.derived;
  await chatCard(
    entity,
    {
      title: displayName(entity),
      keyValues: {
        AC: `${d.armorClass} (${d.armorClassSource})`,
        HP: d.hitPoints,
        ...(entity.roll20.hideMechanics
          ? {}
          : {
              'Body Save': d.saves.body,
              'Mind Save': d.saves.mind,
              'Soul Save': d.saves.soul,
            }),
      },
      traits: [
        ...entity.defenses.resistances.map((r) => `Resist: ${r}`),
        ...entity.defenses.immunities.map((r) => `Immune: ${r}`),
        ...entity.defenses.conditionImmunities.map((r) => `Cond. Immune: ${r}`),
      ],
    },
    options,
    entity.roll20.hideMechanics,
  );
}
