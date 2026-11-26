<script setup>
defineProps({
  survive: { type: Number, default: 0 },
  perish: { type: Number, default: 0 },
})
defineEmits(['set', 'clear', 'roll'])

const POINTS = '50,2 96,26 96,74 50,98 4,74 4,26'
</script>

<template>
  <div class="death">
    <div class="death-title">Death Save <span class="dc">(DC 10)</span></div>

    <div class="rows">
      <div v-for="kind in ['survive', 'perish']" :key="kind" class="row">
        <button
          v-for="n in 3"
          :key="`${kind}${n}`"
          type="button"
          class="hex"
          :class="[kind, { on: n <= (kind === 'survive' ? survive : perish) }]"
          :aria-label="`${kind} ${n}`"
          :aria-pressed="n <= (kind === 'survive' ? survive : perish)"
          @click="$emit('set', kind, n)"
        >
          <svg viewBox="0 0 100 100" aria-hidden="true">
            <polygon :points="POINTS" />
          </svg>
        </button>
        <span class="tag" :class="`${kind}-tag`">
          {{ kind === 'survive' ? 'Survive' : 'Perish' }}
        </span>
      </div>
    </div>

    <div class="actions">
      <button type="button" class="roll" title="Roll a death saving throw" @click="$emit('roll')">
        Roll
      </button>
      <button type="button" class="clear" @click="$emit('clear')">Clear</button>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/tokens.scss' as *;

.death {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  flex: 0 0 auto;
}

.death-title {
  @include ps-caption;
  text-align: center;
  line-height: 1.2;
  .dc { display: block; font-weight: 400; text-transform: none; }
}

.actions { display: flex; align-items: center; gap: 3px; margin-top: 2px; }

.roll,
.clear {
  height: 16px;
  display: inline-flex;
  align-items: center;
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  line-height: 1;
  border-radius: var(--ps-radius-sm);
  cursor: pointer;
}

.roll {
  font-weight: 700;
  background: var(--ps-fill);
  color: var(--ps-on-fill);
  border: 1px solid var(--ps-line);
  padding: 0 8px;

  &:hover { background: var(--ps-fill); }
}

.rows { display: flex; flex-direction: column; gap: 3px; flex: 0 0 auto; }
.row { display: flex; align-items: center; gap: 2px; }

.hex {
  flex: 0 0 auto;
  width: 19px;
  height: 20px;
  padding: 0;
  border: none;
  background: none;
  cursor: pointer;
  line-height: 0;

  svg { width: 100%; height: 100%; display: block; }

  polygon {
    fill: var(--ps-field);
    stroke: var(--ps-line);
    stroke-width: 7;
  }

  &.survive.on polygon { fill: var(--ps-green); stroke: var(--ps-green); }
  &.perish.on polygon  { fill: var(--ps-red);   stroke: var(--ps-red); }

  &:hover polygon { stroke: var(--ps-gold-dark); }
}

.tag {
  font-size: 10px;
  font-weight: 700;
  text-decoration: underline;
  margin-left: 2px;
  &.survive-tag { color: var(--ps-green); }
  &.perish-tag { color: var(--ps-red); }
}

.clear {
  background: none;
  border: 1px solid var(--ps-line-soft);
  color: var(--ps-heading);
  padding: 0 6px;
  &:hover { background: var(--ps-panel-alt); }
}
</style>
