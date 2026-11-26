/**
 * Statblock rendering. One formatter drives the on-screen preview, the plain-text
 * export, the markdown export, and the printable GM card, so they can never drift.
 *
 * Field order follows Design/Convergence TTRPG Rules/Convergence Bestiary Template.md
 * and the directive's statblock spec. Attributes print in the Bestiary's header
 * order (Might, Instinct, Conviction, Focus, Resonance, Presence), which differs
 * from the engine's internal AttributeKey order - see docs/CRUCIBLE_AUDIT.md section 3.
 */

import type { CrucibleEntitySchema } from '@/crucible/schemas/crucibleEntity.schema';
import type { CrucibleActionInstance } from '@/crucible/schemas/crucibleAction.schema';
import {
  STATBLOCK_ATTRIBUTE_ORDER,
  SAVE_LABELS,
  SAVE_IDS,
} from '@/crucible/schemas/crucibleCommon';
import { ATTRIBUTES } from '@/maker/data/attributes';
import { sizeOrDefault } from '@/crucible/data/registries/creatureSizes.registry';
import { roleById } from '@/crucible/data/registries/creatureRoles.registry';
import { effectiveSpeeds } from './computeCrucibleDerived';

const sign = (n: number) => (n >= 0 ? `+${n}` : `${n}`);
const ATTR_LABEL = Object.fromEntries(ATTRIBUTES.map((a) => [a.key, a.label]));

export interface StatblockSection {
  heading: string;
  /** Simple lines, e.g. "Armor Class: 17 (Toughened Hide)". */
  lines: string[];
  /** Named entries, used for traits and actions. */
  entries?: { name: string; body: string; note?: string; gmOnly?: boolean }[];
  /** Hide from players when the sheet is set to conceal mechanics. */
  gmOnly?: boolean;
}

/** Fill {{dc}}, {{pb}}, {{name}}, {{tr}} placeholders in registry text. */
export function fillPlaceholders(text: string, entity: CrucibleEntitySchema): string {
  return text
    .replace(/\{\{\s*name\s*\}\}/g, entity.identity.name || 'the creature')
    .replace(/\{\{\s*dc\s*\}\}/g, String(entity.derived.effectSaveDc))
    .replace(/\{\{\s*pb\s*\}\}/g, String(entity.derived.proficiencyBonus))
    .replace(/\{\{\s*tr\s*\}\}/g, String(entity.progression.threatRating));
}

/** The header line under the name, e.g. "Large Beast (Primordial), Bruiser". */
export function subtitleLine(entity: CrucibleEntitySchema): string {
  const size = sizeOrDefault(entity.classification.sizeId).name;
  const tags = entity.classification.tagIds.join(', ');
  return [size, tags].filter(Boolean).join(' ');
}

export function speedLine(entity: CrucibleEntitySchema): string {
  const speeds = effectiveSpeeds(entity);
  const parts: string[] = [];
  if (speeds.ground) parts.push(`${speeds.ground} ft.`);
  if (speeds.climb) parts.push(`climb ${speeds.climb} ft.`);
  if (speeds.swim) parts.push(`swim ${speeds.swim} ft.`);
  if (speeds.fly) parts.push(`fly ${speeds.fly} ft.${entity.movement.hover ? ' (hover)' : ''}`);
  if (speeds.burrow) parts.push(`burrow ${speeds.burrow} ft.`);
  for (const [name, value] of Object.entries(entity.movement.other)) {
    if (value) parts.push(`${name} ${value} ft.`);
  }
  return parts.join(', ') || '0 ft.';
}

/** Damage as printed, e.g. "8 (1d8 + 4) Bludgeoning damage". */
export function damageLine(action: CrucibleActionInstance, entity: CrucibleEntitySchema): string {
  if (!action.damage?.length) return '';
  return action.damage
    .map((d) => {
      const abilityMod = d.abilityBonus ? entity.derived.modifiers[d.abilityBonus] ?? 0 : 0;
      const flat = d.flat + abilityMod;
      const average = Math.floor(d.count * ((d.die + 1) / 2) + flat);
      const formula = `${d.count}d${d.die}${
        flat ? ` ${flat > 0 ? '+' : '-'} ${Math.abs(flat)}` : ''
      }`;
      const conditional = d.condition ? ` if ${d.condition}` : '';
      const onSave =
        d.onSave === 'half'
          ? ', half on a successful save'
          : d.onSave === 'none'
          ? ', none on a successful save'
          : '';
      return `${average} (${formula}) ${d.damageType} damage${conditional}${onSave}`;
    })
    .join(', plus ');
}

