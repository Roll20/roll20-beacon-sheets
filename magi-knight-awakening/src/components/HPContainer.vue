<script setup>
import { useSheetStore } from '@/stores';
const sheet = useSheetStore();
</script>

<template>
<div class="hp-container">
  <img src="@/assets/sword.png" alt="magic sword">
  <div class="hp-row">
    <div class="hp-cell">
      <label for="curr-hp">HP</label>
      <input type="number" v-model="sheet.hp.current" id="curr-hp">
    </div>
    <div class="hp-cell">
      <label for="temp-hp">Temp</label>
      <input type="number" v-model="sheet.hp.temp" id="temp-hp">
    </div>
    <div class="hp-cell">
      <label for="max-hp">Max</label>
      <span id="max-hp">{{ sheet.hp.max }}</span>
    </div>
  </div>
  <div class="hp-row">
    <div class="hp-cell double-cell">
      <label for="curr-mp">MP</label>
      <input type="number" v-model="sheet.mp.current" id="curr-mp">
    </div>
    <div class="hp-cell">
      <label for="max-mp">Max</label>
      <span id="max-mp">{{ sheet.mp.max }}</span>
    </div>
  </div>
  <div class="hp-row">
    <div class="hp-cell double-cell">
      <label for="curr-shp">SHP</label>
      <input type="number" v-model="sheet.shp.current" id="curr-shp">
    </div>
    <div class="hp-cell">
      <label for="max-shp">Max</label>
      <span id="max-shp">{{ sheet.shp.max }}</span>
    </div>
  </div>
</div>
</template>

<style>
.hp-container {
  --_swordOverflow: 40px;
  --_borderSize: 1px;
  position: relative;
  display: grid;
  gap: var(--half-gap) var(--_borderSize);
  grid-template-columns: 1fr 1fr 2fr;
  align-self: start;
  margin-block: var(--_swordOverflow);

  img {
    position: absolute;
    grid-column: 1 / -1;
    grid-row: span 3;
    place-self: center;
    height: calc(100% + calc(var(--_swordOverflow) * 2));
    z-index: 10;
  }
}

.hp-row {
  display: grid;
  grid-column: 1 / -1;
  padding: var(--_borderSize);
  grid-template-columns: subgrid;
  background-color: var(--borderColor);
}

.hp-cell {
  isolation: isolate;
  background-color: var(--masterBack);
  flex: 1 0 0;
  display: grid;
  grid-template-rows:
    [label-start input-start] auto [label-end] 30px [input-end];
  padding: var(--tiny-gap);

  &:not(:last-child) {
    grid-template-columns: [label-start input-start] auto [label-end] 1fr [input-end];
  }

  &:last-child {
    grid-template-columns: [input-start] 1fr [label-start] auto [label-end input-end];
  }

  label {
    grid-area: label;
  }

  input,
  span {
    grid-area: input;
    text-align: center;
    vertical-align: bottom;
    z-index: -1;
    background-color: transparent;
    border: none;
    z-index:10;
  }
  span{
    place-self: center;
  }
}

.double-cell {
  grid-column: span 2;
}
</style>