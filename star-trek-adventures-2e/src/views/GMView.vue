<template>
  <div class="gm-sheet">
    <header class="gm-sheet__header">
      <button
        @click="gmStore.registerAsGMSheet"
      >
        Register GM Sheet
      </button>
    </header>
    <main class="gm-sheet__main">
      <div 
        v-if="gmStore.localSheetID === initValsComputed.sharedSettings.gmID"
        class="gm-sheet__resource-inputs"
      >
        <ResourceCounter 
          id="Momentum"
          label="Momentum"
          data-testid="momentum-input"
          :modelValue="{value: momentum}"
          @update:modelValue="momentum = $event.value"
        />
        <ResourceCounter 
          id="Threat"
          label="Threat"
          data-testid="threat-input"
          :modelValue="{value: threat}"
          @update:modelValue="threat = $event.value"
        />
      </div>
      <div 
        v-else
        class="gm-sheet__resource-displays"
      >
        <div 
          class="pc-header__resource-display" 
          data-testid="momentum-display"
        >
          Momentum: {{ momentum }}
        </div>
        <div
          class="pc-header__resource-display"
          data-testid="threat-display"
        >
          Threat: {{ threat }}
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ResourceCounter } from "@/components/GM/ResourceCounter";
import { initValues } from "@/relay/relay";
import { useGMStore } from "@/sheet/stores/gmStore/gmStore";
import { computed } from "vue";

const gmStore = useGMStore();

const momentum = computed({
  get() {return gmStore.resources.momentum},
  set(newValue) {
    gmStore.resources.momentum = newValue
  }
})

const threat = computed({
  get() {return gmStore.resources.threat},
  set(newValue) {
    gmStore.resources.threat = newValue
  }
})

const initValsComputed = computed(() => initValues)

</script>

<style lang="scss">
@use '../common/scss/vars.scss' as vars;

.gm-sheet {
  &__main {
    display: grid;
    gap: 1rem;
    margin-bottom: 1rem;
    grid-template-columns: repeat(12, 1fr);
  }
  &__resource-inputs,
  &__resource-displays {
    display: grid;
    grid-column: span 12;
    grid-template-columns: subgrid;
    justify-items: center;
  }
}
</style>
