<template>
  <div class="view-container">
    <form ref="form" @submit.prevent="save" v-if="localClasses.length > 0">
      <div class="columns columns-2">
        <label>
          {{ $t('titles.calculation') }}
          <select v-model="localHitPointsMode" @change="recalcHitPoints">
            <option value="average">{{ $t('titles.average') }}</option>
            <option value="rolled">{{ $t('titles.rolled') }}</option>
            <option value="manual">{{ $t('titles.manual') }}</option>
          </select>
        </label>
        <template v-if="localHitPointsMode === 'rolled'">
          <label v-for="(cls, i) in localClasses" :key="`class-${i}`" class="class-entry">
            {{ cls.name }} {{ cls.hitPoints.reduce((sum, hp) => sum + hp, 0) }} ({{
              cls.hitPoints.length * parseInt(cls.hitDie.split('d')[0])
            }}d{{ cls.hitDie.split('d')[1] }})
            <div class="columns columns-10 hit-dice">
              <button
                type="button"
                class="button span-1"
                v-for="(die, j) in cls.hitPoints"
                :key="`die-${i}-${j}`"
                @click="rollHitDie(cls, j)"
              >
                {{ die }}
              </button>
            </div>
          </label>
        </template>
        <template v-if="localHitPointsMode === 'manual'">
          <label>
            {{ $t('titles.hit-points') }}:
            <input
              type="number"
              v-model.number="localManualHp"
              placeholder="Enter manual HP"
              @change="setManualHP"
              min="0"
            />
          </label>
        </template>
      </div>
    </form>
    <div class="view-container" v-else>
      <p>{{ $t('warnings.no-classes-for-hp') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useCombatStore } from '@/sheet/stores/combat/combatStore';
import { useProgressionStore } from '@/sheet/stores/progression/progressionStore';
import { useSidebar } from './useSidebar';
import type { ClassProgression, HitPointsMode } from '@/sheet/stores/progression/progressionStore';
import { jsonClone } from '@/utility/jsonTools';
import { DiceRoll } from '@dice-roller/rpg-dice-roller';
const form = ref<HTMLFormElement | null>(null);

const combatStore = useCombatStore();
const progressionStore = useProgressionStore();

const localHitPointsMode = ref<HitPointsMode>(progressionStore.hitPointsMode);
const localClasses = ref(jsonClone(progressionStore.classes));
const localManualHp = ref<number>(localClasses.value[0]?.hitPoints?.[0] || 0);

const rollHitDie = (cls: ClassProgression, index: number) => {
  const diceRoll = new DiceRoll(cls.hitDie);
  diceRoll.roll();
  cls.hitPoints[index] = diceRoll.total;
};

const recalcHitPoints = () => {
  localClasses.value.forEach((cls) => {
    const size = parseInt(cls.hitDie.split('d')[1]);
    const amountOfDice = parseInt(cls.hitDie.split('d')[0]);
    const hitPoints = Array.from({ length: cls.level ?? 1 }, (_, i) => {
      if (localHitPointsMode.value === 'average') {
        return i === 0 ? size : Math.ceil(size / 2) + 1;
      } else if (localHitPointsMode.value === 'rolled') {
        const diceRoll = new DiceRoll(cls.hitDie);
        diceRoll.roll();
        return i === 0 ? size * amountOfDice : diceRoll.total;
      } else {
        return 0;
      }
    });
    cls.hitPoints = hitPoints;
    localManualHp.value = 0;
  });
};

const setManualHP = () => {
  localClasses.value[0].hitPoints[0] = localManualHp.value;
};

const save = () => {
  if (form.value && !form.value.reportValidity()) return;

  progressionStore.hitPointsMode = localHitPointsMode.value;
  progressionStore.classes = localClasses.value;
  useSidebar().close();
};
defineExpose({
  save,
});
</script>

<style lang="scss" scoped>
input,
select {
  width: 100%;
  padding: 0.5rem;
  font-size: 1rem;
}

.manual-settings {
  margin-top: 1rem;
}
</style>
