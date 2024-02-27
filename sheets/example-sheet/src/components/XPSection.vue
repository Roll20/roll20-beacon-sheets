<template>
  <div class="section xp">
    <div class="section__header">XP</div>
    <div class="section__body xp__body">
      <label for="xp-total">
        <span class="label">Experience</span>
        <input id="xp-total" type="number" step="100" v-model="character.xp" />
      </label>
      <div class="xp__table">
        <div class="row">
          <div class="row__header">Level</div>
          <div class="row__header">Bonus</div>
          <div class="row__header">Life</div>
          <div class="row__header">Mana</div>
        </div>
        <div
          class="row"
          v-for="(thisLevel, index) in levelTable"
          :class="{ current: Number(index) === calculatedLevel }"
          :key="index"
        >
          <div class="level">
            <div class="level__lv">
              <div>{{ index }}</div>
            </div>
            <div>{{ thisLevel.xp }} xp</div>
          </div>
          <div>
            <span class="bonus" v-if="thisLevel.profBonus !== levelTable[index - 1]?.profBonus"
              >+{{ thisLevel.profBonus }}</span
            >
          </div>
          <div>{{ thisLevel.life }}</div>
          <div>{{ thisLevel.mana }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useCharacterStore } from '@/sheet/stores/character/characterStore';
import levelTable from '@/system/levelTable';
import { computed } from 'vue';

const character = useCharacterStore();
const calculatedLevel = computed(
  () =>
    Object.values(levelTable)
      .reverse()
      .find((level) => level.xp <= character.xp).level,
);
</script>

<style scoped lang="scss">
.xp {
  height: 34.5rem;

  label {
    display: flex;
    align-items: center;
    font-size: 1.25rem;
    gap: 0.5rem;
    max-width: 100%;

    .label {
      color: var(--examplesheet-primary);
    }
    input {
      font-size: 1.25rem;
      border: none;
      padding: 0.5rem;
      max-width: 9rem;
    }
  }

  &__table {
    text-align: center;
    display: grid;
    gap: 0.4rem;

    .row {
      display: grid;
      grid-template-columns: 1.75fr 1fr 1fr 1fr;
      padding: 0.5rem 0.25rem;

      &__header {
        font-weight: 600;
        font-size: 1.1rem;

        &:first-child {
          text-align: left;
        }
      }

      &.current {
        border-radius: 0.25rem;
        background-color: var(--examplesheet-secondary);
      }

      .level {
        display: flex;
        gap: 0.25rem;

        &__lv {
          border: 1px solid var(--examplesheet-primary);
          border-radius: 1rem;
          color: var(--examplesheet-primary);
          height: 1rem;
          width: 1rem;
          display: flex;
          align-items: center;
          text-align: center;
          justify-content: center;
          font-weight: 600;
        }
      }
      .bonus {
        font-weight: 700;
      }
    }
  }
}
</style>
