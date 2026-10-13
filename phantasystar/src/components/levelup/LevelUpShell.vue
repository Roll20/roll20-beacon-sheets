<script setup>
import { ref, watch } from 'vue'
import { useLevelUp } from '@/composables/useLevelUp.js'
import StepFlag from '@/components/builder/StepFlag.vue'
import LevelsStep from './LevelsStep.vue'
import ImprovementsStep from './ImprovementsStep.vue'
import LevelUpSkillsStep from './LevelUpSkillsStep.vue'
import LevelUpTechniquesStep from './LevelUpTechniquesStep.vue'
import LevelUpReview from './LevelUpReview.vue'

const {
  store, ctx, loaded, steps, index, current, isDone, applying, started,
  go, next, previous, review, apply, save, discard, startOver,
} = useLevelUp()

const BODIES = {
  levels: LevelsStep,
  abilities: ImprovementsStep,
  skills: LevelUpSkillsStep,
  techniques: LevelUpTechniquesStep,
}

const GUIDES = {
  levels: 'Choose the level you are increasing to and determine your HP increase. New features and options are shown below for each level.',
  abilities: 'For each Ability Improvement feature, add 1 to an ability (to a maximum of 5), or take a feat instead.',
  skills: 'Apply the skill ranks and proficiencies granted by your level increase.',
  techniques: 'Choose any techniques learned from or granted by your new level.',
}

const asking = ref(false)
const exit = () => {
  if (started.value) asking.value = true
  else discard()
}
const answer = (choice) => {
  asking.value = false
  if (choice === 'save') save()
  else if (choice === 'discard') discard()
}

watch(() => [store.step, store.reviewing], () => window.scrollTo?.(0, 0))
</script>

<template>
  <div class="builder">
    <header class="builder__bar">
      <h1 class="builder__title">
        <template v-if="store.reviewing">Review Level Up</template>
        <template v-else-if="current">{{ current.title }}</template>
        <template v-else>Level Up</template>
        <StepFlag v-if="!store.reviewing && current" :done="isDone(current)" :mark="index + 1" />
      </h1>
      <div class="builder__actions">
        <button v-if="!store.reviewing && current" type="button" class="link" @click="review">Review Level Up</button>
        <button type="button" class="link" @click="exit">Exit ✕</button>
      </div>
    </header>

    <main class="builder__body">
      <p v-if="!loaded" class="builder__guide">Loading…</p>
      <p v-else-if="!ctx.profession" class="builder__guide">
        This game's compendium has no page for this character's profession, so Level Up has nothing to work from.
      </p>
      <template v-else>
        <p v-if="store.resumed" class="resumed">
          Saved progress restored.
          <button type="button" class="link" @click="startOver">Start Over</button>
        </p>
      </template>
      <LevelUpReview v-if="loaded && ctx.profession && store.reviewing" />
      <template v-else-if="loaded && ctx.profession && current">
        <p class="builder__guide">{{ GUIDES[current.id] }}</p>
        <component :is="BODIES[current.id]" />
      </template>
    </main>

    <footer v-if="loaded && ctx.profession" class="stepper">
      <button type="button" class="stepper__nav" :disabled="!store.reviewing && index === 0" @click="previous">
        ← Previous
      </button>

      <div class="stepper__track">
        <ol class="stepper__chips">
          <li v-for="(step, i) in steps" :key="step.id">
            <button
              type="button"
              class="chip"
              :class="{
                'chip--current': !store.reviewing && i === index,
                'chip--done': isDone(step),
              }"
              :title="step.label"
              @click="go(i)"
            >
              <template v-if="!store.reviewing && i === index">{{ step.label }}</template>
              <template v-else>{{ isDone(step) ? '✓' : i + 1 }}</template>
            </button>
          </li>
        </ol>
        <small class="stepper__caption">
          <template v-if="store.reviewing">Review</template>
          <template v-else-if="current">Step {{ index + 1 }} of {{ steps.length }}: {{ current.label }}</template>
        </small>
      </div>

      <button v-if="store.reviewing" type="button" class="stepper__build" :disabled="applying" @click="apply">
        {{ applying ? 'Levelling Up…' : 'Level Up' }}
      </button>
      <button v-else type="button" class="stepper__nav" @click="next">
        {{ index === steps.length - 1 ? 'Review →' : 'Next →' }}
      </button>
    </footer>

    <div v-if="asking" class="scrim" @click.self="answer('cancel')">
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="level-up-save">
        <h2 id="level-up-save" class="modal__title">Save Level Up Progress?</h2>
        <p class="modal__text">Your choices are kept on the character for the next time you open Level Up. Nothing changes on the sheet until you level up.</p>
        <div class="modal__actions">
          <button type="button" class="modal__cancel" @click="answer('cancel')">Cancel</button>
          <button type="button" class="modal__discard" @click="answer('discard')">Discard</button>
          <button type="button" class="modal__save" @click="answer('save')">Save</button>
        </div>
      </div>
    </div>
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
.resumed {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 10px;
  font-size: 12px;
  color: var(--ps-text-muted);
}

.scrim {
  @include ps-scrim;
}

.modal {
  @include ps-modal;
  max-width: 420px;
  padding: 16px 18px;

  &__title { @include ps-heading(17px); margin: 0 0 8px; }
  &__text { margin: 0 0 14px; font-size: 12px; line-height: 1.5; color: var(--ps-text); }
  &__actions { display: flex; justify-content: flex-end; gap: 8px; }

  &__cancel, &__discard {
    @include ps-button(var(--ps-panel), var(--ps-panel-alt));
    color: var(--ps-heading);
    padding: 5px 14px;
  }

  &__discard { color: var(--ps-red); }

  &__save {
    @include ps-button;
    padding: 5px 18px;
  }
}
</style>
