<script setup>
  import ImageBackedLabel from './ImageBackedLabel.vue';

  import { useSheetStore } from '@/stores/sheetStore';

  const sheet = useSheetStore();

  const emit = defineEmits(['clicked'])

  // expects an array of four objects describing the attributes to be inserted
  /*
    [
      {
        name: 'inspiration',
        image: 'star',
        crown: true,
        text: 'inspiration',
        readonly: false
      },
      {
        name: 'initiative',
        image: 'star',
        crown: false,
        text: 'initiative',
        readonly: true
      }
    ]
  */
  const {
    attributes
  } = defineProps({
    attributes: Array
  });
</script>

<template>
  <div class="split-display">
    <ImageBackedLabel :button="obj.button" v-for="obj in attributes" :key="obj.name" v-bind="obj">
      <template v-slot:value>
        <span v-if="obj.readonly"> {{ sheet[obj.name] }}</span>
        <input v-else type="number" v-model="sheet[obj.name]">
      </template>
      <template v-slot:text>
        <button style="z-index: 100;" v-if="obj.button" @click="$emit('clicked',obj.name)">{{ obj.text }}</button>
        <span v-else>{{ obj.text }}</span>
      </template>
    </ImageBackedLabel>
    <div v-if="$slots.content" class="inject">
      <slot name="content"></slot>
    </div>
  </div>
</template>

<style lang="scss">
.split-display{
  display: flex;
  gap: var(--half-gap);
  padding-inline: var(--half-gap);
  justify-content: space-around;
  flex-wrap: wrap;
  > :is(:nth-child(1),:nth-child(2)) {
    order: 1;
  }
  > :is(:nth-last-child(3),:nth-last-child(2)){
    order: 3;
  }
  > .inject{
    display: contents;
    > *{
      order:2
    }
  }
  @container (345px < width < 680px){
    display: grid;
    grid-template-columns: repeat(3,auto);
    grid-template-rows: auto auto;
    place-content: space-around;
    > .inject{
      > :last-child{
        order: 4
      }
    }
    > .inject > :first-child,
    > :nth-child(2)
    {
      margin-left: auto;
    }
  }
  @container(width <= 345px){
    .inject > *{
      order: 4;
    }
  }
}
</style>