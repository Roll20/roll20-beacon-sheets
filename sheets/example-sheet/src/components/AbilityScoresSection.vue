<template>
  <div class="section ability-scores">
    <div class="section__header">Stats</div>
    <div class="section__body">
      <div class="ability-scores__row">
        <div class="ability-scores__header">Ability Score</div>
        <div class="ability-scores__header">Base</div>
        <div class="ability-scores__header">Current</div>
      </div>
      <div v-for="score in abilityScoresArray" :key="score.label" class="ability-scores__row">
        <div class="ability-scores__label">{{ score.label}}</div>
        <div class="ability-scores__base incrementer">
          <input type="number" :value="score.base" @change="(evt) =>  updateScore(score.label, evt.target.value, 'base')"  min="0" max="9" />
        </div>
        <div class="ability-scores__current incrementer">
          <input type="number" :value="score.base" @change="(evt) =>  updateScore(score.label, evt.target.value, 'current')" />
        </div>
        <div><button class="action-btn" @click="rollAbilityCheck(score.label, false)">Roll</button></div>
        <div><button class="action-btn" @click="rollAbilityCheck(score.label, true)">Roll with Prof.</button></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAbilityScoreStore } from '@/sheet/stores/abilityScores/abilityScoresStore'

const { abilityScores, rollAbilityCheck } = useAbilityScoreStore();
const abilityScoresArray = ref(Object.entries(abilityScores).map(([label, abilityScore]) => ({...abilityScore, label })))

// Since we are not binding directly to the Stores values for base/current,
// we create a new abilityScores object with the updated scores and give it to the computed Setter.
const updateScore = (label, value, type) => {
  const convertedArray = Object.fromEntries(abilityScoresArray.value.map(score => [score.label, { base: Number(score.base), current: Number(score.current)  }]))
  convertedArray[label][type] = Number(value);
  useAbilityScoreStore().abilityScores = convertedArray;
}

</script>

<style scoped lang="scss">
.ability-scores {
  &__header {
    font-weight: 600;
  }
  &__label {
  }
  &__row {
    display: grid;
    grid-template-columns: 1fr 0.5fr 0.5fr 0.5fr 1fr;

    input {
      width: 3rem;
      text-align: center;
    }
  }
}
.incrementer :deep(.poly-incrementer__input) {
  max-width: 2rem;
}

</style>