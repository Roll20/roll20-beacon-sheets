<script setup>
import { watch } from 'vue'
import { useBuilder } from '@/composables/useBuilder.js'
import { useStepMarks } from '@/composables/useBuilderPages.js'
import ReviewSummary from './ReviewSummary.vue'
import ConceptStep from './steps/ConceptStep.vue'
import StoryStep from './steps/StoryStep.vue'
import PendingStep from './steps/PendingStep.vue'
import OptionStep from './steps/OptionStep.vue'
import AbilitiesStep from './steps/AbilitiesStep.vue'
import SkillsStep from './steps/SkillsStep.vue'
import TechniquesStep from './steps/TechniquesStep.vue'
import EquipmentStep from './steps/EquipmentStep.vue'
import StepFlag from './StepFlag.vue'

const {
  builder, steps, index, current, isDone, building,
  go, next, previous, review, build,
} = useBuilder()

useStepMarks()

const BODIES = {
  concept: ConceptStep,
  abilities: AbilitiesStep,
  skills: SkillsStep,
  techniques: TechniquesStep,
  equipment: EquipmentStep,
  story: StoryStep,
}
const bodyFor = (step) => BODIES[step.id] ?? (step.category ? OptionStep : PendingStep)

const exit = () => builder.close()

watch(() => [builder.step, builder.reviewing], () => window.scrollTo?.(0, 0))
</script>

<template>
  <div class="builder">
    <header class="builder__bar">
      <h1 class="builder__title">
        <template v-if="builder.reviewing">Review</template>
        <template v-else>{{ current.title }}</template>
        <StepFlag v-if="!builder.reviewing" :done="isDone(current)" :mark="index + 1" />
      </h1>
      <div class="builder__actions">
        <button v-if="!builder.reviewing" type="button" class="link" @click="review">Review Character</button>
        <button type="button" class="link" @click="exit">Exit ✕</button>
      </div>
    </header>

    <main class="builder__body">
      <ReviewSummary v-if="builder.reviewing" />

      <template v-else>
        <p class="builder__guide">{{ current.guide }}</p>
        <component :is="bodyFor(current)" :step="current" />
      </template>
    </main>

    <footer class="stepper">
      <button type="button" class="stepper__nav" :disabled="!builder.reviewing && index === 0" @click="previous">
        ← Previous
      </button>

      <div class="stepper__track">
        <ol class="stepper__chips">
          <li v-for="(step, i) in steps" :key="step.id">
            <button
              type="button"
              class="chip"
              :class="{
                'chip--current': !builder.reviewing && i === index,
                'chip--done': isDone(step),
              }"
              :title="step.label"
              @click="go(i)"
            >
              <template v-if="!builder.reviewing && i === index">{{ step.label }}</template>
              <template v-else>{{ isDone(step) ? '✓' : i + 1 }}</template>
            </button>
          </li>
        </ol>
        <small class="stepper__caption">
          <template v-if="builder.reviewing">Review</template>
          <template v-else>Step {{ index + 1 }} of {{ steps.length }}: {{ current.label }}</template>
        </small>
      </div>

      <button v-if="builder.reviewing" type="button" class="stepper__build" :disabled="building" @click="build">
        {{ building ? 'Building…' : 'Build Character' }}
      </button>
      <button v-else type="button" class="stepper__nav" @click="next">
        {{ index === steps.length - 1 ? 'Review →' : 'Next →' }}
      </button>
    </footer>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/tokens.scss' as *;

.builder {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.builder__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--ps-gap);
  padding: 10px 14px 8px;
  border-bottom: 2px solid var(--ps-line);
  background: var(--ps-paper);
}

.builder__title {
  @include ps-heading(19px);
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
}

.builder__actions { display: flex; gap: 14px; flex: 0 0 auto; }

.link { white-space: nowrap; }

.link {
  border: none;
  background: none;
  padding: 0;
  cursor: pointer;
  font-family: inherit;
  font-size: 12px;
  font-weight: 700;
  color: var(--ps-heading);

  &:hover { text-decoration: underline; }
}

.builder__body {
  flex: 1;
  width: 100%;
  max-width: 820px;
  margin: 0 auto;
  padding: 12px 14px 20px;
}

.builder__guide { margin: 0 0 12px; color: var(--ps-text-muted); font-size: 12px; line-height: 1.5; }


.stepper {
  position: sticky;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 8px 10px 10px;
  border-top: 2px solid var(--ps-line);
  background: var(--ps-paper);
}

.stepper__track { display: flex; flex-direction: column; align-items: center; gap: 3px; min-width: 0; }

.stepper__chips {
  display: flex;
  justify-content: center;
  gap: 4px;
  max-width: 100%;
  overflow-x: auto;
  margin: 0;
  padding: 4px 8px;
  list-style: none;
  border: var(--ps-border);
  border-radius: 999px;
}

.chip {
  min-width: 26px;
  height: 22px;
  padding: 0 7px;
  border: none;
  border-radius: 999px;
  cursor: pointer;
  font-family: var(--ps-font);
  font-size: 11px;
  font-weight: 800;
  white-space: nowrap;
  background: var(--ps-blue);
  color: var(--ps-on-fill);

  &--done { background: var(--ps-green); color: var(--ps-on-green-fill, var(--ps-on-fill)); }
  &--current { outline: 2px solid var(--ps-heading); outline-offset: 1px; }
}

.stepper__caption { font-size: 10.5px; color: var(--ps-text-muted); white-space: nowrap; }

.stepper__nav {
  @include ps-button(var(--ps-panel), var(--ps-panel-alt));
  color: var(--ps-heading);
  padding: 5px 14px;
  white-space: nowrap;
  flex: 0 0 auto;

  &:disabled { opacity: 0.45; cursor: default; }
}

.stepper__build {
  @include ps-button;
  padding: 6px 18px;
  white-space: nowrap;
  flex: 0 0 auto;

  &:disabled { opacity: 0.6; cursor: default; }
}
</style>
