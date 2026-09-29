<script setup>
import { computed, onMounted, ref } from 'vue'
import { dispatchRef, sheetDrops, dragOverCount, refusedDropCount } from '@/relay/relay.js'
import { dropSummary } from '@/compendium/dropLog.js'
import SheetPanel from '@/components/shared/SheetPanel.vue'

const PRESETS = [
  {
    id: 'typename',
    label: 'Sanity check',
    hint: 'Proves the string is a selection set under ruleSystem, not a document.',
    query: '__typename',
  },
  {
    id: 'byName',
    label: 'Page by name',
    hint: 'Exactly what a drop pointer gives us: pageName and categoryName.',
    query: 'pages(name: "Owlbear" category: "Monsters") '
      + '{ id name properties children { name properties } }',
  },
  {
    id: 'withProse',
    label: 'Page with prose',
    hint: 'Adds the paid description and the rendered card.',
    query: 'pages(name: "Owlbear" category: "Monsters") '
      + '{ id name properties content cardHtml book { itemId shortName } }',
  },
  {
    id: 'byId',
    label: 'Page by id',
    hint: 'The other route, when an id is already in hand.',
    query: 'page(id: "6204553f4401f963c062c395") { id name properties }',
  },
]

const query = ref(PRESETS[1].query)
const result = ref('')
const busy = ref(false)
const failed = ref(false)

const offline = computed(() => typeof dispatchRef.value?.compendiumRequest !== 'function')

const use = (preset) => {
  query.value = preset.query
  result.value = ''
  failed.value = false
}

const send = async () => {
  busy.value = true
  failed.value = false
  result.value = ''
  try {
    const response = await dispatchRef.value.compendiumRequest({ query: query.value })
    result.value = JSON.stringify(response, null, 2)
    failed.value = Array.isArray(response?.errors) && response.errors.length > 0
  } catch (error) {
    failed.value = true
    result.value = `threw: ${error?.message ?? error}\n\n${error?.stack ?? ''}`
  } finally {
    busy.value = false
  }
}

const copy = () => navigator.clipboard?.writeText(result.value)

const AUTO_QUERY = ''

onMounted(async () => {
  if (!AUTO_QUERY) return
  for (let i = 0; i < 40 && offline.value; i += 1) {
    await new Promise((resolve) => setTimeout(resolve, 250))
  }
  if (offline.value) return
  query.value = AUTO_QUERY
  await send()
})
</script>

<template>
  <SheetPanel title="Compendium Probe (Dev Only)">
    <p class="hint">
      Sends a raw query through <code>dispatch.compendiumRequest()</code>. Read-only: it asks
      the compendium questions and never writes anything. Absent from a production build.
    </p>

    <section class="drops">
      <h4>Sheet Drops</h4>
      <p class="hint">
        What arrives at <code>onDropOver</code> when something is dropped onto this open
        sheet. A stub &mdash; it records and imports nothing. Drags seen:
        <strong>{{ dragOverCount }}</strong>.
        <template v-if="refusedDropCount">
          Refused (view-only viewer): <strong>{{ refusedDropCount }}</strong>.
        </template>
      </p>
      <p v-if="!sheetDrops.length" class="muted">
        Nothing dropped on the sheet yet this session. A drop onto the MAP arrives through
        <code>onInit</code> instead and shows in Compendium import, not here.
      </p>
      <ol v-else class="droplist">
        <li v-for="(drop, i) in sheetDrops" :key="drop.at + i">
          <code>{{ dropSummary(drop) }}</code>
          <span v-if="drop.expansionId" class="muted"> exp {{ drop.expansionId }}</span>
          <span v-if="drop.coordinates" class="muted">
            @ {{ drop.coordinates.x }},{{ drop.coordinates.y }}
          </span>
        </li>
      </ol>
    </section>

    <p v-if="offline" class="bad">
      No <code>compendiumRequest</code> on the relay &mdash; this needs the sandbox
      (<code>npm run sandbox</code>) against a game with a compendium, not the offline relay.
    </p>

    <div class="presets">
      <button v-for="preset in PRESETS" :key="preset.id" type="button" :title="preset.hint"
              @click="use(preset)">
        {{ preset.label }}
      </button>
    </div>

    <textarea v-model="query" rows="6" spellcheck="false" />

    <div class="actions">
      <button type="button" class="go" :disabled="busy || offline" @click="send">
        {{ busy ? 'Asking…' : 'Send' }}
      </button>
      <button v-if="result" type="button" class="copy" @click="copy">Copy result</button>
      <span v-if="failed" class="bad">The response carried errors &mdash; read them below.</span>
    </div>

    <pre v-if="result" class="out">{{ result }}</pre>
  </SheetPanel>
</template>

<style scoped lang="scss">
@use '@/styles/tokens.scss' as *;

.hint { margin: 0 0 6px; font-size: 10px; color: var(--ps-muted); line-height: 1.5; }

code, textarea, .out { font-family: ui-monospace, "Cascadia Mono", Consolas, monospace; }
code { text-transform: none; }

.presets {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 5px;

  button {
    @include ps-caption;
    background: var(--ps-panel);
    border: var(--ps-border-thin);
    border-radius: var(--ps-radius-sm);
    padding: 2px 8px;
    font-size: 9px;
    cursor: pointer;

    &:hover { background: var(--ps-panel-alt); }
  }
}

textarea {
  @include ps-well;
  width: 100%;
  text-align: left;
  font-size: 10.5px;
  line-height: 1.45;
  padding: 4px 5px;
  resize: vertical;

  &:focus { outline: 2px solid var(--ps-blue); outline-offset: -1px; }
}

.actions {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 6px;
}

.go {
  @include ps-heading(12px);
  background: var(--ps-navy);
  border: 1px solid var(--ps-navy);
  border-radius: var(--ps-radius-sm);
  color: #fff;
  padding: 3px 14px;
  cursor: pointer;

  &:hover:not(:disabled) { background: var(--ps-navy-deep); }
  &:disabled { opacity: 0.5; cursor: default; }
}

.copy {
  @include ps-caption;
  background: var(--ps-panel);
  border: var(--ps-border-thin);
  border-radius: var(--ps-radius-sm);
  padding: 2px 9px;
  cursor: pointer;

  &:hover { background: var(--ps-panel-alt); }
}

.bad { font-size: 10px; color: var(--ps-red); line-height: 1.5; margin: 0; }

.muted { color: var(--ps-muted); font-size: 9.5px; }

.drops {
  margin-bottom: 8px;
  padding-bottom: 7px;
  border-bottom: var(--ps-border-thin);

  h4 { @include ps-heading(12px); margin: 0 0 3px; }
  p { margin: 0 0 4px; }
}

.droplist {
  margin: 0;
  padding-left: 16px;
  font-size: 10px;
  line-height: 1.5;

  li { word-break: break-word; }
}

.out {
  margin: 6px 0 0;
  padding: 6px 7px;
  background: var(--ps-field);
  border: var(--ps-border-thin);
  border-radius: var(--ps-radius-sm);
  font-size: 10px;
  line-height: 1.4;
  max-height: 320px;
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-word;
  user-select: text;
}
</style>
