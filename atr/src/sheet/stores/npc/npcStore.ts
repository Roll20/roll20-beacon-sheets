import { defineStore } from 'pinia';
import { ref, type Ref, computed } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import {
  arrayToIndexedObject,
  arrayToObject,
  indexedObjectToArray,
  objectToArray,
} from '@/utility/objectify';
import { jsonClone } from '@/utility/jsonTools';
import {
  type Effect,
  type ModifiedValue,
  type EffectsDescriptionList,
  type SingleEffect,
  type ExtendedSingleEffect,
  type DicePool,
  type ModifiedDicePool,
} from '../modifiers/modifiersStore';
import { evaluate } from 'mathjs';
import { config } from '@/config';
import { type AbilityKey } from '../abilities/abilitiesStore';
import { EffectsCalculator } from '@/utility/effectsCalculator';
import { effectKeys } from '@/effects.config';
import type { Spell, StandardSpellSource } from '../spells/spellsStore';
import { type DamageRoll } from '../actions/damage';
import { createRollTemplate } from '@/rolltemplates/rolltemplates';
import { getRollProperties } from '@/utility/roll';
import type { Dispatch } from '@roll20-official/beacon-sdk';
import { dispatchRef, initValues } from '@/relay/relay';

export type NpcSavingThrows = Record<AbilityKey, number | null>;
export type NpcSkills = Record<keyof typeof config.skills, number | null>;

export type SpellSchool = (typeof config.spellSchools)[number];
export type SpellComponent = (typeof config.spellComponents)[number];
export type SpellLevel = (typeof config.spellLevels)[number];

export type NpcDamageRoll = {
  ability: AbilityKey | 'none';
  damage: string;
  type: (typeof config.damageTypes)[number];
};

export type NpcSpellSource = StandardSpellSource & {
  spellAttackBonus: number;
  spellSaveDC: number;
  isInnate: boolean;
  spellSlots: Record<number, number>;
  spellSlotsUsed: Record<number, number>;
};

export type NpcSpell = Spell & {
  innateUsage: string;
};

export type NpcFeature = {
  _id: string;
  name: string;
  description: string;
  effectId: string;
};
export type NpcAction = {
  _id: string;
  name: string;
  description: string;
  group: 'actions' | 'bonus-actions' | 'reactions' | 'free-actions' | 'legendary' | 'lair';
  isAttack: boolean;
  critRange: number;
  attackBonus: number | null;
  saving: AbilityKey | 'none';
  savingDc: number;
  damage: DamageRoll[];
  range: string;
  target: string;
  attackType: 'melee' | 'ranged';
  sourceType: 'weapon' | 'spell';
  legendaryCost?: number;
};

export type Npc = {
  _id: string;
  isCollapsed: boolean;
  isCompanion?: boolean;
  isDefault?: boolean;
  name: string;
  shortDescription: string;
  planarSubtype: string;
  frequency: string;
  vibration: string;
  armorClass: number;
  acDescription: string;
  ballisticAC: number;
  ballisticAcDescription: string;
  hitPoints: {
    current: number;
    max: number;
    formula: string;
  };
  speed: string;
  abilities: Record<string, number>;
  savingThrows: NpcSavingThrows;
  skills: NpcSkills;
  damageVulnerabilities: string;
  damageResistances: string;
  damageImmunities: string;
  conditionImmunities: string;
  senses: string;
  passivePerception: number;
  languages: string;
  challenge: string;
  insanityDC: number;
  creatureFeature: string;
  features: NpcFeature[];
  actions: NpcAction[];
  spellSources: NpcSpellSource[];
  spells: NpcSpell[];
  legendaryActions: {
    description: string;
    actions: NpcAction[];
  };
  lairActions: {
    description: string;
    actions: NpcAction[];
  };
  effects: Effect[];
  token: string;
};
export type NpcsHydrate = {
  npcs: {
    isNpc: boolean;
    npcs: Record<string, Npc>;
    isEditMode?: boolean;
  };
};

