<script setup>
import { ref } from 'vue'
import { dispatchRef, initValues } from '@/relay/relay.js'

const MARKERS = [
  '.sheet-rolltemplate-darkmode',
  '.sheet-darkmode',
  '.darkmode',
  '.dark-mode',
  '.dark',
  '.theme-dark',
  '[data-theme="dark"]',
  '[data-bs-theme="dark"]',
  '[data-color-mode="dark"]',
]

const escape = (s) =>
  String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])

const sent = ref(null)

const post = async () => {
  const rows = MARKERS.map(
    (m, i) => `<div class="pstr-probe__row pstr-probe__row--${i + 1}"><span>${escape(m)}</span></div>`,
  ).join('')
  const theme = escape(initValues.settings?.colorTheme ?? 'unset')
  const content =
    '<div class="pstr-card pstr-card--chat">' +
    '<div class="pstr-card__header"><div class="pstr-card__title">Chat Theme Probe</div>' +
    `<div class="pstr-card__subtitle">sheet colorTheme: ${theme}</div></div>` +
    `<div class="pstr-probe">${rows}` +
    '<div class="pstr-probe__row pstr-probe__row--os"><span>prefers-color-scheme: dark</span></div>' +
    '</div></div>'
  await dispatchRef.value?.post({ characterId: initValues.character.id, content })
  sent.value = theme
}
</script>

<template>
  <div class="probe">
    <h3>Chat Theme Probe</h3>
    <button type="button" class="send" @click="post()">Post Probe Card</button>
    <span v-if="sent" class="sent">Posted (sheet theme {{ sent }})</span>
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
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

h3 { @include ps-heading(14px); margin: 0; flex-basis: 100%; }

.send {
  @include ps-chip(true);
}

.sent { color: var(--ps-text-muted); }
</style>
