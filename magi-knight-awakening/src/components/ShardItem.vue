<script setup>
import RepeatingItem from '@/components/RepeatingItem.vue';
import Collapsible from '@/components/Collapsible.vue';
import NotchContainer from './NotchContainer.vue';
const props = defineProps({
  item: Object
});
</script>

<template>
<RepeatingItem class="shard-item" :row="props.item" name="shards">
  <notch-container>
    <Collapsible class="shards-content" :default="item.collapsed" @collapse="item.collapsed = !item.collapsed">
      <template v-slot:collapsed>
        <span class="technique-header text-4">{{ props.item.name }}</span>
      </template>
      <template v-slot:expanded>
        <input type="text" class="technique-header text-4 underline" v-model="props.item.name" placeholder="Shard Name">
        <div class="flex-box tiny-gap">
          <span class="technique-header capitalize">rarity</span>
          <input type="number" class="underline" v-model="props.item.rarity">
        </div>
        <div class="flex-box tiny-gap">
          <span class="technique-header capitalize">cost</span>
          <input type="text" class="underline cost" v-model="props.item.cost">
        </div>
        <span class="capitalize technique-header">description</span>
        <textarea name="description" class="underline" v-model="props.item.description"></textarea>
      </template>
    </Collapsible>
  </notch-container>
  </RepeatingItem>
</template>

<style>

.cost{
  text-align: center;
}
.shards-content{
  display: grid;
  gap: var(--tiny-gap);
}
</style>