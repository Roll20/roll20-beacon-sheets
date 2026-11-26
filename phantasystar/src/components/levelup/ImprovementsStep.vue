<script setup>
import { computed } from 'vue'
import { useLevelUp } from '@/composables/useLevelUp.js'
import { improvementSlots, improvementBlocks, improvementDone, abilitiesAfter, levelUpFeats } from '@/builder/levelUp.js'
import { featOptionDone } from '@/builder/featChoices.js'
import { IMPROVED_CAP } from '@/builder/abilities.js'
import { ABILITIES, formatModifier } from '@/rules/index.js'
import StepFlag from '@/components/builder/StepFlag.vue'
import FeatPicker from '@/components/builder/FeatPicker.vue'

const { store, ctx, paths, feats } = useLevelUp()
const lu = computed(() => store.lu)

const slots = computed(() => improvementSlots(ctx.value, lu.value, paths.value))
const after = computed(() => abilitiesAfter(ctx.value, lu.value, paths.value))
const blocks = computed(() => improvementBlocks(ctx.value, lu.value, paths.value))
const taken = computed(() => levelUpFeats(ctx.value, lu.value, paths.value))
const takenAt = (slot) => taken.value.find((f) => f.slotKey === slot.key) ?? null

const slotDone = (slot) => improvementDone(lu.value.improvements[slot.key], blocks.value[slot.key], slot)
  && (choiceOf(slot).kind !== 'feat' || featOptionDone(takenAt(slot)?.choices.option, choiceOf(slot).pick))

const choiceOf = (slot) => lu.value.improvements[slot.key] ?? { kind: 'ability', ability: '' }

const set = (slot, patch) => {
  lu.value.improvements = { ...lu.value.improvements, [slot.key]: { ...choiceOf(slot), ...patch } }
}

const canRaise = (slot, id) => choiceOf(slot).ability === id || after.value[id] < IMPROVED_CAP

const abilitiesFor = (slot) => (slot.from ? ABILITIES.filter((a) => slot.from.includes(a.id)) : ABILITIES)
</script>

<template>
  <div class="slots">
    <article v-for="slot in slots" :key="slot.key" class="slot">
      <header class="slot__head">
        <StepFlag :done="slotDone(slot)" :mark="slot.level" />
        <span class="slot__label">Level {{ slot.level }}: {{ slot.name }}</span>
        <div v-if="slot.feat && feats.length" class="slot__kinds">
          <button
            type="button"
            class="tab"
            :class="{ 'tab--on': choiceOf(slot).kind === 'ability' }"
            :aria-pressed="choiceOf(slot).kind === 'ability'"
            @click="set(slot, { kind: 'ability' })"
          >Ability +{{ slot.points }}</button>
          <button
            type="button"
            class="tab"
            :class="{ 'tab--on': choiceOf(slot).kind === 'feat' }"
            :aria-pressed="choiceOf(slot).kind === 'feat'"
            @click="set(slot, { kind: 'feat' })"
          >Feat</button>
        </div>
      </header>

      <div v-if="choiceOf(slot).kind === 'ability'" class="abilities">
        <button
          v-for="a in abilitiesFor(slot)"
          :key="a.id"
          type="button"
          class="ability"
          :class="{ 'ability--on': choiceOf(slot).ability === a.id }"
          :aria-pressed="choiceOf(slot).ability === a.id"
          :disabled="!canRaise(slot, a.id)"
          :title="canRaise(slot, a.id) ? undefined : `${a.name} is at ${IMPROVED_CAP}`"
          @click="set(slot, { ability: choiceOf(slot).ability === a.id ? '' : a.id })"
        >
          <span class="ability__name">{{ a.id.slice(0, 3).toUpperCase() }}</span>
          <span class="ability__value">{{ formatModifier(Number(ctx.abilities[a.id]) || 0) }}</span>
        </button>
      </div>

      <FeatPicker
        v-else
        :feats="feats"
        :value="choiceOf(slot).feat ?? ''"
        :blocked="blocks[slot.key] ?? {}"
        :option="takenAt(slot)?.choices.option ?? null"
        :pick="choiceOf(slot).pick ?? ''"
        @change="set(slot, { feat: $event, pick: '' })"
        @pick="set(slot, { pick: $event })"
      />
    </article>

    <p class="after">
      <span v-for="a in ABILITIES" :key="a.id" :class="{ changed: after[a.id] !== (Number(ctx.abilities[a.id]) || 0) }">
        {{ a.id.slice(0, 3).toUpperCase() }} {{ formatModifier(after[a.id]) }}
      </span>
    </p>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/tokens.scss' as *;

.slot {
  padding: 8px 0 12px;
  border-bottom: 1px solid rgba(var(--ps-line-soft-rgb), 0.3);
}

.slot__head { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; flex-wrap: wrap; }
.slot__label { font-weight: 700; color: var(--ps-heading); font-size: 13px; }
.slot__kinds { display: flex; gap: 4px; margin-left: auto; }

.tab {
  @include ps-heading(11px);
  padding: 3px 10px;
  border: var(--ps-border);
  border-radius: var(--ps-radius-sm);
  background: var(--ps-panel);
  color: var(--ps-heading);
  cursor: pointer;

  &--on { background: var(--ps-fill); color: var(--ps-on-fill); }
}

.abilities {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 72px));
  gap: 6px;
}

.ability {
  @include ps-well;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4px 2px;
  cursor: pointer;
  font-family: inherit;

  &__name { @include ps-caption; font-size: 10px; }
  &__value { font-size: 15px; font-weight: 700; color: var(--ps-text); }

  &--on { background: var(--ps-blue); border-color: var(--ps-blue); }
  &--on .ability__name, &--on .ability__value { color: var(--ps-on-fill); }
  &:disabled { opacity: 0.4; cursor: default; }
}

.after {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 14px;
  margin: 12px 0 0;
  font-size: 12px;
  color: var(--ps-text-muted);

  .changed { font-weight: 800; color: var(--ps-blue); }
}

@media (max-width: 560px) {
  .abilities { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
</style>
