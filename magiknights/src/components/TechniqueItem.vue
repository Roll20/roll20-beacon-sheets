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

// Check if technique is available based on level and uses
const isAvailable = computed(() => {
  return sheet.isTechniqueAvailable(props.item);
});

// Check if level requirement is met
const levelRequirementMet = computed(() => {
  return props.item.levelRequired <= sheet.level;
});

// Increment uses
const incrementUses = () => {
  if (props.item.usesRemaining < props.item.maxUses) {
    props.item.usesRemaining++;
  }
};

// Decrement uses
const decrementUses = () => {
  if (props.item.usesRemaining > 0) {
    props.item.usesRemaining--;
  }
};

// Reset uses to max
const resetUses = () => {
  props.item.usesRemaining = props.item.maxUses;
};
</script>

<template>
  <RepeatingItem class="technique-item" :row="props.item" name="techniques">
    <NotchContainer :class="{ 'unavailable': !isAvailable, 'level-locked': !levelRequirementMet }">
    <Collapsible class="technique-content" :default="item.collapsed" @collapse="item.collapsed = !item.collapsed">
      <template v-slot:collapsed>
        <div class="technique-collapsed-header">
          <span class="technique-header">{{ props.item.name || 'New Technique' }}</span>
          <div class="technique-meta">
            <span v-if="props.item.levelRequired > 0" class="level-req" :class="{ 'unmet': !levelRequirementMet }">
              Lvl {{ props.item.levelRequired }}+
            </span>
            <span v-if="props.item.frequency && props.item.frequency !== 'At-Will'" class="frequency">
              {{ props.item.frequency }}
              <span v-if="props.item.frequency !== 'At-Will'" class="uses">
                ({{ props.item.usesRemaining }}/{{ props.item.maxUses }})
              </span>
            </span>
            <span v-else-if="props.item.frequency === 'At-Will'" class="frequency at-will">At-Will</span>
          </div>
        </div>
      </template>
      <template v-slot:expanded>
        <input type="text" class="underline technique-header" v-model="props.item.name" placeholder="Technique Name">

        <div class="technique-grid">
          <div class="flex-box">
            <span class="technique-label capitalize">type</span>
            <select class="underline" v-model="props.item.type">
              <option value="">Select One</option>
              <option value="battle">Battle</option>
              <option value="combat">Combat</option>
              <option value="social">Social</option>
            </select>
          </div>

          <div class="flex-box">
            <span class="technique-label capitalize">category</span>
            <select class="underline" v-model="props.item.category">
              <option value="">Select One</option>
              <option value="Physical Attacks">Physical Attacks</option>
              <option value="Defensive">Defensive</option>
              <option value="Magical">Magical</option>
              <option value="Squad Support">Squad Support</option>
            </select>
          </div>

          <div class="flex-box">
            <span class="technique-label capitalize">level required</span>
            <input type="number" class="underline" v-model.number="props.item.levelRequired" min="0" max="15">
          </div>

          <div class="flex-box">
            <span class="technique-label capitalize">action type</span>
            <select class="underline" v-model="props.item.actionType">
              <option value="">Select One</option>
              <option value="Standard">Standard Action</option>
              <option value="Bonus">Bonus Action</option>
              <option value="Free">Free Action</option>
              <option value="Immediate">Immediate Action</option>
              <option value="Reaction">Reaction</option>
              <option value="Full-Round">Full-Round Action</option>
            </select>
          </div>

          <div class="flex-box">
            <span class="technique-label capitalize">frequency</span>
            <select class="underline" v-model="props.item.frequency">
              <option value="At-Will">At-Will (Unlimited)</option>
              <option value="1/Round">1/Round</option>
              <option value="1/Encounter">1/Encounter</option>
              <option value="1/Rest">1/Rest</option>
              <option value="1/Phase">1/Phase</option>
              <option value="X/Encounter">X/Encounter (Custom)</option>
            </select>
          </div>

          <div v-if="props.item.frequency !== 'At-Will'" class="usage-tracker">
            <span class="technique-label">uses remaining</span>
            <div class="usage-controls">
              <button @click="decrementUses" class="usage-btn">-</button>
              <span class="usage-display">{{ props.item.usesRemaining }} / {{ props.item.maxUses }}</span>
              <button @click="incrementUses" class="usage-btn">+</button>
              <button @click="resetUses" class="reset-btn">Reset</button>
            </div>
            <div class="flex-box">
              <span class="technique-label">max uses</span>
              <input type="number" class="underline small-input" v-model.number="props.item.maxUses" min="1" max="10">
            </div>
          </div>
        </div>

        <span class="capitalize technique-label">associated roll (optional)</span>
        <input type="text" class="underline" v-model="props.item.associatedRoll" placeholder="e.g., 2d6+4">

        <span class="capitalize technique-label">description</span>
        <textarea class="underline" v-model="props.item.description" placeholder="Describe the technique's effects..."></textarea>
      </template>
    </Collapsible>
  </NotchContainer>
  </RepeatingItem>
</template>

<style scoped>
.technique-header {
  color: var(--header-blue);
  font-weight: bold;
  font-size: medium;
}

.technique-label {
  color: var(--header-blue);
  font-weight: bold;
  font-size: small;
}

.technique-content {
  display: grid;
  gap: var(--tiny-gap);
  font-size: medium;
  font-weight: lighter;
}

.technique-collapsed-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.technique-meta {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  font-size: small;
}

.level-req {
  padding: 0.1rem 0.4rem;
  border-radius: 3px;
  background: var(--header-blue);
  color: white;
  font-weight: bold;
}

.level-req.unmet {
  background: #cc0000;
  text-decoration: line-through;
}

.frequency {
  padding: 0.1rem 0.4rem;
  border-radius: 3px;
  background: var(--notch-color);
  color: var(--text-color);
  font-weight: normal;
}

.frequency.at-will {
  background: #28a745;
  color: white;
}

.uses {
  font-weight: bold;
}

.technique-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}

.usage-tracker {
  grid-column: 1 / -1;
  display: grid;
  gap: 0.3rem;
}

.usage-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.usage-btn {
  padding: 0.2rem 0.6rem;
  background: var(--header-blue);
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  font-weight: bold;
}

.usage-btn:hover {
  opacity: 0.8;
}

.reset-btn {
  padding: 0.2rem 0.6rem;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  margin-left: auto;
}

.reset-btn:hover {
  opacity: 0.8;
}

.usage-display {
  font-weight: bold;
  color: var(--header-blue);
}

.small-input {
  max-width: 4rem;
}

.unavailable {
  opacity: 0.6;
}

.level-locked {
  border: 2px solid #cc0000;
}

.flex-box {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}
</style>