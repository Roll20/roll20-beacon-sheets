<script setup>
import { useMetaStore } from '@/stores/metaStore.js'
import { useSheetStore } from '@/stores/sheetStore.js'
import { clampInt, syncClamped } from '@/utility/clamp.js'

const meta = useMetaStore()
const sheet = useSheetStore()

const emit = defineEmits(['open-settings'])

// rank is nullable 1–5 (supers only; null outside the genre). '' <-> null is
// the select-sentinel rule applied to a number input; a junk or out-of-range
// entry clamps and resyncs the box (ddd-9sf).
const setRank = (event) => {
  if (event.target.value.trim() === '') {
    sheet.rank = null
    event.target.value = ''
    return
  }
  sheet.rank = Math.min(clampInt(event.target.value, 1), 5)
  syncClamped(event, sheet.rank)
}
</script>

<!-- The printed sheet's identity block: wordmark, then the character sentence with a
     microlabel above each field and its grammatical role below, joined by IS A / WHO
     bars.

     The sentence is TWO GROUPS, each a joiner bar over its own fields — is a
     (descriptor/species/type) and who (focus). That grouping is what lets one DOM order
     serve three layouts with no JS: stacked when narrow, descriptor/species/type 3-up at
     medium, and both groups side by side when wide (ddd-11d). The wrappers exist so the
     bar can span its own group's columns; without them the two bars and the focus row
     would need :has() or nth-child to tell apart. Spec amendment 4 permits the structure.

     The wordmark is ART, not type (the printed sheet draws it in Modesto Condensed,
     an Adobe-Fonts-only face). It is a background-image on an empty span so the data:
     URI lives in main.css with the rest of the embedded assets — an <img src> would be
     imported through vite and would resolve to /undefined/undefined/ in production
     (ddd-brb). role="img" + aria-label keeps it announced.

     EVERY class here is a permanent test/JS hook (spec §7), including __sentence and
     __who, which survive the restructure. Bindings, handlers and accessible names are
     unchanged — this is a styling bead (spec §8). -->
<template>
  <header class="header panel">
    <div class="header__nameplate">
      <span class="header__mark" role="img" aria-label="Cypher" />

      <div class="header__row header__row--name">
        <span class="microlabel">Name</span>
        <input class="header__name field" v-model="meta.name" placeholder="Character name" aria-label="Character name" />
      </div>

      <!-- Visible at EVERY width, including below 27rem where the segmented controls
           are hidden: it is the only route to settings and import/export (spec ⑦ §6). -->
      <button class="header__settings" type="button" aria-label="Settings" @click="emit('open-settings')">⚙</button>
    </div>

    <div class="header__sentence">
      <div class="header__group header__group--isa">
        <span class="header__who">is a</span>

        <div class="header__row">
          <input class="header__descriptor field" v-model="sheet.sentence.descriptor" placeholder="Descriptor" />
          <span class="header__row-foot">
            <span class="microlabel">Descriptor</span><span class="microlabel">Adjective</span>
          </span>
          <!-- secondDescriptor joins the sentence DISPLAY only (owner ruling,
               ddd-5vb): no second input — the field edits the primary, the
               second value is import-only and never clobbered. -->
          <span v-if="sheet.sentence.secondDescriptor" class="header__second">
            + {{ sheet.sentence.secondDescriptor }}
          </span>
        </div>

        <div class="header__row">
          <input class="header__species field" v-model="sheet.sentence.species" placeholder="Species (optional)" />
          <span class="header__row-foot">
            <span class="microlabel">Species</span><span class="microlabel">Optional</span>
          </span>
        </div>

        <div class="header__row">
          <input class="header__type field" v-model="sheet.sentence.type" placeholder="Type" />
          <span class="header__row-foot">
            <span class="microlabel">Type</span><span class="microlabel">Noun</span>
          </span>
        </div>
      </div>

      <div class="header__group header__group--who">
        <span class="header__who">who</span>

        <div class="header__row">
          <input class="header__focus field" v-model="sheet.sentence.focus" placeholder="Focus" />
          <span class="header__row-foot">
            <span class="microlabel">Focus</span><span class="microlabel">Verb</span>
          </span>
          <!-- secondFocus: same display-only rule as secondDescriptor; the
               book's dual-focus characters join with "and". -->
          <span v-if="sheet.sentence.secondFocus" class="header__second">
            and {{ sheet.sentence.secondFocus }}
          </span>
        </div>
      </div>
    </div>

    <div class="header__numbers">
      <label>
        <span class="microlabel">Tier</span>
        <input class="header__tier field" type="number" min="1" :value="sheet.tier"
          @change="sheet.tier = syncClamped($event, clampInt($event.target.value, 1))" />
      </label>
      <label>
        <span class="microlabel">Effort</span>
        <!-- No upper clamp: schemaVersion 2 dropped the effort maximum (abilities like
             Superheroics raise the limit past 6 — contract acceptance letter §2). -->
        <input class="header__effort field" type="number" min="1" :value="sheet.effort"
          @change="sheet.effort = syncClamped($event, clampInt($event.target.value, 1))" />
      </label>
      <label>
        <span class="microlabel">XP</span>
        <input class="header__xp field" type="number" min="0" :value="sheet.xp"
          @change="sheet.xp = syncClamped($event, clampInt($event.target.value))" />
      </label>
      <!-- v2 scalars (ddd-5vb). xp is REGULAR XP only — storyXp and RP are
           separately tracked pools, never summed (acceptance letter §3.4). -->
      <label>
        <span class="microlabel">Story XP</span>
        <input class="header__story-xp field" type="number" min="0" :value="sheet.storyXp"
          @change="sheet.storyXp = syncClamped($event, clampInt($event.target.value))" />
      </label>
      <label>
        <span class="microlabel">RP</span>
        <input class="header__rp field" type="number" min="0" :value="sheet.resourcePoints"
          @change="sheet.resourcePoints = syncClamped($event, clampInt($event.target.value))" />
      </label>
      <!-- Always visible, not genre-gated: genre is free text, and gating a
           field on matching a string is how a "superhero " (trailing space)
           character loses their rank input. Empty = null (not a supers game). -->
      <label>
        <span class="microlabel">Rank</span>
        <input class="header__rank field" type="number" min="1" max="5" placeholder="—"
          :value="sheet.rank ?? ''" @change="setRank" />
      </label>
      <label class="header__label--wide">
        <span class="microlabel">Genre</span>
        <input class="header__genre field" v-model="sheet.genre" placeholder="—" />
      </label>
      <label class="header__label--wide">
        <span class="microlabel">Subgenre</span>
        <input class="header__subgenre field" v-model="sheet.subgenre" placeholder="—" />
      </label>
    </div>
  </header>
</template>
