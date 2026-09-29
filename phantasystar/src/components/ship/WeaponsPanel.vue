<script setup>
import { useStarshipStore } from '@/stores/starshipStore.js'
import { useSheetRolls } from '@/composables/useSheetRolls.js'
import { formatModifier } from '@/rules/index.js'
import ConfirmDelete from '@/components/shared/ConfirmDelete.vue'

const ship = useStarshipStore()
const rolls = useSheetRolls()
</script>

<template>
  <div class="weapons">
    <div class="head">
      <h2 class="ps-heading">Weapon Systems</h2>
      <span class="formula">Attack Power = gunner&rsquo;s DEX + gunner&rsquo;s Save Bonus</span>
      <button type="button" class="add" @click="ship.addWeapon()">+ Add</button>
    </div>

    <div class="panel">
      <div class="thead">
        <span>Gunner</span>
        <span>Weapon</span>
        <span>Range</span>
        <span>DEX</span>
        <span>Save</span>
        <span>Attack</span>
        <span>Damage</span>
        <span>Type</span>
        <span />
      </div>

      <p v-if="!ship.weapons.length" class="empty">
        No weapons yet. Copy them from the ship&rsquo;s stat block &mdash; range is in units,
        and each one needs a gunner.
      </p>

      <div v-for="w in ship.weapons" :key="w._id" class="row">
        <select v-model="w.gunnerId" aria-label="Gunner">
          <option value="">&mdash;</option>
          <option v-for="c in ship.roster" :key="c._id" :value="c._id">{{ c.name || 'Unnamed' }}</option>
        </select>
        <input v-model="w.name" placeholder="Laser Cannon" />
        <input v-model="w.range" placeholder="8" class="narrow" />
        <output class="narrow">{{ ship.gunnerOf(w).dexterity }}</output>
        <output class="narrow">{{ ship.gunnerOf(w).saveBonus }}</output>

        <button
          type="button"
          class="attack"
          :title="`Roll an attack with ${w.name || 'this weapon'}`"
          @click="rolls.rollShipAttack(w)"
        >
          {{ formatModifier(ship.weaponPower(w)) }}
        </button>

        <div class="dmg">
          <input v-model="w.damage" aria-label="Damage" placeholder="1d8" />
          <button
            type="button"
            class="damage"
            :disabled="!w.damage"
            :title="w.damage ? `Roll ${w.damage} damage` : 'Enter a damage formula first'"
            @click="rolls.rollShipDamage(w)"
          >
            Roll
          </button>
        </div>

        <input v-model="w.damageType" placeholder="Physical" />

        <ConfirmDelete class="del" title="Remove" @confirm="ship.removeWeapon(w._id)" />

        <div class="row__extras">
          <label title="The stat block lists (+ Dex mod) for this weapon">
            <input v-model="w.addDexToDamage" type="checkbox" />
            <span>+ gunner&rsquo;s DEX to damage</span>
          </label>
          <input v-model="w.notes" class="notes" placeholder="Notes" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/tokens.scss' as *;

.weapons { display: flex; flex-direction: column; min-width: 0; }

.head {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin: 0 0 3px 4px;
  flex-wrap: wrap;

  .ps-heading { @include ps-heading; color: var(--ps-title); margin: 0; }
}

.formula { font-size: 9.5px; color: var(--ps-text-muted); }

.add {
  @include ps-caption;
  margin-left: auto;
  background: var(--ps-panel);
  border: var(--ps-border-thin);
  border-radius: var(--ps-radius-sm);
  padding: 2px 10px;
  cursor: pointer;

  &:hover { background: var(--ps-panel-alt); }
}

.panel {
  @include ps-panel;
  padding: 6px;
  overflow-x: auto;
}

.thead, .row {
  display: grid;
  grid-template-columns:
    minmax(0, 1fr) minmax(0, 1.4fr) 48px 44px 44px 56px minmax(0, 1.2fr) minmax(0, 0.9fr) 22px;
  gap: 5px;
  align-items: center;
  min-width: 620px;
}

.thead {
  @include ps-caption;
  font-size: 8.5px;
  padding: 0 2px 3px;
  border-bottom: 1.5px solid var(--ps-line);
}

.row {
  padding: 3px 2px;
  border-bottom: 1px solid rgba(var(--ps-line-soft-rgb), 0.25);

  &:last-child { border-bottom: none; }

  input[type='checkbox'] { @include ps-pip-check; }

  input:not([type='checkbox']), select, output {
    @include ps-well;
    height: 22px;
    font-size: 11.5px;
    padding: 0 4px;
    text-align: left;
    min-width: 0;

    &:focus { outline: 2px solid var(--ps-blue); outline-offset: -1px; }
  }

  output {
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    background: var(--ps-panel-alt);
    color: var(--ps-derived, var(--ps-text));
  }

  .narrow, .dmg input { text-align: center; }

  &__extras {
    grid-column: 1 / -1;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 2px 0 1px;
    flex-wrap: wrap;

    label { display: flex; align-items: center; gap: 3px; cursor: pointer; }
    span { font-size: 9px; color: var(--ps-text-muted); }

    .notes { flex: 1; min-width: 120px; }
  }
}

.dmg {
  display: flex;
  gap: 3px;
  min-width: 0;

  input { flex: 1; }
  .damage { flex: 0 0 auto; padding: 0 6px; font-size: 9px; @include ps-caption; }
}

.attack, .damage {
  @include ps-well;
  height: 22px;
  font-size: 12px;
  font-weight: 700;
  color: var(--ps-derived, var(--ps-heading));
  cursor: pointer;
  text-align: center;

  &:hover:not(:disabled) { background: var(--ps-panel-alt); }
  &:disabled { opacity: 0.45; cursor: not-allowed; }
}

.del {
  border: none;
  background: none;
  color: var(--ps-text-muted);
  font-size: 15px;
  line-height: 1;
  cursor: pointer;

  &:hover { color: var(--ps-red); }
}

.empty { font-size: 11.5px; color: var(--ps-text-muted); padding: 8px 4px; margin: 0; }
</style>
