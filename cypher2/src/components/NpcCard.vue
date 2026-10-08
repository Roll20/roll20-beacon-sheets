<script setup>
import { computed, ref } from 'vue'
import NpcEditForm from '@/components/NpcEditForm.vue'
import IconPencil from '@/components/icons/IconPencil.vue'
import IconChat from '@/components/icons/IconChat.vue'
import { useMetaStore } from '@/stores/metaStore.js'
import { useNpcStore } from '@/stores/npcStore.js'
import { DEFAULT_CHARACTER_NAME } from '@/stores/index.js'
import { READ_ORDER, isBlank, isBlankAction, targetNumber } from '@/creature/creature.js'
import { clampInt, syncClamped } from '@/utility/clamp.js'

const meta = useMetaStore()
const npc = useNpcStore()

// NPC mode always holds a branch: switchTo creates it and hydrate heals it (spec §5.4).
// Nothing here guards against null, because a guard for a state the store cannot reach
// is one no test can tell from its absence (ddd-pzx).
const creature = computed(() => npc.branch.creature)

// The name is the Roll20 character name, shared by both modes (spec decision 5). A blank
// name falls back the way the exporters do.
const displayName = computed(() => meta.name || DEFAULT_CHARACTER_NAME)

// spec §7.3: whether the edit form is open is local to this browser tab. TRANSIENT view
// state, never persisted (StatusRow's pencil, the rollerStat rule). updateCharacter
// deletes omitted keys (ddd-6qe), so a store-backed toggle would round-trip through the
// VTT and open the form for every viewer.
const editing = ref(false)

const LABELS = {
  description: 'Description',
  motive: 'Motive',
  environment: 'Environment',
  health: 'Health',
  damageInflicted: 'Damage inflicted',
  armor: 'Armor',
  movement: 'Movement',
  modifications: 'Modifications',
  combat: 'Combat',
  interaction: 'Interaction',
  use: 'Use',
  loot: 'Loot',
  gmIntrusions: 'GM intrusions',
  adventureSeed: 'Adventure seed',
  other: 'Other'
}

// spec §7.2. A text field is empty when it is blank after trimming, and empty fields
// hide. Health always shows, because current health is play state. Armor 0 hides only
// when it has no note, which is the book's own rule. Combat hides only when its prelude
// is blank and no action has text. Stored values are never touched.
const isShown = (field, c) => {
  if (field === 'health') return true
  if (field === 'armor') return c.armor !== 0 || !isBlank(c.armorNote)
  if (field === 'combat') return !isBlank(c.combat) || c.combatActions.some((row) => !isBlankAction(row))
  if (field === 'gmIntrusions') return c.gmIntrusions.some((row) => !isBlank(row.text))
  return !isBlank(c[field])
}
const shownFields = computed(() => READ_ORDER.filter((field) => isShown(field, creature.value)))
// Armor is not a READ_ORDER entry. It renders inside the Health row (owner amendment
// 2026-09-14), so the row asks the same rule directly.
const armorShown = computed(() => isShown('armor', creature.value))

// ddd-pqfl, owner design 2026-09-14: the read view is five banner-headed boxes. Each holds
// a run of READ_ORDER, so the boxes keep the spec §7.2 field order. A box shows only when
// one of its fields does, and Health always does. Combat follows Health so the mechanical
// values sit together (owner, 2026-09-14).
const GROUPS = [
  { key: 'health', label: 'Health', fields: ['health'] },
  { key: 'combat', label: 'Combat', fields: ['damageInflicted', 'movement', 'modifications', 'combat'] },
  { key: 'description', label: 'Description', fields: ['description', 'motive', 'environment'] },
  { key: 'encounter', label: 'Encounter', fields: ['interaction', 'use', 'loot'] },
  { key: 'gm', label: 'GM', fields: ['gmIntrusions', 'adventureSeed', 'other'] }
]
const shownGroups = computed(() => GROUPS
  .map((group) => ({ ...group, fields: group.fields.filter((field) => shownFields.value.includes(field)) }))
  .filter((group) => group.fields.length > 0))

