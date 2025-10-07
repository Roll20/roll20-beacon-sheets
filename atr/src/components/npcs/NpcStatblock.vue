<template>
  <div v-if="localNpc" class="npc-statblock" :class="{ 'npc-statblock--edit-mode': isEditing }">
    <ImageUpload
      v-if="companionMode && isEditing"
      v-model="localNpc.token"
      :edit-mode="true"
      class="npc-statblock__token-editor"
    />
    <NpcStatblockHeader
      :npc="displayNpc"
      :localNpc="localNpc"
      :editMode="isEditing"
      :companionMode="companionMode"
      :showCollapseControl="showCollapseControl"
      v-model:isCollapsed="isCollapsed"
      @delete="deleteNpc"
      @open-edit="$emit('open-edit')"
    />

    <details :open="forceExpanded || !isCollapsed" class="npc-statblock__content">
      <NpcStatblockSummary
        :npc="displayNpc"
        :localNpc="localNpc"
        :editMode="isEditing"
        :activeEffects="activeEffects"
        :initiativeBonus="initiativeBonus"
        :initiativeRollArgs="initiativeRollArgs"
        @update:hp="handleHpUpdate"
      />

      <NpcStatblockDetails
        :npc="displayNpc"
        :localNpc="localNpc"
        :editMode="isEditing"
        :modifiedAbilities="modifiedAbilities"
        :savingThrowsWithBonuses="savingThrowsWithBonuses"
        :skillsWithBonuses="skillsWithBonuses"
        :challengeRatings="challengeRatings"
        v-model:challengeRatingValue="challengeRatingValue"
        v-model:newEffectJson="newEffectJson"
        @addEffect="addEffect"
        @toggleEffect="handleToggleEffect"
        @removeEffect="handleRemoveEffect"
        @addFeature="addFeature"
        @removeFeature="removeFeature"
        @addAction="addAction"
        @removeAction="removeAction"
        @addSpellSource="addSpellSource"
        @removeSpellSource="removeSpellSource"
        @addSpell="addSpell"
        @removeSpell="removeSpell"
        @update-spell-slots-used="handleUpdateSpellSlots"
        @save-npc="saveChanges"
      />
    </details>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import {
  useNpcStore,
  type Npc,
} from '@/sheet/stores/npc/npcStore';
import { jsonClone } from '@/utility/jsonTools';
import { config } from '@/config';
import { evaluate } from 'mathjs';

import {
  type SingleEffect,
  type Effect,
  type ModifiedValue,
} from '@/sheet/stores/modifiers/modifiersStore';

import { useI18n } from 'vue-i18n';
import { v4 as uuidv4 } from 'uuid';
import { effectKeys } from '@/effects.config';
import type { D20RollArgs, LabeledBonus } from '@/utility/roll';
import NpcStatblockHeader from './NPCStatblockHeader.vue';
import NpcStatblockSummary from './NPCStatblockSummary.vue';
import NpcStatblockDetails from './NPCStatblockDetails.vue';
import ImageUpload from '@/components/shared/ImageUpload.vue';
import { useMetaStore } from '@/sheet/stores/meta/metaStore';

const props = withDefaults(
  defineProps<{
    npc: Npc; 
    editMode: boolean;
    companionMode?: boolean;
    forceExpanded?: boolean;
    showCollapseControl?: boolean;
  }>(),
  {
    companionMode: false,
    forceExpanded: false,
    showCollapseControl: true,
  },
);
defineEmits(['open-edit']);

const store = useNpcStore();
const { t } = useI18n();
const localNpc = ref<Npc>(jsonClone(props.npc));
const newEffectJson = ref('');
const isCollapsed = ref(props.npc?.isCollapsed ?? true);
const displayNpc = computed(() => (props.editMode ? localNpc.value : props.npc));

const isEditing = computed(() => {
  if (!props.editMode) return false;
  if (props.npc.isDefault) {
    return true;
  }
  return isCollapsed.value;
});

watch(
  () => props.npc?.isCollapsed,
  (newVal) => {
    isCollapsed.value = newVal ?? true;
  },
);

watch(
  () => props.npc,
  (newNpc) => {
    if (newNpc && !props.editMode) {
      localNpc.value = jsonClone(newNpc);
    }
  },
  { deep: true },
);

