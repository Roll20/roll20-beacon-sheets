<template>
  <div class="sidebar-header">
    <h2 class="sidebar-header__title">{{ title }}</h2>
    <button @click="close" class="sidebar-header__close-button" title="Close"><SvgIcon icon="close" /></button>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue';
import { useSidebar } from '../sidebars/useSidebar';
import SvgIcon from './SvgIcon.vue';

const { sidebarTitle: title, close } = useSidebar();

function handleEsc(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    close();
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleEsc);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleEsc);
});
</script>

<style lang="scss" scoped>
.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid red;
  background: var(--color-box);
  color: var(--color-box-detail);
  .sidebar-header__title {
    margin: 0;
    font-size: 1.5rem;
    font-family: var(--font-family-title);
    text-transform: uppercase;
    font-weight: normal;
  }

  .svg-icon {
    fill: var(--color-box-detail);
    width: 1.2rem;
    height: 1.2rem;
  }

  .sidebar-header__close-button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0 0.5rem;
    font-weight: bold;
    &:hover {
      .svg-icon {
        fill: var(--color-highlight);
      }
    }
  }
}
</style>