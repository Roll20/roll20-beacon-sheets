<template>
  <div class="view-container">
    <h2>{{ $t('titles.custom-skills') }}</h2>
    <ul class="skill-list">
      <li
        v-for="skill in tools"
        :key="skill._id"
        class="skill-item"
        @click="$emit('navigate', skill)"
      >
        {{ skill.label }}
      </li>
    </ul>
    <button class="add-button" @click="$emit('navigate', null)">
      {{ $t('actions.add-new-skill') }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { useProficienciesStore } from '@/sheet/stores/proficiencies/proficienciesStore';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

const proficiencies = useProficienciesStore();
const tools = computed(
  () => proficiencies.ranked.filter((proficiency) => proficiency.group === 'tools'),
  //.sort((a, b) => a.label.localeCompare(b.label))
);
</script>

<style lang="scss" scoped>
.view-container {
  padding: 1rem;
}
.skill-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.skill-item {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #ddd;
  cursor: pointer;
}
.skill-item:hover {
  background-color: #f8f8f8;
}
.add-button {
  width: 100%;
  margin-top: 1rem;
  padding: 1rem;
  font-size: 1.1rem;
  font-weight: bold;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
}
</style>
