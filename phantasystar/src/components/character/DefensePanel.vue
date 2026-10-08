<script setup>
import { computed } from 'vue'
import { useCharacterStore } from '@/stores/characterStore.js'
import { formatModifier } from '@/rules/index.js'
import defenseFrame from '@/assets/img/defense-frame.webp'

const sheet = useCharacterStore()

const armor = computed(() => sheet.armorState ?? {})

const setArmorType = (type) => {
  sheet.defenseParts.armorType = sheet.defenseParts.armorType === type ? 'none' : type
}
</script>

<template>
  <div class="defense">
    <h2 class="ps-heading">Defense</h2>

    <div class="panel">
      <div class="emblem">
        <svg viewBox="0 0 350 318" width="100%" aria-hidden="true">
          <polygon points="120,62 230,62 283,159.5 230,257 120,257 67,159.5" fill="var(--ps-field)" />
          <image :href="defenseFrame" x="0" y="0" width="350" height="318" />
        </svg>
        <div class="emblem-value">{{ sheet.defenseValue }}</div>
      </div>

      <div class="parts">
        <div class="part">
          <div v-if="armor.armorLinked" class="box readonly">{{ armor.armorBonus }}</div>
          <div v-else class="box"><input v-model.number="sheet.defenseParts.armorBonus" type="number" /></div>
          <div class="lbl">Armor<br />Bonus</div>
          <span v-if="armor.armorLinked" class="note note--linked">
            {{ sheet.defenseParts.armorName || 'Armor' }}
            <b v-if="armor.armorUntrained" class="warn">Untrained</b>
          </span>
          <span v-else class="note-wrap">
            <input v-model="sheet.defenseParts.armorName" class="note" placeholder="Armor" />
            <b v-if="armor.armorUntrained" class="warn">Untrained</b>
          </span>
        </div>

        <div class="part">
          <div v-if="armor.shieldLinked" class="box readonly">{{ armor.shieldBonus }}</div>
          <div v-else class="box"><input v-model.number="sheet.defenseParts.shieldBonus" type="number" /></div>
          <div class="lbl">Shield<br />Bonus</div>
          <span v-if="armor.shieldLinked" class="note note--linked">
            {{ sheet.defenseParts.shieldName || 'Shield' }}
            <b v-if="armor.shieldUntrained" class="warn">Untrained</b>
          </span>
          <input v-else v-model="sheet.defenseParts.shieldName" class="note" placeholder="Shield" />
        </div>

        <div class="part">
          <div class="box readonly">{{ formatModifier(sheet.defenseDexApplied) }}</div>
          <div class="lbl">DEX<br />Modifier</div>
          <div class="armor-flags">
            <label>
              <input type="checkbox" :checked="sheet.defenseParts.armorType === 'medium'"
                     :disabled="armor.armorLinked" @change="setArmorType('medium')" />
              Medium Armor
            </label>
            <label>
              <input type="checkbox" :checked="sheet.defenseParts.armorType === 'heavy'"
                     :disabled="armor.armorLinked" @change="setArmorType('heavy')" />
              Heavy Armor
            </label>
            <label class="stealth">
              <input v-model="sheet.defenseParts.stealthDisadvantage" type="checkbox"
                     :disabled="armor.armorLinked" />
              Stealth Disadv.
            </label>
          </div>
        </div>

        <div class="part">
          <div class="box"><input v-model.number="sheet.defenseParts.techniqueMod" type="number" /></div>
          <div class="lbl">Technique<br />Modifier</div>
          <input v-model="sheet.defenseParts.techniqueNote" class="note" placeholder="Source" />
        </div>

        <div class="part">
          <div class="box"><input v-model.number="sheet.defenseParts.itemMisc" type="number" /></div>
          <div class="lbl">Item/Misc<br />Modifier</div>
          <input v-model="sheet.defenseParts.itemMiscNote" class="note" placeholder="Source" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/tokens.scss' as *;

.ps-heading { @include ps-heading; color: var(--ps-title); margin: 0 0 3px 4px; }

.panel {
  @include ps-panel;
  display: grid;
  grid-template-columns: 119px minmax(0, 1fr);
  gap: 10px;
  padding: 8px;
  align-items: start;
}

.emblem {
  position: relative;
  align-self: center;

  svg { display: block; }
}

.emblem-value {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 29px;
  font-weight: 700;
  color: var(--ps-derived, var(--ps-heading));
}

.parts { display: flex; flex-direction: column; gap: 4px; min-width: 0; }

.part {
  display: grid;
  grid-template-columns: 34px 70px minmax(0, 1fr);
  gap: 5px;
  align-items: center;
}


.box {
  @include ps-well;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--ps-fs-body);
  font-weight: 700;

  &.readonly { background: var(--ps-panel-alt); color: var(--ps-derived, var(--ps-text)); }

  input {
    width: 100%;
    border: none;
    background: transparent;
    text-align: center;
    font-size: var(--ps-fs-body);
    font-weight: 700;
    font-family: var(--ps-font);
    color: var(--ps-text);
    -moz-appearance: textfield;
    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
    &:focus { outline: none; }
  }
}

.lbl { font-size: 9px; font-weight: 700; color: var(--ps-heading); line-height: 1.05; }

.note {
  border: none;
  border-bottom: 1px solid var(--ps-line-soft);
  background: transparent;
  font-size: 11px;
  font-family: var(--ps-font);
  color: var(--ps-text);
  min-width: 0;
  padding: 1px 2px;
  &:focus { outline: none; border-bottom-color: var(--ps-blue); background: var(--ps-field); }
}

.note--linked {
  border-bottom-style: dotted;
  display: flex;
  align-items: baseline;
  gap: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.note-wrap {
  display: flex;
  align-items: baseline;
  gap: 6px;
  min-width: 0;

  .note { flex: 1; }
}

.warn {
  @include ps-caption;
  font-size: 8.5px;
  color: var(--ps-red);
}

.armor-flags {
  display: grid;
  grid-template-columns: repeat(2, max-content);
  column-gap: 10px;
  row-gap: 2px;

  .stealth { grid-column: 1 / -1; }
  label {
    font-size: 9px;
    line-height: 1.1;
    color: var(--ps-text);
    display: flex;
    align-items: center;
    gap: 3px;
    cursor: pointer;
  }
  input { @include ps-pip-check; }
  input:disabled { cursor: default; opacity: 0.6; }
}

@media (max-width: 560px) {
  .panel { grid-template-columns: 1fr; }
  .emblem { width: 110px; margin: 0 auto; }
}
</style>
