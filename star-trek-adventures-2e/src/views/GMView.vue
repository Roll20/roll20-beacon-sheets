<template>
  <div class="gm-sheet">
    <div class="gm-sheet__main">
      <div class="gm-sheet__resources">
        <ResourceCounter 
          id="Momentum"
          label="Momentum"
          :modelValue="{value: momentum}"
          @update:modelValue="momentum = $event.value"
        />
        <ResourceCounter 
          id="Threat"
          label="Threat"
          :modelValue="{value: threat}"
          @update:modelValue="threat = $event.value"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ResourceCounter } from "@/components/ResourceCounter";
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
  &__resources {
    display: grid;
    grid-column: span 12;
    grid-template-columns: subgrid;
    justify-items: center;
  }
}
</style>
