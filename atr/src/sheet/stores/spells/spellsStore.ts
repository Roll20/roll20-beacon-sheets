import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import type { Ref } from 'vue';
import {
  arrayToObject,
  objectToArray,
  arrayToIndexedObject,
  indexedObjectToArray,
} from '@/utility/objectify';
import { v4 as uuidv4 } from 'uuid';
import { config } from '@/config';
import { useTagsStore } from '../tags/tagsStore';
import { useProgressionStore, type ClassProgression } from '../progression/progressionStore';
import { type AbilityData, useAbilitiesStore, type AbilityKey } from '../abilities/abilitiesStore';
import { DamageRollSchema, type DamageRoll } from '../actions/damage';

import { getEntryByLabel } from '@/utility/getEntryBy';
import { evaluate } from 'mathjs';
import { effectKeys } from '@/effects.config';
import { useI18n } from 'vue-i18n';
import * as z from 'zod/v4';
import {
  type ModifiedValue,
  useEffectsStore,
  type DicePool,
  type ModifiedDicePool,
} from '../modifiers/modifiersStore';
import { useMetaStore } from '../meta/metaStore';
import { dispatchRef, initValues } from '@/relay/relay';
import { createRollTemplate } from '@/rolltemplates/rolltemplates';
import type { Dispatch } from '@roll20-official/beacon-sdk';
import { EffectsCalculator} from '@/utility/effectsCalculator';
import { evaluateDiceFormula, parseFormula } from '../formulas';
import { getRollProperties } from '@/utility/roll';
import { RequirementSchema } from '../modifiers/requirement';

export type SpellSchool = (typeof config.spellSchools)[number];
export type SpellComponent = (typeof config.spellComponents)[number];
export type SpellLevel = (typeof config.spellLevels)[number];
export type CasterType = keyof typeof config.casterTypes;
export type SpellCastingProgression = 'none' | CasterType;
export type SlotType = 'spell-slots' | 'pact-spell-slots';

export const UpcastModifierSchema = z.object({
  level: z.number(),
  school: z.enum([...config.spellSchools] as [string, ...string[]]),
  castingTime: z.string(),
  range: z.string(),
  duration: z.string(),
  target: z.string(),
  description: z.string(),
  concentration: z.boolean(),
  damage: z.array(DamageRollSchema).optional(),
});

export const SpellSchema = z.object({
  _id: z.string(),
  name: z.string(),
  level: z.number(),
  school: z.enum([...config.spellSchools] as [string, ...string[]]),
  castingTime: z.string(),
  range: z.string(),
  target: z.string(),
  components: z.array(z.enum([...config.spellComponents] as [string, ...string[]])),
  material: z.string(),
  duration: z.string(),
  concentration: z.boolean(),
  ritual: z.boolean(),
  description: z.object({
    default: z.string(),
    upcast: z.string().optional(),
  }),
  isAttack: z.boolean(),
  attackType: z.enum(['melee', 'ranged']),
  attackAbility: z.union([z.literal('none'), z.custom<AbilityKey>()]),
  critRange: z.number(),
  damage: z.array(DamageRollSchema),
  saving: z.union([z.literal('none'), z.custom<AbilityKey>()]),
  upcast: z.array(UpcastModifierSchema),
  spellSourceId: z.string(),
  effectId: z.string(),
  tagId: z.string(),
  'data-tags': z.array(z.string()).optional(),
  required: z.array(RequirementSchema).optional(),
});

export type UpcastModifier = z.infer<typeof UpcastModifierSchema>;
export type Spell = z.infer<typeof SpellSchema>;

const BaseSpellSourceSchema = z.object({
  _id: z.string(),
  name: z.string(),
  isPrepared: z.boolean().optional(),
  cantripsKnown: z.array(z.number()).optional(),
  spellsKnown: z.array(z.number()).optional(),
});

export const StandardSpellSourceSchema = BaseSpellSourceSchema.extend({
  type: z.literal('ability'),
  ability: z.custom<AbilityKey>(),
  required: z.array(RequirementSchema).optional(),
});