/** The to-hit / DC clause for an action. */
export function rollLine(action: CrucibleActionInstance, entity: CrucibleEntitySchema): string {
  const pb = entity.derived.proficiencyBonus;
  switch (action.roll.type) {
    case 'attack': {
      const attrMod = entity.derived.modifiers[action.roll.ability] ?? 0;
      const extra = /\+(\d+)$/.exec(action.roll.bonusFormula);
      const bonus =
        attrMod +
        (action.roll.bonusFormula.includes('pb') ? pb : 0) +
        (extra ? Number(extra[1]) : 0);
      const kind = action.range?.kind === 'ranged' ? 'Ranged' : 'Melee';
      const reach =
        action.range?.kind === 'ranged'
          ? `range ${action.range.value}${action.range.long ? `/${action.range.long}` : ''} ft.`
          : `reach ${action.range?.value ?? 5} ft.`;
      const target =
        action.targeting.mode === 'multipleTargets'
          ? `${action.targeting.count ?? 2} Targets`
          : action.targeting.mode === 'area'
          ? 'All in area'
          : 'One Target';
      return `${kind} Attack: ${sign(bonus)} to hit, ${reach}, ${target}`;
    }
    case 'save': {
      const base = entity.derived.effectSaveDc;
      const extra = /\+(\d+)$/.exec(action.roll.dcFormula);
      const dc =
        (action.roll.dcFormula.startsWith('arteDc') ? entity.derived.arteSaveDc : base) +
        (extra ? Number(extra[1]) : 0);
      return `DC ${dc} ${SAVE_LABELS[action.roll.save]} Saving Throw`;
    }
    case 'opposed':
      return `Contested ${action.roll.attackerTalent} against the target's ${action.roll.defenderTalent}`;
    default:
      return '';
  }
}

export function areaLine(action: CrucibleActionInstance): string {
  if (!action.area) return '';
  const { shape, size, width } = action.area;
  if (shape === 'line') return `${size}-foot line${width ? `, ${width} feet wide` : ''}`;
  return `${size}-foot ${shape}`;
}

/** One action rendered as name + body, ready for print or chat. */
export function formatAction(
  action: CrucibleActionInstance,
  entity: CrucibleEntitySchema,
): { name: string; body: string; note?: string; gmOnly?: boolean } {
  const qualifiers: string[] = [];
  if (action.actionPointCost) qualifiers.push(`${action.actionPointCost} AP`);
  if (action.recharge) {
    qualifiers.push(
      action.recharge.min === action.recharge.die
        ? `Recharge ${action.recharge.min}`
        : `Recharge ${action.recharge.min}-${action.recharge.die}`,
    );
  }
  if (action.uses)
    qualifiers.push(
      `${action.uses.count}/${action.uses.per
        .replace(/([A-Z])/g, ' $1')
        .toLowerCase()
        .trim()}`,
    );

  const bodyParts = [
    rollLine(action, entity),
    areaLine(action),
    damageLine(action, entity) ? `Hit: ${damageLine(action, entity)}` : '',
    fillPlaceholders(action.description, entity),
    ...action.effects.map((e) =>
      [e.description || `${e.kind}: ${e.value}`, e.duration ? `(${e.duration})` : '']
        .filter(Boolean)
        .join(' '),
    ),
    ...(action.healing ?? []).map((h) => {
      const abilityMod = h.abilityBonus ? entity.derived.modifiers[h.abilityBonus] ?? 0 : 0;
      const flat = h.flat + abilityMod;
      const average = Math.floor(h.count * ((h.die + 1) / 2) + flat);
      return `Restores ${average} (${h.count}d${h.die}${flat ? ` + ${flat}` : ''}) ${
        h.temporary ? 'temporary hit points' : 'hit points'
      }.`;
    }),
  ].filter(Boolean);

  return {
    name: qualifiers.length ? `${action.name} (${qualifiers.join(', ')})` : action.name,
    body: bodyParts.join('\n'),
    gmOnly: action.gmOnly,
  };
}

