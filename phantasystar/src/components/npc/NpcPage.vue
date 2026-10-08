<script setup>
import { ref, computed, nextTick, onBeforeUnmount } from 'vue'
import { useAppStore } from '@/stores/index.js'
import { useNpcStore } from '@/stores/npcStore.js'
import { useNpcShipStore } from '@/stores/npcShipStore.js'
import { NPC_MODES, NPC_SHIP } from '@/sheetTypes.js'
import RollBar from '@/components/shared/RollBar.vue'
import StatBlock from './StatBlock.vue'
import StatBlockEditor from './StatBlockEditor.vue'
import ShipStatBlock from '@/components/npcship/ShipStatBlock.vue'
import ShipStatBlockEditor from '@/components/npcship/ShipStatBlockEditor.vue'

const app = useAppStore()
const npc = useNpcStore()
const npcShip = useNpcShipStore()
const editing = ref(false)

const isShip = computed(() => app.npcMode === NPC_SHIP)

const page = ref(null)

const finishEditing = async () => {
  editing.value = false
  await nextTick()
  if (page.value && page.value.getBoundingClientRect().top < 0) {
    page.value.scrollIntoView({ block: 'start' })
  }
}

const copyArmed = ref(false)
let copyTimer = null
const disarmCopy = () => {
  copyArmed.value = false
  clearTimeout(copyTimer)
}
const onCopy = () => {
  if (!copyArmed.value) {
    copyArmed.value = true
    copyTimer = setTimeout(disarmCopy, 3000)
    return
  }
  disarmCopy()
  npc.copyFromCharacter()
}
onBeforeUnmount(disarmCopy)
</script>

<template>
  <div ref="page" class="page">
    <RollBar />

    <div class="bar">
      <div class="group" role="group" aria-label="What this NPC is">
        <button
          v-for="mode in NPC_MODES"
          :key="mode.id"
          type="button"
          class="toggle"
          :class="{ active: app.npcMode === mode.id }"
          :title="mode.blurb"
          @click="app.setNpcMode(mode.id)"
        >
          {{ mode.name }}
        </button>
      </div>

      <span v-if="isShip" class="chip">Maneuver DC {{ npcShip.saveDC }}</span>

      <button
        v-if="!isShip && npc.hasCharacter"
        type="button"
        class="copy"
        :class="{ armed: copyArmed }"
        @click="onCopy"
        @blur="disarmCopy"
      >
        {{ copyArmed ? 'Replace stat block?' : 'Copy from Character' }}
      </button>
    </div>

    <div v-if="editing" class="done-row">
      <button type="button" class="done" @click="finishEditing">Done</button>
    </div>

    <template v-if="isShip">
      <ShipStatBlockEditor v-if="editing" />
      <ShipStatBlock v-else @edit="editing = true" />
    </template>

    <template v-else>
      <StatBlockEditor v-if="editing" />
      <StatBlock v-else @edit="editing = true" />
    </template>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/tokens.scss' as *;

.page {
  display: flex;
  flex-direction: column;
  gap: var(--ps-gap-lg);
  padding: 12px;
  max-width: 1180px;
  margin: 0 auto;
}

.bar {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.group {
  display: flex;
  gap: 4px;
}

.toggle {
  @include ps-heading(12px);
  background: var(--ps-field);
  border: var(--ps-border-thin);
  border-radius: var(--ps-radius-sm);
  padding: 3px 12px;
  color: var(--ps-heading);
  cursor: pointer;

  &:hover { background: var(--ps-panel-alt); }
  &.active { background: var(--ps-fill); color: var(--ps-on-fill); border-color: var(--ps-line); }
}

.done-row {
  position: sticky;
  top: calc(var(--ps-tabs-h, 0px) + 8px);
  z-index: 5;
  display: flex;
  justify-content: flex-end;
  pointer-events: none;
}

.done {
  @include ps-button;
  pointer-events: auto;
  box-shadow: 0 2px 6px rgba(var(--ps-shadow-rgb), 0.2);
}

.chip {
  @include ps-caption;
  margin-left: auto;
  color: var(--ps-text-muted);
}

.copy {
  @include ps-heading(12px);
  margin-left: auto;
  background: var(--ps-field);
  border: var(--ps-border-thin);
  border-radius: var(--ps-radius-sm);
  padding: 3px 12px;
  color: var(--ps-heading);
  cursor: pointer;

  &:hover { background: var(--ps-panel-alt); }

  &.armed {
    background: var(--ps-red);
    border-color: var(--ps-red);
    color: var(--ps-on-fill);
  }
}
</style>
