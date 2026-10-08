<script setup>
import { computed, ref } from 'vue'
import { useCharacterStore } from '@/stores/characterStore.js'
import { useTechniqueStore } from '@/stores/techniqueStore.js'
import SheetPanel from '@/components/shared/SheetPanel.vue'
import RollBar from '@/components/shared/RollBar.vue'
import RestButtons from '@/components/shared/RestButtons.vue'
import TechniqueRow from './TechniqueRow.vue'
import TechOptionsModal from './TechOptionsModal.vue'
import ComboRow from './ComboRow.vue'
import { rankLabel, formatModifier, ABILITIES } from '@/rules/index.js'
import { sharedSettings } from '@/relay/sheetSettings.js'

const sheet = useCharacterStore()
const store = useTechniqueStore()

const isCaster = computed(() => !!sheet.techAbility)

const optionsOpen = ref(false)

const techAbilityName = computed(
  () => ABILITIES.find((a) => a.id === sheet.techAbility)?.name ?? null,
)

const allowance = computed(() => sheet.techniquesKnownValue)

const tpPercent = computed(() => {
  const max = sheet.maxTP || 0
  if (!max) return 0
  return Math.max(0, Math.min(100, (Number(sheet.tp.current) / max) * 100))
})
</script>

<template>
  <div class="page">
    <div class="topbar">
      <RollBar />
      <span v-if="sheet.armorState?.armorUntrained" class="armor-warn">Untrained Armor</span>
      <RestButtons />
    </div>

    <div class="layout">
      <div class="left">
        <SheetPanel title="Tech Features">
          <template #actions>
            <button type="button" class="gear" title="Tech Feature Options" @click="optionsOpen = true">
              &#9881;
            </button>
          </template>

          <div class="tp">
            <span class="tp__label">Technique Points</span>
            <div class="tp__bar">
              <div class="tp__fill" :style="{ width: `${tpPercent}%` }" />
              <span class="tp__reading">{{ sheet.tp.current }} / {{ sheet.maxTP }}</span>
              <span
                class="tp__reading tp__reading--on"
                aria-hidden="true"
                :style="{ clipPath: `inset(0 ${100 - tpPercent}% 0 0)` }"
              >{{ sheet.tp.current }} / {{ sheet.maxTP }}</span>
            </div>
            <div class="tp__controls">
              <button type="button" class="step" title="Spend 1 TP" @click="sheet.tp.current = Math.max(0, Number(sheet.tp.current) - 1)">&minus;</button>
              <input v-model.number="sheet.tp.current" type="number" class="field" aria-label="Current TP" />
              <button type="button" class="step" title="Regain 1 TP" @click="sheet.tp.current = Math.min(sheet.maxTP, Number(sheet.tp.current) + 1)">+</button>
            </div>
          </div>

          <dl class="stats">
            <div><dt>Tech Ability</dt><dd>{{ techAbilityName ?? '—' }}</dd></div>
            <div><dt>Tech Attack</dt><dd>{{ sheet.techAttackPowerValue === null ? '—' : formatModifier(sheet.techAttackPowerValue) }}</dd></div>
            <div><dt>Tech Save DC</dt><dd>{{ sheet.techSaveDCValue ?? '—' }}</dd></div>
            <div><dt>Max Rank</dt><dd>{{ sheet.maxTechRankValue ?? '—' }}</dd></div>
            <div
              title="Techniques a feature granted are excluded - the book says they do not count toward your maximum"
            >
              <dt>Known</dt>
              <dd>{{ store.knownCount }}<span v-if="allowance"> / {{ allowance }}</span></dd>
            </div>
          </dl>

          <div v-if="isCaster" class="limit">
            <label
              class="toggle"
              title="Granted by a feature - the savant's at level 7. Uses equal your tech ability modifier. Constitution save vs 10 + the technique's rank to cast without enough TP; on a failure the technique fails, your TP drops to 0, and you gain a level of exhaustion."
            >
              <input v-model="store.hasLimitBreach" type="checkbox" />
              <span>Limit Breach</span>
            </label>
            <div v-if="store.hasLimitBreach" class="breaches">
              <span class="breaches__count">
                {{ store.limitBreachesLeft }} / {{ store.maxLimitBreaches }}
              </span>
              <button type="button" class="step" :disabled="store.limitBreachesLeft <= 0" @click="store.spendLimitBreach()">
                Spend
              </button>
              <button type="button" class="step" :disabled="store.limitBreachesUsed <= 0" @click="store.limitBreachesUsed -= 1">
                Restore
              </button>
            </div>
          </div>
          <TechOptionsModal :open="optionsOpen" @close="optionsOpen = false" />
        </SheetPanel>

        <SheetPanel v-if="store.advancedSlots.length" title="Advanced Techniques">
          <p class="hint">One per rank. Recover after long rest.</p>
          <div class="slots">
            <button
              v-for="slot in store.advancedSlots"
              :key="slot.rank"
              type="button"
              class="slot"
              :class="{ used: slot.used }"
              :title="slot.used ? `${slot.label} spent - click to restore` : `${slot.label} available`"
              @click="store.toggleAdvancedRank(slot.rank)"
            >
              {{ slot.rank }}
            </button>
          </div>
        </SheetPanel>
      </div>

      <div class="right">
        <SheetPanel title="Known Techniques">
          <template #actions>
            <button type="button" class="add" @click="store.addCustom()">+ Add</button>
          </template>

          <div v-if="store.techniques.length === 0" class="empty">No techniques yet.</div>

          <div v-for="group in store.byRank" :key="group.rank" class="rank-group">
            <h3 class="rank-group__heading">
              {{ rankLabel(group.rank) }}
              <span class="rank-group__count">{{ group.techniques.length }}</span>
            </h3>
            <TechniqueRow v-for="t in group.techniques" :key="t._id" :technique="t" />
          </div>
        </SheetPanel>

        <SheetPanel v-if="sharedSettings.comboTechniques" title="Combo Techniques">
          <template #actions>
            <button type="button" class="add" @click="store.addCombo()">+ Add</button>
          </template>
          <div v-if="store.combos.length === 0" class="empty">No combos yet.</div>
          <ComboRow v-for="c in store.combos" :key="c._id" :combo="c" />
        </SheetPanel>

      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/tokens.scss' as *;

