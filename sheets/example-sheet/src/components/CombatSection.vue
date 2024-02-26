<template>
  <div class="section combat">
    <div class="section__header">Combat</div>
    <div class="section__body combat__body">
      <div class="row combat__life">
        <div>Life</div>
        <label for="life-mod">Mod<input type="number" id="life-mod" step="1" v-model="character.lifeMod"/></label>
        <label for="life-max">Max<input type="number" min="0" step="1" disabled id="life-max" v-model="character.lifeMax"/></label>
        <label for="life-mod">Current<input type="number" min="0" step="1" id="life-mod" v-model="character.lifeCurrent"/></label>
        <button @click="character.rollHeroDiceLife" class="action-btn">Hero Die</button>
      </div>
      <div class="row combat__mana">
        <div>Mana</div>
        <label for="mana-mod">Mod<input type="number" id="mana-mod" step="1" v-model="character.manaMod"/></label>
        <label for="mana-max">Max<input type="number" min="0" step="1" disabled id="mana-max" v-model="character.manaMax"/></label>
        <label for="mana-mod">Current<input type="number" min="0" step="1" id="mana-mod" v-model="character.manaCurrent"/></label>
        <button @click="character.rollHeroDiceMana" class="action-btn">Hero Die</button>
      </div>
      <div class="row combat__hero-dice">
        <div>Hero Dice</div>
        <label for="hero-mod">Mod<input type="number" id="hero-mod" step="1" v-model="character.heroDiceMod"/></label>
        <label for="hero-max">Max<input type="number" min="0" step="1" disabled id="hero-max" v-model="character.heroDiceMax"/></label>
        <label for="hero-mod">Current<input type="number" min="0" step="1" id="hero-mod" v-model="character.heroDiceCurrent"/></label>
        <button @click="character.rollHeroDiceRaw()" class="action-btn">Roll</button>
      </div>
      <div class="row combat__extra">
        <label for="defense-mod">Def. Mod<input type="number" id="defense-mod" step="1" v-model="character.defenseMod"/></label>
        <label for="defense">Defense<input disabled type="number" id="defense" step="1" v-model="character.defense"/></label>
        <button @click="character.rollAttack" class="action-btn">Attack</button>
        <button @click="character.rollSpell" class="action-btn">Spell</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useCharacterStore } from '@/sheet/stores/character/characterStore'

const character = useCharacterStore()
</script>

<style scoped lang="scss">
.combat {
  height: 16rem;

  &__body {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;

    label {
      display: flex;
      flex-direction: column;
    }

    input {
      width: 3rem;
      text-align: center;
    }
  }

  &__life, &__mana, &__hero-dice, &__extra {
    display: grid;
    align-items: center;
    grid-template-columns: 0.5fr 0.5fr 0.5fr 0.5fr 0.5fr;
    gap: 0.5rem;
  }

}

</style>