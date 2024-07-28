<template>
  <div v-if="!editing">
    <label>{{ label }}</label>
    {{total}}
  </div>
  <div v-else>
    <label>{{ label }} Base:</label>
    <input 
      v-model="attributeBase"
      type="number"
    >
    <button 
      @click="setModifyingToAttribute()"
      class="icon-button icon-button--calculate"
    >
      <label class="sr-only">
        Modifiers
      </label>
    </button>
  </div>
</template>

<script setup lang="ts">
import { useAttributeStore } from '@/sheet/stores/attributeStore/attributeStore';
import { useUIStore } from '@/sheet/stores/uiStore/uiStore';
import { AttributeKey } from '@/system/gameTerms';
import { computed } from 'vue';

export type AttributeInterfaceProps = {
  attribute: AttributeKey
}

const props = defineProps<AttributeInterfaceProps>();

const uiStore = useUIStore();
const attributeStore = useAttributeStore();

const editing = computed(() => {
  return uiStore.editMode
});

const attribute = computed(() => props.attribute);
const total = computed(() => attributeStore[attribute.value])
const label = computed(() => attributeStore.fields[attribute.value].label)

const attributeBase = computed({
  get: () => attributeStore.fields[attribute.value].base,
  set: (newValue) => {
    attributeStore.fields[attribute.value].base = newValue
  }
})

const setModifyingToAttribute = () => {
  uiStore.modifyingStat = attribute.value;
}

</script>

<style lang="scss">
@use "../../../common/scss/common.scss";

</style>