// A field that opens its box and shares the box's name would repeat the banner, so it
// drops its label. Every other field keeps one.
const showLabel = (group, field) => !(group.fields[0] === field && LABELS[field] === group.label)
const actions = computed(() => creature.value.combatActions.filter((row) => !isBlankAction(row)))
const intrusions = computed(() => creature.value.gmIntrusions.filter((row) => !isBlank(row.text)))

// The text after an action's italic "Title:". Built here, not in the template, so no
// template whitespace can reach a pre-wrap paragraph. A blank title leaves the
// description alone with no leading space, and a blank description leaves the title alone.
const actionBody = (action) => {
  if (isBlank(action.description)) return ''
  return isBlank(action.title) ? action.description : ` ${action.description}`
}

// The italic title. Its colon introduces the description, so a title with no
// description shows alone, with no colon (spec §7.2).
const actionTitle = (action) => (isBlank(action.description) ? action.title : `${action.title}:`)

// Direct entry. clampInt floors junk to 0, then setCurrentHealth clamps to 0..max. The
// template resyncs the box to the STORED value, so typing 9 over a max of 3 reads 3
// (ddd-9sf). The guard is the clamped @change sweep in clamp-resync.test.js, which
// requires this handler to wrap its write in syncClamped($event, ...).
const setCurrent = (value) => {
  npc.setCurrentHealth(clampInt(value))
  return npc.branch.health
}

// No state to roll back if the post fails, the same as ItemList.vue onPost. Swallow
// rather than leave an unhandled rejection in the host frame.
const onShare = async () => {
  try {
    await npc.postDescription(meta.name)
  } catch {
    // Chat post failed; the sheet is unchanged.
  }
}

// Named by its action, as ItemList names its rows. A blank title still needs a name. Two
// actions can share a title, and every blank title reads the same, so a repeated name is
// qualified by the action's position among the shown actions, as ItemList's rowWhat does
// (ddd-lwl; ddd-gtoq closeout audit).
const actionName = (action) => (isBlank(action.title) ? 'unnamed combat action' : action.title.trim())
const actionNameCounts = computed(() => {
  const counts = new Map()
  for (const action of actions.value) counts.set(actionName(action), (counts.get(actionName(action)) ?? 0) + 1)
  return counts
})
const chatLabel = (action, index) => {
  const name = actionName(action)
  return `Post ${actionNameCounts.value.get(name) > 1 ? `${name} (action ${index + 1})` : name} to chat`
}

// spec §7.4. meta.name goes in raw, as it does for postDescription, so a blank name
// drops the card's source line rather than printing a fallback (plan decision 10). A
// failed post changes nothing on the sheet, so it is swallowed like onShare.
const onPostAction = async (action) => {
  try {
    await npc.postCombatAction(action, meta.name)
  } catch {
    // Chat post failed; the sheet is unchanged.
  }
}
</script>

<!-- The NPC stat block (spec §7.2): one column at every width, in the current skin, in
     the §7.2 order. The card has no frame of its own. Its fields sit in banner-headed
     boxes, and the edit form in one box (ddd-pqfl). The pencil swaps the boxes for
     NpcEditForm and stays mounted in both views, so toggling never strands keyboard focus.

     Creature text renders through {{ }} and `white-space: pre-wrap`, never v-html, so a
     literal <b> stays text and line breaks survive. Keep every interpolation flush with
     its tags: under pre-wrap, template whitespace inside .npc-card__text or
     .npc-card__action-text would render.

     The minus and plus buttons never bind :disabled at 0 or max. setCurrentHealth
     already clamps, and a focused button that turns disabled drops keyboard focus to
     <body>, which is the focus-parking defect class (ddd-5qi, ddd-001 R6). -->