watch(
  () => props.editMode,
  (isEditing) => {
    if (isEditing) {
      localNpc.value = jsonClone(props.npc);
    } else if (localNpc.value) {
      saveChanges();
    }
  },
);

const saveChanges = () => {
  if (localNpc.value) {
    store.updateNpc(props.npc._id, localNpc.value);
  }
};

const deleteNpc = () => {
  if (localNpc.value) {
    store.removeNpc(props.npc._id);
  }
};

const handleHpUpdate = (newValue: number) => {
  if (localNpc.value) {
    localNpc.value.hitPoints.current = newValue;
    saveChanges();
  }
};

const handleUpdateSpellSlots = ({ sourceId, level, value }: { sourceId: string; level: number; value: number }) => {
  if (!localNpc.value) return;

  const source = localNpc.value.spellSources.find(s => s._id === sourceId);
  if (source) {
    if (!source.spellSlotsUsed) {
      source.spellSlotsUsed = {};
    }
    source.spellSlotsUsed[level] = value;
    saveChanges();
  }
};

const challengeRatings = computed(() => {
  return Object.keys(config.challengeRatingXP).sort((a, b) => {
    const valA = evaluate(a);
    const valB = evaluate(b);
    return valA - valB;
  });
});

const challengeRatingValue = computed({
  get: () => localNpc.value?.challenge.split(' ')[0] ?? '0',
  set: (cr) => {
    if (localNpc.value) {
      const xp = config.challengeRatingXP[cr as keyof typeof config.challengeRatingXP] || 0;
      localNpc.value.challenge = `${cr} (${xp.toLocaleString()} XP)`;
    }
  },
});

const modifiedAbilities = store.getNpcModifiedAbilities(props.npc._id);

const initiativeBonus = computed(() => {
  const dexterityBonus = modifiedAbilities.value['dexterity']?.bonus.value.final ?? 0;
  return store.getNpcModifiedValue(props.npc._id, dexterityBonus, effectKeys['initiative']);
});

const initiativeRollArgs =  computed((): D20RollArgs => {
  const npc = displayNpc.value;
  if (!npc) return { rollName: '', subtitle: '', bonuses: [] };
  const bonusValue = initiativeBonus.value.value;
  const bonuses: LabeledBonus[] = [];
  const effectsTotal = bonusValue.modifiers.reduce((sum, mod) => sum + mod.value, 0);
  const baseModifier = bonusValue.final - effectsTotal;
  if (baseModifier !== 0) {
    bonuses.push({ label: t('titles.abilities.dexterity'), value: baseModifier });
  }
  bonusValue.modifiers.forEach((mod) => {
    bonuses.push({ label: mod.name, value: mod.value });
  });

  const rollBonusKeys = [
    effectKeys['initiative-roll'],
    effectKeys['dexterity-check-roll'],
    effectKeys['check-roll'],
  ].filter(Boolean);

  const actionDieKeys = [
    effectKeys['initiative-action-die'],
    effectKeys['dexterity-check-action-die'],
    effectKeys['check-action-die'],
  ].filter(Boolean);

  return {
    rollName: t('titles.initiative'),
    subtitle: t('rolls.initiative-check'),
    bonuses,
    rollBonusKeys,
    actionDieKeys,
    critRange: 20,
    effectsSource: npc.effects,
    characterName: npc.name,
    addToTracker: true,
    tokenId: useMetaStore().token?.id,
    isCompanion: displayNpc.value?.isCompanion || false,
    avatar: displayNpc.value?.token || undefined,
  };
});

const savingThrowsWithBonuses = computed(() => {
  if (!displayNpc.value) return [];
  return config.abilities.filter((key) => displayNpc.value!.savingThrows[key] !== null);
});

const skillsWithBonuses = computed(() => {
  if (!displayNpc.value) return [];
  return (Object.keys(config.skills) as Array<keyof typeof config.skills>).filter(
    (key) => displayNpc.value!.skills[key] !== null,
  );
});

const activeEffects = computed(() => {
  const allEffects = store.getNpcEffects(props.npc._id);
  //return allEffects.value.filter((e) => e.enabled);
  return [];
});

