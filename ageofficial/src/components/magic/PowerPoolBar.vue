<template>
  <div class="power-pool">
    <div class="d-flex flex-column justify-content-between power-pool-bar">
      <div class="hpmp-container">
        <div class="hpmp-current">
          <input
            class="age-input"
            type="number"
            v-model.number="current"
            :max="max"
            :min="0"
            autocomplete="off"
            :aria-label="`Current ${heading} points`"
          />
        </div>
        <div>/</div>
        <div class="hpmp-max">{{ max }}</div>
      </div>
      <div
        class="progress"
        role="progressbar"
        :aria-label="`${heading} points`"
        :aria-valuenow="current"
        aria-valuemin="0"
        :aria-valuemax="max"
      >
        <div
          class="progress-bar"
          :class="{
            'bg-success': percent >= 50,
            'bg-warning': percent < 50,
            'bg-danger': percent < 25,
          }"
          :style="{ width: percent + '%' }"
        ></div>
      </div>
    </div>
    <h4 class="age-subsection-header">{{ heading }}</h4>
  </div>
</template>
<script setup>
import { computed } from "vue";
import { useCharacterStore } from "@/sheet/stores/character/characterStore";
import { useSettingsStore } from "@/sheet/stores/settings/settingsStore";
import { poolHeading } from "@/utility/powerSources";

const props = defineProps({
  sourceId: { type: String, required: true },
});
const char = useCharacterStore();
const settings = useSettingsStore();

const current = computed({
  get: () => char.poolCurrent(props.sourceId),
  set: (value) => char.setPoolCurrent(props.sourceId, Number(value) || 0),
});
const max = computed(() => char.poolMax(props.sourceId));
const percent = computed(() => (max.value > 0 ? (current.value / max.value) * 100 : 0));
const heading = computed(() => poolHeading(props.sourceId, settings.gameSystem));
</script>
<style scoped>
.power-pool-bar {
  height: 50px;
}
</style>
