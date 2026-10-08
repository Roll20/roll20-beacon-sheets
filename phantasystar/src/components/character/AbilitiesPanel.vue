<script setup>
import { ref } from 'vue'
import { useCharacterStore } from '@/stores/characterStore.js'
import { useSheetRolls } from '@/composables/useSheetRolls.js'
import { ABILITIES, formatModifier } from '@/rules/index.js'
import SheetPanel from '@/components/shared/SheetPanel.vue'
import SaveOptionsModal from './SaveOptionsModal.vue'

const sheet = useCharacterStore()
const rolls = useSheetRolls()

const left = ABILITIES.slice(0, 3)
const right = ABILITIES.slice(3)

const saveOptions = ref(false)
</script>

<template>
  <SheetPanel title="Abilities">
    <template #actions>
      <button type="button" class="gear" title="Save Options" @click="saveOptions = true">
        &#9881;
      </button>
    </template>

    <div class="cols">
      <div v-for="(group, gi) in [left, right]" :key="gi" class="col">
        <div class="col-head">
          <span>Modifier</span>
          <span>Save</span>
        </div>

        <div v-for="a in group" :key="a.id" class="row">
          <input
            class="mod"
            type="number"
            min="-5"
            max="5"
            :value="sheet.abilities[a.id]"
            @input="sheet.abilities[a.id] = Number($event.target.value) || 0"
          />

          <button
            type="button"
            class="name"
            :title="`${a.name} check`"
            @click="rolls.rollAbilityCheck(a.id)"
          >
            <span class="abbr">{{ a.abbr }}</span>
            <span class="full">{{ a.name }}</span>
          </button>

          <button
            type="button"
            class="pip"
            :class="{ on: sheet.saveProficiencies[a.id] }"
            :title="sheet.saveProficiencies[a.id]
              ? `Trained - save includes the Save Bonus ${formatModifier(sheet.saveBonusValue)}`
              : 'Not trained - click to toggle'"
            @click="sheet.toggleSaveProficiency(a.id)"
          />

          <button
            type="button"
            class="save"
            :class="{ proficient: sheet.saveProficiencies[a.id] }"
            :title="`${a.name} saving throw`"
            @click="rolls.rollSave(a.id)"
          >
            {{ formatModifier(sheet.saves[a.id]) }}
          </button>
        </div>
      </div>
    </div>

    <SaveOptionsModal :open="saveOptions" @close="saveOptions = false" />
  </SheetPanel>
</template>

<style scoped lang="scss">
@use '@/styles/tokens.scss' as *;

.gear { @include ps-gear-button; }

.cols { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.col { display: flex; flex-direction: column; gap: 4px; min-width: 0; }

.col-head {
  display: flex;
  justify-content: space-between;
  @include ps-caption;
  padding: 0 2px;
}

.row {
  display: grid;
  grid-template-columns: 38px minmax(0, 1fr) 11px 38px;
  align-items: center;
  gap: 5px;
}

.mod {
  @include ps-well;
  height: 34px;
  font-size: var(--ps-fs-value);
  font-weight: 700;
  -moz-appearance: textfield;
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
  &:focus { outline: 2px solid var(--ps-blue); outline-offset: -1px; }
}

.name {
  display: block;
  width: 100%;
  text-align: center;
  border: none;
  border-bottom: 1px solid var(--ps-line-soft);
  background: none;
  padding: 0;
  min-width: 0;
  cursor: pointer;
  font-family: inherit;

  &:hover { background: var(--ps-panel-alt); }

  .abbr {
    display: block;
    font-family: var(--ps-font);
    font-size: 19px;
    font-weight: 700;
    color: var(--ps-heading);
    line-height: 1.05;
  }
  .full { display: block; font-size: 9px; color: var(--ps-text-muted); }
}

.pip {
  width: 11px;
  height: 11px;
  border-radius: 50%;
  border: 1.5px solid var(--ps-line);
  background: var(--ps-field);
  padding: 0;
  cursor: pointer;

  &.on { background: var(--ps-gold-light); border-color: var(--ps-gold-dark); }
}

.save {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: var(--ps-border);
  background: var(--ps-field);
  font-size: var(--ps-fs-body);
  font-weight: 700;
  color: var(--ps-derived, var(--ps-text));
  cursor: pointer;
  font-family: var(--ps-font);

  &.proficient {
    background: var(--ps-gold-light);
    border-color: var(--ps-gold-dark);
    color: var(--ps-on-gold-fill, var(--ps-derived, var(--ps-text)));
    box-shadow: inset 0 0 0 2px var(--ps-paper);
  }
  &:hover { filter: brightness(0.96); }
}

@media (max-width: 520px) {
  .cols { grid-template-columns: 1fr; }
}
</style>