// --- Methods for Modifying Lists (Actions, Features, etc.) ---
const addEffect = () => {
  if (!localNpc.value) return;
  try {
    const parsedEffect: Partial<Effect> = JSON.parse(newEffectJson.value);
    if (!parsedEffect.label || !parsedEffect.effects) throw new Error('Invalid structure');
    const fullEffect: Effect = {
      _id: parsedEffect._id ?? uuidv4(),
      label: parsedEffect.label,
      description: parsedEffect.description ?? '',
      enabled: parsedEffect.enabled ?? false,
      toggleable: parsedEffect.toggleable ?? true,
      removable: parsedEffect.removable ?? true,
      effects: parsedEffect.effects.map((e) => ({ ...e, _id: e._id ?? uuidv4() })),
    };
    localNpc.value.effects.push(fullEffect);
    newEffectJson.value = '';
  } catch (e) {
    alert(t('titles.invalid-json'));
  }
};

const handleToggleEffect = (effectId: string) => {
  if (props.editMode) {
    const effect = localNpc.value?.effects.find((e) => e._id === effectId);
    if (effect && effect.toggleable) {
      effect.enabled = !effect.enabled;
    }
  } else {
    store.toggleNpcEffect(props.npc._id, effectId);
  }
};

const handleRemoveEffect = (effectId: string) => {
  if (!props.editMode || !localNpc.value) return;
  const index = localNpc.value.effects.findIndex((e) => e._id === effectId);
  if (index > -1) {
    localNpc.value.effects.splice(index, 1);
  }
};

const addFeature = () => {
  if (localNpc.value) {
    const newFeature = store.getEmptyNpcFeature();
    localNpc.value.features.push(newFeature);
  }
};

const removeFeature = (index: number) => {
  if (localNpc.value) {
    const featureToRemove = localNpc.value.features[index];
    if (featureToRemove) {
      const effectIndex = localNpc.value.effects.findIndex(
        (e) => e._id === featureToRemove.effectId,
      );
      if (effectIndex > -1) {
        localNpc.value.effects.splice(effectIndex, 1);
      }
    }
    localNpc.value.features.splice(index, 1);
  }
};

const addAction = (context: 'actions' | 'legendary' | 'lair') => {
  if (localNpc.value) {
    const newAction = store.getEmptyNpcAction(context);
    if (context === 'legendary') localNpc.value.legendaryActions.actions.push(newAction);
    else if (context === 'lair') localNpc.value.lairActions.actions.push(newAction);
    else localNpc.value.actions.push(newAction);
  }
};
const removeAction = (index: number, context: 'actions' | 'legendary' | 'lair') => {
  if (localNpc.value) {
    if (context === 'legendary') localNpc.value.legendaryActions.actions.splice(index, 1);
    else if (context === 'lair') localNpc.value.lairActions.actions.splice(index, 1);
    else localNpc.value.actions.splice(index, 1);
  }
};

const addSpellSource = () => {
  if (localNpc.value) {
    localNpc.value.spellSources.push(store.getEmptyNpcSpellSource());
  }
};
const removeSpellSource = (index: number) => {
  if (localNpc.value) {
    localNpc.value.spellSources.splice(index, 1);
  }
};
const addSpell = () => {
  if (localNpc.value) {
    const newSpell = store.getEmptyNpcSpell();
    localNpc.value.spells.push(newSpell);
  }
};
const removeSpell = (spellId: string) => {
  if (localNpc.value) {
    const index = localNpc.value.spells.findIndex((s) => s._id === spellId);
    if (index > -1) {
      const spellToRemove = localNpc.value.spells[index];
      if (spellToRemove) {
        const effectIndex = localNpc.value.effects.findIndex(
          (e) => e._id === spellToRemove.effectId,
        );
        if (effectIndex > -1) {
          localNpc.value.effects.splice(effectIndex, 1);
        }
      }
      localNpc.value.spells.splice(index, 1);
    }
  }
};

defineExpose({
  saveChanges,
  deleteNpc,
});
</script>

<style lang="scss" scoped>
.npc-statblock {
  border: 2px solid var(--color-danger);
  padding: 1rem;
  border-radius: var(--size-border-radius-medium);

  &__token-editor {
    width: 120px;
    height: 120px;
    margin: 0 auto 1rem;

    :deep(.image-uploader__label) {
      border-radius: 8px;
    }
    :deep(.image-uploader__remove-button) {
      top: 0;
      right: 0;
      border: none;
    }
  }


  &--edit-mode {
    border-color: var(--color-info);
  }
  &__content[open] > .npc-statblock__summary {
    display: none;
  }
}
</style>
