<script setup>
import { useSheetStore } from '@/stores/sheetStore.js'
import { clampInt, syncClamped } from '@/utility/clamp.js'

// ddd-xrug phase 2, spec §3. The fourth Pool the Lucky descriptor grants, in the play
// strip immediately after PoolsRow. App.vue owns the gate — `v-if="sheet.luck !== null"`
// — so every read below is direct rather than optional-chained: unlike the damage track
// and Stress, Luck has no rule flag that can disagree with its object, and the object IS
// the switch (spec §2). WoundsTrack's shield column reads `sheet.shield` the same way
// under the same kind of gate.
//
// Not a fourth PoolCard (spec §1.3): Luck is not one of the three Pools mechanically,
// POOL_NAMES is pinned literally by contract-enums.test.js, and a fourth identical card
// would read as a fourth stat.
//
// No props. Pool and Max are play state a player changes at the table, so neither sits
// behind an edit-mode pencil (spec §3.2).
const sheet = useSheetStore()

// Returns the clamped value so the template can resync the box through syncClamped — a
// rejected edit otherwise survives in the DOM while the store, the export and the chat
// card all disagree with it (ddd-9sf). PoolCard.set is the pattern, and the sweep in
// clamp-resync.test.js enforces the wrapper at every clamped site.
//
// Member assignment, not a rebuilt object: `luck` is additionalProperties: false with all
// five members required, so a write that rebuilt it would have to carry `name` and
// `description` or export an invalid document.
const set = (field, value) => (sheet.luck[field] = clampInt(value))

// Edge is carried, shown when stored, and never authored here (spec §3.3). The book gives
// Luck no Edge at all, and the sheet's Effort maths subtracts Edge once, from the stat Pool
// being spent — so a box here would invite a player to set a number that changes nothing.
const EDGE_NOTE =
  'Carried from the character file and shown as stored. The book gives Luck no Edge, and this value enters no calculation on this sheet.'
</script>

<!-- The panel reuses PoolCard's head, name and fields classes wholesale, the way the
     damage-track and Stress columns reuse the wounds column's: same shape, same wrap
     rules, same metrics, and the two-field row is exactly what .pool-card__fields is for
     (its label rule gives each box its own min-width-0 cell). .wounds__note is the
     repo's shared metrics for small reference copy, which is what both lines below are.
     Only the root, the Edge figure and the rule prose are this component's own. -->
<template>
  <section class="luck-pool panel">
    <header class="pool-card__head">
      <!-- The Pool's own name, never a hardcoded "Luck": the contract lets it be any
           string, and a hardcoded heading would silently contradict a stored one
           (spec §3.2). -->
      <h3 class="pool-card__name">{{ sheet.luck.name }}</h3>
    </header>
    <div class="pool-card__fields">
      <label>
        <span class="microlabel">Pool</span>
        <input class="field" type="number" min="0" :value="sheet.luck.current" @change="syncClamped($event, set('current', $event.target.value))" />
      </label>
      <label>
        <span class="microlabel">Max</span>
        <input class="field" type="number" min="0" :value="sheet.luck.max" @change="syncClamped($event, set('max', $event.target.value))" />
      </label>
    </div>
    <!-- A <template> wrapper adds no element, so one v-if covers the figure and its line.
         Zero renders nothing at all: there is nothing to read and nothing to explain. -->
    <template v-if="sheet.luck.edge > 0">
      <p class="luck-pool__edge">
        <span class="microlabel">Edge</span>
        {{ sheet.luck.edge }}
      </p>
      <p class="luck-pool__edge-note wounds__note">{{ EDGE_NOTE }}</p>
    </template>
    <!-- The descriptor's rule text as the document carries it, not a copy of the book
         string baked in here. StressTrack carries its book copy inline because Stress has
         no contract field for it; Luck's description is a required field the publisher's
         own exporter fills with the book wording, and the toggle's seed supplies the same
         words, so both routes print the same thing (spec §3.4). -->
    <p class="luck-pool__rule wounds__note">{{ sheet.luck.description }}</p>
  </section>
</template>
