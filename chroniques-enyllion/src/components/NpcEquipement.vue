<script setup>
import { useNpcStore } from '@/stores/npcStore.js'
import EquipmentSection from '@/components/EquipmentSection.vue'

const npc = useNpcStore()
</script>

<template>
  <EquipmentSection :inv="npc" />
</template>
