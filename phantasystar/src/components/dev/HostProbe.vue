<script setup>
import { computed } from 'vue'
import { initValues } from '@/relay/relay.js'

const settingsRows = computed(() =>
  Object.entries(initValues.settings ?? {})
    .map(([key, value]) => ({ key, value: display(value) }))
    .sort((a, b) => a.key.localeCompare(b.key)),
)

const frameParams = computed(() => {
  try {
    const params = [...new URL(window.location.href).searchParams.entries()]
    return params.map(([key, value]) => ({ key, value }))
  } catch {
    return []
  }
})

const prefersDark = computed(() => {
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  } catch {
    return null
  }
})

const referrer = computed(() => document.referrer || 'none')

const themeish = computed(() =>
  settingsRows.value.filter((row) => /theme|dark|light|colou?r|appearance/i.test(row.key)),
)

const tokenRows = computed(() =>
  Object.entries(initValues.character?.token ?? {})
    .map(([key, value]) => ({ key, value: display(value) }))
    .sort((a, b) => a.key.localeCompare(b.key)),
)

const imageish = computed(() =>
  tokenRows.value.filter((row) => /img|image|src|avatar|url|picture/i.test(row.key)),
)

const characterKeys = computed(() =>
  Object.keys(initValues.character ?? {})
    .sort()
    .map((key) => (key === 'attributes'
      ? `attributes (${Object.keys(initValues.character.attributes ?? {}).length} keys)`
      : key))
    .join(", "),
)

function display(value) {
  if (value === null) return 'null'
  if (value === undefined) return 'undefined'
  const text = typeof value === 'object' ? JSON.stringify(value) : String(value)
  return text.length > 160 ? `${text.slice(0, 160)}… (${text.length} chars)` : text
}
</script>

<template>
  <div class="probe">
    <h3>Host Probe</h3>

    <dl class="facts">
      <div>
        <dt>Theme-ish keys in settings</dt>
        <dd :class="themeish.length ? 'yes' : 'no'">
          {{ themeish.length ? themeish.map((r) => `${r.key} = ${r.value}`).join(', ') : 'none' }}
        </dd>
      </div>
      <div>
        <dt>prefers-color-scheme: dark</dt>
        <dd>{{ prefersDark === null ? 'unavailable' : prefersDark }}</dd>
      </div>
      <div>
        <dt>Frame URL params</dt>
        <dd>
          {{ frameParams.length
            ? frameParams.map((p) => `${p.key}=${p.value}`).join(' · ')
            : 'none' }}
        </dd>
      </div>
      <div>
        <dt>Referrer</dt>
        <dd>{{ referrer }}</dd>
      </div>
      <div>
        <dt>Image-ish keys in token</dt>
        <dd :class="imageish.length ? 'yes' : 'no'">
          {{ imageish.length
            ? imageish.map((r) => `${r.key} = ${r.value}`).join(', ')
            : 'none' }}
        </dd>
      </div>
      <div>
        <dt>character keys</dt>
        <dd>{{ characterKeys || 'none' }}</dd>
      </div>
    </dl>

    <h4>settings ({{ settingsRows.length }} keys)</h4>
    <table>
      <tbody>
        <tr v-for="row in settingsRows" :key="row.key">
          <th>{{ row.key }}</th>
          <td>{{ row.value }}</td>
        </tr>
      </tbody>
    </table>

    <h4>character.token ({{ tokenRows.length }} keys)</h4>
    <p v-if="!tokenRows.length" class="none">empty &mdash; no default token on this character</p>
    <table v-else>
      <tbody>
        <tr v-for="row in tokenRows" :key="row.key">
          <th>{{ row.key }}</th>
          <td>{{ row.value }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/tokens.scss' as *;

.probe {
  border: 1px dashed var(--ps-gold-dark);
  border-radius: var(--ps-radius-sm);
  padding: 8px;
  margin-top: 10px;
  font-size: 11px;
}

h3 { @include ps-heading(14px); margin: 0 0 6px; }
h4 { @include ps-caption; font-size: 9px; margin: 10px 0 3px; }

.facts {
  margin: 0;

  div { display: flex; gap: 6px; align-items: baseline; padding: 1px 0; }
  dt { @include ps-caption; font-size: 9px; flex: 0 0 auto; }
  dd { margin: 0; font-weight: 700; word-break: break-all; }
  .yes { color: var(--ps-green); }
  .no { color: var(--ps-muted); font-weight: 400; }
}

table { width: 100%; border-collapse: collapse; }

th, td {
  text-align: left;
  padding: 1px 4px;
  border-bottom: 1px solid rgba(74, 111, 165, 0.25);
  vertical-align: top;
  word-break: break-all;
}

th { @include ps-caption; font-size: 9px; width: 38%; }

.none { margin: 2px 0; color: var(--ps-muted); }
</style>
