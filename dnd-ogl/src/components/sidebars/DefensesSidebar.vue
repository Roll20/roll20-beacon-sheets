<template>
  <div class="view-container">
    <form ref="form" @submit.prevent="save">
      <div class="columns columns-2">
        <SheetTagsInput
          :label="$t('titles.damage-resistances')"
          :store="localState"
          storeKey="damageResistances"
          :autocompleteSource="[...autocomplete.damageTypes]"
          add-only-from-autocomplete
        />
        <SheetTagsInput
          :label="$t('titles.damage-immunities')"
          :store="localState"
          storeKey="damageImmunities"
          :autocompleteSource="[...autocomplete.damageTypes]"
          add-only-from-autocomplete
        />
        <SheetTagsInput
          :label="$t('titles.damage-vulnerabilities')"
          :store="localState"
          storeKey="damageVulnerabilities"
          :autocompleteSource="[...autocomplete.damageTypes]"
          add-only-from-autocomplete
        />
        <SheetTagsInput
          :label="$t('titles.condition-immunities')"
          :store="localState"
          storeKey="conditionImmunities"
          :autocompleteSource="[...autocomplete.conditions]"
          add-only-from-autocomplete
        />
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { useSidebar } from '../sidebars/useSidebar';
import { useDefenseStore } from '@/sheet/stores/defenses/defenseStore';
import SheetTagsInput from '../shared/SheetTagsInput.vue';
import { config } from '@/config';
const form = ref<HTMLFormElement | null>(null);

const defenseStore = useDefenseStore();
const { autocomplete } = config;

const localState = reactive({
  conditionImmunities: [...defenseStore.combinedConditionImmunities],
  damageResistances: [...defenseStore.combinedDamageResistances],
  damageImmunities: [...defenseStore.combinedDamageImmunities],
  damageVulnerabilities: [...defenseStore.combinedDamageVulnerabilities],
});

const save = () => {
  if (form.value && !form.value.reportValidity()) return;

  defenseStore.setDefenses({
    conditionImmunities: localState.conditionImmunities.filter((tag) => !tag.isFromEffect),
    damageResistances: localState.damageResistances.filter((tag) => !tag.isFromEffect),
    damageImmunities: localState.damageImmunities.filter((tag) => !tag.isFromEffect),
    damageVulnerabilities: localState.damageVulnerabilities.filter((tag) => !tag.isFromEffect),
  });
  useSidebar().close();
};

defineExpose({
  save,
});
</script>

<style lang="scss" scoped></style>
