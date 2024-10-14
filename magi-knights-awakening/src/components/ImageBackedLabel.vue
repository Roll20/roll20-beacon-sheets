<script setup>
  import LabelStacked from './LabelStacked.vue';
  import NotchContainer from './NotchContainer.vue';

  const {
    image,
    button
  } = defineProps({
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
      <div :class="`image-container ${image}`">
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
.apple{
  background-image: var(--appleImage);
  background-size: 110%;
  background-position: right -5px top -1px;
  background-repeat: no-repeat;
}
.studied{
  background-image: var(--studiedImage);
  background-size: 100%;
  width: 110px;
  background-position: right 5px top -3px;
  background-repeat: no-repeat;
}
.move{
  background-image: var(--moveImage);
  background-size: 110%;
  background-position: right -5px top -1px;
  background-repeat: no-repeat;
}
.student-shield{
  background-image: var(--studentShieldImage);
  background-size: 100%;
  background-position: right 0px top -5px;
  background-repeat: no-repeat;
}
.magi-knight-shield{
  background-image: var(--magiKnightShieldImage);
  background-size: 100%;
  background-position: right -2px top -3px;
  background-repeat: no-repeat;
}
.attack{
  background-image: var(--attackImage);
  background-size: 120%;
  background-position: right -7px top -5px;
  background-repeat: no-repeat;
}
.student-damage{
  background-image: var(--studentDamageImage);
  background-size: 145%;
  background-position: right -20px top -3px;
  background-repeat: no-repeat;
}
.magi-knight-damage{
  background-image: var(--magiKnightDamageImage);
  background-size: 107%;
  background-position: right -2px top -3px;
  background-repeat: no-repeat;
}
.bottle-left {
  position: relative;  /* Make the parent element a positioning context */
}

.bottle-left::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: var(--bottleImage);
  background-size: 80%;
  background-position: right 8px top -2px;
  background-repeat: no-repeat;
  transform: flip;
  transform: rotate(340deg); /* Rotate the background image */
  z-index: -1; /* Make sure the pseudo-element is behind the content */
}
.bottle-right {
  position: relative;  /* Make the parent element a positioning context */
}

.bottle-right::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: var(--bottleImage);
  background-size: 80%;
  background-position: right 5px top 0px;
  background-repeat: no-repeat;
  transform: flip;
  transform: rotate(20deg); /* Rotate the background image */
  z-index: -1; /* Make sure the pseudo-element is behind the content */
}


</style>