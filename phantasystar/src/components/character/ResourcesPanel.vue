<script setup>
import { computed } from 'vue'
import { useCharacterStore } from '@/stores/characterStore.js'
import { featureReached, recoveryLabel, resourceLeft, showsAsNumber } from '@/rules/index.js'
import SheetPanel from '@/components/shared/SheetPanel.vue'
import UsePips from '@/components/shared/UsePips.vue'
import { useSheetRolls } from '@/composables/useSheetRolls.js'

const sheet = useCharacterStore()
const rolls = useSheetRolls()

const rows = computed(() =>
  sheet.resources
    .map((r) => ({ r, feature: sheet.features.find((f) => f._id === r.feature) }))
    .filter(({ feature }) => feature && featureReached(feature, sheet.effectiveLevel))
    .map(({ r, feature }) => {
      const max = sheet.resourceMaxFor(r)
      return {
        id: r._id,
        name: r.name || feature.name || 'Unnamed',
        max,
        used: Math.min(max, r.used),
        left: resourceLeft(r, max),
        number: showsAsNumber(r, max),
        unit: r.unit,
        recovery: recoveryLabel(r.recovery),
        armed: !!feature.riderOn,
      }
    }),
)

const setLeft = (row, value) => sheet.setResourceUsed(row.id, row.max - (Number(value) || 0))
</script>

<template>
  <SheetPanel v-if="rows.length" title="Resources">
    <div class="wrap">
      <div class="grid">
        <div v-for="row in rows" :key="row.id" class="row">
          <span class="name" :title="row.name">{{ row.name }}</span>
          <span class="count">
            <template v-if="row.number">
              <input
                class="left"
                type="number"
                min="0"
                :max="row.max"
                :value="row.left"
                :aria-label="`${row.name} remaining`"
                @change="setLeft(row, $event.target.value)"
              />
              <span class="of">/ {{ row.max }}{{ row.unit ? ` ${row.unit}` : '' }}</span>
            </template>
            <UsePips
              v-else-if="row.max"
              :total="row.max"
              :used="row.used"
              :label="row.name"
              @set="sheet.setResourceUsed(row.id, $event)"
            />
            <span v-else class="of">&mdash;</span>
          </span>
          <button
            v-if="!row.number"
            type="button"
            class="use"
            :class="{ armed: row.armed }"
            :disabled="!row.left || row.armed"
            @click="rolls.useResource(row.id)"
          >
            Use
          </button>
          <span v-else />
          <span class="recovery">{{ row.recovery }}</span>
        </div>
      </div>
    </div>
  </SheetPanel>
</template>

<style scoped lang="scss">
@use '@/styles/tokens.scss' as *;

.wrap { container-type: inline-size; }

.grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 2px 14px;
}

@container (min-width: 420px) {
  .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

.row {
  @include ps-list-row;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto 40px;
  gap: 8px;
  align-items: center;
  min-height: 22px;
}

.name {
  font-size: var(--ps-fs-body);
  font-weight: 700;
  color: var(--ps-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.count { display: inline-flex; align-items: center; gap: 4px; }

.left {
  @include ps-control(20px);
  width: 40px;
  text-align: center;
}

.of { font-size: 11px; color: var(--ps-text-muted); white-space: nowrap; }

.use {
  @include ps-caption;
  font-size: 9px;
  background: var(--ps-field);
  border: var(--ps-border-thin);
  border-radius: var(--ps-radius-sm);
  padding: 1px 5px;
  cursor: pointer;
  color: var(--ps-chip-idle, var(--ps-heading));

  &:hover:not(:disabled) {
    background: var(--ps-green);
    border-color: var(--ps-green);
    color: var(--ps-on-green-fill, var(--ps-on-fill));
  }
  &:disabled { opacity: 0.4; cursor: not-allowed; }
  &.armed { opacity: 1; background: var(--ps-blue); border-color: var(--ps-blue); color: var(--ps-on-fill); }
}

.recovery {
  @include ps-caption;
  font-size: 9px;
  text-align: right;
}
</style>
