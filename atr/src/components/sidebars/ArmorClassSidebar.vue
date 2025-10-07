<template>
  <div class="view-container">
    <form ref="form" @submit.prevent="save">
      <label>
        {{ $t('titles.calculation') }}
        <select v-model="localArmorClass.mode">
          <option value="automatic">{{ $t('titles.proficiency-levels.automatic') }}</option>
          <option value="manual">{{ $t('titles.manual') }}</option>
        </select>
      </label>

      <div v-if="localArmorClass.mode === 'manual'" class="manual-settings columns columns-3">
        <label class="span-1">
          {{ $t('titles.base-ac') }}
          <input type="number" v-model.number="localArmorClass.base" min="0" />
        </label>

        <label class="span-1">
          {{ $t('titles.ability-modifier') }}
          <select v-model="localArmorClass.ability">
            <option value="strength">{{ $t('titles.strength') }}</option>
            <option value="dexterity">{{ $t('titles.dexterity') }}</option>
            <option value="constitution">{{ $t('titles.constitution') }}</option>
            <option value="intelligence">{{ $t('titles.intelligence') }}</option>
            <option value="wisdom">{{ $t('titles.wisdom') }}</option>
            <option value="charisma">{{ $t('titles.charisma') }}</option>
          </select>
        </label>

        <label class="span-1">
          <span>{{ $t('titles.ballistic-ac') }}</span>
          <input type="number" v-model.number="localArmorClass.ballistic" min="0" />
        </label>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue';
import { useCombatStore } from '@/sheet/stores/combat/combatStore';
import { useSidebar } from './useSidebar';
const combatStore = useCombatStore();
const localArmorClass = reactive({ ...combatStore.armorClass });
const form = ref<HTMLFormElement | null>(null);

watch(localArmorClass, (newValue) => {
  if (newValue.mode === 'automatic') {
    localArmorClass.base = 10;
    localArmorClass.ability = 'dexterity';
    localArmorClass.ballistic = 0;
  }
});

const save = () => {
  if (form.value && !form.value.reportValidity()) return;

  const updatedArmorClass = {
    ...localArmorClass,
    base: localArmorClass.mode === 'manual' ? localArmorClass.base : 10,
    ability: localArmorClass.mode === 'manual' ? localArmorClass.ability : 'dexterity',
    ballistic: localArmorClass.mode === 'manual' ? localArmorClass.ballistic : 0,
  };
  combatStore.armorClass = { ...updatedArmorClass };
  useSidebar().close();
};
defineExpose({
  save,
});
</script>

<style lang="scss" scoped>
.manual-settings {
  margin-top: 1rem;
}
</style>
