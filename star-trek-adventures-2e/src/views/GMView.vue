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
    console.log(newValue)
    gmStore.resources.momentum = newValue
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
    grid-template-columns: repeat(1fr, 12);
  }
}
</style>
