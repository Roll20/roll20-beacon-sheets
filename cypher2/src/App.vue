<script setup>
import { computed, ref, watch } from 'vue'
import SheetHeader from '@/components/SheetHeader.vue'
import PoolsRow from '@/components/PoolsRow.vue'
import StatusRow from '@/components/StatusRow.vue'
import NotesBlock from '@/components/NotesBlock.vue'
import SegmentCluster from '@/components/SegmentCluster.vue'
import SkillsSegment from '@/components/SkillsSegment.vue'
import AbilitiesSegment from '@/components/AbilitiesSegment.vue'
import AdvancementSegment from '@/components/AdvancementSegment.vue'
import AttacksSegment from '@/components/AttacksSegment.vue'
import CyphersSegment from '@/components/CyphersSegment.vue'
import ArtifactsSegment from '@/components/ArtifactsSegment.vue'
import GearSegment from '@/components/GearSegment.vue'
import SettingsModal from '@/components/SettingsModal.vue'
import RollerModal from '@/components/RollerModal.vue'
import NpcSheet from '@/components/NpcSheet.vue'
import NpcGmNotice from '@/components/NpcGmNotice.vue'
import {
  CHARACTER_SEGMENTS,
  KIT_SEGMENTS,
  resolveCharacterSegment,
  resolveKitSegment
} from '@/components/segments.js'
import { resolveTheme } from '@/components/themes.js'
import { useSheetStore } from '@/stores/sheetStore.js'
import { useMetaStore } from '@/stores/metaStore.js'
import { useNpcStore } from '@/stores/npcStore.js'
import { useAppStore } from '@/stores/index.js'

// The relay's Pinia plugin only binds the store whose id is 'app'
// (relay.js: primaryStore) — without this call the relay never hydrates,
// persists, or wires dispatchRef in production.
useAppStore()
const sheet = useSheetStore()
const meta = useMetaStore()
const npc = useNpcStore()

const CHARACTER_PANELS = {
  skills: SkillsSegment,
  abilities: AbilitiesSegment,
  advancement: AdvancementSegment
}
const KIT_PANELS = {
  attacks: AttacksSegment,
  cyphers: CyphersSegment,
  artifacts: ArtifactsSegment,
  gear: GearSegment
}

// Resolved ONCE per cluster and handed to SegmentCluster, which feeds the same value
// to its control and its panel host. Reading `sheet.ui.*` raw anywhere below would
// reintroduce the disagreement tabs.js had to warn about in a comment.
const characterSegment = computed(() => resolveCharacterSegment(sheet.ui.characterSegment))
const kitSegment = computed(() => resolveKitSegment(sheet.ui.kitSegment))
const theme = computed(() => resolveTheme(sheet.ui.theme))

// Deliberately a local ref, not store state: a modal's open/closed status must not
// persist to the character. updateCharacter deletes omitted keys (ddd-6qe), so
// anything put on ui here would round-trip through the VTT.
const settingsOpen = ref(false)

// spec §7.5: on an NPC sheet a viewer without GM rights sees only the notice. A player
// can already have Settings open when a GM's switch arrives, and the dialog would
// otherwise outlive the sheet it belongs to. Closing it, rather than hiding it, keeps it
// from popping back if the sheet returns to Character. A GM keeps the dialog, because a
// GM switches from inside it.
const showNotice = computed(() => npc.isNpc && !meta.permissions.isGM)
watch(showNotice, (on) => {
  if (on) settingsOpen.value = false
})

// ddd-wqx6: a brand-new character opens Settings once. useAppStore() above has already
// run the relay's startup hydrate, so this reads the stored document, not defaults.
// Only a viewer who can save gets it: for anyone else the seen flag never persists and
// the dialog would reopen on every load. Writing settingsSeen changes the dehydrated
// document, so the relay persists a ui branch and hasStoredUi is true from then on.
if (!sheet.hasStoredUi && (meta.permissions.isOwner || meta.permissions.isGM) && !showNotice.value) {
  settingsOpen.value = true
  sheet.ui.settingsSeen = true
}

