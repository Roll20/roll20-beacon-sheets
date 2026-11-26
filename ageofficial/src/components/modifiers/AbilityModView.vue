<template>
  <div class="ability-mod-grid">
    <select
      class="age-atk-select form-select"
      data-testid="test-spell-weaponType-input"
      v-model="mod.modifiedValue"
    >
      <option v-for="abl in abilities" :key="abl" :value="abl">
        {{ abl }}
      </option>
    </select>
    <select
      class="age-atk-select form-select"
      data-testid="test-spell-weaponType-input"
      v-model="mod.abilityFocus"
    >
      <option value="">None</option>
      <option
        v-for="abl in filteredFocuses[mod.modifiedValue]"
        :key="abl"
        :value="abl"
      >
        {{ abl }}
      </option>
    </select>
    <select
      class="age-atk-select form-select"
      data-testid="test-spell-weaponType-input"
      v-model="mod.modifiedOption"
    >
      <option value="">None</option>
      <option value="Bonus">Bonus</option>
      <option value="Penalty">Penalty</option>
      <option value="Reroll">Reroll</option>
    </select>
    <div v-if="mod.modifiedOption === 'Bonus'">
      <input
        type="number"
        class="form-control"
        placeholder="0"
        v-model="mod.bonus"
      />
    </div>
    <div v-if="mod.modifiedOption === 'Penalty'">
      <input
        type="number"
        class="form-control"
        placeholder="0"
        v-model="mod.penalty"
      />
    </div>
    <!-- <div style="display: grid;grid-template-columns: 75px 50px;">
                        Ability Reroll
                        <label class="age-checkbox-toggle">
                        <input type="checkbox" v-model="mod.abilityReroll" />
                        <span class="slider round"  v-tippy="{ content: mod.abilityReroll ? 'Option to reroll' : 'No reroll' }"></span>
                      </label>
                      </div> -->
  </div>
</template>
<script setup>
import { computed } from "vue";
import { useSettingsStore } from "@/sheet/stores/settings/settingsStore";
import { resolveFocuses } from "@/components/modifiers/focuses";

const props = defineProps({
  mod: { type: Object },
});
const settings = useSettingsStore();
const abilities = [
  "Accuracy",
  "Communication",
  "Constitution",
  "Dexterity",
  "Fighting",
  "Intelligence",
  "Perception",
  "Strength",
  "Willpower",
];

// Base focuses for the system, merged with any active genre-slice focuses.
const filteredFocuses = computed(() =>
  resolveFocuses(settings.gameSystem, settings)
);
</script>
<style scoped>
.ability-mod-grid {
  display: grid;
  gap: 10px;
  grid-template-columns: 1fr 1fr 1fr 50px;
}
</style>