.armor-warn {
  @include ps-caption;
  font-size: 10px;
  padding: 2px 8px;
  border: 1px solid var(--ps-red);
  border-radius: var(--ps-radius-sm);
  color: var(--ps-red);
}

.page {
  display: flex;
  flex-direction: column;
  gap: var(--ps-gap-lg);
  padding: 12px;
  max-width: 1180px;
  margin: 0 auto;
}

.topbar {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.layout {
  display: grid;
  grid-template-columns: minmax(280px, 0.85fr) minmax(0, 1.4fr);
  gap: var(--ps-gap-lg);
  align-items: start;
}

.left, .right { display: flex; flex-direction: column; gap: var(--ps-gap-lg); min-width: 0; }

.tp {
  display: flex;
  flex-direction: column;
  gap: 6px;

  &__bar {
    position: relative;
    height: 22px;
    border: var(--ps-border);
    border-radius: 11px;
    background: var(--ps-field);
    overflow: hidden;
  }

  &__fill {
    position: absolute;
    inset: 0 auto 0 0;
    background: var(--ps-blue);
    transition: width 0.2s ease;
  }

  &__reading {
    position: relative;
    display: block;
    text-align: center;
    line-height: 20px;
    font-weight: 700;
    font-size: 12px;
    color: var(--ps-heading);

    &--on {
      position: absolute;
      inset: 0;
      color: var(--ps-on-fill);
      transition: clip-path 0.2s ease;
    }
  }

  &__controls {
    display: flex;
    align-items: center;
    gap: 5px;
  }

  &__label { @include ps-caption; font-size: 9px; margin-bottom: -3px; }
}

.field {
  @include ps-well;
  height: 24px;
  width: 58px;
  font-size: 12px;

  &:focus { outline: 2px solid var(--ps-blue); outline-offset: -1px; }
}

.gear { @include ps-gear-button; }

.add {
  @include ps-caption;
  background: var(--ps-panel);
  border: var(--ps-border-thin);
  border-radius: var(--ps-radius-sm);
  padding: 2px 10px;
  cursor: pointer;

  &:hover { background: var(--ps-panel-alt); }
}

.step {
  @include ps-caption;
  background: var(--ps-panel);
  border: var(--ps-border-thin);
  border-radius: 4px;
  min-width: 24px;
  height: 24px;
  cursor: pointer;
  font-size: 11px;

  &:hover:not(:disabled) { background: var(--ps-panel-alt); }
  &:disabled { opacity: 0.4; cursor: not-allowed; }
}

.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(84px, 1fr));
  gap: 4px;
  margin: 8px 0 0;

  div {
    border: var(--ps-border-thin);
    border-radius: var(--ps-radius-sm);
    background: var(--ps-field);
    padding: 2px 4px;
    text-align: center;
  }

  dt { @include ps-caption; font-size: 8.5px; }
  dd { margin: 0; font-size: 15px; font-weight: 700; color: var(--ps-derived, var(--ps-heading)); text-transform: capitalize; }
}

.hint { margin: 0 0 6px; font-size: 10.5px; color: var(--ps-text-muted); }

.limit {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px 10px;
  margin-top: 8px;
  padding-top: 8px;
  border-top: var(--ps-border-thin);
}

.toggle {
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;

  input { @include ps-pip-check; }
  span { @include ps-caption; font-size: 9.5px; }
}

.slots { display: flex; gap: 5px; flex-wrap: wrap; }

.slot {
  width: 30px;
  height: 30px;
  border: 1.5px solid var(--ps-breach);
  border-radius: 50%;
  background: var(--ps-field);
  color: var(--ps-breach);
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;

  &:hover { background: rgba(var(--ps-breach-rgb), 0.12); }
  &.used {
    background: var(--ps-breach);
    color: var(--ps-on-fill);
    text-decoration: line-through;
  }
}

.breaches {
  display: flex;
  align-items: center;
  gap: 6px;

  &__count {
    font-size: 17px;
    font-weight: 700;
    color: var(--ps-heading);
  }
}

.rank-group {
  &__heading {
    @include ps-heading(14px);
    display: flex;
    align-items: baseline;
    gap: 6px;
    margin: 8px 0 2px;
    border-bottom: 1px solid var(--ps-gold);
  }

  &__count {
    font-size: 9px;
    font-variant: normal;
    color: var(--ps-text-muted);
  }

  &:first-child &__heading { margin-top: 0; }
}

.empty { font-size: 11.5px; color: var(--ps-text-muted); padding: 6px 2px; }


@media (max-width: 860px) {
  .layout { grid-template-columns: 1fr; }
}
</style>
