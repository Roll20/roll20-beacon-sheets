<script setup>
  const props = defineProps({
    width:{
      type: String,
      default: "mid"
    },
    notch:{
      type: [Number,String],
      default: 10
    },
    notchType:{
      type: String,
      default: 'curve'
    },
    container:{
      type: String,
      default: 'div'
    }
  });
</script>

<template>
  <component :is="container" :class="`notch-container ${notchType} ${width}`" :style="`--_notchSize:${notch}px`">
    <slot></slot>
  </component>
</template>

<style lang="scss">
  .notch-container{
    --_border-width:2px;
    .thin{
      --_border-width:1px;
    }
    .thick{
      --_border-width:3px;
    }
    &.none{
      border: var(--_border-width) var(--borderColor) solid;
    }
    &.curve{
      background-image:
        radial-gradient(
          circle at top left,
            var(--masterBack),
            var(--masterBack) var(--_notchSize),
            var(--borderColor) var(--_notchSize),
            var(--borderColor) calc(var(--_notchSize) + var(--_border-width)),
            transparent calc(var(--_notchSize) + var(--_border-width))
        ),
        radial-gradient(
          circle at top right,
            var(--masterBack),
            var(--masterBack) var(--_notchSize),
            var(--borderColor) var(--_notchSize),
            var(--borderColor) calc(var(--_notchSize) + var(--_border-width)),
            transparent calc(var(--_notchSize) + var(--_border-width))
        ),
        radial-gradient(
          circle at bottom left,
            var(--masterBack),
            var(--masterBack) var(--_notchSize),
            var(--borderColor) var(--_notchSize),
            var(--borderColor) calc(var(--_notchSize) + var(--_border-width)),
            transparent calc(var(--_notchSize) + var(--_border-width))
        ),
        radial-gradient(
          circle at bottom right,
            var(--masterBack),
            var(--masterBack) var(--_notchSize),
            var(--borderColor) var(--_notchSize),
            var(--borderColor) calc(var(--_notchSize) + var(--_border-width)),
            transparent calc(var(--_notchSize) + var(--_border-width))
        ),
        linear-gradient(
          to right,
          var(--borderColor),
          var(--borderColor) var(--_border-width),
          transparent var(--_border-width),
          transparent
        ),
        linear-gradient(
          to left,
          var(--borderColor),
          var(--borderColor) var(--_border-width),
          transparent var(--_border-width),
          transparent
        ),
        linear-gradient(
          to bottom,
          var(--borderColor),
          var(--borderColor) var(--_border-width),
          transparent var(--_border-width),
          transparent
        ),
        linear-gradient(
          to top,
          var(--borderColor),
          var(--borderColor) var(--_border-width),
          transparent var(--_border-width),
          transparent
        );
      padding: var(--_notchSize) calc(var(--_notchSize) + var(--_border-width));
    }
    &.wedge{
      background-image:
        linear-gradient(
          45deg,
            var(--masterBack),
            var(--masterBack) var(--_notchSize),
            var(--borderColor) var(--_notchSize),
            var(--borderColor) calc(var(--_notchSize) + var(--_border-width)),
            transparent calc(var(--_notchSize) + var(--_border-width))
        ),
        linear-gradient(
          135deg,
            var(--masterBack),
            var(--masterBack) var(--_notchSize),
            var(--borderColor) var(--_notchSize),
            var(--borderColor) calc(var(--_notchSize) + var(--_border-width)),
            transparent calc(var(--_notchSize) + var(--_border-width))
        ),
        linear-gradient(
          225deg,
            var(--masterBack),
            var(--masterBack) var(--_notchSize),
            var(--borderColor) var(--_notchSize),
            var(--borderColor) calc(var(--_notchSize) + var(--_border-width)),
            transparent calc(var(--_notchSize) + var(--_border-width))
        ),
        linear-gradient(
          315deg,
            var(--masterBack),
            var(--masterBack) var(--_notchSize),
            var(--borderColor) var(--_notchSize),
            var(--borderColor) calc(var(--_notchSize) + var(--_border-width)),
            transparent calc(var(--_notchSize) + var(--_border-width))
        ),
        linear-gradient(
          to right,
          var(--borderColor),
          var(--borderColor) var(--_border-width),
          transparent var(--_border-width),
          transparent
        ),
        linear-gradient(
          to left,
          var(--borderColor),
          var(--borderColor) var(--_border-width),
          transparent var(--_border-width),
          transparent
        ),
        linear-gradient(
          to bottom,
          var(--borderColor),
          var(--borderColor) var(--_border-width),
          transparent var(--_border-width),
          transparent
        ),
        linear-gradient(
          to top,
          var(--borderColor),
          var(--borderColor) var(--_border-width),
          transparent var(--_border-width),
          transparent
        );
    }
  }
</style>