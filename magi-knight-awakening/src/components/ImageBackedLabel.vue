<script setup>
  import LabelStacked from './LabelStacked.vue';
  import NotchContainer from './NotchContainer.vue';

  const {
    crown,
    image,
    button
  } = defineProps({
    crown: Boolean,
    image: {
      type: String,
      default: 'star'
    },
    button: Boolean
  });
</script>

<template>
  <LabelStacked :button="button" class="image-label">
    <template v-slot:number>
      <div :class="`image-container ${image}${crown ? ' crown' : ''}`">
        <slot name="value"></slot>
      </div>
    </template>
    <template v-slot:label>
      <NotchContainer class="image-text-container" width="thin" :notch="5">
        <span>
          <slot name="text"></slot>
        </span>
      </NotchContainer>
    </template>
  </LabelStacked>
</template>

<style>
.image-label{
  --_containerSize: 70px;
  display: inline-flex;
  gap: var(--tiny-gap);
}
.image-container{
  isolation: isolate;
  display: grid;
  place-items: center;
  width:var(--_containerSize);
  height: var(--_containerSize);
  grid-template-areas: 'content';
}
.image-container > * {
  grid-area: content;
}
.image-text-container{
  min-width: 100px;
  display: flex;
  justify-content: center;
  text-transform: capitalize;
}
.image-container.crown:after{
  content: '';
  background-image: var(--crownImage);
  grid-area: content;
}
.image-label input{
  width: 100%;
  background-color: transparent;
  border: none;
  text-align: center;
}
.star{
  background-image: var(--starImage);
  background-size: 110%;
  background-position: right -5px top -1px;
  background-repeat: no-repeat;
}
.diamond{
  background-image: var(--diamondImage);
  background-size: 110%;
  background-position: right -5px top -1px;
  background-repeat: no-repeat;
}
</style>