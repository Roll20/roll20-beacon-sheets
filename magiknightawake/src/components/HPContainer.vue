<script setup>
import { useSheetStore } from '@/stores';
const sheet = useSheetStore();
</script>

<template>
  <div class="hp-container">
    <img src="@/assets/sword.png" alt="magic sword">
    <div class="hp-row">
      <div class="hp-cell left-input">
        <label for="curr-hp">HP</label>
        <input type="number" v-model="sheet.hp.current" id="curr-hp">
      </div>
      <div class="hp-cell left-input">
        <label for="temp-hp">Temp HP</label>
        <input type="number" v-model="sheet.hp.temp" id="temp-hp">
      </div>
      <div class="hp-cell right-input">
        <label for="max-hp">Max HP</label>
        <input type="number" v-model="sheet.hp.max" id="max-hp">
      </div>
    </div>
    <div class="hp-row left-input">
      <div class="hp-cell double-cell">
        <label for="curr-mp">MP</label>
        <input type="number" v-model="sheet.mp.current" id="curr-mp">
      </div>
      <div class="hp-cell right-input">
        <label for="max-mp">Max MP</label>
        <input type="number" v-model="sheet.mp.max" id="max-mp">
      </div>
    </div>
    <div class="hp-row left-input">
      <div class="hp-cell double-cell">
        <label for="curr-shp">SHP</label>
        <input type="number" v-model="sheet.shp.current" id="curr-shp">
      </div>
      <div class="hp-cell right-input">
        <label for="max-shp">Max SHP</label>
        <input type="number" v-model="sheet.shp.max" id="max-shp">
      </div>
    </div>
  </div>
</template>


<style>
.hp-container {
  --_swordOverflow: 40px;
  --_borderSize: 2px;
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
    pointer-events: none; /* Makes the image click-through */
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
    font-size: x-small;
    font-weight: bold;
  }

  input,
  span {
    grid-area: input;
    text-align: left;
    vertical-align: bottom;
    align-self: self-end;
    z-index: -1;
    background-color: transparent;
    border: none;
    z-index:10;
    padding-top:1cap;
    margin-top:.1cap;
    margin-bottom: .1cap;
    font-size: xx-large;
  }
  span{
    place-self: center;
  }
}

.left-input input{
  text-align: left; /* Left-justifies the text */
  vertical-align: bottom; /* Aligns the input to the bottom */
  color: var(--color);
}

.right-input input{
  text-align: right; /* Left-justifies the text */
  vertical-align: bottom; /* Aligns the input to the bottom */
  color: var(--color);
}

.double-cell {
  grid-column: span 2;
}
</style>