export const FlatSpellSourceSchema = BaseSpellSourceSchema.extend({
  type: z.literal('flat'),
  flat: z.number(),
  required: z.array(RequirementSchema).optional(),
});

export const SpellSourceSchema = z.discriminatedUnion('type', [
  StandardSpellSourceSchema,
  FlatSpellSourceSchema,
]);

export type StandardSpellSource = z.infer<typeof StandardSpellSourceSchema>;
export type FlatSpellSource = z.infer<typeof FlatSpellSourceSchema>;
export type SpellSource = z.infer<typeof SpellSourceSchema>;

export type Slots = {
  mode: 'automatic' | 'manual';
  total: {
    standard: number[];
    pact: number[];
  };
  used: number[];
};

export type SpellsHydrate = {
  spells: Record<string, Spell>;
  sources: Record<string, SpellSource>;
  slots: {
    mode: 'automatic' | 'manual';
    total: {
      standard: Record<string, number>;
      pact: Record<string, number>;
    };
    used: Record<string, number>;
  };
};

export const useSpellsStore = defineStore('spells', () => {
  const userSpells: Ref<Array<Spell>> = ref([]);
  const userSources: Ref<Array<SpellSource>> = ref([]);
  const slots: Ref<Slots> = ref({
    mode: 'automatic',
    total: {
      standard: Array(config.spellLevels.length - 1).fill(0),
      pact: Array(config.spellLevels.length - 1).fill(0),
    },
    used: Array(config.spellLevels.length - 1).fill(0),
  });
  const effectsStore = useEffectsStore();

  const { t } = useI18n();

  const sourcesFromEffects = computed(() => {
    return EffectsCalculator.collectFromEffects<SpellSource>(
      effectsStore.effects,
      'spellSources',
      effectsStore.isEffectActive,
    );
  });

  const sources = computed(() => {
    return [...userSources.value, ...sourcesFromEffects.value];
  });

  const spellsFromEffects = computed(() => {
    return EffectsCalculator.collectFromEffects<Spell>(
      effectsStore.effects,
      'spells',
      effectsStore.isEffectActive,
    );
  });

  const spells = computed(() => {
    return [...userSpells.value, ...spellsFromEffects.value];
  });

  const lastSpellAttack = ref<{
    spellId: string;
    resultType: 'crit-success' | 'crit-fail' | undefined;
  } | null>(null);

  const setLastSpellAttackResult = (
    spellId: string,
    resultType: 'crit-success' | 'crit-fail' | undefined,
  ) => {
    lastSpellAttack.value = { spellId, resultType };
  };

  const getEmptySpell = (patch: Partial<Spell>): Spell => {
    return {
      _id: uuidv4(),
      name: '',
      level: 0,
      school: config.spellSchools[0],
      castingTime: '',
      range: '',
      target: '',
      components: [],
      material: '',
      duration: '',
      concentration: false,
      ritual: false,
      isAttack: false,
      attackType: 'melee',
      attackAbility: 'none',
      critRange: 20,
      damage: [],
      saving: 'none',
      description: { default: '' },
      upcast: [],
      spellSourceId: sources.value[0]?._id ?? '',
      effectId: uuidv4(),
      tagId: uuidv4(),
      ...patch,
    };
  };

  const getEmptySource = (patch: Partial<SpellSource>): SpellSource => {
    const base = {
      _id: uuidv4(),
      name: '',
    };
    if (patch.type === 'ability') {
      return {
        ...base,
        type: 'ability',
        ability: (patch as StandardSpellSource).ability ?? config.abilities[0],
        ...patch,
      };
    } else if (patch.type === 'flat') {
      return {
        ...base,
        type: 'flat',
        flat: (patch as FlatSpellSource).flat ?? 0,
        ...patch,
      };
    } else {
      return {
        ...base,
        type: 'ability',
        ability: config.abilities[0],
      };
    }
  };

  const updateSource = (patch: Partial<SpellSource> & { sourceEffectId?: string }) => {
    if (patch.sourceEffectId) {
      effectsStore.updateItemWithinEffect({
        effectId: patch.sourceEffectId,
        itemKey: 'spellSources',
        itemPatch: patch,
      });
      return;
    }

    const existing = patch._id ? userSources.value.find((a) => a._id === patch._id) : undefined;
    if (!existing) {
      const newSource = getEmptySource(patch);
      userSources.value.push(newSource);
    } else {
      Object.assign(existing, patch);
    }
  };

  const removeSource = (sourceToRemove: SpellSource & { sourceEffectId?: string }) => {
    if (sourceToRemove.sourceEffectId) {
      effectsStore.removeItemFromEffect({
        effectId: sourceToRemove.sourceEffectId,
        itemKey: 'spellSources',
        itemId: sourceToRemove._id,
      });
      return;
    }
    const indexToRemove = userSources.value.findIndex(
      (source) => source._id === sourceToRemove._id,
    );
    if (indexToRemove >= 0) {
      userSources.value.splice(indexToRemove, 1);
      userSpells.value = userSpells.value.filter(
        (spell) => spell.spellSourceId !== sourceToRemove._id,
      );
    }
  };

  const updateSpell = (patch: Partial<Spell> & { sourceEffectId?: string }) => {
    if (patch.sourceEffectId) {
      effectsStore.updateItemWithinEffect({
        effectId: patch.sourceEffectId,
        itemKey: 'spells',
        itemPatch: patch,
      });
      return;
    }
    const existing = patch._id ? userSpells.value.find((a) => a._id === patch._id) : undefined;
    if (!existing) {
      const newSpell = getEmptySpell(patch);
      userSpells.value.push(newSpell);
    } else {
      Object.assign(existing, patch);
    }
  };

  const removeSpell = (spellToRemove: Spell & { sourceEffectId?: string }) => {
    if (spellToRemove.sourceEffectId) {
      effectsStore.removeItemFromEffect({
        effectId: spellToRemove.sourceEffectId,
        itemKey: 'spells',
        itemId: spellToRemove._id,
      });
      return;
    }
    const indexToRemove = userSpells.value.findIndex((spell) => spell._id === spellToRemove._id);
    if (indexToRemove >= 0) {
      const { effectId, tagId } = userSpells.value[indexToRemove];
      useEffectsStore().remove(effectId);
      useTagsStore().remove(tagId);
      userSpells.value.splice(indexToRemove, 1);
    }
  };

  const getSpellCritRange = (spell: Spell): ModifiedValue => {
    const baseValue = spell.critRange;
    const keysToQuery = [
      effectKeys['crit-range'],
      effectKeys['spell-crit-range'],
      effectKeys[`${spell.attackType}-spell-crit-range`],
    ];
    return useEffectsStore().getModifiedValue(baseValue, keysToQuery.filter(Boolean));
  };

  const dehydrate = (): SpellsHydrate => {
    const dehydratedSpells = userSpells.value.map((spell) => ({
      ...spell,
      components: arrayToIndexedObject(spell.components),
      damage: arrayToIndexedObject(spell.damage),
      upcast: arrayToIndexedObject(spell.upcast),
      required: spell.required ? arrayToIndexedObject(spell.required) : undefined,
    }));

    const dehydratedSources = userSources.value.map((source) => ({
      ...source,
      required: source.required ? arrayToIndexedObject(source.required) : undefined,
    }));

    return {
      spells: arrayToObject(dehydratedSpells),
      sources: arrayToObject(dehydratedSources),
      slots: {
        mode: slots.value.mode,
        total: {
          standard: arrayToIndexedObject(slots.value.total.standard),
          pact: arrayToIndexedObject(slots.value.total.pact),
        },
        used: arrayToIndexedObject(slots.value.used),
      },
    };
  };

  const hydrate = (payload: SpellsHydrate) => {
    const spellsHydration = payload?.spells
      ? objectToArray(payload.spells).map((spell) => ({
          ...spell,
          components: indexedObjectToArray(spell.components as Record<string, SpellComponent>),
          damage: indexedObjectToArray(spell.damage as Record<string, DamageRoll>),
          upcast: indexedObjectToArray(spell.upcast as Record<string, Partial<Spell>>),
          required: spell.required
            ? indexedObjectToArray(spell.required as unknown as Record<string, string>)
            : undefined,
        }))
      : [];
    userSpells.value = spellsHydration;
    userSources.value = payload?.sources 
      ? objectToArray(payload.sources).map((source) => ({
          ...source,
          required: source.required ? indexedObjectToArray(source.required as unknown as Record<string, string>) : undefined,
        })) 
      : [];
    slots.value = payload?.slots
      ? {
          mode: payload.slots.mode || 'automatic',
          total: {
            standard: indexedObjectToArray(payload.slots.total?.standard),
            pact: indexedObjectToArray(payload.slots.total?.pact),
          },
          used: indexedObjectToArray(payload.slots.used),
        }
      : slots.value;
  };

  const getMulticlassCasterLevel = (classes: ClassProgression[]): number => {
    const level = classes.reduce((acc, cls) => {
      const type = cls.spellcasting;
      if (type !== 'none' && config.casterTypes[type] && cls.level > 0) {
        return acc + cls.level * (config.casterTypes[type].multiclassMultiplier || 1);
      }
      return acc;
    }, 0);

    return Math.floor(level);
  };

  function calculateSlots(
    effectPrefix: SlotType,
    filterFn: (cls: ClassProgression) => boolean,
  ): number[] {
    const progression = useProgressionStore();
    const effects = useEffectsStore();

    const spellcasterClasses = progression.classes.filter((cls) => filterFn(cls));

    if (spellcasterClasses.length === 0) return Array(config.spellLevels.length).fill(0);

    const isMulticlass = spellcasterClasses.length > 1;
    let availableSlots;

    if (isMulticlass) {
      if (effectPrefix === 'pact-spell-slots') {
        availableSlots = spellcasterClasses.reduce((acc, cls) => {
          if (config.casterTypes.hasOwnProperty('pact')) {
            const level = cls.level;
            const classSlots = config.casterTypes[cls.spellcasting as CasterType].slots[level];
            return acc.map((value, index) => value + classSlots[index]);
          }
          return acc;
        }, Array(config.spellLevels.length).fill(0));
      } else {
        const level = getMulticlassCasterLevel(spellcasterClasses);
        availableSlots = config.casterMulticlassing[level - 1];
      }
    } else {
      const caster = spellcasterClasses[0];
      const level = caster.level;
      if (effectPrefix === 'pact-spell-slots') {
        if (config.casterTypes.hasOwnProperty('pact')) {
          availableSlots = config.casterTypes[caster.spellcasting as CasterType].slots[level - 1];
        } else {
          availableSlots = Array(config.spellLevels.length - 1).fill(0);
        }
      } else {
        availableSlots = config.casterTypes[caster.spellcasting as CasterType].slots[level - 1];
      }
    }

    return availableSlots.map(
      (count, level) => effects.getModifiedValue(count, `${effectPrefix}-${level}`).value.final,
    );
  }

  const getStandardSlots = computed(() => {
    if (slots.value.mode === 'automatic') {
      return calculateSlots('spell-slots', (cls) => cls.spellcasting !== 'none');
    } else {
      return slots.value.total.standard.map(
        (count, level) =>
          useEffectsStore().getModifiedValue(count, `spell-slots-${level}`).value.final,
      );
    }
  });

  const getPactSlots = computed(() => {
    if (slots.value.mode === 'automatic') {
      return calculateSlots('pact-spell-slots', (cls) => cls.spellcasting !== 'none');
    } else {
      return slots.value.total.pact.map(
        (count, level) =>
          useEffectsStore().getModifiedValue(count, `pact-spell-slots-${level}`).value.final,
      );
    }
  });

  const getSlots = computed(() => {
    const slots = {
      standard: getStandardSlots.value,
      pact: getPactSlots.value,
      all: getStandardSlots.value.map((value, index) => value + getPactSlots.value[index]),
    };

    return slots;
  });

  const getSourceDC = (id: string): ModifiedValue => {
    const sourceIndex = sources.value.findIndex((a) => a._id === id);
    if (sourceIndex < 0) {
      return useEffectsStore().getModifiedValue(0, uuidv4());
    }

    const source = sources.value[sourceIndex];

    if (source.type === 'flat') {
      return useEffectsStore().getModifiedValue(
        source.flat + config.baseDC,
        effectKeys['spell-dc'],
      );
    } else if (source.type === 'ability') {
      const abilityModifier: ModifiedValue = useAbilitiesStore().getAbilityModifier(
        getEntryByLabel(source.ability, useAbilitiesStore().abilities) as AbilityData,
      );
      const proficiencyModifier = Math.floor(useProgressionStore().getProficiencyBonus);
      return useEffectsStore().getModifiedValue(
        abilityModifier.value.final + proficiencyModifier + config.baseDC,
        effectKeys['spell-dc'],
      );
    }

    return useEffectsStore().getModifiedValue(0, uuidv4());
  };

  const getSourceAttackBonus = (id: string): ModifiedValue => {
    const sourceIndex = sources.value.findIndex((a) => a._id === id);
    if (sourceIndex < 0) {
      return useEffectsStore().getModifiedValue(0, uuidv4());
    }

    const source = sources.value[sourceIndex];

    if (source.type === 'flat') {
      return useEffectsStore().getModifiedValue(source.flat, [
        effectKeys['spell-attack'],
        effectKeys['attack'],
      ]);
    } else if (source.type === 'ability') {
      const abilityModifier: ModifiedValue = useAbilitiesStore().getAbilityModifier(
        getEntryByLabel(source.ability, useAbilitiesStore().abilities) as AbilityData,
      );
      const proficiencyModifier = Math.floor(useProgressionStore().getProficiencyBonus);
      return useEffectsStore().getModifiedValue(abilityModifier.value.final + proficiencyModifier, [
        effectKeys['spell-attack'],
        effectKeys['attack'],
      ]);
    }

    return useEffectsStore().getModifiedValue(0, uuidv4());
  };

  const getSpellDamage = (spell: Spell): ModifiedDicePool => {
    //const spell = spells.value.find((s) => s._id === id);
    if (!spell) return useEffectsStore().getModifiedDicePool([], uuidv4());
    if (!spell.damage || spell.damage.length === 0) {
      return computed(() => ({ final: [], modifiers: [] }));
    }
    const pool: Ref<DicePool> = ref([]);
    for (const damageRoll of spell.damage) {
      const abilityModifier: ModifiedValue | boolean =
        damageRoll.ability && damageRoll.ability !== 'none'
          ? useAbilitiesStore().getAbilityModifier(
              getEntryByLabel(damageRoll.ability, useAbilitiesStore().abilities) as AbilityData,
            )
          : false;
      if (damageRoll.damage) pool.value.push(evaluateDiceFormula(damageRoll.damage));

      if (abilityModifier) pool.value.push(abilityModifier.value.final);
    }

    const keysToQuery = [
      effectKeys.damage,
      effectKeys['spell-damage'],
      effectKeys[`${spell.attackType}-spell-damage`],
      effectKeys[`${spell.attackType}-damage`],
    ];

    return useEffectsStore().getModifiedDicePool(pool.value, keysToQuery);
  };

  const sendSpellInfoToChat = async (id: string, t: (key: string) => string) => {
    const spell = spells.value.find((s) => s._id === id);
    if (!spell) return;

    const saveDC = getSourceDC(spell.spellSourceId).value.final;
    const properties = getRollProperties(spell, t, saveDC);

    const rollTemplate = createRollTemplate({
      type: 'chat',
      parameters: {
        characterName: useMetaStore().name,
        title: spell.name,
        sourceType: 'spell',
        properties,
        description: spell.description.default,
      },
    });

    const dispatch = dispatchRef.value as Dispatch;
    await dispatch.post({
      characterId: initValues.character.id,
      content: rollTemplate,
    });
  };

  return {
    spells,
    userSpells,
    sources,
    userSources,
    slots,
    getSlots,
    lastSpellAttack,
    setLastSpellAttackResult,

    getSourceAttackBonus,
    getSpellDamage,
    getSpellCritRange,
    getSourceDC,
    getEmptySource,
    getEmptySpell,
    updateSpell,
    removeSpell,
    updateSource,
    removeSource,

    sendSpellInfoToChat,

    dehydrate,
    hydrate,
  };
});
