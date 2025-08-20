<template>
  <div class="section tab-section">
    <div class="section__body">
      <!-- Tab Navigation -->
      <div class="tab-nav" ref="tabNav">
        <button 
          v-for="(tab, index) in tabs" 
          :key="tab.id"
          :class="['tab-btn', { active: activeTab === tab.id }]"
          @click="setActiveTab(tab.id, index)"
          :ref="el => tabButtons[index] = el"
        >
          <span class="tab-label">{{ tab.label }}</span>
        </button>
        <div class="sliding-border" :style="slidingBorderStyle"></div>
      </div>

      <!-- Tab Content -->
      <div class="tab-content">
        <DomainsTab v-if="activeTab === 'domains'" />
        <CombatTab v-else-if="activeTab === 'combat'" />
        <MagicTab v-else-if="activeTab === 'magic'" />
        <AscensionTab v-else-if="activeTab === 'ascension'" />
        <InventoryTab v-else-if="activeTab === 'inventory'" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, nextTick, onMounted } from 'vue';
import DomainsTab from './tabs/DomainsTab.vue';
import CombatTab from './tabs/CombatTab.vue';
import MagicTab from './tabs/MagicTab.vue';
import AscensionTab from './tabs/AscensionTab.vue';
import InventoryTab from './tabs/InventoryTab.vue';

const activeTab = ref('domains');
const tabNav = ref(null);
const tabButtons = ref([]);

const slidingBorderStyle = reactive({
  left: '0px',
  width: '0px'
});

const tabs = [
  { id: 'domains', label: 'Domains' },
  { id: 'combat', label: 'Combat' },
  { id: 'magic', label: 'Magic' },
  { id: 'ascension', label: 'Ascension' },
  { id: 'inventory', label: 'Inventory' }
];

const updateSlidingBorder = (index) => {
  const button = tabButtons.value[index];
  if (button) {
    slidingBorderStyle.left = `${button.offsetLeft}px`;
    slidingBorderStyle.width = `${button.offsetWidth}px`;
  }
};

const setActiveTab = (tabId, index) => {
  activeTab.value = tabId;
  nextTick(() => {
    updateSlidingBorder(index);
  });
};

onMounted(() => {
  nextTick(() => {
    updateSlidingBorder(0);
  });
});
</script>

<style scoped lang="scss">
.tab-section {
  .section__body {
    padding: 0;
  }
}

.tab-nav {
  display: flex;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  position: relative;
  
  .tab-btn {
    flex: 1;
    padding: 0.75rem 1rem;
    border: none;
    cursor: pointer;
    font-weight: 600;
    transition: text-shadow 0.2s;
    position: relative;
    background: transparent;
    
    &:last-child {
      border-right: none;
    }
    
    &:hover .tab-label {
      text-shadow: 0 0 8px #ff0000;
    }

    .tab-label {
      display: inline-block;
      transition: text-shadow 0.2s;
    }
  }
  
  .sliding-border {
    position: absolute;
    bottom: -1px;
    height: 2px;
    background-color: #782e22;
    transition: left 0.3s ease, width 0.3s ease;
    z-index: 1;
  }
}

.tab-content {
  padding: 1rem;
  max-height: 320px;
  overflow-y: auto;
  overflow-x: hidden;
  
  .placeholder {
    text-align: center;
    color: #666;
    font-style: italic;
    padding: 2rem;
  }
}
</style>
