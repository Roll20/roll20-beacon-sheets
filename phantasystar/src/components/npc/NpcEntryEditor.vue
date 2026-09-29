<script setup>
import { computed } from 'vue'
import { useNpcStore } from '@/stores/npcStore.js'
import { allCreatureTechniques } from '@/rules/index.js'
import ConfirmDelete from '@/components/shared/ConfirmDelete.vue'

const props = defineProps({
  id: { type: String, required: true },
  kind: { type: String, required: true },
  withCost: { type: Boolean, default: false },
})

const npc = useNpcStore()

const entry = computed(() => npc.entriesFor(props.kind).find((e) => e._id === props.id) ?? null)

const techniqueOptions = computed(() =>
  npc.techniques.enabled ? allCreatureTechniques(npc.techniques).filter((t) => t.id) : [],
)
</script>

<template>
  <div v-if="entry" class="entry">
    <div class="entry__top">
      <input v-model="entry.name" class="entry__name" placeholder="Name" />
      <label v-if="withCost" class="cost">
        <small>Cost</small>
        <input v-model.number="entry.cost" type="number" min="1" />
      </label>
      <label class="prof" title="This is an attack - show a to-hit roll">
        <input v-model="entry.isAttack" type="checkbox" />
        <small>Attack</small>
      </label>
      <ConfirmDelete class="del" title="Remove" @confirm="npc.removeEntry(kind, entry._id)" />
    </div>

    <div v-if="entry.isAttack" class="entry__attack">
      <label><span>To hit</span><input v-model.number="entry.attackPower" type="number" /></label>
      <label><span>Range</span><input v-model="entry.range" /></label>
    </div>

    <div v-if="entry.isAttack || entry.damage" class="entry__attack">
      <label><span>Damage</span><input v-model="entry.damage" /></label>
      <label><span>Type</span><input v-model="entry.damageType" /></label>
    </div>

    <label v-if="techniqueOptions.length" class="entry__tech">
      <span>Casts</span>
      <select v-model="entry.technique">
        <option value="">&mdash;</option>
        <option v-for="t in techniqueOptions" :key="t._id" :value="t.id">{{ t.name || t.id }}</option>
      </select>
    </label>

    <textarea v-model="entry.text" rows="2" />
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/tokens.scss' as *;

label {
  display: flex;
  flex-direction: column;
  min-width: 0;

  > span { @include ps-caption; font-size: 9px; margin-bottom: 1px; }
}

input:not([type='checkbox']), select, textarea {
  @include ps-well;
  width: 100%;
  min-width: 0;
  height: 24px;
  font-size: 12px;
  text-align: left;
  padding: 0 5px;

  &:focus { outline: 2px solid var(--ps-blue); outline-offset: -1px; }
}

input[type='checkbox'] { @include ps-pip-check; }

textarea {
  height: auto;
  padding: 4px 5px;
  line-height: 1.45;
  resize: vertical;
}

input[type='number'] { text-align: center; }

.entry {
  padding: 6px 0;
  border-bottom: 1px solid rgba(var(--ps-line-soft-rgb), 0.2);

  &:last-child { border-bottom: none; }

  &__top {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
  }

  &__name { flex: 1; font-weight: 700; }

  &__attack {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 5px;
    margin-bottom: 4px;
  }

  &__tech { margin-bottom: 4px; max-width: 50%; }
}

.cost {
  flex-direction: row;
  align-items: center;
  gap: 4px;

  small { @include ps-caption; font-size: 9px; }
  input { width: 44px; }
}

.prof {
  flex-direction: row;
  align-items: center;
  gap: 3px;
  cursor: pointer;

  small { font-size: 10px; color: var(--ps-text-muted); }
}

.del {
  border: none;
  background: none;
  color: var(--ps-text-muted);
  font-size: 15px;
  line-height: 1;
  cursor: pointer;

  &:hover { color: var(--ps-red); }
}
</style>
