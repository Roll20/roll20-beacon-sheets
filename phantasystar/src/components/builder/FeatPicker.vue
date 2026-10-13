<script setup>
import { computed } from 'vue'
import { compendiumUrl } from '@/builder/catalog.js'
import { openCompendium } from '@/utility/openCompendium.js'

const props = defineProps({
  feats: { type: Array, default: () => [] },
  value: { type: String, default: '' },
  blocked: { type: Object, default: () => ({}) },
  option: { type: Object, default: null },
  pick: { type: String, default: '' },
})
const emit = defineEmits(['change', 'pick'])

const picked = computed(() => props.feats.find((f) => f.pageName === props.value) ?? null)

const picks = computed(() => props.pick.split('|').filter(Boolean))
const slots = computed(() => Array.from({ length: props.option?.count ?? 0 }, (_, i) => i))
const setPick = (i, name) => {
  const next = [...picks.value]
  next[i] = name
  emit('pick', next.filter(Boolean).join('|'))
}
const offered = (i) => props.option.options.filter((o) => !picks.value.some((p, j) => j !== i && p === o.value))
</script>

<template>
  <div class="feat">
    <select class="feat__select" :value="picked ? value : ''" @change="emit('change', $event.target.value)">
      <option value="">Choose a feat…</option>
      <option
        v-for="f in feats"
        :key="f.pageName"
        :value="f.pageName"
        :disabled="!!blocked[f.pageName] && f.pageName !== value"
        :title="blocked[f.pageName] || undefined"
      >{{ f.pageName }}{{ blocked[f.pageName] ? ' (unavailable)' : '' }}</option>
    </select>
    <a
      v-if="picked"
      class="book"
      :href="compendiumUrl(picked)"
      target="_blank"
      rel="noopener"
      :title="picked.pageName"
      :aria-label="`Open ${picked.pageName} in the Compendium`"
      @click.prevent="openCompendium(compendiumUrl(picked))"
    >
      <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><path fill="currentColor" d="M6 2h11a2 2 0 0 1 2 2v15a1 1 0 0 1-1 1H7a1 1 0 0 0 0 2h11v-2h2v3a1 1 0 0 1-1 1H7a3 3 0 0 1-3-3V4a2 2 0 0 1 2-2Zm2 4v2h8V6H8Z"/></svg>
    </a>
    <span v-if="picked && blocked[picked.pageName]" class="feat__why">{{ blocked[picked.pageName] }}</span>
    <div v-if="picked && option" class="feat__options">
      <select
        v-for="i in slots"
        :key="i"
        class="feat__option"
        :class="{ 'feat__option--open': !picks[i] }"
        :value="picks[i] ?? ''"
        :aria-label="`${option.label} option`"
        @change="setPick(i, $event.target.value)"
      >
        <option value="">Choose an option…</option>
        <option
          v-for="o in offered(i)"
          :key="o.value"
          :value="o.value"
          :disabled="!!option.held[o.value]"
          :title="option.held[o.value] || o.text || undefined"
        >{{ o.name }}{{ option.held[o.value] ? ' (unavailable)' : '' }}</option>
      </select>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/tokens.scss' as *;

.feat { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }

.feat__select {
  @include ps-control(26px);
  min-width: 260px;
  cursor: pointer;
}

.feat__why { font-size: 11px; color: var(--ps-red); }

.feat__options { display: flex; flex-wrap: wrap; gap: 6px; flex-basis: 100%; }

.feat__option {
  @include ps-control(26px);
  min-width: 180px;
  cursor: pointer;

  &--open { border-color: var(--ps-blue); }
}

.book {
  display: inline-flex;
  color: var(--ps-heading);
  opacity: 0.8;
  &:hover { opacity: 1; }
}
</style>
