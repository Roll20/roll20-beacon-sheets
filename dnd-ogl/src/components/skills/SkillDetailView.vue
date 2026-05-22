<template>
  <div class="view-container">
    <button class="back-button" @click="$emit('back')">{{ $t('actions.back') }}</button>

    <h2>{{ isNew ? $t('titles.add-skill') : $t('titles.edit-skill') }}</h2>

    <form @submit.prevent="submit">
      <label> {{ $t('titles.name') }} <input v-model="label" required /> </label>

      <label>
        {{ $t('titles.ability') }}
        <select v-model="ability">
          <option v-for="key in abilityKeys" :key="key" :value="key">
            {{ $t(`titles.abilities.${key}`) }}
          </option>
        </select>
      </label>

      <label>
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

      <button type="submit" class="save-button">{{ $t('actions.save') }}</button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { AbilityKey } from '@/sheet/stores/abilities/abilitiesStore';
import { config } from '@/config';
import { ProficiencyLevel } from '@/sheet/stores/proficiencies/proficienciesStore';
import type { RankedProficiency } from '@/sheet/stores/proficiencies/proficienciesStore';
import { proficiencyLevelsBase } from '@/sheet/stores/proficiencies/proficienciesStore';
import { useI18n } from 'vue-i18n'; 
const { t } = useI18n();
const props = defineProps<{
  skill: Partial<RankedProficiency> | null;
}>();
const emit = defineEmits(['save', 'back']);

const label = ref(props.skill?.label ?? '');
const ability = ref<AbilityKey>(props.skill?.ability ?? 'strength');
const level = ref<ProficiencyLevel>(props.skill?.level ?? -1);
const _id = props.skill?._id;
const isNew = computed(() => !props.skill);

const abilityKeys = config.abilities;

const submit = () => {
  const skillData: Partial<RankedProficiency> = {
    _id: _id,
    label: label.value,
    ability: ability.value,
    level: level.value,
  };
  emit('save', skillData);
};
</script>

<style lang="scss" scoped>
.view-container {
  padding: 1rem;
}
.back-button {
  background: none;
  border: none;
  font-size: 1rem;
  margin-bottom: 1rem;
  cursor: pointer;
}
form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
input,
select {
  width: 100%;
  padding: 0.5rem;
  font-size: 1rem;
}
.save-button {
  padding: 1rem;
  background-color: #2196f3;
  color: white;
  border: none;
  font-weight: bold;
  border-radius: 0.5rem;
  cursor: pointer;
}
</style>
