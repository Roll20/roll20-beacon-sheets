<script setup>
import ItemList from '@/components/ItemList.vue'
import RowProse from '@/components/RowProse.vue'
import { POOL_NAMES, poolLabel } from '@/components/pools.js'
import {
  RATINGS, WEAPON_CLASSES, WEAPON_CLASS_LABELS,
  WEAPON_RANGES, WEAPON_RANGE_LABELS, MODIFIER_DIRECTIONS, enumLabel, strayOptions
} from '@/components/enums.js'
import { clampInt, syncClamped } from '@/utility/clamp.js'

// v2 fields (ddd-5vb). range: null is LEGAL ("unspecified — treat as
// immediate", schema note), so it collapses; a stray value degrades to its raw
// self (the poolLabel rule). modifier: a standing ease/hinder on this attack —
// "eased" alone at one step, "eased 2 steps" beyond, matching the book's
// phrasing scale.
const rangeText = (row) => row.range && `${enumLabel(WEAPON_RANGE_LABELS, row.range)} range`
const modifierText = (row) => {
  const m = row.modifier
  if (!m || typeof m !== 'object') return null
  return m.steps === 1 ? m.direction : `${m.direction} ${m.steps} steps`
}

// Attacks carry MORE on the card than in the summary — pool and weapon class as well
// as damage and rating (item-contents spec §3.1). Deliberate: an attack posted to the
// table is the card most likely to be read by someone other than its owner.
const contents = (row) => ({
  title: row.name,
  fields: [
    `${row.damage} damage`,
    row.skillRating,
    // Unlike Skills, `pool` is not nullable here — but it is still a stored value
    // hydrate() never validates, so it degrades to its raw self (ddd-9ir).
    poolLabel(row.pool),
    row.weaponClass && `${row.weaponClass} weapon`,
    rangeText(row),
    modifierText(row)
  ],
  prose: row.notes
})

// The editor's modifier control: one mode select over the schema's nullable
// {steps, direction} shape. Switching direction preserves steps; 'none' writes
// the null the schema means by "unmodified".
const modifierMode = (row) => (row.modifier && typeof row.modifier === 'object' ? row.modifier.direction : 'none')
const setModifierMode = (row, value) => {
  row.modifier = value === 'none' ? null : { steps: row.modifier?.steps ?? 1, direction: value }
}
</script>

<template>
  <ItemList :contents="contents" store-key="attacks" title="Attacks" add-label="Add attack">
    <!-- spec ⑦ §4.2: name · damage · skill rating. `damage` is always an integer
         (factory default 0), so its cell never collapses. -->
    <template #summary="{ row }">
      <span class="summary-name">{{ row.name }}</span>
      <span class="summary-cell">{{ row.damage }} damage</span>
      <span class="summary-cell">{{ row.skillRating }}</span>
      <!-- A standing ease/hinder changes what the player rolls, so it earns a
           summary cell; range stays card-only (null means immediate anyway). -->
      <span v-if="modifierText(row)" class="summary-cell">{{ modifierText(row) }}</span>
    </template>
    <template #row="{ row }">
      <input class="row-name field" v-model="row.name" placeholder="Attack name" />
      <!-- strayOptions (ddd-4s3): each of these three selects reads a stored value
           hydrate() never validates, and a value outside the enum matched no <option>
           and blanked the control. It now shows itself, disabled — never coerced, which
           would be a silent write of data the player never entered. -->
      <select class="row-pool field" v-model="row.pool" aria-label="Pool">
        <option
          v-for="s in strayOptions(row.pool, POOL_NAMES, 'pool')"
          :key="s.text"
          :value="s.value"
          disabled
        >
          {{ s.text }}
        </option>
        <option v-for="p in POOL_NAMES" :key="p" :value="p">{{ poolLabel(p) }}</option>
      </select>
      <!-- weaponClass null is LEGAL ("— n/a"), so the sentinel stands alone. -->
      <select
        class="row-weapon-class field"
        :value="row.weaponClass ?? ''"
        aria-label="Weapon class"
        @change="row.weaponClass = $event.target.value === '' ? null : $event.target.value"
      >
        <option
          v-for="s in strayOptions(row.weaponClass, WEAPON_CLASSES, 'weapon class')"
          :key="s.text"
          :value="s.value"
          disabled
        >
          {{ s.text }}
        </option>
        <option value="">— n/a</option>
        <option v-for="w in WEAPON_CLASSES" :key="w" :value="w">{{ WEAPON_CLASS_LABELS[w] }}</option>
      </select>
      <label class="row-damage">
        Damage
        <input class="field" type="number" min="0" :value="row.damage" @change="row.damage = syncClamped($event, clampInt($event.target.value))" />
      </label>
      <select class="row-skill-rating field" v-model="row.skillRating" aria-label="Skill rating">
        <option
          v-for="s in strayOptions(row.skillRating, RATINGS, 'skill rating')"
          :key="s.text"
          :value="s.value"
          disabled
        >
          {{ s.text }}
        </option>
        <option v-for="r in RATINGS" :key="r" :value="r">{{ r }}</option>
      </select>
      <!-- range null is LEGAL (unspecified = immediate), so the sentinel stands
           alone and a stray value gets the ddd-4s3 disabled option. -->
      <select
        class="row-range field"
        :value="row.range ?? ''"
        aria-label="Range"
        @change="row.range = $event.target.value === '' ? null : $event.target.value"
      >
        <option
          v-for="s in strayOptions(row.range, WEAPON_RANGES, 'range')"
          :key="s.text"
          :value="s.value"
          disabled
        >
          {{ s.text }}
        </option>
        <option value="">— unspecified</option>
        <option v-for="r in WEAPON_RANGES" :key="r" :value="r">{{ WEAPON_RANGE_LABELS[r] }}</option>
      </select>
      <select
        class="row-modifier-direction field"
        :value="modifierMode(row)"
        aria-label="Modifier"
        @change="setModifierMode(row, $event.target.value)"
      >
        <option
          v-for="s in strayOptions(row.modifier?.direction, MODIFIER_DIRECTIONS, 'modifier')"
          :key="s.text"
          :value="s.value"
          disabled
        >
          {{ s.text }}
        </option>
        <option value="none">No modifier</option>
        <option value="eased">Eased</option>
        <option value="hindered">Hindered</option>
      </select>
      <label v-if="row.modifier" class="row-modifier-steps-label">
        Steps
        <input
          class="row-modifier-steps field"
          type="number"
          min="1"
          :value="row.modifier.steps"
          @change="row.modifier.steps = syncClamped($event, clampInt($event.target.value, 1))"
        />
      </label>
      <!-- `notes`, not `description` — attacks and equipment are the two lists that
           name their prose differently (item-contents spec §3). -->
      <RowProse :row="row" field="notes" label="Notes" />
    </template>
  </ItemList>
</template>
