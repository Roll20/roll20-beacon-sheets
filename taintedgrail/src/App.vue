<template>
  <div class="taintedgrail">
    <div class="dragOverlay" v-if="isDraggingItem">
      <div class="dragOverlay__text">Drop compendium item to add to sheet</div>
    </div>
    <router-view v-slot="{ Component }">
      <transition name="fade">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<script setup>
import { dragOverPulse } from './relay/relay';
const isDraggingItem = dragOverPulse;
</script>

<style scoped lang="scss">
.taintedgrail {
  container-type: inline-size;
  max-width: 1024px;
  min-width: 1024px;
  min-height: 700px;
  max-height: 700px;
  width: 100%;
  margin: 0;
  overflow-x: hidden;

  .dragOverlay {
    background-color: rgba(0, 0, 0, 0.6);
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;

    &__text {
      background-color: lightgrey;
      color: black;
      border-radius: 0.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      text-align: center;
      padding: 1rem;
      max-width: 80%;
      z-index: 1000;
    }
  }
}
.header {
  margin-bottom: 0.5rem;

  .campaignId {
    display: flex;
    align-items: center;
    font-weight: 600;
  }

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
        color: var(--taintedgrail-primary);
        font-weight: 600;
        text-decoration: underline;
        border-color: var(--taintedgrail-primary);
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
