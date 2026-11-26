<script setup>
import { useStarshipStore } from '@/stores/starshipStore.js'
import { useMetaStore } from '@/stores/metaStore.js'
import SheetPanel from '@/components/shared/SheetPanel.vue'
import { CREW_ROLES, STARSHIP_SIZES, ABILITIES } from '@/rules/index.js'
import ConfirmDelete from '@/components/shared/ConfirmDelete.vue'
import { useSheetRolls } from '@/composables/useSheetRolls.js'

const ship = useStarshipStore()
const meta = useMetaStore()

const rolls = useSheetRolls()

const abbrFor = (id) => ABILITIES.find((a) => a.id === id)?.abbr ?? id
const nameFor = (id) => ABILITIES.find((a) => a.id === id)?.name ?? id
</script>

<template>
  <div class="crew">
    <div class="identity">
      <SheetPanel title="Starship Statistics">
        <div class="fields">
          <label class="line wide">
            <input v-model="meta.name" />
            <span>Ship Name</span>
          </label>
          <label class="line wide">
            <input v-model="ship.owner" />
            <span>Owner</span>
          </label>

          <label class="line">
            <select v-model="ship.size">
              <option value="">&mdash;</option>
              <option v-for="s in STARSHIP_SIZES" :key="s.id" :value="s.id">{{ s.name }}</option>
            </select>
            <span>Size Category</span>
          </label>
          <label class="line">
            <input v-model="ship.crewCapacity" />
            <span>Crew Capacity</span>
          </label>
          <label class="line wide">
            <input v-model="ship.actionStations" placeholder="Pilot 1, Technician 1, Gunner 2" />
            <span>Action Stations</span>
          </label>
        </div>

        <div class="roster">
          <div class="roster__head">
            <span>Crewmember</span>
            <span class="num">DEX</span>
            <span class="num">INT</span>
            <span class="num">WIS</span>
            <span class="num">Save Bonus</span>
            <span class="num">Vehicles (Space)</span>
            <button type="button" class="add" title="Add a crewmember" @click="ship.addCrewmember()">
              +
            </button>
          </div>
          <p v-if="!ship.roster.length" class="empty">
            Nobody aboard yet. Crew capacity is
            {{ ship.crewCapacity || 'unset' }}.
          </p>
          <div v-for="c in ship.roster" :key="c._id" class="roster__row">
            <input v-model="c.name" placeholder="Name" />
            <input v-model.number="c.dexterity" type="number" class="num" aria-label="DEX" />
            <input v-model.number="c.intelligence" type="number" class="num" aria-label="INT" />
            <input v-model.number="c.wisdom" type="number" class="num" aria-label="WIS" />
            <input v-model.number="c.saveBonus" type="number" class="num" aria-label="Save Bonus" />
            <input v-model="c.proficient" type="checkbox" class="pip" aria-label="Vehicles (Space)" />
            <ConfirmDelete class="del" title="Remove" @confirm="ship.removeCrewmember(c._id)" />
          </div>
        </div>
      </SheetPanel>
    </div>

    <SheetPanel title="Ship Description">
      <textarea v-model="ship.description" rows="10" />
    </SheetPanel>
  </div>

  <div class="stations">
    <SheetPanel v-for="role in CREW_ROLES" :key="role.id" :title="role.name" inset>
      <select v-model="ship.stations[role.id]" class="who" :aria-label="`${role.name}`">
        <option value="">&mdash;</option>
        <option v-for="c in ship.roster" :key="c._id" :value="c._id">{{ c.name || 'Unnamed' }}</option>
      </select>

      <div class="mods">
        <div v-for="ability in role.abilities" :key="ability" class="mod">
          <button
            type="button"
            class="mod__roll"
            :title="`${nameFor(ability)} saving throw`"
            @click="rolls.rollCrewSave(role.id, ability)"
          >
            {{ ship.crew[role.id][ability] }}
          </button>
          <span>{{ abbrFor(ability) }}</span>
        </div>
        <div class="mod">
          <output>{{ ship.crew[role.id].saveBonus }}</output>
          <span>Save</span>
        </div>
      </div>
    </SheetPanel>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/tokens.scss' as *;

