<template>
  <div :class="{'nine-sliced-box': true, [`nine-sliced-box--theme-${theme}`]: true, [`nine-sliced-box--theme-${theme}-empty`]: empty }">
    <div class="nine-sliced-box__border-background">
    </div>
    <div class="nine-sliced-box__content">
      <slot />
    </div>
    <div class="nine-sliced-box__border">
    </div>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps<{
  theme: 'a' | 'b' | 'c' | 'c-r' | 'd' | 'e' | 'f' | 'g' | 'h' | 'inspiration' | 'passive' | 'proficiency' | 'tab';
  rotated?: 90 | 180;
  empty?: boolean;
}>();
</script>

<style lang="scss" scoped>
.nine-sliced-box {
  --slicedbox-factor: 2.5;
  --slicedbox-border-bottom: var(--slicedbox-border-top);
  --slicedbox-border-left: var(--slicedbox-border-right);
  --slicedbox-padding-bottom: var(--slicedbox-padding-top);
  --slicedbox-padding-left: var(--slicedbox-padding-right);
  --slicedbox-fill: var(--sheet-border-color);
  --slicedbox-divider: var(--sheet-border-color);
  --slicedbox-background: var(--sheet-background-color);
  display: grid;
  grid-template-areas: "stack";
  min-width: calc(var(--slicedbox-border-left) / var(--slicedbox-factor) * 1px + var(--slicedbox-border-right) / var(--slicedbox-factor) * 1px + 1px);
  min-height: calc(var(--slicedbox-border-top) / var(--slicedbox-factor) * 1px + var(--slicedbox-border-bottom) / var(--slicedbox-factor) * 1px + 1px);
  box-sizing: border-box;
  &__content, &__border, &__border-background {
    grid-area: stack;
  }
  &__content {
    padding: var(--slicedbox-padding-top) var(--slicedbox-padding-right) var(--slicedbox-padding-bottom) var(--slicedbox-padding-left);
    position: relative;
    align-self: center;
  }
  &__border, &__border-background {
    border-image-repeat: stretch;
    pointer-events: none;
    transform: translateY(-9999999px);
    border-image-slice: var(--slicedbox-border-top) var(--slicedbox-border-right) var(--slicedbox-border-bottom) var(--slicedbox-border-left) fill;
    border-image-width: 
      calc(var(--slicedbox-border-top) * 1px / var(--slicedbox-factor))
      calc(var(--slicedbox-border-right) * 1px / var(--slicedbox-factor))
      calc(var(--slicedbox-border-bottom) * 1px / var(--slicedbox-factor))
      calc(var(--slicedbox-border-left) * 1px / var(--slicedbox-factor));
  }
  &__border {
    filter: drop-shadow(0px 9999999px 0 var(--slicedbox-fill));
  }
  &__border-background {
    filter: drop-shadow(0px 9999999px 0 var(--slicedbox-background));
  }
  &--theme-a,
  &--theme-b,
  &--theme-c,
  &--theme-c-r,
  &--theme-d,
  &--theme-e,
  &--theme-f {
    min-height: 36px;
    .nine-sliced-box__content {
      padding: 10px 15px;
    }
  }
  &--theme-a {
    --slicedbox-border-top: 184;
    --slicedbox-border-right: 52;
    --slicedbox-padding-top: 10px;
    --slicedbox-padding-right: 15px;
    > .nine-sliced-box__border {
      border-image-source: url('https://raw.githubusercontent.com/mperes/dnd-images/refs/heads/main/borders/border_a.png');
    }
  }
  &--theme-b {
    --slicedbox-border-top: 26;
    --slicedbox-border-right: 26;
    > .nine-sliced-box__border {
      border-image-source: url('https://raw.githubusercontent.com/mperes/dnd-images/refs/heads/main/borders/border_b.png');
    }
  }
  &--theme-c {
    --slicedbox-border-top: 50;
    --slicedbox-border-right: 44;
    --slicedbox-padding-top: 5px;
    --slicedbox-padding-right: 10px;
    > .nine-sliced-box__border {
      border-image-source: url('https://raw.githubusercontent.com/mperes/dnd-images/refs/heads/main/borders/border_c.png');
    }
    > .nine-sliced-box__border-background {
      border-image-source: url('https://raw.githubusercontent.com/mperes/dnd-images/refs/heads/main/borders/border_c-background.png');
    }
    &-r {
      --slicedbox-border-top: 44;
      --slicedbox-border-right: 50;
      --slicedbox-padding-top: 5px;
      --slicedbox-padding-right: 5px;
      > .nine-sliced-box__border {
        border-image-source: url('https://raw.githubusercontent.com/mperes/dnd-images/refs/heads/main/borders/border_c-r.png');
      }
      > .nine-sliced-box__border-background {
        border-image-source: url('https://raw.githubusercontent.com/mperes/dnd-images/refs/heads/main/borders/border_c-background.png');
      }
    }
  }
  &--theme-d {
    --slicedbox-border-top: 46;
    --slicedbox-border-right: 50;
    --slicedbox-border-bottom: 94;
    --slicedbox-padding-top: 5px;
    --slicedbox-padding-right: 10px;
    > .nine-sliced-box__border {
      border-image-source: url('https://raw.githubusercontent.com/mperes/dnd-images/refs/heads/main/borders/border_d.png');
    }
  }
  &--theme-e {
    --slicedbox-border-top: 48;
    --slicedbox-border-right: 58;
    --slicedbox-border-bottom: 110;
    --slicedbox-padding-top: 5px;
    --slicedbox-padding-right: 5px;
    > .nine-sliced-box__border {
      border-image-source: url('https://raw.githubusercontent.com/mperes/dnd-images/refs/heads/main/borders/border_e.png');
      width: calc(100% + 20px / var(--slicedbox-factor));
      margin-left: calc(-10px / var(--slicedbox-factor));
    }
    &-empty {
      --slicedbox-border-bottom: 48;
      > .nine-sliced-box__border {
        border-image-source: url('https://raw.githubusercontent.com/mperes/dnd-images/refs/heads/main/borders/border_e-empty.png');
      }
    }
  }
  &--theme-f {
    --slicedbox-border-top: 14;
    --slicedbox-border-right: 56;
    --slicedbox-padding-top: 5px;
    --slicedbox-padding-right: 10px;
    > .nine-sliced-box__border {
      border-image-source: url('https://raw.githubusercontent.com/mperes/dnd-images/refs/heads/main/borders/border_f.png');
      &:after, &:before {
        --slicedbox-slice: 48px;
        content: '';
        position: absolute;
        top: 50%;
        transform: translateY(-50%) scaleY(1.3);
        height: 50px;
        width: 50px;
        border-radius: 100px;
        border: calc(4 / var(--slicedbox-factor) * 1px) solid var(--slicedbox-fill);
        clip-path: inset(0 0 0 var(--slicedbox-slice));
      }
      &:before {
        left: calc(-1 * var(--slicedbox-slice));
      }
      &:after {
        right: calc(-1 * var(--slicedbox-slice));
        clip-path: inset(0 var(--slicedbox-slice) 0 0);
      }
    }
  }
  &--theme-g {
    --slicedbox-border-top: 76;
    --slicedbox-border-right: 210;
    --slicedbox-padding-top: 30px;
    --slicedbox-padding-right: 15px;
    > .nine-sliced-box__border {
      border-image-source: url('https://raw.githubusercontent.com/mperes/dnd-images/refs/heads/main/borders/border_g.png');
    }
  }
  &--theme-h {
    --slicedbox-border-top: 100;
    --slicedbox-border-right: 315;
    --slicedbox-padding-top: 10px;
    --slicedbox-padding-right: 10px;
    > .nine-sliced-box__border {
      border-image-source: url('https://raw.githubusercontent.com/mperes/dnd-images/refs/heads/main/borders/border_h.png');
    }
    > .nine-sliced-box__border {
      opacity: 0.15;
    }
    > .nine-sliced-box__content {
      padding: 15px 10px;
      z-index: 2;
    }
  }
  &--theme-inspiration,
  &--theme-passive,
  &--theme-proficiency {
    --slicedbox-border-top: 66;
    --slicedbox-border-right: 150;
    --slicedbox-border-left: 50;
    min-height: auto;
    height: 52px;
  }
  &--theme-inspiration {
    > .nine-sliced-box__border {
      border-image-source: url('https://raw.githubusercontent.com/mperes/dnd-images/refs/heads/main/borders/inspiration.png');
    }
  }
  &--theme-passive {
    > .nine-sliced-box__border {
      border-image-source: url('https://raw.githubusercontent.com/mperes/dnd-images/refs/heads/main/borders/passive.png');
    }
  }
  &--theme-proficiency {
    > .nine-sliced-box__border {
      border-image-source: url('https://raw.githubusercontent.com/mperes/dnd-images/refs/heads/main/borders/proficiency.png');
    }
  }
  &--theme-tab {
    --slicedbox-border-top: 25;
    --slicedbox-border-right: 50;
    --slicedbox-padding-top: 10px;
    --slicedbox-padding-right: 20px;
    > .nine-sliced-box__border {
      border-image-source: url('https://raw.githubusercontent.com/mperes/dnd-images/refs/heads/main/borders/tab.png');
    }
    > .nine-sliced-box__border-background {
      border-image-source: url('https://raw.githubusercontent.com/mperes/dnd-images/refs/heads/main/borders/tab-background.png');
    }
  }
}
</style>
<style lang="scss">
.nine-sliced-box__divider {
  height: 1px;
  background-color: var(--slicedbox-divider);
  border: none;
  width: 100%;
  margin: 10px 0;
  &--vertical {
    width: 1px;
    height: 100%;
    margin: 0 10px;
  }
  &--marginless {
    margin: 0;
  }
}
</style>