<template>
  <section class="npc-card">
    <header class="npc-card__head">
      <h3 class="npc-card__title">
        <span class="npc-card__name">{{ displayName }}</span>
        <span class="npc-card__level">{{ creature.level }} ({{ targetNumber(creature.level) }})</span>
      </h3>
      <div class="npc-card__actions">
        <!-- spec §7.4: the description post. postDescription passes whisper: false
             itself, so the hidden "whisper item cards" setting cannot reach it. Hidden
             when Description is blank after trimming. -->
        <button
          v-if="!isBlank(creature.description)"
          class="npc-card__share btn"
          type="button"
          @click="onShare"
        >
          Share description
        </button>
        <button
          class="npc-card__edit btn"
          :class="{ 'npc-card__edit--active': editing }"
          type="button"
          title="Edit"
          :aria-pressed="editing"
          aria-label="Edit stat block"
          @click="editing = !editing"
        >
          <IconPencil />
        </button>
      </div>
    </header>

    <NpcEditForm v-if="editing" class="panel" />
    <div v-else class="npc-card__fields">
      <section
        v-for="group in shownGroups"
        :key="group.key"
        class="npc-card__group panel"
        :data-group="group.key"
      >
        <h4 class="banner">{{ group.label }}</h4>
        <template v-for="field in group.fields" :key="field">
          <!-- Health and Armor share one row (owner amendment 2026-09-14). The row wraps,
               so Armor drops under Health when the card is too narrow for both. Health
               always opens the Health box, so the banner is its only label. -->
          <div v-if="field === 'health'" class="npc-card__vitals">
            <div class="npc-card__field" data-field="health">
              <div class="npc-card__health-row">
                <button
                  class="npc-card__health-dec btn"
                  type="button"
                  aria-label="Lose 1 health"
                  @click="npc.setCurrentHealth(npc.branch.health - 1)"
                >
                  −
                </button>
                <input
                  class="npc-card__health-current field"
                  type="number"
                  min="0"
                  :max="creature.health"
                  :value="npc.branch.health"
                  aria-label="Current health"
                  @change="syncClamped($event, setCurrent($event.target.value))"
                />
                <span class="npc-card__health-max">/ {{ creature.health }}</span>
                <button
                  class="npc-card__health-inc btn"
                  type="button"
                  aria-label="Gain 1 health"
                  @click="npc.setCurrentHealth(npc.branch.health + 1)"
                >
                  +
                </button>
                <span v-if="npc.branch.health === 0" class="npc-card__down">Down</span>
              </div>
            </div>
            <div v-if="armorShown" class="npc-card__field" data-field="armor">
              <span class="microlabel">{{ LABELS.armor }}</span>
              <p class="npc-card__text">{{ creature.armor }}<span v-if="!isBlank(creature.armorNote)" class="npc-card__armor-note"> ({{ creature.armorNote }})</span></p>
            </div>
          </div>

          <!-- The prelude, then one paragraph per action with its title in italics. The
               action paragraph stays on one line, per the pre-wrap rule above. -->
          <div v-else-if="field === 'combat'" class="npc-card__field" data-field="combat">
            <span v-if="showLabel(group, field)" class="microlabel">{{ LABELS.combat }}</span>
            <p v-if="!isBlank(creature.combat)" class="npc-card__text">{{ creature.combat }}</p>
            <div v-for="(action, index) in actions" :key="action._id" class="npc-card__action">
              <p class="npc-card__action-text"><em v-if="!isBlank(action.title)" class="npc-card__action-title">{{ actionTitle(action) }}</em>{{ actionBody(action) }}</p>
              <!-- spec §7.4: always public. It borrows the character sheet's chat chip,
                   whose rule main.css already holds, and adds no CSS of its own. -->
              <button
                class="npc-card__action-chat item-list__chat"
                type="button"
                title="Send to chat"
                :aria-label="chatLabel(action, index)"
                @click="onPostAction(action)"
              >
                <IconChat />
              </button>
            </div>
          </div>

          <!-- "GM intrusions" never matches the GM banner, so this label always shows. -->
          <div v-else-if="field === 'gmIntrusions'" class="npc-card__field" data-field="gmIntrusions">
            <span class="microlabel">{{ LABELS.gmIntrusions }}</span>
            <ul class="npc-card__intrusions">
              <li v-for="row in intrusions" :key="row._id" class="npc-card__intrusion">{{ row.text }}</li>
            </ul>
          </div>

          <div v-else class="npc-card__field" :data-field="field">
            <span v-if="showLabel(group, field)" class="microlabel">{{ LABELS[field] }}</span>
            <p class="npc-card__text">{{ creature[field] }}</p>
          </div>
        </template>
      </section>
    </div>
  </section>
</template>
