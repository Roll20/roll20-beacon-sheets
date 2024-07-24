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
  --_containerSize: 50px;
  display: inline-flex;
  gap: var(--tiny-gap);
}
.image-container{
  isolation: isolate;
  display: grid;
  place-items: center;
  width:var(--_containerSize);
  height: var(--_containerSize);
  border-radius: 100%;
  border: 2px solid var(--borderColor);
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
.star:before{
  --_starWeight: 200;
  grid-area: content;
  z-index: -1;
  content: 'star';
  font-family: 'Material Symbols Outlined';
  font-weight: normal;
  font-style: normal;
  font-size: 100px;  /* Preferred icon size */
  display: inline-block;
  line-height: 1;
  text-transform: none;
  letter-spacing: normal;
  word-wrap: normal;
  white-space: nowrap;
  direction: ltr;
  color: var(--borderColor);
  position: absolute;
  font-variation-settings:
    'FILL' 0,
    'wght' var(--_starWeight);
}
.dark .star:before{
  font-variation-settings:
    'FILL' 1,
    'wght' var(--_starWeight);
}
.image-label input{
  width: 100%;
  background-color: transparent;
  border: none;
  text-align: center;
}
</style>