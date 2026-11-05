<template>
  <div
    class="d-flex flex-column justify-content-between eldritch-price-container"
    @mouseenter="hover = true"
    @mouseleave="hover = false"
  >
    <div class="age-container-content">
      <button
        class="age-icon-btn age-reset-btn"
        v-if="char.eldritchPrice > 0 && hover"
        @click="char.resetEldritchPrice"
        v-tippy="{ content: 'Click to reset Eldritch Price to 0' }"
      >
        <font-awesome-icon :icon="['fa', 'rotate']" />
      </button>
      <input
        class="age-input age-num-input"
        type="number"
        v-model.number="char.eldritchPrice"
        min="0"
        autocomplete="off"
        aria-label="Eldritch Price"
      />
      <div class="age-container-content-corner-top-right"></div>
      <div class="age-container-content-corner-bottom-left"></div>
    </div>
  </div>
  <h4 class="age-subsection-header">Eldritch Price</h4>
</template>
<script setup>
import { ref } from "vue";
import { useCharacterStore } from "@/sheet/stores/character/characterStore";

const char = useCharacterStore();
const hover = ref(false);
</script>
<style scoped>
.eldritch-price-container {
  height: 50px;
}
</style>
