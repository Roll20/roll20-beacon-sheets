<template>
  <details class="tof-panel cru-trace">
    <summary class="tof-small">
      Where every number came from ({{ traces.length }} traced fields)
    </summary>
    <table class="cru-trace__table tof-small">
      <thead>
        <tr>
          <th>Field</th>
          <th>Origin</th>
          <th>Derivation</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="t in traces" :key="t.fieldPath">
          <td>
            <code>{{ t.fieldPath }}</code>
          </td>
          <td>
            <span class="tof-tag">{{ originLabel(t.origin) }}</span>
          </td>
          <td class="tof-muted">{{ t.detail ?? '-' }}</td>
        </tr>
      </tbody>
    </table>
  </details>
</template>

<script setup lang="ts">
import type { FieldTrace, FieldOrigin } from '@/crucible/schemas/crucibleCommon';

defineProps<{ traces: FieldTrace[] }>();

const LABELS: Record<FieldOrigin, string> = {
  userProvided: 'You',
  rulesCalculated: 'Rules',
  registryDefault: 'Registry',
  templateApplied: 'Template',
  inferred: 'Inferred',
  manualOverride: 'Override',
};
const originLabel = (o: FieldOrigin) => LABELS[o] ?? o;
</script>

<style scoped lang="scss">
.cru-trace__table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 0.4rem;
  th,
  td {
    text-align: left;
    padding: 0.2rem 0.5rem 0.2rem 0;
    border-bottom: 1px dashed var(--tof-panel-border);
    vertical-align: top;
  }
}
</style>
