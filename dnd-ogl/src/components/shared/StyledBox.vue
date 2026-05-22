<template>
  <div :class="['styled-box', `styled-box--${mode}`]">
    <div class="styled-box__border">
      <!-- Decorative elements can go here -->
    </div>
    <div class="styled-box__content">
      <slot>Box Content</slot>
    </div>
    <div class="styled-box__background">
      <!-- Decorative elements can go here -->
    </div>
  </div>
</template>

<script setup lang="ts">

withDefaults(defineProps<{
  mode?: 'gothic' | 'fancy';
}>(), {
  mode: 'gothic'
});

</script>

<style scoped lang="scss">
.styled-box {
  position: relative;
  &__content {
    position: relative;
    z-index: 2;
    &:deep(.section__header) {
      h3 {
        color: var(--styledbox-detail);
      }
      .sidebar-link .svg-icon svg {
        fill: var(--styledbox-detail);
      }
    }
  }
  &__border {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 3;
    pointer-events: none;
  }
  &__background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
  }
  &--gothic {
    clip-path: var(--path-gothic);
    .styled-box__border {
      box-sizing: border-box;
      border-image-slice: 4 4 4 4;
      border-image-width: 4px;
      border-image-outset: 0px;
      border-image-repeat: stretch stretch;
      border-image-source: url("https://i.postimg.cc/sg346pxQ/gothic-border.png");
      border-style: solid;
    }
    .styled-box__background {
      background-color: var(--styledbox-background);
      clip-path: var(--path-gothic);
      top: var(--styledbox-border-width);
      left: var(--styledbox-border-width);
      width: calc(100% - calc(2 * var(--styledbox-border-width)));
      height: calc(100% - calc(2 * var(--styledbox-border-width)));
    }
  }
}
</style>