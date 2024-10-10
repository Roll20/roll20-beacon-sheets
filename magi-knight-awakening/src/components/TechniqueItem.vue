<script setup>
import RepeatingItem from '@/components/RepeatingItem.vue';
import Collapsible from '@/components/Collapsible.vue';
import NotchContainer from './NotchContainer.vue';
const props = defineProps({
  item: Object
});
</script>

<template>
  <RepeatingItem class="technique-item" :row="props.item" name="techniques">
    <NotchContainer>
    <Collapsible class="technique-content" :default="item.expanded" @collapse="item.collapsed = !item.collapsed">
      <template v-slot:collapsed>
        <span class="technique-header">{{ props.item.name }}</span>
      </template>
      <template v-slot:expanded>
        <input type="text" class="underline technique-header" v-model="props.item.name" placeholder="Technique Name">
        <div class="flex-box">
          <span class="technique-header capitalize">type</span>
          <select name="type" class="underline" v-model="props.item.type">
            <option value="">Select One</option>
            <option value="battle">Battle</option>
            <option value="combat">Combat</option>
            <option value="social">Social</option>
          </select>
        </div>
        <span class="capitalize technique-header">description</span>
        <textarea name="description" class="underline" v-model="props.item.description"></textarea>
      </template>
    </Collapsible>
  </NotchContainer>
  </RepeatingItem>
</template>

<style>
.technique-header {
  color: var(--header-blue);
  font-weight: bold;
  font-size: medium;
}
.technique-content{
  display: grid;
  gap: var(--tiny-gap);
  font-size: medium;
  font-weight: lighter;
}
</style>