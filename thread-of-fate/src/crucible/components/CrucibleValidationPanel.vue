<template>
  <div v-if="issues.length" class="tof-panel">
    <h3 class="tof-h2">Validation</h3>
    <div class="tof-small tof-muted cru-val__counts">
      <span v-if="counts.error" class="tof-warn"
        >{{ counts.error }} error{{ counts.error === 1 ? '' : 's' }}</span
      >
      <span v-if="counts.warning"
        >{{ counts.warning }} warning{{ counts.warning === 1 ? '' : 's' }}</span
      >
      <span v-if="counts.info">{{ counts.info }} note{{ counts.info === 1 ? '' : 's' }}</span>
    </div>
    <div v-for="issue in sorted" :key="issue.id" class="cru-val__row">
      <span class="cru-val__badge" :class="`cru-val__badge--${issue.level}`">{{
        badge(issue.level)
      }}</span>
      <div class="cru-val__text">
        <div>{{ issue.message }}</div>
        <div v-if="issue.suggestion" class="tof-small tof-muted">{{ issue.suggestion }}</div>
      </div>
    </div>
  </div>
  <div v-else class="tof-panel tof-ok">No validation issues - ready to deploy.</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { CrucibleValidationIssue } from '@/crucible/schemas/crucibleCommon';
import { countByLevel } from '@/crucible/engine/validateCrucibleEntity';

const props = defineProps<{ issues: CrucibleValidationIssue[] }>();

const ORDER = { error: 0, warning: 1, info: 2 } as const;
const sorted = computed(() => [...props.issues].sort((a, b) => ORDER[a.level] - ORDER[b.level]));
const counts = computed(() => countByLevel(props.issues));
const badge = (level: string) =>
  level === 'error' ? 'ERROR' : level === 'warning' ? 'WARN' : 'INFO';
</script>

<style scoped lang="scss">
.cru-val__counts {
  display: flex;
  gap: 0.8rem;
  margin-bottom: 0.4rem;
}
.cru-val__row {
  display: flex;
  gap: 0.5rem;
  align-items: flex-start;
  padding: 0.3rem 0;
  border-bottom: 1px dashed var(--tof-panel-border);
  &:last-child {
    border-bottom: none;
  }
}
.cru-val__badge {
  font-size: 0.68rem;
  font-weight: 700;
  border-radius: 4px;
  padding: 0.1rem 0.35rem;
  flex: none;
  margin-top: 0.15rem;
  &--error {
    background: #7a2727;
    color: #ffd9d9;
  }
  &--warning {
    background: #7a5b1c;
    color: #ffedc4;
  }
  &--info {
    background: #29415e;
    color: #d3e5fb;
  }
}
.cru-val__text {
  flex: 1;
}
</style>
