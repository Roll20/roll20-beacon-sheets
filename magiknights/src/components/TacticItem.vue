<script setup>
import { computed } from 'vue';
import RepeatingItem from '@/components/RepeatingItem.vue';
import Collapsible from '@/components/Collapsible.vue';
import NotchContainer from './NotchContainer.vue';
import { useSheetStore } from '@/stores/sheetStore';

const props = defineProps({
  item: Object
});

const sheet = useSheetStore();

// Check if tactic prerequisites are met
const prerequisitesMet = computed(() => {
  return sheet.checkTacticPrerequisites(props.item);
});

// Toggle tactic active/inactive
const toggleActive = () => {
  props.item.active = !props.item.active;
};
</script>

<template>
  <RepeatingItem class="tactic-item" :row="props.item" name="tactics">
    <NotchContainer :class="{ 'inactive': !props.item.active, 'prereq-unmet': !prerequisitesMet }">
    <Collapsible class="tactic-content" :default="item.collapsed" @collapse="item.collapsed = !item.collapsed">
      <template v-slot:collapsed>
        <div class="tactic-collapsed-header">
          <div class="tactic-name-section">
            <input type="checkbox" v-model="props.item.active" @click.stop class="tactic-checkbox">
            <span class="tactic-header">{{ props.item.name || 'New Tactic' }}</span>
          </div>
          <div class="tactic-meta">
            <span v-if="!prerequisitesMet" class="prereq-warning">✗ Prerequisites not met</span>
            <span v-if="props.item.effectType" class="effect-type">{{ props.item.effectType }}</span>
            <span v-if="props.item.automaticBonus" class="auto-bonus">{{ props.item.automaticBonus }}</span>
          </div>
        </div>
      </template>
      <template v-slot:expanded>
        <div class="tactic-active-toggle">
          <label class="toggle-label">
            <input type="checkbox" v-model="props.item.active" class="tactic-checkbox-large">
            <span class="toggle-text">{{ props.item.active ? 'Active' : 'Inactive' }}</span>
          </label>
        </div>

        <input type="text" class="underline tactic-header" v-model="props.item.name" placeholder="Tactic Name">

        <div class="tactic-grid">
          <div class="flex-box">
            <span class="tactic-label capitalize">effect type</span>
            <select class="underline" v-model="props.item.effectType">
              <option value="Passive">Passive</option>
              <option value="Active">Active</option>
              <option value="Reaction">Reaction</option>
            </select>
          </div>

          <div class="flex-box full-width">
            <span class="tactic-label capitalize">prerequisites</span>
            <input type="text" class="underline" v-model="props.item.prerequisites"
                   placeholder="e.g., Level 9+, Combat Form Drills">
          </div>

          <div class="flex-box full-width">
            <span class="tactic-label capitalize">automatic bonus</span>
            <input type="text" class="underline" v-model="props.item.automaticBonus"
                   placeholder="e.g., +1 to Initiative, +2 HP/Level">
          </div>
        </div>

        <div class="prereq-status">
          <span class="prereq-label">Prerequisites Status:</span>
          <span :class="prerequisitesMet ? 'prereq-met' : 'prereq-not-met'">
            {{ prerequisitesMet ? '✓ Met' : '✗ Not Met' }}
          </span>
        </div>

        <span class="capitalize tactic-label">description</span>
        <textarea class="underline" v-model="props.item.description"
                  placeholder="Describe the tactic's effects..."></textarea>
      </template>
    </Collapsible>
  </NotchContainer>
  </RepeatingItem>
</template>

<style scoped>
.tactic-header {
  color: var(--header-blue);
  font-weight: bold;
  font-size: medium;
}

.tactic-label {
  color: var(--header-blue);
  font-weight: bold;
  font-size: small;
}

.tactic-content {
  display: grid;
  gap: var(--tiny-gap);
  font-size: medium;
  font-weight: lighter;
}

.tactic-collapsed-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  gap: 1rem;
}

.tactic-name-section {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.tactic-checkbox {
  width: 1.2rem;
  height: 1.2rem;
  cursor: pointer;
}

.tactic-checkbox-large {
  width: 1.5rem;
  height: 1.5rem;
  cursor: pointer;
}

.tactic-meta {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  font-size: small;
  flex-wrap: wrap;
}

.effect-type {
  padding: 0.1rem 0.4rem;
  border-radius: 3px;
  background: var(--header-blue);
  color: white;
  font-weight: bold;
}

.auto-bonus {
  padding: 0.1rem 0.4rem;
  border-radius: 3px;
  background: #28a745;
  color: white;
  font-weight: bold;
}

.prereq-warning {
  padding: 0.1rem 0.4rem;
  border-radius: 3px;
  background: #cc0000;
  color: white;
  font-weight: bold;
}

.tactic-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}

.full-width {
  grid-column: 1 / -1;
}

.tactic-active-toggle {
  padding: 0.5rem;
  background: var(--notch-color);
  border-radius: 5px;
  margin-bottom: 0.5rem;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-weight: bold;
}

.toggle-text {
  color: var(--header-blue);
  font-size: medium;
}

.prereq-status {
  padding: 0.5rem;
  background: var(--notch-color);
  border-radius: 5px;
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.prereq-label {
  font-weight: bold;
}

.prereq-met {
  color: #28a745;
  font-weight: bold;
}

.prereq-not-met {
  color: #cc0000;
  font-weight: bold;
}

.inactive {
  opacity: 0.5;
}

.prereq-unmet {
  border: 2px solid #ffc107;
}

.flex-box {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}
</style>
