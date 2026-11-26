<script setup>
import { computed } from 'vue'
import { initValues } from '@/relay/relay.js'
import { themeOf } from '@/theme.js'

const props = defineProps({
  value: { type: [Number, String], default: 0 },
  max: { type: [Number, String], default: 0 },
  fill: { type: [Number, String], default: null },
  plain: { type: Boolean, default: false },
  color: { type: String, default: 'var(--ps-green)' },
  size: { type: Number, default: 92 },
  label: { type: String, default: '' },
  showRatio: { type: Boolean, default: true },
  editable: { type: Boolean, default: false },
  frame: { type: String, default: '' },
  frameDark: { type: String, default: '' },
  inset: { type: Number, default: 0 },
})
defineEmits(['update:value'])

const shownFrame = computed(() =>
  props.frameDark && themeOf(initValues.settings?.colorTheme) === 'dark' ? props.frameDark : props.frame,
)

const R = 34
const CIRC = 2 * Math.PI * R

const pct = computed(() => {
  const v = Number(props.fill ?? props.value) || 0
  const m = Number(props.max) || 0
  if (!props.showRatio || m <= 0) return 1
  return Math.max(0, Math.min(1, v / m))
})

const dash = computed(() => `${CIRC * pct.value} ${CIRC}`)

const viewBox = computed(() => (props.plain ? '11 11 78 78' : '0 0 100 100'))
</script>

<template>
  <div class="gauge" :style="{ width: size + inset * 2 + 'px' }">
    <div class="gauge-face">
      <img v-if="shownFrame" class="gauge-frame" :src="shownFrame" :width="size" :height="size" alt="" />
      <svg
        v-else
        :viewBox="viewBox"
        :width="size"
        :height="size"
        role="img"
        :aria-label="label"
      >
        <circle v-if="!plain" cx="50" cy="50" r="45" fill="none" stroke="var(--ps-gold-light)" stroke-width="5"
                stroke-dasharray="70 30" stroke-linecap="round" transform="rotate(-90 50 50)" />
        <circle v-if="!plain" cx="50" cy="50" r="45" fill="none" stroke="var(--ps-gold)" stroke-width="2"
                stroke-dasharray="40 60" stroke-linecap="round" transform="rotate(30 50 50)" />
        <circle cx="50" cy="50" :r="R" fill="var(--ps-field)" stroke="var(--ps-panel-alt)" stroke-width="6" />
        <circle
          v-if="pct > 0"
          cx="50" cy="50" :r="R"
          fill="none" :stroke="color" stroke-width="6" stroke-linecap="round"
          :stroke-dasharray="dash" transform="rotate(-90 50 50)"
        />
        <g v-if="plain" fill="none" stroke="var(--ps-line)" stroke-width="1">
          <circle cx="50" cy="50" :r="R + 3" />
          <circle cx="50" cy="50" :r="R - 3" />
        </g>
      </svg>
      <input
        v-if="editable"
        class="gauge-value editable"
        :value="value"
        @input="$emit('update:value', $event.target.value)"
      />
      <div v-else class="gauge-value">{{ value }}</div>
    </div>
    <div v-if="label" class="gauge-label">{{ label }}</div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/tokens.scss' as *;

.gauge {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 0 0 auto;
}

.gauge-face {
  position: relative;
  width: v-bind('size + "px"');
  height: v-bind('size + "px"');
  margin: v-bind('inset + "px"');

  > img, > svg { display: block; }
}

.gauge-value {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 700;
  color: var(--ps-derived, var(--ps-heading));
  pointer-events: none;
  transform: translateY(0.055em);

  &.editable {
    color: var(--ps-entry, var(--ps-heading));
    pointer-events: auto;
    background: transparent;
    border: none;
    text-align: center;
    width: 100%;
    height: 40%;
    top: 30%;
    font-family: var(--ps-font);
    &:focus { outline: 2px solid var(--ps-blue); border-radius: 4px; }
  }
}

.gauge-label {
  @include ps-caption;
  margin-top: 2px;
  text-align: center;
}
</style>
