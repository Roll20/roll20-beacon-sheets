<template>
  <div class="view-container">
    <form ref="form" @submit.prevent="save">
      <label>
        {{ $t('titles.base-score') }} *
        <input type="number" v-model="score" required min="1" />
      </label>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useSidebar } from '../sidebars/useSidebar';
import { type AbilityData, useAbilitiesStore } from '@/sheet/stores/abilities/abilitiesStore';
const form = ref<HTMLFormElement | null>(null);

const props = defineProps<{
  ability: Partial<AbilityData> | null;
}>();

const score = ref(props.ability?.score ?? 10);
const save = () => {
  if (form.value && !form.value.reportValidity()) return;

  const abilityeData = {
    score: Number(score.value),
  };
  handleSave(abilityeData);
  useSidebar().close();
};

const handleSave = (abilityeData: Partial<AbilityData>) => {
  const abilitiesStore = useAbilitiesStore();
  if (!props.ability?._id) return;
  abilitiesStore.update(props.ability._id, abilityeData);
};
defineExpose({
  save,
});
</script>

<style lang="scss" scoped>
.view-container {
}
form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
input,
select,
textarea {
  width: 100%;
  padding: 0.5rem;
  font-size: 1rem;
}
</style>
