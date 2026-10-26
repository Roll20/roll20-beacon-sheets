<script setup>
import { computed, ref } from 'vue'
import ModalShell from '@/components/ModalShell.vue'
import ImportExportPanel from '@/components/ImportExportPanel.vue'
import CreatureImportExportPanel from '@/components/CreatureImportExportPanel.vue'
import { useSheetStore } from '@/stores/sheetStore.js'
import { useMetaStore } from '@/stores/metaStore.js'
import { useNpcStore } from '@/stores/npcStore.js'
import { THEMES, resolveTheme } from '@/components/themes.js'

const emit = defineEmits(['close'])
const sheet = useSheetStore()
const meta = useMetaStore()
const npc = useNpcStore()

// Resolve on BOTH sides, exactly as the retired SettingsTab did: reading normalises an
// unknown stored value so the select never renders blank, and writing refuses to store
// one.
const theme = computed({
  get: () => resolveTheme(sheet.ui.theme),
  set: (v) => {
    sheet.ui.theme = resolveTheme(v)
  }
})

// ---- The Luck Pool toggle (ddd-xrug.1 spec §4) ----
// It lived in the Damage & Recovery panel head beside the damage-track and Stress
// checkboxes until the owner's walkthrough on 2026-10-26: those two decide which injury
// model the table uses, and Luck is not an injury model at all, so the panel's heading was
// off-label for it. It is a sheet-wide rule switch, which is what this dialog is for.
//
// There is deliberately NO rules.luck flag. `rules` is additionalProperties: false with
// damageTrack and stress its only two members, so a third flag would mean a schema bump and
// a coordination step with the Cypher Tools developer, all to express what `luck !== null`
// already expresses. The Pool's presence IS the switch, which is why this checkbox's state
// is derived from the object and neither direction writes a flag. Nulling on the untick is
// also what lets exportDocument fall back to schemaVersion 2, so a current-edition
// character who tried Luck once does not export version 3 for the rest of their life.
//
// Three points, a maximum of three and no Edge are the book's numbers, and the description
// is the Lucky descriptor's own rule text verbatim — the same words the publisher's own
// exporter fills the field with, so a Pool created here and a Pool imported from Old Gods
// of Appalachia print the same thing in LuckPool (spec §3.4). The oracle for this string is
// cypher-contract/fixtures/valid-v3/oga-lucky-protector.json, which the tests compare the
// seed against rather than retyping it.
const LUCK_SEED = () => ({
  current: 3,
  max: 3,
  edge: 0,
  name: 'Luck',
  description:
    'You have an additional Pool called Luck that begins with 3 points, and it has a maximum value of 3 points. When spending points from any other Pool, you can take one, some, or all of the points from your Luck Pool first. When you make a recovery roll to recover points to any other Pool, your Luck Pool is also refreshed by the same number of points. When your Luck Pool is at 0 points, it does not count against your damage track.'
})

// Unticking DESTROYS play state: the points a player has spent, plus a name and description
// they may have rewritten. So the untick arms first and performs on the second click, the
// way the Damage & Recovery toggles do (ddd-houn). One arming flag, not a shared one: this
// dialog carries no sibling destructive toggle, and closing it unmounts the component, which
// disarms by itself so a later session asks again.
const luckArming = ref(false)

// Against the seed's own key set rather than five hand-written comparisons: `luck` is
// additionalProperties: false with all five members required, so the seed's keys ARE the
// object's, and any value this did not read would be one the write below silently replaced.
const luckIsEmpty = () => {
  const l = sheet.luck
  if (!l) return true
  const seed = LUCK_SEED()
  return Object.keys(seed).every((key) => l[key] === seed[key])
}

// A checkbox flips itself before the change event fires, so refusing the first click has to
// put the box back: nothing changed, Vue therefore does not re-render, and the box would
// read unchecked while the sheet still holds the Pool. The same DOM resync syncClamped
// performs for a rejected number (ddd-9sf).
const setLuckRule = (on, event) => {
  if (!luckIsEmpty() && !luckArming.value) {
    luckArming.value = true
    if (event?.target) event.target.checked = sheet.luck !== null
    return
  }
  luckArming.value = false
  sheet.luck = on ? LUCK_SEED() : null
}
</script>

<!-- Sheet type (spec §7.1). GM-only, and it takes effect at once with no confirmation:
     switching deletes nothing, so a misclick is undone by switching back. `:value` plus
     `@change`, not v-model, because switchTo is the only write path. It is what creates
     the default branch on a first switch, and a raw assignment would skip that.

     The v-if hides the DISPLAY only. isGM is read once at load, and journal permissions
     are the real barrier (spec §2.3, decision 9).

     For a GM this select is now the first control in the dialog, which is the position
     ruling R6 worried about for the skin select. ModalShell still parks initial focus on
     the panel, so a stray arrow key reaches neither select.

     NPC mode hides the three settings that only mean something for a character: guided
     rolls, whisper item cards, and character import-export. Part C (ddd-zm47.3) adds the
     creature panel beside this template. -->
<template>
  <ModalShell label="Settings" @close="emit('close')">
    <label v-if="meta.permissions.isGM" class="settings__row">
      <span class="microlabel">Sheet type</span>
      <select class="settings__sheet-type field" :value="npc.sheetType" @change="npc.switchTo($event.target.value)">
        <option value="character">Character</option>
        <option value="npc">NPC</option>
      </select>
    </label>

    <label class="settings__row">
      <span class="microlabel">Sheet skin</span>
      <select class="settings__theme field" v-model="theme">
        <option v-for="t in THEMES" :key="t.key" :value="t.key">{{ t.label }}</option>
      </select>
    </label>
    <p class="settings__hint">
      Per character. Stored with this sheet's display settings, not with the character
      data — an exported character carries no skin.
    </p>

    <template v-if="!npc.isNpc">
      <label class="settings__toggle">
        <input class="settings__guided" type="checkbox" v-model="sheet.ui.guidedRoll" />
        <span>Guided rolls — walk through skill, assets, and Effort; spends pool points.</span>
      </label>

      <label class="settings__toggle">
        <input class="settings__whisper" type="checkbox" v-model="sheet.ui.whisperItemCards" />
        <span>Whisper item cards to the GM — chat cards sent from a row stay private. Rolls
          are unaffected.</span>
      </label>

      <!-- Old Gods of Appalachia's Lucky descriptor (ddd-xrug.1, spec §4). Bound to the
           Pool's existence rather than to a flag, and rendered for a character who has
           none: this is the only route to a Luck Pool other than importing a document that
           already carries one. The armed label says what the second click will destroy,
           the way the Damage & Recovery toggles do. -->
      <label class="settings__toggle" :class="{ 'settings__toggle--armed': luckArming }">
        <input
          class="settings__luck"
          type="checkbox"
          :checked="sheet.luck !== null"
          @change="setLuckRule($event.target.checked, $event)"
        />
        <span v-if="luckArming">Luck Pool — click again to clear the Luck Pool</span>
        <span v-else>Luck Pool — the Lucky descriptor's fourth Pool, shown below the pool
          cards and spendable before them.</span>
      </label>
      <p class="settings__hint">
        Character data, not a display setting. Switching it off clears the Pool and the
        points in it.
      </p>

      <ImportExportPanel />
    </template>
    <!-- Spec §7.1: in NPC mode the creature panel takes the character panel's place. -->
    <CreatureImportExportPanel v-if="npc.isNpc" />
  </ModalShell>
</template>
