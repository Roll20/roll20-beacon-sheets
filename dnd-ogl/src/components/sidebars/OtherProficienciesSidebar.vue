<template>
  <div class="view-container">
    <form ref="form" @submit.prevent="save">
      <div class="columns columns-2">
        <SheetTagsInput
          :label="$t('titles.languages')"
          :store="localState"
          storeKey="languages"
          :autocompleteSource="[...autocomplete.languages]"
        />
        <SheetTagsInput
          :label="$t('titles.proficiency-types.armor-proficiencies')"
          :store="localState"
          storeKey="armor"
          :autocompleteSource="[...autocomplete.armorProficiencies]"
        />
        <SheetTagsInput
          :label="$t('titles.proficiency-types.weapon-proficiencies')"
          :store="localState"
          storeKey="weapons"
          :autocompleteSource="[...autocomplete.weaponProficiencies]"
        />
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useSidebar } from '../sidebars/useSidebar';
import { useUnrankedProficienciesStore } from '@/sheet/stores/proficiencies/unrankedProficienciesStore';
import SheetTagsInput from '../shared/SheetTagsInput.vue';
import { config } from '@/config';
import { watch } from 'vue';

const proficienciesStore = useUnrankedProficienciesStore();
const { autocomplete } = config;
const form = ref<HTMLFormElement | null>(null);

const localState = reactive({
  languages: [...proficienciesStore.combinedLanguages],
  armor: [...proficienciesStore.combinedArmorProficiencies],
  weapons: [...proficienciesStore.combinedWeaponProficiencies],
});

const save = () => {
  if (form.value && !form.value.reportValidity()) return;

  proficienciesStore.setProficiencies({
    languages: localState.languages.filter((tag) => !tag.isFromEffect),
    armor: localState.armor.filter((tag) => !tag.isFromEffect),
    weapons: localState.weapons.filter((tag) => !tag.isFromEffect),
  });
  useSidebar().close();
};

defineExpose({
  save,
});
</script>

<style lang="scss" scoped></style>
