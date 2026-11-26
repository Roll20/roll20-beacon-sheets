<script setup>
import { useNpcShipStore } from '@/stores/npcShipStore.js'
import { useMetaStore } from '@/stores/metaStore.js'
import SheetPanel from '@/components/shared/SheetPanel.vue'
import ConfirmDelete from '@/components/shared/ConfirmDelete.vue'
import {
  STARSHIP_SIZES,
  NPC_SHIP_ABILITIES,
  npcShipAbilityTitle,
} from '@/rules/index.js'

const ship = useNpcShipStore()
const meta = useMetaStore()

const KINDS = [
  { kind: 'trait', title: 'Traits', list: 'traits' },
  { kind: 'action', title: 'Actions', list: 'actions' },
  { kind: 'reaction', title: 'Reactions', list: 'reactions' },
]

const LISTS = [
  { key: 'saves', title: 'Saving Throws', add: 'addSave', remove: 'removeSave' },
  { key: 'skills', title: 'Skills', add: 'addSkill', remove: 'removeSkill' },
]
</script>

<template>
  <div class="editor">
    <div class="col">
      <SheetPanel title="Name and Size">
        <div class="grid">
          <label class="wide">
            <span>Name</span>
            <input v-model="meta.name" placeholder="Ship name" />
          </label>
          <label>
            <span>Size</span>
            <select v-model="ship.size">
              <option value="">&mdash;</option>
              <option v-for="s in STARSHIP_SIZES" :key="s.id" :value="s.id">{{ s.name }}</option>
            </select>
          </label>
        </div>
      </SheetPanel>

      <SheetPanel title="Combat">
        <div class="grid">
          <label>
            <span>Defense</span>
            <input v-model.number="ship.defense" type="number" />
          </label>
          <label>
            <span>Speed</span>
            <input v-model.number="ship.speed" type="number" />
          </label>
          <label>
            <span>Maneuver Defense</span>
            <input v-model.number="ship.maneuverDefense" type="number" />
          </label>
          <label>
            <span>Initiative</span>
            <input v-model.number="ship.initiative" type="number" />
          </label>
          <label>
            <span>HLP now</span>
            <input v-model.number="ship.hull.current" type="number" />
          </label>
          <label>
            <span>HLP max</span>
            <input v-model.number="ship.hull.max" type="number" />
          </label>
          <label>
            <span>SI now</span>
            <input v-model.number="ship.si.current" type="number" />
          </label>
          <label>
            <span>SI max</span>
            <input v-model.number="ship.si.max" type="number" />
          </label>
        </div>
      </SheetPanel>

      <SheetPanel title="Crew Abilities">
        <div class="crew">
          <div v-for="slot in NPC_SHIP_ABILITIES" :key="slot.id" class="slot">
            <span class="slot__label" :title="npcShipAbilityTitle(slot.id)">{{ slot.label }}</span>
            <input v-model.number="ship.crew[slot.id].mod" type="number" class="slot__mod" />
          </div>
        </div>
      </SheetPanel>

      <SheetPanel title="Piloting and Senses">
        <div class="grid">
          <label>
            <span>Piloting</span>
            <input v-model.number="ship.piloting" type="number" />
          </label>
          <label>
            <span>Maneuver save DC</span>
            <input
              v-model="ship.maneuverSaveDC"
              type="number"
              :placeholder="String(ship.suggestedSaveDC)"
            />
          </label>
          <label>
            <span>Sensor Range</span>
            <input v-model.number="ship.sensorRange" type="number" />
          </label>
          <label>
            <span>Passive Perception</span>
            <input v-model.number="ship.passivePerception" type="number" />
          </label>
        </div>
      </SheetPanel>

      <SheetPanel v-for="list in LISTS" :key="list.key" :title="list.title">
        <div class="row-head">
          <button type="button" class="add" @click="ship[list.add]()">+ Add</button>
        </div>
        <div v-for="row in ship[list.key]" :key="row._id" class="row">
          <input v-model="row.name" />
          <input v-model.number="row.bonus" type="number" />
          <ConfirmDelete class="del" title="Remove" @confirm="ship[list.remove](row._id)" />
        </div>
      </SheetPanel>

      <SheetPanel title="Notes">
        <textarea v-model="ship.notes" rows="2" />
      </SheetPanel>
    </div>

    <div class="col">

      <SheetPanel v-for="group in KINDS" :key="group.kind" :title="group.title">
        <div class="entry-head">
          <button type="button" class="add" @click="ship.addEntry(group.kind)">+ Add</button>
        </div>

        <div v-for="entry in ship[group.list]" :key="entry._id" class="entry">
          <div class="entry__top">
            <input v-model="entry.name" class="entry__name" placeholder="Action name" />
            <label class="prof" title="This is an attack - show a to-hit roll">
              <input v-model="entry.isAttack" type="checkbox" />
              <small>Attack</small>
            </label>
            <ConfirmDelete class="del" title="Remove" @confirm="ship.removeEntry(group.kind, entry._id)" />
          </div>

          <div v-if="entry.isAttack" class="entry__attack">
            <label><span>To hit</span><input v-model.number="entry.attackPower" type="number" /></label>
            <label><span>Range (units)</span><input v-model="entry.range" /></label>
          </div>

          <div v-if="entry.isAttack || entry.damage" class="entry__attack">
            <label><span>Damage</span><input v-model="entry.damage" /></label>
            <label><span>Type</span><input v-model="entry.damageType" /></label>
          </div>

          <textarea v-model="entry.text" rows="2" />
        </div>
      </SheetPanel>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/tokens.scss' as *;

