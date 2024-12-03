<template>
    <Transition name="modal">
    <div v-if="show" class="modal-mask">
        <div class="modal-container age-modal">
          <div class="age-modal-header">
            <slot name="header">default header</slot>
            <button type="button" class="btn-close" @click="$emit('close')" aria-label="Close"></button>

            </div>
            <div class="age-ability-scores">
              <div v-for="score in abilityScoresArray" :key="score.label" >
                <div class="mb-3 col">
                    <span class="age-input-label" id="basic-addon1" style="display: flex;justify-content: space-between;;">
                      {{ score.label }}
                      <label class="age-checkbox-toggle" style="width: 18px;" v-tippy="{content:'Pending Ability Score Upgrade'}">
                        <input type="checkbox"  v-model="score.partialAdvancement" />
                        <span class="slider round" ></span>
                      </label>
                      <!-- <input type="checkbox" v-tippy="{content:'Pending Ability Score Upgrade'}" style="margin:5px;" v-model="score.partialAdvancement" />                     -->
                    </span>          
                    <input type="number" class="form-control" placeholder="0" aria-label="Character Name" v-model="score.base"  aria-describedby="basic-addon1" @change="(evt) => updateScore(score.label, evt.target.value, 'base')">
                  </div>
              </div>
            </div>
    <div class="modal-footer-actions">
          <slot name="footer">
            <button
              class="confirm-btn"
              @click="$emit('close')"
            >OK</button>
          </slot>
        </div>
    </div>
    </div>
    </Transition>
</template>
<script setup>
const props = defineProps({
  show: Boolean
})
import { ref } from 'vue';
import { useAbilityScoreStore } from '@/sheet/stores/abilityScores/abilityScoresStore';
const { abilityScores } = useAbilityScoreStore();
const abilityScoresArray = ref(
  Object.entries(abilityScores).map(([label, abilityScore]) => ({ ...abilityScore, label })),
);

const updateScore = (label, value, type) => {
  const convertedArray = Object.fromEntries(
    abilityScoresArray.value.map((score) => [
      score.label,
      { base: Number(score.base), current: Number(score.current) },
    ]),
  );
  convertedArray[label][type] = value;
  useAbilityScoreStore().abilityScores = convertedArray;
};
</script>