// spec §7.5: the guided roller belongs to Character mode. Roller state is transient and
// hydrate never resets it (sheetStore.js rollerStat, rollerSkillId and rollerOpen), so a
// roller open when the sheet becomes an NPC would survive the switch, for a GM and a
// player alike. Closing it through the store rather than RollerModal's close() also ends
// a session that is mid-roll. That is safe: rollGuided reserves the pool and posts the
// card inside the store (sheetStore.js rollGuided), so the roll finishes without its
// modal. The unmounted modal's continuation then calls close(), which clears roller state
// only while the store's rollerSession is still its own, so it cannot close a roller
// opened since.
watch(() => npc.isNpc, (on) => {
  if (!on) return
  sheet.rollerStat = null
  sheet.rollerSkillId = null
  sheet.rollerAttackId = null // ddd-keb3: the attack entry is a third way in, and closes the same way
})
</script>

<!-- ARCHITECTURE (spec ⑦ §4.1). Four regions, no global tab bar:
       play strip   identity and pools, always visible
       pinned rail  the Damage & Recovery vitals panel (ddd-2g8 variant A:
                    wounds/shield/recovery columns, one pencil for all setup
                    controls) — always visible, behind no switch, at every width.
                    The armor and cypher-limit scalars it once held moved out in
                    ddd-2g8 (armorModifiers → Gear, cypherLimit → Cyphers)
       clusters     Character (3 segments) and Kit (4), each with its own control
       notes rail   Notes & Background, same always-visible treatment, LAST

     ⚠️ "Pinned rail" names a TREATMENT — always visible, behind no switch — not one
     contiguous region, which is why two elements carry the class. Owner decision
     2026-08-23: Notes & Background reads as reference, not play state, so it sits
     after the clusters rather than above them. Spec §4.1 described a single rail
     with Notes inside it; this supersedes that (see the dated note in the spec).
     Both rails keep the class deliberately — the skin-coverage net and capture.mjs
     scope their assertions to `.pinned-rail`, and Notes must stay inside both.

     Every segment panel is mounted at every width and CSS decides visibility, which
     is what makes stack mode below 27rem pure CSS — no resize listener, no state.

     .cypher-sheet carries container-type directly. RollerModal and the modals
     (position: fixed) stay inside it: container-type applies style + size containment
     and an independent formatting context, NOT layout containment, so it does not
     become a containing block for fixed descendants (CSS Conditional 5; verified in
     Chromium).

     ⚠️ min-width: 0 on every direct grid item of .cypher-sheet is load-bearing — see
     the ddd-2bv note in main.css. .play-strip, BOTH .pinned-rail elements and
     .clusters all carry it. -->
<template>
  <div class="cypher-sheet" :data-theme="theme">
    <!-- Mode branch (ddd-zm47.2, spec §7). Character mode is the four regions below,
         unchanged. A <template> wrapper adds no element, so .cypher-sheet's direct grid
         items, and the Notes-last source order App.test.js asserts, are untouched. -->
    <template v-if="!npc.isNpc">
      <div class="play-strip">
        <SheetHeader @open-settings="settingsOpen = true" />
        <PoolsRow />
      </div>

      <div class="pinned-rail">
        <StatusRow />
      </div>

      <main class="clusters">
        <SegmentCluster
          label="Character"
          :segments="CHARACTER_SEGMENTS"
          :panels="CHARACTER_PANELS"
          :active="characterSegment"
          @select="sheet.ui.characterSegment = $event"
        />
        <SegmentCluster
          label="Kit"
          :segments="KIT_SEGMENTS"
          :panels="KIT_PANELS"
          :active="kitSegment"
          @select="sheet.ui.kitSegment = $event"
        />
      </main>

      <div class="pinned-rail pinned-rail--notes">
        <NotesBlock />
      </div>
    </template>
    <NpcSheet v-else-if="meta.permissions.isGM" @open-settings="settingsOpen = true" />
    <NpcGmNotice v-else />

    <SettingsModal v-if="settingsOpen" @close="settingsOpen = false" />
    <!-- Session-keyed, not stat-keyed (ddd-669y): the modal's own pool select
         writes rollerStat mid-open, and a stat key would remount and wipe the
         half-configured roll on every pool change. rollerOpen covers the
         poolless per-skill entry, where rollerStat is null while open.
         !npc.isNpc: an NPC sheet never shows the roller (spec §7.5). The
         watch in the script closes a roller that was open at the switch; this
         gate covers any later opener while the sheet is an NPC. -->
    <RollerModal v-if="sheet.rollerOpen && !npc.isNpc" :key="sheet.rollerSession" />
  </div>
</template>
