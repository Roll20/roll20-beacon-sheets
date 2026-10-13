<script setup>
import { computed, ref } from 'vue'
import { cardLine } from '@/builder/catalog.js'

const props = defineProps({
  option: { type: Object, required: true },
  chosen: { type: Boolean, default: false },
  tag: { type: String, default: '' },
})
defineEmits(['open'])

const broken = ref(false)
const line = computed(() => cardLine(props.option))
</script>

<template>
  <button type="button" class="card" :class="{ 'card--chosen': chosen }" @click="$emit('open', option)">
    <span class="card__art">
      <img v-if="option.art && !broken" :src="option.art" alt="" loading="lazy" @error="broken = true" />
      <span v-else class="card__initial">{{ option.pageName.charAt(0) }}</span>
      <span v-if="chosen" class="card__check" aria-label="Chosen">✓</span>
      <span v-if="tag" class="card__tag">{{ tag }}</span>
    </span>
    <span class="card__name">{{ option.pageName }}</span>
    <span v-if="line" class="card__summary">{{ line }}</span>
  </button>
</template>

<style scoped lang="scss">
@use '@/styles/tokens.scss' as *;

.card {
  display: flex;
  flex-direction: column;
  padding: 0;
  border: 2.5px solid var(--ps-line);
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  background: var(--ps-panel-alt);
  font-family: var(--ps-font);
  color: var(--ps-text);
  text-align: center;
  transition: border-color 0.15s ease, transform 0.15s ease;

  &:hover { border-color: var(--ps-gold); transform: translateY(-2px); }
  &:focus-visible { outline: 2px solid var(--ps-blue); outline-offset: 2px; }

  &--chosen,
  &--chosen:hover { border-color: var(--ps-blue); }
}

.card__art {
  position: relative;
  display: block;
  aspect-ratio: 3 / 4;
  background: linear-gradient(160deg, var(--ps-navy-soft), var(--ps-navy-deep));

  img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center top;
    display: block;
  }

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    box-shadow: inset 0 0 0 2px var(--ps-paper), inset 0 0 0 4px var(--ps-line-soft);
  }
}

.card__initial {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--ps-font-display);
  font-size: 56px;
  font-weight: 700;
  color: var(--ps-gold-light);
  opacity: 0.85;
}

.card__check {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--ps-blue);
  color: #fff;
  font-size: 13px;
  font-weight: 800;
}

.card__tag {
  position: absolute;
  left: 8px;
  bottom: 8px;
  z-index: 1;
  @include ps-chip;
}

.card__name {
  @include ps-heading(15px);
  padding: 6px 6px 0;
  border-top: 2px solid var(--ps-line);
}

.card__summary {
  padding: 1px 6px 7px;
  font-size: 10.5px;
  color: var(--ps-text-muted);
}
</style>
