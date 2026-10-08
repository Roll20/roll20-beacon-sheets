<script setup>
import { nextTick, ref } from 'vue'
import { useNpcStore } from '@/stores/npcStore.js'
import { clampInt, syncClamped } from '@/utility/clamp.js'

const npc = useNpcStore()

// The edit form's order (spec §7.3, owner amendment 2026-09-14): the three numbers and
// the armor note first, then the GM's Guide prose with each list in its place, then the
// two amendment fields. The two list entries are markers the template renders as groups.
// Every text field is a textarea, short ones included: an <input> strips line breaks
// from its value, and creature strings are stored verbatim.
const LAYOUT = [
  { key: 'level', label: 'Level', kind: 'number' },
  { key: 'health', label: 'Health (max)', kind: 'number' },
  { key: 'armor', label: 'Armor', kind: 'number' },
  { key: 'armorNote', label: 'Armor note', rows: 1 },
  { key: 'description', label: 'Description', rows: 4 },
  { key: 'motive', label: 'Motive', rows: 1 },
  { key: 'environment', label: 'Environment', rows: 1 },
  { key: 'damageInflicted', label: 'Damage inflicted', rows: 1 },
  { key: 'movement', label: 'Movement', rows: 1 },
  { key: 'modifications', label: 'Modifications', rows: 2 },
  { key: 'combat', label: 'Combat', rows: 3 },
  { key: 'combatActions', kind: 'group' },
  { key: 'interaction', label: 'Interaction', rows: 3 },
  { key: 'use', label: 'Use', rows: 3 },
  { key: 'loot', label: 'Loot', rows: 2 },
  { key: 'gmIntrusions', kind: 'group' },
  { key: 'adventureSeed', label: 'Adventure seed', rows: 3 },
  { key: 'other', label: 'Other', rows: 3 }
]

// Returns the STORED value so the template resyncs the box through syncClamped (ddd-9sf).
// Max health goes through setMaxHealth, which owns the follow rule in spec §7.3.
const setNumber = (key, value) => {
  const n = clampInt(value)
  if (key === 'health') npc.setMaxHealth(n)
  else npc.branch.creature[key] = n
  return npc.branch.creature[key]
}

const root = ref(null)

// A + button: the GM pressed it to type, so focus lands in the new row's first box.
const focusNewRow = (boxSelector) =>
  nextTick(() => {
    const boxes = root.value?.querySelectorAll(boxSelector) ?? []
    boxes[boxes.length - 1]?.focus()
  })

// One click, like RecoveryBlock's slot remove: a row is text the GM can retype, not the
// six values a shield remove destroys. The splice unmounts the ✕ just pressed, so focus
// parks on the same-index ✕, clamped, or on the list's + button when the list is empty
// (ddd-5qi, ddd-001 R6, ddd-001 closeout F1).
const parkAfterRemove = (index, removeSelector, addSelector) =>
  nextTick(() => {
    const removes = root.value?.querySelectorAll(removeSelector) ?? []
    const target = removes[Math.min(index, removes.length - 1)]
    ;(target ?? root.value?.querySelector(addSelector))?.focus()
  })

const addAction = () => {
  npc.addCombatAction()
  focusNewRow('.npc-edit__action-title')
}
const removeAction = (id, index) => {
  npc.removeCombatAction(id)
  parkAfterRemove(index, '.npc-edit__action-remove', '.npc-edit__action-add')
}
const addIntrusion = () => {
  npc.addIntrusion()
  focusNewRow('.npc-edit__intrusion')
}
const removeIntrusion = (id, index) => {
  npc.removeIntrusion(id)
  parkAfterRemove(index, '.npc-edit__intrusion-remove', '.npc-edit__intrusion-add')
}
</script>

<!-- The NPC card's edit view (spec §7.3), shown while NpcCard's pencil is on. Whether it
     is open is NpcCard's local ref and never store state. Text binds straight to the
     branch. Numbers clamp through clampInt and resync through syncClamped, which the
     sweep in clamp-resync.test.js enforces. -->
<template>
  <div ref="root" class="npc-edit">
    <template v-for="f in LAYOUT" :key="f.key">
      <div v-if="f.key === 'combatActions'" class="npc-edit__actions" role="group" aria-label="Combat actions">
        <span class="microlabel">Combat actions</span>
        <div v-for="(row, i) in npc.branch.creature.combatActions" :key="row._id" class="npc-edit__action-row">
          <div class="npc-edit__action-fields">
            <textarea class="npc-edit__action-title field" rows="1" :aria-label="`Combat action ${i + 1} title`" v-model="row.title" />
            <textarea class="npc-edit__action-description field" rows="3" :aria-label="`Combat action ${i + 1} description`" v-model="row.description" />
          </div>
          <button
            class="npc-edit__action-remove btn"
            type="button"
            :aria-label="`Remove combat action ${i + 1}`"
            @click="removeAction(row._id, i)"
          >
            ✕
          </button>
        </div>
        <button class="npc-edit__action-add btn" type="button" @click="addAction">+ Combat action</button>
      </div>

      <div v-else-if="f.key === 'gmIntrusions'" class="npc-edit__intrusions" role="group" aria-label="GM intrusions">
        <span class="microlabel">GM intrusions</span>
        <div v-for="(row, i) in npc.branch.creature.gmIntrusions" :key="row._id" class="npc-edit__intrusion-row">
          <textarea class="npc-edit__intrusion field" rows="2" :aria-label="`GM intrusion ${i + 1}`" v-model="row.text" />
          <button
            class="npc-edit__intrusion-remove btn"
            type="button"
            :aria-label="`Remove GM intrusion ${i + 1}`"
            @click="removeIntrusion(row._id, i)"
          >
            ✕
          </button>
        </div>
        <button class="npc-edit__intrusion-add btn" type="button" @click="addIntrusion">+ GM intrusion</button>
      </div>

      <label v-else class="npc-edit__row">
        <span class="microlabel">{{ f.label }}</span>
        <input
          v-if="f.kind === 'number'"
          class="field"
          :class="`npc-edit__${f.key}`"
          type="number"
          min="0"
          :value="npc.branch.creature[f.key]"
          @change="syncClamped($event, setNumber(f.key, $event.target.value))"
        />
        <textarea v-else class="field" :class="`npc-edit__${f.key}`" :rows="f.rows" v-model="npc.branch.creature[f.key]" />
      </label>
    </template>
  </div>
</template>
