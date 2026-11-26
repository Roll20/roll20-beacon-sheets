<template>
  <div class="cru-statblock tof-panel">
    <div class="cru-statblock__head">
      <h3 class="cru-statblock__name">{{ entity.identity.name || 'Unnamed' }}</h3>
      <div class="tof-small tof-muted">{{ subtitle }}</div>
    </div>

    <template v-for="section in sections" :key="section.heading">
      <div v-if="showSection(section)" class="cru-statblock__section">
        <h4 v-if="section.heading !== 'Header'" class="cru-statblock__heading">
          {{ section.heading }}
          <span v-if="section.gmOnly" class="tof-tag" title="Hidden from players">GM</span>
        </h4>
        <p v-for="(line, i) in section.lines" :key="`l-${i}`" class="cru-statblock__line">
          {{ line }}
        </p>
        <div
          v-for="entry in visibleEntries(section)"
          :key="entry.name"
          class="cru-statblock__entry"
        >
          <strong>{{ entry.name }}.</strong>
          <span v-if="entry.gmOnly" class="tof-tag" title="Hidden from players">GM</span>
          <span class="cru-statblock__body">{{ entry.body }}</span>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { CrucibleEntitySchema } from '@/crucible/schemas/crucibleEntity.schema';
import {
  statblockSections,
  subtitleLine,
  type StatblockSection,
} from '@/crucible/engine/formatStatblock';

const props = defineProps<{
  entity: CrucibleEntitySchema;
  /** Hide GM-only content (player preview mode). */
  playerSafe?: boolean;
}>();

const sections = computed(() => statblockSections(props.entity));
const subtitle = computed(() => subtitleLine(props.entity));

const showSection = (section: StatblockSection) => !(props.playerSafe && section.gmOnly);
const visibleEntries = (section: StatblockSection) =>
  (section.entries ?? []).filter((e) => !(props.playerSafe && e.gmOnly));
</script>

<style scoped lang="scss">
.cru-statblock {
  font-size: 0.92rem;
  line-height: 1.45;
}
.cru-statblock__name {
  font-family: var(--tof-font-heading);
  color: var(--tof-gold);
  margin: 0;
  font-size: 1.4rem;
}
.cru-statblock__head {
  border-bottom: 1px solid var(--tof-panel-border-strong);
  padding-bottom: 0.4rem;
  margin-bottom: 0.6rem;
}
.cru-statblock__heading {
  font-family: var(--tof-font-heading);
  color: var(--tof-cream);
  border-bottom: 1px solid var(--tof-panel-border);
  margin: 0.8rem 0 0.35rem;
  font-size: 1.02rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}
.cru-statblock__line {
  margin: 0.15rem 0;
  white-space: pre-wrap;
}
.cru-statblock__entry {
  margin: 0.35rem 0;
}
.cru-statblock__body {
  white-space: pre-wrap;
  margin-left: 0.3rem;
}
</style>
