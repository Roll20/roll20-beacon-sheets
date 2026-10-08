<template>
  <div v-if="assumptions.length" class="tof-panel cru-assume">
    <h3 class="tof-h2">Assumptions Made</h3>
    <p class="tof-small tof-muted">
      Everything The Crucible guessed is listed here. Accept it, edit the field, or reroll.
    </p>
    <div
      v-for="a in assumptions"
      :key="a.id"
      class="cru-assume__row"
      :class="{ accepted: a.accepted }"
    >
      <span
        class="cru-assume__dot"
        :class="`cru-assume__dot--${a.confidence}`"
        :title="`${a.confidence} confidence`"
      />
      <div class="cru-assume__text">
        <div>
          <code class="tof-small">{{ a.fieldPath }}</code>
          <strong> = {{ shortValue(a.assumedValue) }}</strong>
        </div>
        <div class="tof-small tof-muted">{{ a.reason }}</div>
      </div>
      <div class="cru-assume__actions">
        <button
          v-if="!a.accepted"
          class="tof-btn tof-btn--ghost tof-small"
          title="Mark as reviewed and keep"
          @click="$emit('accept', a.id)"
        >
          Keep
        </button>
        <button
          class="tof-btn tof-btn--ghost tof-small"
          title="Remove this note (the value stays until you edit it)"
          @click="$emit('dismiss', a.id)"
        >
          Dismiss
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CrucibleAssumption } from '@/crucible/schemas/crucibleCommon';

defineProps<{ assumptions: CrucibleAssumption[] }>();
defineEmits<{ (e: 'accept', id: string): void; (e: 'dismiss', id: string): void }>();

function shortValue(value: unknown): string {
  if (value == null) return '-';
  if (typeof value === 'object') {
    const s = JSON.stringify(value);
    return s.length > 60 ? `${s.slice(0, 57)}...` : s;
  }
  return String(value);
}
</script>

<style scoped lang="scss">
.cru-assume__row {
  display: flex;
  align-items: flex-start;
  gap: 0.55rem;
  padding: 0.4rem 0;
  border-bottom: 1px dashed var(--tof-panel-border);
  &:last-child {
    border-bottom: none;
  }
  &.accepted {
    opacity: 0.55;
  }
}
.cru-assume__dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-top: 0.35rem;
  flex: none;
  &--low {
    background: #d66;
  }
  &--medium {
    background: var(--tof-gold);
  }
  &--high {
    background: #7c6;
  }
}
.cru-assume__text {
  flex: 1;
}
.cru-assume__actions {
  display: flex;
  gap: 0.3rem;
  flex: none;
}
</style>
