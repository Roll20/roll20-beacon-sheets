<template>
  <div
    :class="[
      'bg-white border-3 border-secondary transition-all duration-150',
      lgShadow ? 'action-shadow-lg' : 'action-shadow',
      hoverable ? 'panel-hover cursor-pointer' : ''
    ]"
  >
    
    <div
      v-if="title || $slots.header || $slots.headerRight"
      class="border-b-3 border-secondary flex justify-between items-center px-4 py-2"
      :class="headerBg"
    >
      <slot name="header">
        <h3 class="font-space-grotesk font-black uppercase text-base tracking-wide flex items-center gap-2">
          <slot name="header-icon"></slot>
          {{ title }}
        </h3>
      </slot>
      <div>
        <slot name="headerRight"></slot>
      </div>
    </div>
    
    <div :class="noPadding ? '' : 'p-4 md:p-6'">
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts" setup>
interface Props {
  title?: string;
  lgShadow?: boolean;
  hoverable?: boolean;
  noPadding?: boolean;
  headerBg?: string;
}

withDefaults(defineProps<Props>(), {
  title: '',
  lgShadow: false,
  hoverable: false,
  noPadding: false,
  headerBg: 'bg-white text-black',
});
</script>