.crew {
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr);
  gap: var(--ps-gap-lg);
  align-items: start;
}

.fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px 12px;
  margin-bottom: 8px;
}

.line {
  display: flex;
  flex-direction: column;
  min-width: 0;

  &.wide { grid-column: span 2; }

  > span { @include ps-caption; margin-top: 1px; }

  input, select {
    border: none;
    border-bottom: 1.5px solid var(--ps-line);
    background: transparent;
    font-size: 13px;
    padding: 1px 2px;
    min-width: 0;

    &:focus { outline: none; border-bottom-color: var(--ps-blue); background: var(--ps-field); }
  }
}

.roster {
  border-top: 2px solid var(--ps-gold);
  padding-top: 6px;
}

$roster-cols: minmax(0, 1fr) repeat(4, 40px) 58px 22px;

.roster__head {
  display: grid;
  grid-template-columns: $roster-cols;
  gap: 6px;
  align-items: end;
  @include ps-caption;
  padding-bottom: 3px;
  border-bottom: 1.5px solid var(--ps-line);

  .num { text-align: center; font-size: 9px; line-height: 1.15; }
}

.roster__row {
  display: grid;
  grid-template-columns: $roster-cols;
  gap: 6px;
  align-items: center;
  padding: 2px 0;

  input:not([type='checkbox']) {
    @include ps-well;
    height: 22px;
    font-size: 11.5px;
    text-align: left;
    padding: 0 4px;
    min-width: 0;

    &:focus { outline: 2px solid var(--ps-blue); outline-offset: -1px; }
  }

  input.num { text-align: center; font-weight: 700; }

  .pip {
    @include ps-pip-check(13px);
    justify-self: center;
  }
}

textarea {
  @include ps-well;
  width: 100%;
  text-align: left;
  padding: 5px;
  font-size: 11.5px;
  line-height: 1.45;
  resize: vertical;

  &:focus { outline: 2px solid var(--ps-blue); outline-offset: -1px; }
}

.stations {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--ps-gap-lg);
  margin-top: var(--ps-gap-lg);
}

.who {
  @include ps-well;
  width: 100%;
  height: 22px;
  font-size: 11.5px;
  text-align: left;
  padding: 0 4px;
  margin-bottom: 5px;

  &:focus { outline: 2px solid var(--ps-blue); outline-offset: -1px; }
}

.mods {
  display: flex;
  gap: 5px;

  .mod { display: flex; flex-direction: column; align-items: center; flex: 1; min-width: 0; }

  output,
  .mod__roll {
    @include ps-well;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 30px;
    font-size: 15px;
    font-weight: 700;
    background: var(--ps-panel-alt);
    color: var(--ps-derived, var(--ps-text));
  }

  .mod__roll {
    cursor: pointer;
    color: var(--ps-derived, var(--ps-text));
    font-family: var(--ps-font);

    &:hover {
      background: var(--ps-blue);
      border-color: var(--ps-blue);
      color: var(--ps-on-fill);
    }
    &:focus-visible { outline: 2px solid var(--ps-blue); outline-offset: 1px; }
  }

  span { @include ps-caption; font-size: 9px; margin-top: 1px; }
}

.add, .del {
  border: none;
  background: none;
  color: var(--ps-heading);
  font-size: 15px;
  line-height: 1;
  cursor: pointer;
  padding: 0;

  &:hover { color: var(--ps-blue); }
}

.del:hover { color: var(--ps-red); }

.empty { font-size: 11px; color: var(--ps-text-muted); padding: 6px 2px; margin: 0; }

@media (max-width: 860px) {
  .crew { grid-template-columns: 1fr; }
  .stations { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
</style>