.editor {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--ps-gap-lg);
  align-items: start;

  @media (min-width: 900px) { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

.col {
  display: flex;
  flex-direction: column;
  gap: var(--ps-gap-lg);
  min-width: 0;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 6px 10px;

  .wide { grid-column: 1 / -1; }
}

label {
  display: flex;
  flex-direction: column;
  min-width: 0;

  > span { @include ps-caption; font-size: 9px; margin-bottom: 1px; }
}

input:not([type='checkbox']), select, textarea {
  @include ps-well;
  width: 100%;
  min-width: 0;
  height: 24px;
  font-size: 12px;
  text-align: left;
  padding: 0 5px;

  &:focus { outline: 2px solid var(--ps-blue); outline-offset: -1px; }
}

input[type='checkbox'] { @include ps-pip-check; }

textarea {
  height: auto;
  padding: 4px 5px;
  line-height: 1.45;
  resize: vertical;
}

input[type='number'] { text-align: center; }

.crew {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 5px;
}

.slot {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  min-width: 0;

  &__label { @include ps-caption; font-size: 9.5px; cursor: help; }
  &__mod { font-weight: 700; }
}

.row-head, .entry-head {
  display: flex;
  align-items: baseline;
  gap: 8px;
  @include ps-caption;
  margin-bottom: 3px;
  justify-content: flex-end;
}

.row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 60px 22px;
  gap: 5px;
  align-items: center;
  margin-bottom: 4px;
}

.entry {
  padding: 6px 0;
  border-bottom: 1px solid rgba(var(--ps-line-soft-rgb), 0.2);

  &:last-child { border-bottom: none; }

  &__top {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
  }

  &__name { flex: 1; font-weight: 700; }

  &__attack {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 5px;
    margin-bottom: 4px;
  }
}

.prof {
  flex-direction: row;
  align-items: center;
  gap: 3px;
  cursor: pointer;

  small { font-size: 10px; color: var(--ps-text-muted); }
}

.add {
  @include ps-caption;
  margin-left: auto;
  background: var(--ps-panel);
  border: var(--ps-border-thin);
  border-radius: var(--ps-radius-sm);
  padding: 2px 9px;
  cursor: pointer;

  &:hover { background: var(--ps-panel-alt); }
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

@media (max-width: 620px) {
  .crew { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
</style>
