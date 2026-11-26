<template>
  <div
    tabindex="0"
    class="mp-pf-container"
    @mouseenter="pfHover = true"
    @mouseleave="pfHover = false"
  >
    <div class="age-pf-cntr">
      <div class="age-pf-label">{{ powerFatigueLabel }}</div>
      <div class="age-pf-details">
        <div>
          <button
            class="age-icon-btn"
            v-show="char.powerFatigue > 0 && pfHover"
            @click="char.resetPowerFatigue"
            v-tippy="{ content: 'Click to reset to No Fatigue' }"
          >
            <font-awesome-icon :icon="['fa', 'rotate']" />
          </button>
        </div>

        <div :class="'age-pf ' + powerFatigueClass"></div>
        <div class="age-pf-manual-change" v-show="pfHover">
          <button
            class="age-icon-btn-sm"
            :disabled="char.powerFatigue > 3"
            @click="char.powerFatigue++"
            v-tippy="{ content: 'Manually increase Power Fatigue' }"
          >
            <font-awesome-icon :icon="['fa', 'caret-up']" />
          </button>
          <button
            class="age-icon-btn-sm"
            :disabled="char.powerFatigue === 0"
            @click="char.powerFatigue--"
            v-tippy="{ content: 'Manually decrease Power Fatigue' }"
          >
            <font-awesome-icon :icon="['fa', 'caret-down']" />
          </button>
        </div>
      </div>
    </div>
    <h4 class="age-subsection-header mp-pf-header">
      <span class="age-nowrap"> Power Fatigue </span>
      <button
        class="age-icon-btn mp-pf-dice-btn"
        v-if="pfHover"
        @click="showPFTestModal = true"
        v-tippy="{ content: 'Manually roll for Power Fatigue' }"
      >
        <font-awesome-icon :icon="['fa', 'dice']" />
      </button>
    </h4>
  </div>
  <Teleport to="body">
    <PowerFatigueModalView
      v-if="showPFTestModal"
      :show="showPFTestModal"
      @close="showPFTestModal = false"
    >
      <template #header>
        <h3 class="age-modal-details-header">Power Fatigue Test</h3>
      </template>
    </PowerFatigueModalView>
  </Teleport>
</template>
<script setup>
import { computed, ref } from "vue";
import { useCharacterStore } from "@/sheet/stores/character/characterStore";
import PowerFatigueModalView from "@/components/modifiers/PowerFatigueModalView.vue";

const char = useCharacterStore();
const showPFTestModal = ref(false);
const pfHover = ref(false);
const levels = ["None", "Winded", "Fatigued", "Exhausted", "Dying"];
const powerFatigueClass = computed(
  () =>
    ({
      1: "age-pf-winded",
      2: "age-pf-fatigued",
      3: "age-pf-exhausted",
      4: "age-pf-dying",
    })[char.powerFatigue] ?? "age-pf-default"
);
const powerFatigueLabel = computed(
  () => `Fatigue: ${levels[char.powerFatigue] ?? "None"}`
);
</script>
<style scoped>
.mp-pf-container {
  position: relative;
}
.mp-pf-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  flex-wrap: nowrap;
}
.mp-pf-dice-btn {
  position: absolute;
  bottom: 0px;
  right: -15px;
}
</style>
