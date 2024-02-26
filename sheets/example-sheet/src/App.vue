<template>
  <div class="examplesheet">
    <div class="header section">
      <div class="section__header">This is the Header</div>
      <div class="section__body tabs">
        <router-link to="/sheet">Sheet Tab</router-link>
        <router-link to="/settings">Settings Tab</router-link>
      </div>
    </div>
    <router-view v-slot="{ Component }">
      <transition name="fade">
        <component :is="Component" />
      </transition>
    </router-view>
    <div class="footer section section__header">This is the Footer</div>
  </div>
</template>

<script setup>
import { useExampleSheetStore } from './sheet/stores';
import router from './router';

const store = useExampleSheetStore();
</script>

<style scoped lang="scss">
.header {
  margin-bottom: 0.5rem;

  .tabs {
    display: flex;
    gap: 1rem;
    a {
      color: black;
      padding: 0.5rem;
      border-radius: 0.5rem;
      text-decoration: none;
      border: 1px solid lightgrey;
      // Router-links get this class added if you're already on the page it leads you to. Useful for tabs.
      &.router-link-active {
        color: var(--examplesheet-primary);
        font-weight: 600;
        text-decoation: underline;
        border-color: var(--examplesheet-primary);
      }
    }
  }
}
.footer {
  margin-top: 0.5rem;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
