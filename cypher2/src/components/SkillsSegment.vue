<script setup>
import ItemList from '@/components/ItemList.vue'
import RowProse from '@/components/RowProse.vue'
import { useSheetStore } from '@/stores/sheetStore.js'
import { POOL_NAMES, poolLabel } from '@/components/pools.js'
import { RATINGS, SKILL_ASSETS, strayOptions } from '@/components/enums.js'

const sheet = useSheetStore()

// Per-skill roller entry (ddd-669y): every skill row gets a d20 chip that
// opens the guided roller with this skill preselected, REGARDLESS of the
// guided-mode setting — except proficiencies, which never roll (MCG §3.6),
// so they get no chip at all rather than a dead one.
const rollRow = (row) => sheet.rollSkill(row._id)
const rowCanRoll = (row) => !row.isProficiency

// Item contents (item-contents spec §3.1). Ratings stay lowercase, matching the
// guided-roll card's existing "Smashing (trained)" (guidedCard.js).
//
// v2 fields (ddd-5vb): a proficiency SUPPRESSES the rating — MCG §3.6,
// proficiencies are not trainable, so showing a rating would imply an
// advancement path that does not exist. The asset cell uses easesLine's
// "asset +N" wording (guidedCard.js) so the row, the card and the roller can
// never describe the same asset differently.
const ratingOrProficiency = (row) => (row.isProficiency ? 'proficiency' : row.rating)
const assetText = (row) => (typeof row.asset === 'number' && row.asset > 0 ? `asset +${row.asset}` : null)

const contents = (row) => ({
  title: row.name,
  fields: [row.pool && poolLabel(row.pool), ratingOrProficiency(row), assetText(row)],
  source: row.source,
  prose: row.description
})
</script>

<template>
  <ItemList :contents="contents" :roll="rollRow" :can-roll="rowCanRoll" store-key="skills" title="Skills" add-label="Add skill">
    <!-- spec ⑦ §4.2: name · pool · rating. `pool` is nullable ("not tied to a Pool")
         and an absent field COLLAPSES — it does not render an empty cell. `source` and
         `description` are editor-only. A pool that is SET but outside the enum shows
         its raw value (poolLabel, ddd-9ir): the v-if collapse means "no pool" and must
         not be borrowed to hide a bad one. -->
    <template #summary="{ row }">
      <span class="summary-name">{{ row.name }}</span>
      <span v-if="row.pool" class="summary-cell">{{ poolLabel(row.pool) }}</span>
      <span class="summary-cell">{{ ratingOrProficiency(row) }}</span>
      <span v-if="assetText(row)" class="summary-cell">{{ assetText(row) }}</span>
    </template>
    <template #row="{ row }">
      <input class="row-name field" v-model="row.name" placeholder="Skill name" />
      <!-- strayOptions (ddd-4s3) prepends ONE disabled option carrying a stored value
           the enum does not contain, so it stays visible instead of blanking the
           control. Empty for a legal row, which is what keeps these lists identical to
           the schema's for contract-enums.test.js.

           v-if, not :disabled, when the row is a proficiency: the rating select is an
           advancement affordance and proficiencies are not trainable (MCG §3.6). The
           stored rating is left untouched for round-trip — hiding is not a write. -->
      <select v-if="!row.isProficiency" class="row-rating" v-model="row.rating" aria-label="Rating">
        <option
          v-for="s in strayOptions(row.rating, RATINGS, 'rating')"
          :key="s.text"
          :value="s.value"
          disabled
        >
          {{ s.text }}
        </option>
        <option v-for="r in RATINGS" :key="r" :value="r">{{ r }}</option>
      </select>
      <!-- '' <-> null mapping: empty option means "not tied to a Pool". null is LEGAL
           here, so it keeps the sentinel and gets no stray option (ddd-4s3). -->
      <select
        class="row-pool field"
        :value="row.pool ?? ''"
        aria-label="Pool"
        @change="row.pool = $event.target.value === '' ? null : $event.target.value"
      >
        <option
          v-for="s in strayOptions(row.pool, POOL_NAMES, 'pool')"
          :key="s.text"
          :value="s.value"
          disabled
        >
          {{ s.text }}
        </option>
        <option value="">— no pool</option>
        <option v-for="p in POOL_NAMES" :key="p" :value="p">{{ poolLabel(p) }}</option>
      </select>
      <!-- asset is a closed numeric enum (0/1/2), so a select, not a stepper —
           Number() because an <option> value round-trips as a string. -->
      <label class="row-asset-label">
        <span>Asset</span>
        <select
          class="row-asset field"
          :value="row.asset"
          aria-label="Asset"
          @change="row.asset = Number($event.target.value)"
        >
          <option
            v-for="s in strayOptions(row.asset, SKILL_ASSETS, 'asset')"
            :key="s.text"
            :value="s.value"
            disabled
          >
            {{ s.text }}
          </option>
          <option v-for="a in SKILL_ASSETS" :key="a" :value="a">{{ a }}</option>
        </select>
      </label>
      <label class="row-proficiency-label">
        <input class="row-proficiency" type="checkbox" v-model="row.isProficiency" />
        Proficiency
      </label>
      <input class="row-source field" v-model="row.source" placeholder="Source" />
      <RowProse :row="row" />
    </template>
  </ItemList>
</template>
