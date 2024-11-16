<!-- eslint-disable vue/require-toggle-inside-transition -->
<template>
    <!-- Sidebar -->
    <transition name="slide">
      <div class="sidebar" :class="[{ 'sidebar-hidden': !isVisible }, classWidth]">
        <div v-if="isVisible">
        <button type="button" class="btn-close" style="position: absolute;right: 15px;" @click="closeSidebar" aria-label="Close"></button>
        <div class="content">
          <slot></slot>
        </div>
        </div>
        
      </div>
    </transition>
  
    <!-- Overlay to close sidebar when clicking outside -->
    <div v-if="isVisible" class="overlay" @click="closeSidebar"></div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  const props = defineProps({
  className: { type: String },
});
  const isVisible = ref(false);  // Controls sidebar visibility
  const classWidth = ref(props.className)
  const openSidebar = () => {
    isVisible.value = true;
  };
  const closeSidebar = () => {
    isVisible.value = false;
  };
  defineExpose({
  openSidebar,
  closeSidebar
});
  </script>
  
  <style scoped>

  </style>
  