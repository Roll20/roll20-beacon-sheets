<template>
  <div class="star-trek-adventures-2e">
    <div class="header">
      <div class="section__body tabs">
        <router-link :to="{ name: 'gm' }">
          GM Tab
        </router-link>
        <router-link :to="{ name: 'pc' }">
          PC Tab
        </router-link>
        <div
          v-if="campaignId"
          class="campaignId"
        >
          Campaign ID: {{ campaignId }}
        </div>
      </div>
    </div>
    <router-view v-slot="{ Component }">
      <transition name="fade">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<script setup>
import { useStarTrekStore } from './sheet/stores';

const store = useStarTrekStore();
const campaignId = store.meta.campaignId;
</script>

<style lang="scss">
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
        color: var(--primary-border-color);
        font-weight: 600;
        text-decoration: underline;
        border-color: var(--primary-text-color);
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
