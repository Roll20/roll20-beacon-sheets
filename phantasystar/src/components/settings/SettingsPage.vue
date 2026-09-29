<script setup>
import { computed, defineAsyncComponent } from 'vue'
import { useMetaStore } from '@/stores/metaStore.js'
import { useAppStore } from '@/stores/index.js'
import { SHEET_TYPES, NPC_MODES, NPC } from '@/sheetTypes.js'
import SheetPanel from '@/components/shared/SheetPanel.vue'
import CompendiumImport from './CompendiumImport.vue'

const isDev = import.meta.env.DEV
const CompendiumProbe = isDev
  ? defineAsyncComponent(() => import('@/components/dev/CompendiumProbe.vue'))
  : null
const HostProbe = isDev
  ? defineAsyncComponent(() => import('@/components/dev/HostProbe.vue'))
  : null
const ChatThemeProbe = isDev
  ? defineAsyncComponent(() => import('@/components/dev/ChatThemeProbe.vue'))
  : null
import { SHEET_OPTIONS, sharedSettings, saveSharedSettings } from '@/relay/sheetSettings.js'
import sheetComputed from '@/relay/handlers/computed.js'

const meta = useMetaStore()
const app = useAppStore()

const isGM = computed(() => meta.permissions.isGM)

const toggle = (key, value) => saveSharedSettings({ [key]: value })

const barValues = Object.entries(sheetComputed)
  .filter(([, entry]) => entry.tokenBarValue)
  .map(([name, entry]) => ({ name, description: entry.description }))

const macroValues = Object.entries(sheetComputed)
  .filter(([, entry]) => !entry.tokenBarValue)
  .map(([name, entry]) => ({ name, description: entry.description }))

const exampleName = computed(() => meta.name || 'Character Name')
</script>

<template>
  <div class="page">
    <div class="cols">
      <div class="col">
        <SheetPanel title="Character Type">
          <p class="hint">
            Changes the type of character used on this sheet. Sheet options and tabs change
            for each selection.
          </p>
          <template v-for="type in SHEET_TYPES" :key="type.id">
            <label class="option">
              <input
                type="radio"
                name="ps-sheet-type"
                :value="type.id"
                :checked="app.sheetType === type.id"
                :disabled="!meta.canEdit"
                @change="app.setSheetType(type.id)"
              />
              <span class="option__body">
                <strong>{{ type.name }}</strong>
              </span>
            </label>

            <div v-if="type.id === NPC && app.sheetType === NPC" class="nested">
              <label v-for="mode in NPC_MODES" :key="mode.id" class="option">
                <input
                  type="radio"
                  name="ps-npc-mode"
                  :value="mode.id"
                  :checked="app.npcMode === mode.id"
                  :disabled="!meta.canEdit"
                  @change="app.setNpcMode(mode.id)"
                />
                <span class="option__body">
                  <strong>{{ mode.name }}</strong>
                </span>
              </label>
            </div>
          </template>
        </SheetPanel>

        <SheetPanel title="Campaign Options">
          <p class="hint">Game-wide settings (set by the GM)</p>

          <label v-for="option in SHEET_OPTIONS" :key="option.key" class="option">
            <input
              type="checkbox"
              :checked="sharedSettings[option.key]"
              :disabled="!isGM"
              @change="toggle(option.key, $event.target.checked)"
            />
            <span class="option__body">
              <strong>{{ option.name }}</strong>
              <small>{{ option.hint }}</small>
            </span>
          </label>
        </SheetPanel>

        <CompendiumImport v-if="isGM" />

        <component :is="CompendiumProbe" v-if="isDev && meta.canEdit" />
        <component :is="HostProbe" v-if="isDev" />
        <component :is="ChatThemeProbe" v-if="isDev" />
      </div>

      <div class="col">
        <SheetPanel title="Token Bars">
          <dl class="facts">
            <template v-for="v in barValues" :key="v.name">
              <dt><code>{{ v.name }}</code></dt>
              <dd>{{ v.description }}</dd>
            </template>
          </dl>
        </SheetPanel>

        <SheetPanel title="Macros">
          <p class="hint">
            <code>@{{ '{' }}{{ exampleName }}|skills.perception{{ '}' }}</code>
          </p>
          <dl class="facts">
            <template v-for="v in macroValues" :key="v.name">
              <dt><code>{{ v.name }}</code></dt>
              <dd>{{ v.description }}</dd>
            </template>
          </dl>
        </SheetPanel>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/tokens.scss' as *;

.page {
  padding: 12px;
  max-width: 1180px;
  margin: 0 auto;
}

.cols {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: var(--ps-gap-lg);
  align-items: start;
}

.col { display: flex; flex-direction: column; gap: var(--ps-gap-lg); min-width: 0; }

.hint {
  margin: 0 0 7px;
  font-size: 10.5px;
  color: var(--ps-text-muted);
  line-height: 1.5;
}

.nested {
  margin-left: 18px;
  padding-left: 9px;
  border-left: 2px solid var(--ps-gold);
}

.option {
  display: flex;
  align-items: flex-start;
  gap: 7px;
  padding: 5px 2px;
  border-bottom: 1px solid rgba(var(--ps-line-soft-rgb), 0.2);
  cursor: pointer;

  &:last-child { border-bottom: none; }

  input { margin-top: 2px; }
  input[type='checkbox'] { @include ps-pip-check(12px); }
  input[type='radio'] { @include ps-pip-radio(12px); }

  &__body { display: flex; flex-direction: column; min-width: 0; }

  strong { font-size: 12px; color: var(--ps-heading); }
  small { font-size: 10px; color: var(--ps-text-muted); line-height: 1.45; }
}

.facts {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 2px 10px;
  margin: 0;
  font-size: 11px;

  dt { @include ps-caption; align-self: baseline; }
  dd { margin: 0; color: var(--ps-text); }
}

code {
  font-family: ui-monospace, 'Cascadia Mono', Consolas, monospace;
  font-size: 10.5px;
  background: var(--ps-field);
  border-radius: 2px;
  padding: 0 3px;
  text-transform: none;
  letter-spacing: 0;
  font-weight: 400;
}

@media (max-width: 860px) {
  .cols { grid-template-columns: 1fr; }
}
</style>
