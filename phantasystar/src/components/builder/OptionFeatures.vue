<script setup>
import { computed } from 'vue'
import { featuresOf } from '@/builder/choices.js'

const props = defineProps({
  option: { type: Object, required: true },
  level: { type: Number, default: 20 },
  levelled: { type: Boolean, default: false },
})

const features = computed(() => featuresOf(props.option, props.level))
</script>

<template>
  <ul v-if="features.length" class="features">
    <li v-for="f in features" :key="`${f.level}-${f.id || f.name}`">
      <details class="feature">
        <summary>
          <span v-if="levelled" class="feature__level">{{ f.level }}</span>
          <span class="feature__name">{{ f.name }}</span>
        </summary>
        <p v-for="(para, i) in f.text" :key="i" class="feature__text">{{ para }}</p>
        <ul v-if="f.entry.options?.length" class="feature__options">
          <li v-for="o in f.entry.options" :key="o.name">
            <strong>{{ o.name }}.</strong> {{ o.text }}
          </li>
        </ul>
      </details>
    </li>
  </ul>
</template>

<style scoped lang="scss">
@use '@/styles/tokens.scss' as *;

.features { list-style: none; margin: 0; padding: 0; }

.feature {
  border-bottom: 1px solid rgba(var(--ps-line-soft-rgb), 0.3);

  summary {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 4px;
    cursor: pointer;
    list-style: none;

    &::-webkit-details-marker { display: none; }
    &::before { content: '▸'; width: 8px; color: var(--ps-heading-soft); font-size: 10px; }
  }

  &[open] summary::before { content: '▾'; }
}

.feature__level {
  @include ps-chip;
  min-width: 22px;
  justify-content: center;
}

.feature__name { font-weight: 700; color: var(--ps-heading); font-size: 13px; }

.feature__text,
.feature__options {
  margin: 0 4px 8px;
  font-size: 12px;
  line-height: 1.5;
}

.feature__options { padding-left: 18px; }
</style>