export const useNpcStore = defineStore('npcs', () => {
  const isNpc = ref(false);
  const npcs: Ref<Array<Npc>> = ref([]);
  const isEditMode = ref(true);

  const lastNpcSpellAttack = ref<{
    spellId: string;
    resultType: 'crit-success' | 'crit-fail' | undefined;
  } | null>(null);

  const setLastNpcSpellAttackResult = (
    spellId: string,
    resultType: 'crit-success' | 'crit-fail' | undefined,
  ) => {
    lastNpcSpellAttack.value = { spellId, resultType };
  };

  const getEmptyNpc = (isDefault = false, isCompanion = false, patch: Partial<Npc> = {}): Npc => ({
    _id: patch._id ?? uuidv4(),
    isDefault: patch.isDefault ?? isDefault,
    isCompanion: patch.isCompanion ?? isCompanion,
    isCollapsed: patch.isCollapsed ?? isCompanion,
    name: patch.name ?? (isCompanion ? 'New Companion' : 'New NPC'),
    shortDescription: patch.shortDescription ?? 'Medium humanoid',
    planarSubtype: patch.planarSubtype ?? '',
    frequency: patch.frequency ?? '',
    vibration: patch.vibration ??  '',
    armorClass: patch.armorClass ?? 10,
    acDescription: patch.acDescription ?? '',
    ballisticAC: patch.ballisticAC ?? 10,
    ballisticAcDescription: patch.ballisticAcDescription ?? '',
    hitPoints: patch.hitPoints ?? { current: 10, max: 10, formula: '2d8+2' },
    speed: patch.speed ?? '30 ft.',
    abilities: patch.abilities ?? {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10,
    },
    savingThrows: { ...Object.fromEntries(config.abilities.map((key) => [key, null])), ...patch.savingThrows } as NpcSavingThrows,
    skills: { ...Object.fromEntries(Object.keys(config.skills).map((key) => [key, null])), ...patch.skills } as NpcSkills,
    damageVulnerabilities: patch.damageVulnerabilities ?? '',
    damageResistances: patch.damageResistances ?? '',
    damageImmunities: patch.damageImmunities ?? '',
    conditionImmunities: patch.conditionImmunities ?? '',
    senses: patch.senses ?? 'Passive Perception 10',
    passivePerception: patch.passivePerception ?? 10,
    languages: patch.languages ?? '',
    challenge: patch.challenge ?? '1/2 (100XP)',
    insanityDC: patch.insanityDC ?? 0,
    creatureFeature: patch.creatureFeature ?? '',
    features: patch.features ? patch.features.map(feature => getEmptyNpcFeature(feature)) : [],
    actions: patch.actions ? patch.actions.map(action => getEmptyNpcAction(action)) : [],
    legendaryActions: patch.legendaryActions ? { description: patch.legendaryActions.description, actions: patch.legendaryActions.actions.map(action => getEmptyNpcAction(action)) } : { description: '', actions: [] },
    lairActions: patch.lairActions ? { description: patch.lairActions.description, actions: patch.lairActions.actions.map(action => getEmptyNpcAction(action)) } : { description: '', actions: [] },
    effects: patch.effects ?? [],
    spellSources: patch.spellSources ? patch.spellSources.map(source => getEmptyNpcSpellSource(source)) : [],
    spells: patch.spells ? patch.spells.map(spell => getEmptyNpcSpell(spell)) : [],
    token: patch.token ?? '',
  });

  const getEmptyNpcSpellSource = (patch: Partial<NpcSpellSource> = {}): NpcSpellSource => ({
    _id: patch._id ?? uuidv4(),
    name: patch.name ?? 'New Spellcasting',
    type: patch.type ?? 'ability',
    ability: patch.ability ?? 'wisdom',
    spellAttackBonus: patch.spellAttackBonus ?? 0,
    spellSaveDC: patch.spellSaveDC ?? 10,
    isInnate: patch.isInnate ?? false,
    spellSlots: patch.spellSlots ?? { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 },
    spellSlotsUsed:
      patch.spellSlotsUsed ?? { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 },
  });

  const getEmptyNpcSpell = (patch: Partial<NpcSpell> = {}): NpcSpell => ({
    _id: patch._id ?? uuidv4(),
    name: patch.name ?? '',
    level: patch.level ?? 0,
    school: patch.school ?? 'abjuration',
    castingTime: patch.castingTime ?? '',
    range: patch.range ?? '',
    target: patch.target ?? '',
    components: patch.components ?? [],
    material: patch.material ?? '',
    duration: patch.duration ?? '',
    concentration: patch.concentration ?? false,
    ritual: patch.ritual ?? false,
    description: patch.description ?? { default: '' },
    damage: patch.damage ?? [],
    saving: patch.saving ?? 'none',
    effectId: patch.effectId ?? uuidv4(),
    spellSourceId: patch.spellSourceId ?? '',
    innateUsage: patch.innateUsage ?? '',
    upcast: patch.upcast ?? [],
    tagId: patch.tagId ?? '',
    isAttack: patch.isAttack ?? false,
    attackType: patch.attackType ?? 'melee',
    attackAbility: patch.attackAbility ?? 'strength',
    critRange: patch.critRange ?? 20,
  });

  const getEmptyNpcFeature = (patch: Partial<NpcFeature> = {}): NpcFeature => ({
    _id: patch._id ?? uuidv4(),
    name: patch.name ?? '',
    description: patch.description ?? '',
    effectId: patch.effectId ?? uuidv4(),
  });

  const getEmptyNpcAction = (patch: Partial<NpcAction>): NpcAction => ({
    _id: patch._id ?? uuidv4(),
    name: patch.name ?? '',
    group: patch.group ?? 'actions',
    isAttack: patch.isAttack ?? false,
    attackType: patch.attackType ?? 'melee',
    sourceType: patch.sourceType ?? 'weapon',
    critRange: patch.critRange ?? 20,
    attackBonus: patch.attackBonus ?? 0,
    saving: patch.saving ?? 'none',
    savingDc: patch.savingDc ?? 10,
    damage: patch.damage ?? [],
    range: patch.range ?? '',
    target: patch.target ?? '',
    legendaryCost: patch.legendaryCost ?? 1,
    description: patch.description ?? '',
  });

  const addCompanion = (): string => {
    const newCompanion = getEmptyNpc(false, true, {});
    npcs.value.push(newCompanion);
    return newCompanion._id;
  };

  const updateNpc = (_id: string | null, patch: Partial<Npc>): string => {
    const npc = npcs.value.find((n) => n._id === _id);
    if (npc) {
      Object.assign(npc, patch);
      return npc._id;
    } else {
      const newNpc = getEmptyNpc(false, false, patch);
      npcs.value.push(newNpc);
      return newNpc._id;
    }
  };

  const removeNpc = (_id: string) => {
    const index = npcs.value.findIndex((n) => n._id === _id);
    console.log(index);
    if (index > -1 && !npcs.value[index].isDefault) {
      npcs.value.splice(index, 1);
    }
  };

  const duplicateNpc = (_id: string) => {
    const originalNpc = npcs.value.find((n) => n._id === _id);
    if (originalNpc) {
      const newNpc = jsonClone(originalNpc);
      newNpc._id = uuidv4();
      newNpc.name = `${originalNpc.name} (Copy)`;
      npcs.value.push(newNpc);
      newNpc.isDefault = false;
      const sourceIdMap = new Map<string, string>();

      if (newNpc.spellSources) {
        newNpc.spellSources.forEach((source) => {
          const oldId = source._id;
          const newId = uuidv4();
          sourceIdMap.set(oldId, newId);
          source._id = newId;
        });
      }

      if (newNpc.spells) {
        newNpc.spells.forEach((spell) => {
          spell._id = uuidv4();
          if (sourceIdMap.has(spell.spellSourceId)) {
            spell.spellSourceId = sourceIdMap.get(spell.spellSourceId)!;
          }
        });
      }

      if (newNpc.features) {
        newNpc.features.forEach((feature) => {
          feature._id = uuidv4();
        });
      }

      const reIdActions = (actions: NpcAction[]) => {
        if (actions) {
          actions.forEach((action) => {
            action._id = uuidv4();
          });
        }
      };

      reIdActions(newNpc.actions);
      if (newNpc.legendaryActions) reIdActions(newNpc.legendaryActions.actions);
      if (newNpc.lairActions) reIdActions(newNpc.lairActions.actions);
    }
  };

  const regularNpcs = computed(() => npcs.value.filter((npc) => !npc.isCompanion));
  const companionNpcs = computed(() => npcs.value.filter((npc) => npc.isCompanion));

  const getNpcModifiedAbilities = (npcId: string) => {
    /* return computed(() => {
      const npc = npcs.value.find((n) => n._id === npcId);
      const result: Record<string, { score: ModifiedValue; bonus: ModifiedValue }> = {};
      if (!npc) return result;
      for (const abilityName of config.abilities) {
      const baseScore = npc.abilities[abilityName];
      const modifiedScore = getNpcModifiedValue(npcId, baseScore, effectKeys[abilityName]);

      const modifiedBonus = computed(() => {
        const bonus = Math.floor((modifiedScore.value.final - 10) / 2);
        return getNpcModifiedValue(npcId, bonus, effectKeys[`${abilityName}-check`]).value;
      });
      result[abilityName] = {
        score: modifiedScore,
        bonus: computed(() => ({
        final: modifiedBonus.value.final,
        modifiers: modifiedBonus.value.modifiers,
        })),
      };
      }
      return result;
    }); */
    return computed(() => {
      const npc = npcs.value.find((n) => n._id === npcId);
      const result: Record<string, { score: ModifiedValue; bonus: ModifiedValue }> = {};
      if (!npc) return result;

      for (const abilityName of config.abilities) {
        const baseScore = npc.abilities[abilityName];
        const baseBonus = Math.floor((baseScore - 10) / 2);

        result[abilityName] = {
          score: computed(() => ({ final: baseScore, modifiers: [] })),
          bonus: computed(() => ({ final: baseBonus, modifiers: [] })),
        };
      }
      return result;
    });
  };

  const getNpcSpellAttackBonus = (npcId: string, sourceId: string): ModifiedValue => {
    return computed(() => {
      const npc = npcs.value.find((n) => n._id === npcId);
      if (!npc) return { final: 0, modifiers: [] };
      const source = npc.spellSources.find((s) => s._id === sourceId);
      if (!source) return { final: 0, modifiers: [] };
      const baseBonus = source.spellAttackBonus;
      return { final: baseBonus, modifiers: [] };
      //return getNpcModifiedValue(npcId, baseBonus, effectKeys['spell-attack']).value;
    });
  };

  const getNpcSpellSaveDC = (npcId: string, sourceId: string): ModifiedValue => {
    return computed(() => {
      const npc = npcs.value.find((n) => n._id === npcId);
      if (!npc) return { final: 0, modifiers: [] };
      const source = npc.spellSources.find((s) => s._id === sourceId);
      if (!source) return { final: 0, modifiers: [] };
      const baseDC = source.spellSaveDC;
      return { final: baseDC, modifiers: [] };

      //return getNpcModifiedValue(npcId, baseDC, effectKeys['spell-dc']).value;
    });
  };

  const getNpcSpellDamage = (npcId: string, spell: NpcSpell): ModifiedDicePool => {
    return computed(() => {
      const npc = npcs.value.find((n) => n._id === npcId);
      if (!npc) return { final: [], modifiers: [] };
      if (!spell.damage || spell.damage.length === 0) return { final: [], modifiers: [] };

      const modifiedAbilities = getNpcModifiedAbilities(npcId).value;
      const pool: DicePool = [];
      for (const roll of spell.damage) {
        if (roll.damage) pool.push(roll.damage);
        if (roll.ability !== 'none') {
          const abilityBonus = modifiedAbilities[roll.ability]?.bonus.value.final ?? 0;
          if (abilityBonus !== 0) pool.push(abilityBonus);
        }
      }

      const keysToQuery = [
        effectKeys.damage,
        effectKeys['spell-damage'],
        effectKeys[`${spell.attackType}-spell-damage`],
        effectKeys[`${spell.attackType}-damage`],
      ].filter(Boolean);

      const validEffects = EffectsCalculator.getValidEffects(
        npc.effects || [],
        keysToQuery,
        (effect) => effect.enabled,
      );
      // return EffectsCalculator.calculateModifiedDicePool(pool, validEffects);
      return { final: pool, modifiers: [] };
    });
  };

  const getNpcSpellCritRange = (npcId: string, spell: NpcSpell): ModifiedValue => {
    return computed(() => {
      const baseValue = spell.critRange;
      const keys = [
        effectKeys['crit-range'],
        effectKeys['spell-crit-range'],
        effectKeys[`${spell.attackType}-spell-crit-range`],
      ];
      //return getNpcModifiedValue(npcId, baseValue, keys).value;
      return { final: baseValue, modifiers: [] };
    });
  };

  const getNpcSavingThrowBonus = (npcId: string, saveKey: AbilityKey): ModifiedValue => {
    return computed(() => {
      const npc = npcs.value.find((n) => n._id === npcId);
      if (!npc) return { final: 0, modifiers: [] };

      const modifiedAbilities = getNpcModifiedAbilities(npcId).value;
      const abilityBonus = modifiedAbilities[saveKey]?.bonus.value.final ?? 0;

      const baseValue = npc.savingThrows[saveKey] ?? abilityBonus;
      const keys = [effectKeys[`${saveKey}-saving`], effectKeys.saving];
      return { final: baseValue, modifiers: [] };

      //return getNpcModifiedValue(npcId, baseValue, keys).value;
    });
  };

  const getNpcSkillBonus = (npcId: string, skillKey: keyof typeof config.skills): ModifiedValue => {
    return computed(() => {
      const npc = npcs.value.find((n) => n._id === npcId);
      if (!npc) return { final: 0, modifiers: [] };

      const modifiedAbilities = getNpcModifiedAbilities(npcId).value;
      const skillAbility = config.skills[skillKey].ability;
      const abilityBonus = modifiedAbilities[skillAbility]?.bonus.value.final ?? 0;

      const baseValue = npc.skills[skillKey] ?? abilityBonus;
      const keys = [effectKeys[`${skillKey}`], effectKeys.skill];

      //return getNpcModifiedValue(npcId, baseValue, keys).value;
      return { final: baseValue, modifiers: [] };
    });
  };

  const getNpcActionBonus = (npcId: string, action: NpcAction): ModifiedValue => {
    return computed(() => {
      const baseBonus = action.attackBonus ?? 0;
      const keys = [
        effectKeys[`${action.attackType}-attack`],
        effectKeys[`${action.sourceType}-attack`],
        effectKeys[`${action.attackType}-${action.sourceType}-attack`],
        effectKeys.attack,
      ];
      //return getNpcModifiedValue(npcId, baseBonus, keys).value;
      return { final: baseBonus, modifiers: [] };
    });
  };

  const getNpcActionDamage = (npcId: string, action: NpcAction): ModifiedDicePool => {
    return computed(() => {
      const npc = npcs.value.find((n) => n._id === npcId);
      if (!npc) return { final: [], modifiers: [] };

      const modifiedAbilities = getNpcModifiedAbilities(npcId).value;
      const pool: DicePool = [];
      for (const roll of action.damage) {
        if (roll.damage) pool.push(roll.damage);
        if (roll.ability !== 'none') {
          const abilityBonus = modifiedAbilities[roll.ability]?.bonus.value.final ?? 0;
          if (abilityBonus !== 0) pool.push(abilityBonus);
        }
      }

      const keysToQuery = [
        effectKeys.damage,
        effectKeys[`${action.attackType}-damage`],
        effectKeys[`${action.sourceType}-damage`],
        effectKeys[`${action.attackType}-${action.sourceType}-damage`],
      ].filter(Boolean);

      const npcEffects = npc.effects || [];

      const validEffects = EffectsCalculator.getValidEffects(
        npcEffects,
        keysToQuery,
        (effect) => effect.enabled,
      );
      const modifiedPool = EffectsCalculator.calculateModifiedDicePool(pool, validEffects);

      //return modifiedPool;
      return { final: pool, modifiers: [] };
    });
  };

  const getNpcEffects = (npcId: string) => {
    return computed(() => {
      const npc = npcs.value.find((n) => n._id === npcId);
      if (!npc) return [];
      return [];
      //return npc.effects || [];
    });
  };

  const toggleNpcEffect = (npcId: string, effectId: string) => {
    const npc = npcs.value.find((n) => n._id === npcId);
    if (npc) {
      const effect = npc.effects.find((e) => e._id === effectId);
      if (effect && effect.toggleable) {
        effect.enabled = !effect.enabled;
      }
    }
  };

  const getNpcModifiedValue = (
    npcId: string,
    baseValue: number,
    attribute: string | string[],
  ): ModifiedValue => {
    const combinedEffects = getNpcEffects(npcId);

    return computed(() => {
      const validEffects = EffectsCalculator.getValidEffects(
        combinedEffects.value,
        attribute,
        (effect: Effect) => effect.enabled,
      );
      return { final: baseValue, modifiers: [] };
      //return EffectsCalculator.calculateModifiedValue(baseValue, validEffects);
    });
  };

  const sendActionInfoToChat = async (npcId: string, actionId: string, t: (key: string) => string) => {
    const npc = npcs.value.find((n) => n._id === npcId);
    if (!npc) return;
    const action = [...npc.actions, ...npc.legendaryActions.actions, ...npc.lairActions.actions].find(
      (a) => a._id === actionId,
    );
    if (!action) return;

    const rollTemplate = createRollTemplate({
      type: 'chat',
      parameters: {
        characterName: npc.name,
        title: action.name,
        sourceType: 'action',
        properties: getRollProperties(action,t, action.savingDc),
        description: action.description,
      },
    });

    await (dispatchRef.value as Dispatch).post({
      characterId: initValues.character.id,
      content: rollTemplate,
    });
  };

  const sendSpellInfoToChat = async (npcId: string, spellId: string, t: (key: string) => string) => {
    const npc = npcs.value.find((n) => n._id === npcId);
    if (!npc) return;
    const spell = npc.spells.find((s) => s._id === spellId);
    if (!spell) return;

    const source = npc.spellSources.find(s => s._id === spell.spellSourceId);
    const saveDCValue = source ? getNpcSpellSaveDC(npcId, source._id).value.final : undefined;

    const rollTemplate = createRollTemplate({
      type: 'chat',
      parameters: {
        characterName: npc.name,
        title: spell.name,
        sourceType: 'spell',
        properties: getRollProperties(spell, t, saveDCValue),
        description: spell.description.default,
      },
    });

    await (dispatchRef.value as Dispatch).post({
      characterId: initValues.character.id,
      content: rollTemplate,
    });
  };

  const dehydrate = (): NpcsHydrate => {
    return {
      npcs: {
        isNpc: isNpc.value,
        isEditMode: isEditMode.value,
        npcs: arrayToObject(
          npcs.value.map((npc) => {
            const processActions = (actions: NpcAction[]) =>
              arrayToObject(
                actions.map((action) => ({
                  ...action,
                  damage: arrayToIndexedObject(action.damage),
                })),
              );

            return {
              ...npc,
              actions: processActions(npc.actions),
              legendaryActions: {
                ...npc.legendaryActions,
                actions: processActions(npc.legendaryActions.actions),
              },
              lairActions: {
                ...npc.lairActions,
                actions: processActions(npc.lairActions.actions),
              },
              spells: arrayToObject(
                npc.spells.map((spell) => ({
                  ...spell,
                  components: arrayToIndexedObject(spell.components),
                  damage: arrayToIndexedObject(spell.damage),
                  upcast: arrayToIndexedObject(spell.upcast),
                })),
              ),
              effects: arrayToObject(
                npc.effects.map((effect) => ({
                  ...effect,
                  effects: arrayToObject(effect.effects),
                })),
              ),
              features: arrayToObject(npc.features),
              spellSources: arrayToObject(npc.spellSources),
            };
          }),
        ),
      },
    };
  };

  const hydrate = (payload: NpcsHydrate) => {
    isNpc.value = payload?.npcs?.isNpc ?? isNpc.value;
    const savedNpcs = payload?.npcs?.npcs;

    if (savedNpcs) {
      isEditMode.value = payload.npcs.isEditMode ?? true;
      const hydratedNpcs = objectToArray(savedNpcs).map((npc) => {
        const processActions = (actions: any): NpcAction[] =>
          objectToArray(actions).map((action) => ({
            ...action,
            damage: indexedObjectToArray(action.damage),
          }));

        const defaultNpc = getEmptyNpc(false, false, {});
        return {
          ...defaultNpc,
          ...npc,
          savingThrows: { ...defaultNpc.savingThrows, ...npc.savingThrows },
          skills: { ...defaultNpc.skills, ...npc.skills },
          features: objectToArray(npc.features),
          actions: processActions(npc.actions),
          legendaryActions: {
            ...defaultNpc.legendaryActions,
            ...npc.legendaryActions,
            actions: processActions(npc.legendaryActions?.actions),
          },
          lairActions: {
            ...defaultNpc.lairActions,
            ...npc.lairActions,
            actions: processActions(npc.lairActions?.actions),
          },
          spells: objectToArray(npc.spells).map((spell) => ({
            ...spell,
            components: indexedObjectToArray(spell.components),
            damage: indexedObjectToArray(spell.damage),
            upcast: indexedObjectToArray(spell.upcast as Record<string, Partial<Spell>>),
          })),
          spellSources: objectToArray(npc.spellSources).map(source => {
            const defaultSource = getEmptyNpcSpellSource();
            return {
              ...defaultSource,
              ...source,
              spellSlots: { ...defaultSource.spellSlots, ...source.spellSlots },
              spellSlotsUsed: { ...defaultSource.spellSlotsUsed, ...source.spellSlotsUsed }
            }
          }),
          effects: objectToArray(npc.effects).map((effect) => ({
            ...effect,
            effects: objectToArray(effect.effects),
          })),
        };
      });

      if (hydratedNpcs.length === 0) {
        npcs.value = [getEmptyNpc(true, false, {})];
      } else {
        hydratedNpcs[0].isDefault = true;
        npcs.value = hydratedNpcs;
      }
    } else {
      npcs.value = [getEmptyNpc(true, false, {})];
    }
  };

  return {
    npcs,
    isEditMode,
    isNpc,
    updateNpc,
    removeNpc,
    duplicateNpc,
    getEmptyNpc,
    getEmptyNpcAction,
    hydrate,
    dehydrate,
    getNpcModifiedValue,
    getNpcEffects,
    getNpcActionBonus,
    getEmptyNpcFeature,
    getNpcSavingThrowBonus,
    getNpcSkillBonus,
    getNpcActionDamage,
    getNpcModifiedAbilities,
    getEmptyNpcSpellSource,
    getEmptyNpcSpell,
    getNpcSpellAttackBonus,
    lastNpcSpellAttack,
    setLastNpcSpellAttackResult,
    getNpcSpellDamage,
    getNpcSpellCritRange,
    getNpcSpellSaveDC,
    regularNpcs,
    companionNpcs,
    toggleNpcEffect,
    addCompanion,
    sendActionInfoToChat,
    sendSpellInfoToChat,
  };
});
