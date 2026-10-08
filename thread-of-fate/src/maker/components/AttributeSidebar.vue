<template>
  <aside class="tof-panel attrbar">
    <div class="tof-h3" style="margin-top: 0">Attributes</div>
    <div v-for="attr in ATTRIBUTES" :key="attr.key" class="attr" :title="attr.description">
      <span class="attr__label">{{ attr.label }}</span>
      <span class="attr__score">{{ score(attr.key) }}</span>
      <span class="attr__mod">{{ formatModifier(store.modifiers[attr.key]) }}</span>
    </div>

    <hr class="attr__hr" />
    <div class="attr attr__derived">
      <span class="attr__label">Health</span>
      <span class="attr__score">{{ store.derived.health }}</span>
    </div>
    <div class="attr attr__derived">
      <span class="attr__label">Stamina</span>
      <span class="attr__score">{{ store.derived.stamina }}</span>
    </div>
    <div class="attr attr__derived">
      <span class="attr__label">Armor Class</span>
      <span class="attr__score">{{ store.derived.armorClass }}</span>
    </div>
    <div class="attr attr__derived">
      <span class="attr__label">Prof. Bonus</span>
      <span class="attr__score">+{{ store.derived.proficiencyBonus }}</span>
    </div>
    <div class="attr attr__derived">
      <span class="attr__label">Level</span>
      <span class="attr__score">{{ store.derived.level }}</span>
    </div>

    <hr class="attr__hr" />
    <div
      class="tof-small"
      style="
        color: var(--tof-accent-blue);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-bottom: 0.3rem;
      "
    >
      Saving Throws
    </div>
    <div
      class="attr attr__save"
      v-for="sv in saveRows"
      :key="sv.label"
      :title="sv.prof ? 'Proficient' : ''"
    >
      <span class="attr__label"
        >{{ sv.label }}<span v-if="sv.prof" class="attr__prof">*</span></span
      >
      <span class="attr__mod">{{ fmt(sv.value) }}</span>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useDraftStore } from '@/maker/store/draftStore';
import { ATTRIBUTES } from '@/maker/data/attributes';
import { formatModifier } from '@/maker/rules/stats';
import type { AttributeKey } from '@/maker/types';

const store = useDraftStore();
const score = (k: AttributeKey) => store.finalScores[k] || 0;
const fmt = formatModifier;
const saveRows = computed(() => {
  const d = store.derived;
  return [
    { label: 'Body', value: d.saves.body, prof: d.saveProficiencies.includes('Body') },
    { label: 'Mind', value: d.saves.mind, prof: d.saveProficiencies.includes('Mind') },
    { label: 'Soul', value: d.saves.soul, prof: d.saveProficiencies.includes('Soul') },
    { label: 'Concentration', value: d.saves.concentration, prof: false },
  ];
});
</script>

<style scoped lang="scss">
.attrbar {
  margin-top: 1rem;
}
.attr {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 0.5rem;
  align-items: baseline;
  padding: 0.25rem 0;
}
.attr__label {
  font-family: var(--tof-font-subheading);
  font-size: 0.9rem;
}
.attr__score {
  font-weight: 700;
  color: var(--tof-gold);
  font-size: 1.05rem;
  min-width: 1.5rem;
  text-align: right;
}
.attr__mod {
  color: var(--tof-accent-blue);
  min-width: 2rem;
  text-align: right;
  font-variant-numeric: tabular-nums;
}
.attr__hr {
  border: none;
  border-top: 1px solid rgba(255, 255, 255, 0.15);
  margin: 0.6rem 0;
}
.attr__derived .attr__score {
  color: var(--tof-cream);
}
.attr__save {
  grid-template-columns: 1fr auto;
}
.attr__prof {
  color: var(--tof-gold);
  font-size: 0.7rem;
  margin-left: 0.3rem;
  vertical-align: middle;
}
</style>
