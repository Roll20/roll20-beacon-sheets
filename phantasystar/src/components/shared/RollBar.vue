<script setup>
import { computed } from 'vue'
import { useSheetRolls } from '@/composables/useSheetRolls.js'
import { useCharacterStore } from '@/stores/characterStore.js'
import { useAppStore } from '@/stores/index.js'
import { NORMAL, ADVANTAGE, DISADVANTAGE, FATE_DICE } from '@/rules/index.js'
import { sharedSettings } from '@/relay/sheetSettings.js'
import { PC } from '@/sheetTypes.js'

const rolls = useSheetRolls()
const sheet = useCharacterStore()
const app = useAppStore()

const hasFate = computed(() => app.sheetType === PC)

const showBane = computed(() => sharedSettings.temptingFate && hasFate.value)

const modes = [
  { id: DISADVANTAGE, label: 'Dis', title: 'Disadvantage: roll two d20s, keep the lower' },
  { id: NORMAL, label: 'Normal', title: 'One d20' },
  { id: ADVANTAGE, label: 'Adv', title: 'Advantage: roll two d20s, keep the higher' },
]
</script>

<template>
  <div class="roll-bar">
    <span class="roll-bar__label" title="Stays set until you change it">Roll mode</span>

    <div class="modes">
      <button
        v-for="m in modes"
        :key="m.id"
        type="button"
        class="mode"
        :class="{ active: rolls.mode.value === m.id }"
        :title="m.title"
        @click="rolls.setMode(m.id)"
      >
        {{ m.label }}
      </button>
    </div>

    <span class="roll-bar__label">Seen by</span>

    <div class="modes">
      <button
        v-for="v in rolls.VISIBILITIES"
        :key="v.id"
        type="button"
        class="mode"
        :class="{ active: rolls.visibility.value.id === v.id, secret: v.id !== 'public' }"
        :title="v.hint"
        @click="rolls.setVisibility(v.id)"
      >
        {{ v.short }}
      </button>
    </div>

    <button
      v-if="hasFate"
      type="button"
      class="fate"
      :disabled="!rolls.canAddFateDie.value"
      :title="
        rolls.canAddFateDie.value
          ? `Spend 1 fate point to add a ${sheet.fate.die} to your last roll`
          : 'Make a roll first, and have a fate point left to spend'
      "
      @click="rolls.addFateDie()"
    >
      Fate Bonus ({{ sheet.fate.die }})
      <small>{{ sheet.fate.remaining }} left</small>
    </button>

    <template v-if="showBane">
      <span class="roll-bar__label">Bane</span>
      <select
        class="bane"
        :class="{ armed: rolls.options.bane }"
        :value="rolls.options.bane ?? ''"
        title="Subtracted from your next d20 roll"
        @change="rolls.setBane($event.target.value)"
      >
        <option value="">&mdash;</option>
        <option v-for="die in FATE_DICE" :key="die" :value="die">{{ die }}</option>
      </select>
      <button
        v-if="rolls.options.bane"
        type="button"
        class="fate"
        :disabled="sheet.fate.remaining <= 0"
        title="Spend 1 fate point instead of rolling the bane die"
        @click="rolls.buyOffBane()"
      >
        Buy Off
      </button>
    </template>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/tokens.scss' as *;

.roll-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;

  &__label {
    @include ps-caption;
  }
}

.modes {
  display: inline-flex;
  border: var(--ps-border);
  border-radius: var(--ps-radius-sm);
  overflow: hidden;
}

.mode {
  background: var(--ps-field);
  border: none;
  border-right: var(--ps-border-thin);
  padding: 3px 10px;
  font-size: 11px;
  font-weight: 700;
  color: var(--ps-heading);
  cursor: pointer;

  &:last-child { border-right: none; }
  &:hover { background: var(--ps-panel-alt); }
  &.active { background: var(--ps-fill); color: var(--ps-on-fill); }
  &.active.secret { background: var(--ps-gold-dark); color: var(--ps-on-gold); }
}

.bane {
  @include ps-control(22px);
  width: 54px;
  font-size: 11px;
  font-weight: 700;

  &.armed { background: var(--ps-red); border-color: var(--ps-red); color: #fff; }
}

.fate {
  display: inline-flex;
  align-items: baseline;
  gap: 5px;
  background: var(--ps-gold-light);
  border: 1.5px solid var(--ps-gold-dark);
  border-radius: var(--ps-radius-sm);
  padding: 3px 10px;
  font-size: 11px;
  font-weight: 700;
  color: var(--ps-on-gold-fill, var(--ps-heading));
  cursor: pointer;

  small { font-size: 9px; font-weight: 400; color: var(--ps-on-gold-fill, var(--ps-heading)); }

  &:hover:not(:disabled) { background: var(--ps-gold); }
  &:disabled { opacity: 0.45; cursor: not-allowed; }
}
</style>