// ---------------------------------------------------------------------------
// Sections
// ---------------------------------------------------------------------------

export function statblockSections(entity: CrucibleEntitySchema): StatblockSection[] {
  const d = entity.derived;
  const sections: StatblockSection[] = [];

  const roleNames = entity.classification.roleIds
    .map((r) => roleById[r]?.name ?? r)
    .filter(Boolean);

  sections.push({
    heading: 'Header',
    lines: [
      `Role(s): ${roleNames.join(', ') || '-'}`,
      `Threat Rating: ${entity.progression.threatRating}`,
      `Proficiency Bonus: ${sign(d.proficiencyBonus)}`,
      '',
      `Armor Class: ${d.armorClass} (${d.armorClassSource})`,
      `Hit Points: ${d.hitPoints} (${d.hitPointsFormula})`,
      `Speed: ${speedLine(entity)}`,
      `Initiative: ${sign(d.initiative)}`,
      `Action Points: ${d.actionPoints}`,
    ],
  });

  sections.push({
    heading: 'Attributes',
    lines: [
      STATBLOCK_ATTRIBUTE_ORDER.map((k) => ATTR_LABEL[k] ?? k).join(' | '),
      STATBLOCK_ATTRIBUTE_ORDER.map(
        (k) => `${entity.attributes[k]} (${sign(d.modifiers[k])})`,
      ).join('  '),
    ],
  });

  sections.push({
    heading: 'Saving Throws',
    lines: [SAVE_IDS.map((s) => `${SAVE_LABELS[s]} Save ${sign(d.saves[s])}`).join(', ')],
  });

  const talents = Object.entries(d.talentBonuses);
  if (talents.length) {
    sections.push({
      heading: 'Talents',
      lines: [talents.map(([name, bonus]) => `${name} ${sign(bonus)}`).join(', ')],
    });
  }

  const defenceLines: string[] = [];
  if (entity.defenses.vulnerabilities.length)
    defenceLines.push(`Vulnerabilities: ${entity.defenses.vulnerabilities.join(', ')}`);
  if (entity.defenses.resistances.length)
    defenceLines.push(`Damage Resistances: ${entity.defenses.resistances.join(', ')}`);
  if (entity.defenses.immunities.length)
    defenceLines.push(`Damage Immunities: ${entity.defenses.immunities.join(', ')}`);
  if (entity.defenses.conditionImmunities.length)
    defenceLines.push(`Condition Immunities: ${entity.defenses.conditionImmunities.join(', ')}`);
  if (entity.defenses.regeneration)
    defenceLines.push(`Regeneration: ${entity.defenses.regeneration} per round`);
  if (entity.defenses.temporaryHitPoints)
    defenceLines.push(`Temporary Hit Points: ${entity.defenses.temporaryHitPoints}`);
  if (defenceLines.length) sections.push({ heading: 'Defenses', lines: defenceLines });

  const senses = [...entity.senses.entries, `passive Perception ${d.passivePerception}`];
  sections.push({
    heading: 'Senses',
    lines: [senses.join(', '), `Languages: ${entity.classification.languages.join(', ') || '-'}`],
  });

  if (entity.magic.isCaster) {
    sections.push({
      heading: 'Artes',
      lines: [
        `${entity.magic.casterType}, ${entity.magic.sources.join('/') || 'Arcane'} source`,
        `Aether ${d.aether} | Max Arte Tier ${d.maxArteTier} | Arte Save DC ${
          d.arteSaveDc
        } | Arte Attack ${sign(d.arteAttack)}`,
        entity.magic.innateNote,
      ].filter(Boolean),
    });
  }

  if (entity.traits.length) {
    sections.push({
      heading: 'Traits',
      lines: [],
      entries: entity.traits.map((t) => ({
        name: t.uses ? `${t.name} (${t.uses.count}/${t.uses.per})` : t.name,
        body: fillPlaceholders(t.description, entity),
        gmOnly: t.gmOnly,
      })),
    });
  }

  const actionSections: [string, CrucibleActionInstance[]][] = [
    ['Core Actions', entity.actions],
    ['Quick Actions', entity.quickActions],
    ['Reactions', entity.reactions],
    ['Apex Actions', entity.apexActions],
    ['Overture Actions', entity.overtureActions],
  ];
  for (const [heading, list] of actionSections) {
    if (!list.length) continue;
    sections.push({
      heading,
      lines: [],
      entries: list.map((a) => formatAction(a, entity)),
    });
  }

  if (entity.boss?.phases.length) {
    sections.push({
      heading: 'Phases',
      lines: [],
      gmOnly: true,
      entries: entity.boss.phases.map((p) => ({
        name: `${p.order}. ${p.name}`,
        body: [
          triggerText(p.trigger),
          p.transitionText,
          p.addedActions.length ? `Gains: ${p.addedActions.length} action(s)` : '',
          p.gmOnlyNotes ?? '',
        ]
          .filter(Boolean)
          .join('\n'),
        gmOnly: true,
      })),
    });
  }

  if (entity.loot.entries.length || entity.loot.currency || entity.loot.notes) {
    sections.push({
      heading: 'Loot',
      lines: [
        entity.loot.currency,
        ...entity.loot.entries.map(
          (l) => `${l.name} (${l.chance}%${l.quantity ? `, ${l.quantity}` : ''})`,
        ),
        entity.loot.notes,
      ].filter(Boolean),
      gmOnly: true,
    });
  }

  const behaviour = entity.monster?.combatProfile;
  if (behaviour) {
    const lines = [
      behaviour.openingMove ? `Opening: ${behaviour.openingMove}` : '',
      behaviour.standardTurn ? `Standard turn: ${behaviour.standardTurn}` : '',
      behaviour.bloodiedBehavior ? `Bloodied: ${behaviour.bloodiedBehavior}` : '',
      behaviour.retreatBehavior ? `Retreat: ${behaviour.retreatBehavior}` : '',
      behaviour.morale != null ? `Morale: ${behaviour.morale}/10` : '',
      ...(entity.monster?.weaknessClues ?? []).map((c) => `Clue: ${c}`),
    ].filter(Boolean);
    if (lines.length) sections.push({ heading: 'Behavior', lines, gmOnly: true });
  }

  return sections;
}

