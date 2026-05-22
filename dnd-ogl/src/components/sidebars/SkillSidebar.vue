<template>
  <div class="view-container">
    <form ref="form" @submit.prevent="save">
      <div class="columns columns-2">
        <label>
          {{ $t('titles.name') }}
          <input v-model="label" required v-if="canEditName" />
          <input
            :value="$t(`titles.${props.skill?.group}.${props.skill?.label}`)"
            readonly
            v-else
          />
        </label>
        <label class="span-1">
          {{ $t('titles.ability') }}
          <select v-model="ability">
            <option v-for="key in abilityKeys" :key="key" :value="key">
              {{ $t(`titles.abilities.${key}`) }}
            </option>
          </select>
        </label>
        <label class="span-1">
          {{ $t('titles.proficiency') }}
          <select v-model.number="level">
            <option
              v-for="(value, levelKey) in proficiencyLevelsBase"
              :key="levelKey"
              :value="proficiencyLevelsBase[levelKey]"
            >
              {{ $t(`titles.proficiency-levels.${levelKey}`) }}
            </option>
          </select>
        </label>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { AbilityKey } from '@/sheet/stores/abilities/abilitiesStore';
import { config } from '@/config';
import { type ProficiencyLevelBase } from '@/sheet/stores/proficiencies/proficienciesStore';
import type { RankedProficiency } from '@/sheet/stores/proficiencies/proficienciesStore';
import { proficiencyLevelsBase } from '@/sheet/stores/proficiencies/proficienciesStore';
import { useProficienciesStore } from '@/sheet/stores/proficiencies/proficienciesStore';
import { useSidebar } from './useSidebar';
const form = ref<HTMLFormElement | null>(null);

const props = defineProps<{
  skill: Partial<RankedProficiency> | null;
}>();
//const emit = defineEmits(['save', 'back']);

const label = ref(props.skill?.label ?? '');
const ability = ref<AbilityKey>(props.skill?.ability ?? 'strength');
const level = ref<ProficiencyLevelBase>(props.skill?.level ?? -1);
const _id = props.skill?._id;
const isNew = computed(() => !props.skill);

const abilityKeys = config.abilities;

const save = () => {
  if (form.value && !form.value.reportValidity()) return;

  const skillData: Partial<RankedProficiency> = {
    _id: _id,
    label: label.value,
    ability: ability.value,
    level: level.value,
  };
  handleSave(skillData);
  useSidebar().close();
};

const handleSave = (skillData: Partial<RankedProficiency>) => {
  useProficienciesStore().updateRanked(skillData._id, {
    label: skillData.label,
    ability: skillData.ability,
    level: skillData.level,
  });
};

const canEditName = computed(() => !props.skill?.group || props.skill.group === 'tools');
const remove = () => {
  if (props.skill?._id) {
    useProficienciesStore().removeRanked(props.skill._id);
    useSidebar().close();
  }
};
defineExpose({
  save,
  remove,
});
</script>

<style lang="scss" scoped>
input[readonly] {
  pointer-events: none;
  outline: none;
}
</style>
