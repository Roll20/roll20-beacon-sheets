<template>
  <StatInterface 
    v-for="stat in stats" 
    :stat="stat"
  />
</template>

<script setup lang="ts">
import type { AttributeKey,  DepartmentKey } from '@/system/gameTerms';
import { AttributeKeys, DepartmentKeys } from '@/system/gameTerms';
import { computed } from 'vue';
import StatInterface from './StatInterface.vue';


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