function triggerText(trigger: {
  type: string;
  value?: number;
  round?: number;
  resourceId?: string;
}): string {
  switch (trigger.type) {
    case 'hpThreshold':
      return `Triggers at ${trigger.value}% hit points.`;
    case 'roundStart':
      return `Triggers at the start of round ${trigger.round}.`;
    case 'resourceEmpty':
      return `Triggers when ${trigger.resourceId} is spent.`;
    case 'death':
      return 'Triggers on death.';
    default:
      return 'Triggered manually by the Storyteller.';
  }
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export interface FormatOptions {
  /** Drop GM-only sections and entries. */
  playerSafe?: boolean;
}

export function formatStatblockText(
  entity: CrucibleEntitySchema,
  options: FormatOptions = {},
): string {
  const out: string[] = [entity.identity.name || 'Unnamed', subtitleLine(entity), ''];
  for (const section of statblockSections(entity)) {
    if (options.playerSafe && section.gmOnly) continue;
    if (section.heading !== 'Header') out.push(section.heading);
    out.push(...section.lines);
    for (const entry of section.entries ?? []) {
      if (options.playerSafe && entry.gmOnly) continue;
      out.push(entry.name);
      out.push(entry.body);
      out.push('');
    }
    out.push('');
  }
  if (!options.playerSafe && entity.identity.gmNotes) {
    out.push('GM Notes', entity.identity.gmNotes);
  }
  return out
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function formatStatblockMarkdown(
  entity: CrucibleEntitySchema,
  options: FormatOptions = {},
): string {
  const out: string[] = [
    `## ${entity.identity.name || 'Unnamed'}`,
    `*${subtitleLine(entity)}*`,
    '',
  ];
  for (const section of statblockSections(entity)) {
    if (options.playerSafe && section.gmOnly) continue;
    if (section.heading !== 'Header') out.push(`### ${section.heading}`);
    for (const line of section.lines) out.push(line ? `${line}  ` : '');
    for (const entry of section.entries ?? []) {
      if (options.playerSafe && entry.gmOnly) continue;
      out.push(`***${entry.name}.*** ${entry.body.replace(/\n/g, '  \n')}`);
      out.push('');
    }
    out.push('');
  }
  return out
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
