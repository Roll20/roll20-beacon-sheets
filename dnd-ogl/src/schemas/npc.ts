import { z } from 'zod';
import { EffectSchema } from './effect';
import { SpellSchema } from './spell';
import { type AbilityKey } from '@/sheet/stores/abilities/abilitiesStore';
import { config } from '@/config';

export const NpcSpellSchema = SpellSchema.extend({
  innateUsage: z.string().optional(),
});

export const NpcSpellSourceSchema = z.object({
  _id: z.string().optional(),
  spellAttackBonus: z.number(),
  spellSaveDC: z.number(),
  isInnate: z.boolean().optional(),
  ability: z.custom<AbilityKey>(),
  spellSlots: z.object({
    1: z.number(),
    2: z.number(),
    3: z.number(),
    4: z.number(),
    5: z.number(),
    6: z.number(),
    7: z.number(),
    8: z.number(),
    9: z.number(),
  }).optional(),
  spellSlotsUsed: z.object({
    1: z.number(),
    2: z.number(),
    3: z.number(),
    4: z.number(),
    5: z.number(),
    6: z.number(),
    7: z.number(),
    8: z.number(),
    9: z.number(),
  }).optional(),
  name: z.string(),
  casterLevel: z.number().optional(),
});

export const DamageRollSchema = z.object({
  ability: z.union([z.literal('none'), z.literal('spellcasting'), z.enum([...config.abilities] as [string, ...string[]])
  ]),
  damage: z.string(),
  type: z.enum([...config.dicePoolTypes] as [string, ...string[]]),
  critDamage: z.string().optional(),
});

export const NpcActionSchema = z.object({
  _id: z.string().optional(),
  name: z.string(),
  description: z.string().optional(),
  group: z.enum([
    'actions',
    'bonus-actions',
    'reactions',
    'free-actions',
    'legendary',
    'lair',
  ]),
  isAttack: z.boolean(),
  critRange: z.number().min(1).max(20).optional(),
  attackBonus: z.number().nullable().optional(),
  saving: z.union([
    z.enum([...config.abilities] as [string, ...string[]]),
    z.literal('none'),
  ]).optional(),
  savingDc: z.number().optional(),
  damage: DamageRollSchema.array().optional(),
  range: z.string().optional(),
  target: z.string().optional(),
  attackType: z.enum(['melee', 'ranged']).optional(),
  sourceType: z.enum(['weapon', 'spell']).optional(),
  legendaryCost: z.number().optional(),
});

export const NpcFeatureSchema = z.object({
  _id: z.string().optional(),
  name: z.string(),
  description: z.string(),
  effectId: z.string().optional(),
  'data-effects': EffectSchema.optional(),
  'data-spells': z.array(NpcSpellSchema).optional(),
});


export const NpcCompendiumSchema = z.object({
  name: z.string(),
  shortDescription: z.string().optional(),
  armorClass: z.number(),
  acDescription: z.string().optional(),
  hitPoints: z.object({
    current: z.number(),
    max: z.number().optional(),
    formula: z.string(),
  }),
  speed: z.string(),
  abilities: z.object({
    strength: z.number(),
    dexterity: z.number(),
    constitution: z.number(),
    intelligence: z.number(),
    wisdom: z.number(),
    charisma: z.number(),
  }),
  savingThrows: z.object({
    strength: z.number().optional(),
    dexterity: z.number().optional(),
    constitution: z.number().optional(),
    intelligence: z.number().optional(),
    wisdom: z.number().optional(),
    charisma: z.number().optional(),
  }).optional(),
  skills: z.object({
    'acrobatics': z.number().optional(),
    'animal-handling': z.number().optional(),
    'arcana': z.number().optional(),
    'athletics': z.number().optional(),
    'deception': z.number().optional(),
    'history': z.number().optional(),
    'insight': z.number().optional(),
    'intimidation': z.number().optional(),
    'investigation': z.number().optional(),
    'medicine': z.number().optional(),
    'nature': z.number().optional(),
    'perception': z.number().optional(),
    'performance': z.number().optional(),
    'persuasion': z.number().optional(),
    'religion': z.number().optional(),
    'sleight-of-hand': z.number().optional(),
    'stealth': z.number().optional(),
    'survival': z.number().optional(),
  }),
  damageVulnerabilities: z.string().optional(),
  damageResistances: z.string().optional(),
  damageImmunities: z.string().optional(),
  conditionImmunities: z.string().optional(),
  senses: z.string().optional(),
  passivePerception: z.number().optional(),
  languages: z.string().optional(),
  challenge: z.string().optional(),
  features: z.array(NpcFeatureSchema).optional(),
  actions: z.array(NpcActionSchema).optional(),
  legendaryActions: z.object({ description: z.string().optional(), actions: NpcActionSchema.array().optional() }).optional(),
  lairActions: z.object({ description: z.string().optional(), actions: NpcActionSchema.array().optional() }).optional(),
  spellSources: NpcSpellSourceSchema.array().optional(),
  token: z.string(),
  'data-spells': z.array(NpcSpellSchema).optional(),
});

export const NpcSchema = NpcCompendiumSchema.extend({
  _id: z.string().optional(),
  isDefault: z.boolean().optional(),
  isCompanion: z.boolean().optional(),
  isCollapsed: z.boolean().optional(),
  effects: EffectSchema.array().optional(),
});