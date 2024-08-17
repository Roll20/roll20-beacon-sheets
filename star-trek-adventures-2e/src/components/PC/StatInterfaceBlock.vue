<template>
  <StatInterface 
    v-for="stat in stats" 
    :stat="stat"
  />
</template>

<script setup lang="ts">
import { AttributeKey, AttributeKeys, DepartmentKey, DepartmentKeys } from '@/system/gameTerms';
import { computed } from 'vue';
import StatInterface from './StatInterface/StatInterface.vue';


export type StatInterfaceBlockProps = {
  statType: "Attribute" | "Department"
}

const props = defineProps<StatInterfaceBlockProps>()

const { statType } = props;

const stats = computed<AttributeKey[] | DepartmentKey[]> (() => {
  switch (statType) {
    case 'Attribute': 
      return AttributeKeys
    case 'Department':
      return DepartmentKeys
  }
});

</script>

<style>

</style>