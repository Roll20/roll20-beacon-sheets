<template>
  <div class="proficiency-section">
    <!-- View Mode: Shows only proficiencies with bonuses -->
    <div v-if="!editMode && visibleKeys.length > 0" class="npc-statblock__prof-display">
      <strong>{{ title }}:</strong>
      <div class="npc-statblock__prof-grid">
        <NpcProficiencyItem
          v-for="key in visibleKeys"
          :key="key"
          :label="t(getLabelKey(key))"
          :finalBonus="getFinalBonus(key)"
          :baseBonus="(baseValues as Record<string, number | null>)[key] || null"
          :placeholder="getPlaceholder(key)"
          :editMode="false"
          :npcId="npcId"
          :group="itemType"
          :skillKey="getSkillKey(key)"
        />
      </div>
    </div>
    <!-- Edit Mode: Shows all available proficiency items -->
    <div v-else-if="editMode" class="npc-statblock__prof-editor">
      <h4>{{ title }}</h4>
      <div class="npc-statblock__prof-grid">
        <NpcProficiencyItem
          v-for="key in items"
          :key="key"
          :label="t(getLabelKey(key))"
          :baseBonus="(baseValues as Record<string, number | null>)[key]"
          :placeholder="getPlaceholder(key)"
          :finalBonus="getFinalBonus(key)"
          :editMode="true"
          :npcId="npcId"
          :group="itemType"
          :skillKey="getSkillKey(key)"
          @update:baseBonus="(newValue) => $emit('update:base-value', key, newValue)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { type PropType } from 'vue';
import { useI18n } from 'vue-i18n';
import { useNpcStore } from '@/sheet/stores/npc/npcStore';
import { config } from '@/config';
import NpcProficiencyItem from './NpcProficiencyItem.vue';
import type { AbilityKey } from '@/sheet/stores/abilities/abilitiesStore';

type SkillKey = keyof typeof config.skills;
const props = defineProps({
  editMode: { type: Boolean, required: true },
  title: { type: String, required: true },
  // Array of keys for all items in this section (ex: all ability names).
  items: { type: Array as PropType<string[]>, required: true },
  itemType: { type: String as PropType<'saving-throws' | 'skills'>, required: true },
  // The object holding the base bonus values (ex: localNpc.savingThrows).
  baseValues: { type: Object, required: true },
  modifiedAbilities: { type: Object, required: true },
  npcId: { type: String, required: true },
  // Keys for items that should be visible in view mode.
  visibleKeys: { type: Array as PropType<string[]>, required: true },
});

defineEmits(['update:base-value']);

const { t } = useI18n();
const store = useNpcStore();

//Gets the translation key for the proficiency's label.
const getLabelKey = (key: string) =>
  props.itemType === 'saving-throws' ? `titles.abilities.${key}` : `titles.default-skills.${key}`;

//Gets the specific key used for querying effects related to this proficiency.
const getSkillKey = (key: string) => (props.itemType === 'saving-throws' ? `${key}-saving` : key);

//Retrieves the final calculated bonus for a proficiency from the store.
const getFinalBonus = (key: string) =>
  props.itemType === 'saving-throws'
    ? store.getNpcSavingThrowBonus(props.npcId, key as AbilityKey)
    : store.getNpcSkillBonus(props.npcId, key as SkillKey);


//Determines the placeholder value for a proficiency input, which is the raw ability bonus.
const getPlaceholder = (key: string) => {
  const abilityKey =
    props.itemType === 'saving-throws'
      ? key
      : config.skills[key as keyof typeof config.skills].ability;
  return props.modifiedAbilities[abilityKey]?.bonus.value.final.toString() ?? '0';
};
</script>

<style lang="scss" scoped>
.npc-statblock__prof-display {
  display: flex;
  gap: 0.5rem;
  strong {
    white-space: nowrap;
  }
  .npc-statblock__prof-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 0 1rem;
  }
}

.npc-statblock__prof-editor h4 {
  margin: 0.5rem 0;
}

.npc-statblock__prof-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.25rem 1rem;
}
</style>
