<script setup>
import { computed, defineAsyncComponent } from 'vue'
import { useMetaStore } from '@/stores/metaStore.js'
import { useAppStore } from '@/stores/index.js'
import { SHEET_TYPES, NPC_MODES, NPC, STARSHIP } from '@/sheetTypes.js'
import { STARSHIP_KINDS } from '@/rules/index.js'
import { useStarshipStore } from '@/stores/starshipStore.js'
import SheetPanel from '@/components/shared/SheetPanel.vue'
import CompendiumImport from './CompendiumImport.vue'
import SettingOption from './SettingOption.vue'

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
import { offeredOptions, sharedSettings, saveSharedSettings } from '@/relay/sheetSettings.js'
import sheetComputed from '@/relay/handlers/computed.js'

const meta = useMetaStore()
const app = useAppStore()
const ship = useStarshipStore()

const isGM = computed(() => meta.permissions.isGM)

const toggle = (key, value) => saveSharedSettings({ [key]: value })
const offered = offeredOptions()

const options = offered.filter((o) => !o.group && o.key !== 'characterBuilder')
const builderSwitch = offered.find((o) => o.key === 'characterBuilder') ?? null
const builderOptions = offered.filter((o) => o.group === 'builder')

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

            <div v-if="type.id === STARSHIP && app.sheetType === STARSHIP" class="nested">
              <label v-for="k in STARSHIP_KINDS" :key="k.id" class="option">
                <input
                  type="radio"
                  name="ps-starship-kind"
                  :value="k.id"
                  :checked="ship.kind === k.id"
                  :disabled="!meta.canEdit"
                  @change="ship.setKind(k.id)"
                />
                <span class="option__body">
                  <strong>{{ k.name }}</strong>
                </span>
              </label>
            </div>

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

          <SettingOption
            v-for="option in options"
            :key="option.key"
            :option="option"
            :value="sharedSettings[option.key]"
            :disabled="!isGM"
            @change="toggle(option.key, $event)"
          />
        </SheetPanel>

        <SheetPanel v-if="builderSwitch" title="Character Builder">
          <template #actions>
            <button
              type="button"
              role="switch"
              class="switch"
              :class="{ 'switch--on': sharedSettings.characterBuilder }"
              :aria-checked="!!sharedSettings.characterBuilder"
              :disabled="!isGM"
              @click="toggle('characterBuilder', !sharedSettings.characterBuilder)"
            >
              <span class="switch__knob" />
              <span class="switch__label">{{ sharedSettings.characterBuilder ? 'On' : 'Off' }}</span>
            </button>
          </template>
          <p class="hint">{{ builderSwitch.hint }}</p>
          <div v-if="sharedSettings.characterBuilder" class="nested">
            <SettingOption
              v-for="option in builderOptions"
              :key="option.key"
              :option="option"
              :value="sharedSettings[option.key]"
              :disabled="!isGM"
              @change="toggle(option.key, $event)"
            />
          </div>
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
  input[type='radio'] { @include ps-pip-radio(12px); }

  &__body { display: flex; flex-direction: column; min-width: 0; }

  strong { font-size: 12px; color: var(--ps-heading); }
}

.switch {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0;
  border: none;
  background: none;
  cursor: pointer;
  font-family: var(--ps-font);

  &:disabled { cursor: default; opacity: 0.6; }

  &__knob {
    position: relative;
    width: 30px;
    height: 16px;
    border-radius: 999px;
    background: var(--ps-panel-alt);
    border: var(--ps-border-thin);
    transition: background 0.15s;

    &::after {
      content: '';
      position: absolute;
      top: 1px;
      left: 1px;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: var(--ps-heading-soft);
      transition: transform 0.15s, background 0.15s;
    }
  }

  &__label { @include ps-caption; font-size: 10px; min-width: 18px; text-align: left; }

  &--on .switch__knob {
    background: var(--ps-blue);
    border-color: var(--ps-blue);

    &::after { transform: translateX(14px); background: var(--ps-on-fill); }
  }

  &:focus-visible { outline: 2px solid var(--ps-blue); outline-offset: 2px; border-radius: 4px; }
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
