<template>
  <div class="tag-box" :class="{ 'tag-box--disabled': isDisabled, 'tag-box--weakness': props.isWeakness, 'tag-box--power': !props.isWeakness, 'tag-box--active': props.isActive, 'tag-box--inverted': props.inverted }">
    <div class="tag-box__box">
      <div class="tag-box__indicator"></div>
      <div class="tag-box__actions" v-if="!props.isWeakness"></div>
      <div class="tag-box__stripes" v-else></div>
    </div>
    <div class="tag-box__content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  isWeakness?: boolean;
  inverted?: boolean;
  isActive?: boolean;
  isDisabled?: boolean;
  isBurnt?: boolean;
}>();
</script>

<style lang="scss" scoped>
.tag-box {
  display: grid;
  grid-template-areas: 'stack';
  &__content, &__box {
    grid-area: stack;
  }
  &__box {
    width: 100%;
    height: var(--tag-box-height);
    background-color: var(--tag-box-color, rgb(var(--color-palette-default) / 0.85));
    position: relative;
    clip-path: polygon(
      0 0,
      calc(100% - var(--tag-box-inclination-right)) 0,
      100% 100%,
      var(--tag-box-inclination-left) 100%,
      0 calc(100% - var(--tag-box-inclination-right))
    );
  }
  &__indicator {
    width: var(--tag-box-indicator-width);
    height: 100%;
    background-color: rgb(var(--color-palette-foreground) / var(--color-palette-disabled));
    position: absolute;
    top: 0;
    left: 0;
  }
  &__actions {
    position: absolute;
    top: 0;
    right: 0;
    height: 100%;
    width: var(--tag-box-actions-width);
    background-color: var(--tag-box-actions-color, rgb(var(--color-palette-dark)));
    clip-path: polygon(
      0 0,
      100% 0,
      100% 100%,
      calc(var(--tag-box-inclination-right)) 100%,
    );
  }
  &__stripes {
    width: 100%;
    height: 100%;
    background: repeating-linear-gradient(
      calc(var(--tag-box-stripe-angle) * -1),
      transparent,
      transparent calc(var(--tag-box-actions-width) / 2),
      var(--tag-box-stripe-color) calc(var(--tag-box-actions-width) / 2),
      var(--tag-box-stripe-color) calc(var(--tag-box-actions-width) * 0.75)
    );
  }
  &:hover:not(.tag-box--active) {
    .tag-box__box {
      background-color: var(--tag-box-color-hover, rgb(var(--color-palette-default) / 0.35));
    }
  }
  &--active {
    .tag-box__box {
      background-color: var(--tag-box-color-active, rgb(var(--color-palette-default)));
    }
    .tag-box__indicator {
      background-color: var(--tag-box-indicator-color-active, rgb(var(--color-palette-highlight)));
    }
    .tag-box__actions {
      background-color: var(--tag-box-actions-color-active, rgb(var(--color-palette-dark)));
    }
    .tag-box__stripes {
      background: repeating-linear-gradient(
        calc(var(--tag-box-stripe-angle) * -1),
        transparent,
        transparent calc(var(--tag-box-actions-width) / 2),
        var(--tag-box-stripe-color-active) calc(var(--tag-box-actions-width) / 2),
        var(--tag-box-stripe-color-active) calc(var(--tag-box-actions-width) * 0.75)
      );
    }
  }
  &--inverted {
    filter: hue-rotate(180deg);
  }
  &--disabled {
    .tag-box__indicator, .tag-box__actions {
      opacity: 0;
    }
  }
}
</style>