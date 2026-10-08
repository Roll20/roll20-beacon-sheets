/**
 * Roll20 payload builder.
 *
 * Two audiences, one rule: the flattened attribute payload is what macros and
 * tokens can read, so GM SECRETS NEVER GO INTO IT. Secrets (NPC knowledge,
 * private phases, GM notes) live only in the gm partition, which the relay
 * routes to gmNotes / whispers.
 */

import type { CrucibleEntitySchema } from '@/crucible/schemas/crucibleEntity.schema';
import { STATBLOCK_ATTRIBUTE_ORDER, SAVE_IDS } from '@/crucible/schemas/crucibleCommon';
import { sizeOrDefault } from '@/crucible/data/registries/creatureSizes.registry';
import { formatStatblockText } from './formatStatblock';
import { generateTokenActions } from './generateTokenActions';

/** Flattened, macro-safe attributes: @{name|crucible.ac} etc. */
export function buildAttributePayload(
  entity: CrucibleEntitySchema,
): Record<string, string | number> {
  const d = entity.derived;
  const out: Record<string, string | number> = {
    'crucible.kind': entity.kind,
    'crucible.threatRating': entity.progression.threatRating,
    'crucible.level': entity.progression.level,
    'crucible.pb': d.proficiencyBonus,
    'crucible.ac': d.armorClass,
    'crucible.hp': d.hitPoints,
    'crucible.hitDice': d.hitDice,
    'crucible.initiative': d.initiative,
    'crucible.actionPoints': d.actionPoints,
    'crucible.passivePerception': d.passivePerception,
    'crucible.effectDc': d.effectSaveDc,
    'crucible.size': sizeOrDefault(entity.classification.sizeId).name,
  };
  for (const key of STATBLOCK_ATTRIBUTE_ORDER) {
    out[`crucible.${key}.score`] = entity.attributes[key];
    out[`crucible.${key}.mod`] = d.modifiers[key];
  }
  for (const save of SAVE_IDS) {
    out[`crucible.save.${save}`] = d.saves[save];
  }
  for (const [talent, bonus] of Object.entries(d.talentBonuses)) {
    out[`crucible.talent.${talent.replace(/\s+/g, '_').toLowerCase()}`] = bonus;
  }
  if (entity.magic.isCaster) {
    out['crucible.aether'] = d.aether;
    out['crucible.arteSaveDc'] = d.arteSaveDc;
    out['crucible.arteAttack'] = d.arteAttack;
    out['crucible.maxArteTier'] = d.maxArteTier;
  }
  return out;
}

/** Data that must stay off the player-readable channel. */
export interface CrucibleGmPartition {
  gmNotes: string;
  npcSecrets: string[];
  knowledge: { topic: string; content: string; difficulty: string }[];
  phaseNotes: string[];
  behaviour: string[];
  loot: string[];
}

export function buildGmPartition(entity: CrucibleEntitySchema): CrucibleGmPartition {
  const npc = entity.npc;
  const secrets: string[] = [];
  if (npc) {
    if (npc.secret) secrets.push(`Secret: ${npc.secret}`);
    if (npc.privateRole) secrets.push(`Private role: ${npc.privateRole}`);
    if (npc.contradiction) secrets.push(`Contradiction: ${npc.contradiction}`);
    if (npc.breakingPoint) secrets.push(`Breaking point: ${npc.breakingPoint}`);
  }
  const behaviourProfile = entity.monster?.combatProfile;
  return {
    gmNotes: entity.identity.gmNotes,
    npcSecrets: secrets,
    knowledge: (npc?.knowledge ?? []).map((k) => ({
      topic: k.topic,
      content: k.content,
      difficulty: k.difficulty,
    })),
    phaseNotes: (entity.boss?.phases ?? [])
      .map((p) => (p.gmOnlyNotes ? `${p.name}: ${p.gmOnlyNotes}` : ''))
      .filter(Boolean),
    behaviour: behaviourProfile
      ? [
          behaviourProfile.openingMove ?? '',
          behaviourProfile.standardTurn ?? '',
          behaviourProfile.bloodiedBehavior ?? '',
          behaviourProfile.retreatBehavior ?? '',
        ].filter(Boolean)
      : [],
    loot: entity.loot.entries.map((l) => `${l.name} (${l.chance}%)`),
  };
}

