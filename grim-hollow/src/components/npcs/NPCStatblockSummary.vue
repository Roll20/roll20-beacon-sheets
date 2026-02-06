<template>
  <!-- The summary statblock mode -->
  <summary class="npc-statblock__summary" @click.prevent>
    <!-- Left column for primary combat stats -->
    <div class="npc-statblock__summary-column">
      <div class="npc-statblock__summary-item">
        <strong>{{ t('titles.hit-points') }}</strong>
        <span v-if="!editMode">
          <CurrentMaxNumber :count="currentHp" :max="maxHp" @update="$emit('update:hp', $event)" />
        </span>
        <div v-else class="npc-statblock__hp-inputs">
          <input type="number" v-model.number="localNpc.hitPoints.current" />
          <span>/</span>
          <input type="number" v-model.number="localNpc.hitPoints.max" min="0" />
        </div>
      </div>
      <div v-if="!editMode" class="npc-statblock__summary-item">
        <strong>{{ t('titles.initiative') }}: </strong>
        <RollModifier :finalBonus="initiativeBonus.value.final" :rollArgs="initiativeRollArgs" />
      </div>
      <div class="npc-statblock__summary-item">
        <strong>{{ t('titles.ac') }}:</strong>
        <span v-if="!editMode">{{ ac }}</span>
        <input v-else type="number" v-model.number="localNpc.armorClass" min="0"/>
      </div>
      <div v-if="!editMode" class="npc-statblock__summary-item">
        <strong>{{ t('titles.speed') }}:</strong>
        <span>{{ speed }}</span>
      </div>
    </div>
    <!-- Right column for a summary of active effects -->
    <div class="npc-statblock__summary-column npc-statblock__summary-column--effects">
      <strong>{{ t('titles.active-effects') }}:</strong>
      <div v-if="activeEffects.length > 0" class="summary-effects">
      <div v-for="effectParent in activeEffects" :key="effectParent._id" class="summary-effects__group">
        <span class="summary-effects__label">{{ effectParent.label }}</span>
        <div class="summary-effects__breakdown">
        <div v-for="effect in effectParent.effects" :key="effect._id" class="summary-effects__single-effect">
          <span class="summary-effects__description">{{ createDescription(effect) }}</span>
        </div>
        </div>
      </div>
      </div>
      <div v-else>{{ t('titles.none') }}</div>
    </div>
  </summary>
</template>

<script setup lang="ts">
import { computed, type PropType } from 'vue';
import { useI18n } from 'vue-i18n';
import { useNpcStore, type Npc } from '@/sheet/stores/npc/npcStore';
import { effectKeys } from '@/effects.config';
import type { SingleEffect, Effect, ModifiedValue } from '@/sheet/stores/modifiers/modifiersStore';
import CurrentMaxNumber from '../shared/CurrentMaxNumber.vue';
import RollModifier from '@/components/shared/RollModifier.vue';
import { type D20RollArgs } from '@/utility/roll';

const props = defineProps({
  npc: { type: Object as PropType<Npc>, required: true },
  localNpc: { type: Object as PropType<Npc>, required: true },
  editMode: { type: Boolean, required: true },
  activeEffects: { type: Array as PropType<Effect[]>, required: true },
  initiativeBonus: { type: Object as PropType<ModifiedValue>, required: true },
  initiativeRollArgs: { type: Object as  PropType<D20RollArgs>, required: true },
});

defineEmits(['update:hp']);

const store = useNpcStore();
const { t } = useI18n();

// Computed Properties for Display
const currentHp = computed(() =>
  store.getNpcModifiedValue(props.npc._id, props.npc.hitPoints.current, [])
    .value.final,
);
const maxHp = computed(() =>
  store.getNpcModifiedValue(props.npc._id, props.npc.hitPoints.max, effectKeys['hit-points-max'])
    .value.final,
);
const ac = computed(() =>
  store.getNpcModifiedValue(props.npc._id, props.npc.armorClass, effectKeys['armor-class']).value
    .final,
);

const speed = computed(() => props.npc.speed ?? '30 ft.');

// Creates a human-readable description string for a single effect.
const createDescription = (effect: SingleEffect): string => {
  const value =
    effect.value !== undefined && effect.value !== ''
      ? typeof effect.value === 'string' && !/^-?\d+(\.\d+)?$/.test(effect.value)
        ? `"${effect.value}"`
        : effect.value
      : effect.formula;
  return `[${effect.operation.toUpperCase()}] ${value} -> "${effect.attribute}"`;
};
</script>

<style lang="scss" scoped>
.npc-statblock__summary {
  display: grid;
  grid-template-columns: minmax(180px, auto) 1fr;
  gap: 1.5rem;
  padding: 0.75rem;
  background: var(--color-background-secondary);
  border-radius: var(--size-border-radius-medium);
  cursor: default;
  list-style: none;

  &::-webkit-details-marker {
    display: none;
  }
}

.npc-statblock__summary-column {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.npc-statblock__summary-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.npc-statblock__hp-inputs {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  input {
    width: 50px;
  }
}

.summary-effects {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.9em;

  &__group {
    display: flex;
    flex-direction: column;
  }
  &__label {
    font-weight: bold;
  }
  &__breakdown {
    padding-left: 1rem;
  }
  &__description {
    color: var(--color-on-background-secondary);
    font-family: monospace;
  }
}
</style>