<script setup>
import RepeatingItem from '@/components/RepeatingItem.vue';
import Collapsible from '@/components/Collapsible.vue';
const props = defineProps({
  item: Object
});
</script>

<template>
<RepeatingItem class="shard-item" :row="props.item" name="shards">
    <Collapsible class="shards-content" :default="item.collapsed" @collapse="item.collapsed = !item.collapsed">
      <template v-slot:collapsed>
        <span class="technique-header text-4">{{ props.item.name }}</span>
        <p>{{ props.item.description }}</p>
      </template>
      <template v-slot:expanded>
        <input type="text"class="technique-header text-4 underline" v-model="props.item.name" placeholder="technique name">
        <div class="flex-box tiny-gap">
          <span class="technique-header capitalize">rarity</span>
          <input type="number" class="underline" v-model="props.item.rarity">
        </div>
        <div class="flex-box tiny-gap">
          <span class="technique-header capitalize">cost</span>
          <input type="text" class="underline" v-model="props.item.cost">
        </div>
        <span class="capitalize technique-header">description</span>
        <textarea name="description" class="underline" v-model="props.item.description"></textarea>
      </template>
    </Collapsible>

  </RepeatingItem>
</template>

<style>

.shards-content{
  display: grid;
  gap: var(--tiny-gap);
}
</style>