/** The gmNotes text Roll20 stores on the character. */
export function buildGmNotesText(entity: CrucibleEntitySchema): string {
  const gm = buildGmPartition(entity);
  const blocks: string[] = [];
  if (gm.gmNotes) blocks.push(gm.gmNotes);
  if (gm.npcSecrets.length) blocks.push([' - Secrets - ', ...gm.npcSecrets].join('\n'));
  if (gm.knowledge.length) {
    blocks.push(
      [
        ' - Knowledge - ',
        ...gm.knowledge.map((k) => `[${k.difficulty}] ${k.topic}: ${k.content}`),
      ].join('\n'),
    );
  }
  if (gm.behaviour.length) blocks.push([' - Behaviour - ', ...gm.behaviour].join('\n'));
  if (gm.phaseNotes.length) blocks.push([' - Phases - ', ...gm.phaseNotes].join('\n'));
  if (gm.loot.length) blocks.push([' - Loot - ', ...gm.loot].join('\n'));
  return blocks.join('\n\n');
}

/** Sanitised entity for the player-visible channel: secrets stripped, not just hidden. */
export function playerSafeEntity(entity: CrucibleEntitySchema): CrucibleEntitySchema {
  const clone: CrucibleEntitySchema = JSON.parse(JSON.stringify(entity));
  clone.identity.gmNotes = '';
  if (clone.npc) {
    clone.npc.secret = '';
    clone.npc.privateRole = '';
    clone.npc.contradiction = '';
    clone.npc.breakingPoint = '';
    clone.npc.knowledge = clone.npc.knowledge.filter((k) => !k.gmOnly);
    clone.npc.relationships = clone.npc.relationships.filter((r) => !r.gmOnly);
    clone.npc.questHooks = clone.npc.questHooks.filter((q) => !q.gmOnly);
  }
  if (clone.boss) {
    clone.boss.phases = clone.boss.phases.map((p) => ({ ...p, gmOnlyNotes: undefined }));
  }
  clone.traits = clone.traits.filter((t) => !t.gmOnly);
  clone.actions = clone.actions.filter((a) => !a.gmOnly);
  clone.quickActions = clone.quickActions.filter((a) => !a.gmOnly);
  clone.reactions = clone.reactions.filter((a) => !a.gmOnly);
  clone.apexActions = clone.apexActions.filter((a) => !a.gmOnly);
  clone.overtureActions = clone.overtureActions.filter((a) => !a.gmOnly);
  return clone;
}

export interface Roll20CharacterPayload {
  name: string;
  avatar: string;
  /** Player-readable attributes. */
  attributes: Record<string, unknown>;
  /** GM-only notes text. */
  gmNotes: string;
  bio: string;
}

/**
 * The complete update payload for dispatch.updateCharacter(). The full canonical
 * entity rides under attributes.crucible; when the sheet is not player-visible the
 * stored canonical copy is ALSO the sanitised one - GM secrets then live only in
 * gmNotes, which Roll20 restricts to the GM.
 */
export function convertEntityToRoll20(entity: CrucibleEntitySchema): Roll20CharacterPayload {
  const displayName =
    entity.roll20.concealName && entity.roll20.concealedAs
      ? entity.roll20.concealedAs
      : entity.identity.name;
  const storedEntity = entity.roll20.playerVisible ? playerSafeEntity(entity) : entity;
  return {
    name: displayName || 'Crucible Entity',
    avatar: entity.token.imageUrl || entity.identity.portrait || '',
    attributes: {
      crucible: storedEntity as unknown as Record<string, never>,
      crucibleFlat: buildAttributePayload(entity),
      crucibleMacros: generateTokenActions(entity),
      crucibleStatblock: formatStatblockText(playerSafeEntity(entity), { playerSafe: true }),
    },
    gmNotes: buildGmNotesText(entity),
    bio: entity.identity.description,
  };
}
