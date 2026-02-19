<template>
  <div class="section effects-section">
    <div class="section__header">
      <h3>{{ $t('titles.active-effects') }}</h3>
    </div>
    <div class="list">
      <div
        v-for="effectParent in effectsStore.visibleEffects.sort((a, b) => a.label.localeCompare(b.label))"
        :key="effectParent._id"
        class="effects-group"
        :class="{ 'effects-group--disabled': !effectParent.enabled }"
      >
        <div class="effects-group__toggle-wrap">
          <ToggleSwitch v-model="effectParent.enabled" :disabled="false" class="toggle-switch--small"/>
          <SidebarLink
            componentName="EffectSidebar"
            :props="{ effect: effectParent }"
            :options="{
              title: $t('actions.edit-effect'),
              hasSave: true,
              hasDelete: effectParent.removable,
            }"
            display="text"
            :label="effectParent.label"
          />
        </div>
        <div v-if="effectParent.enabled && Array.isArray(effectParent.pickers) && effectParent.pickers.length > 0" class="pickers">
          <div v-for="(picker, index) in effectParent.pickers" :key="index" class="picker">
            <label>
              {{ picker.label }}
              <select :class="{'picker-unselected': !picker.value}" v-model="picker.value">
                <option :value="undefined">Choose...</option>
                <option v-for="option in picker.options" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </label>
          </div>
        </div>
      </div>
    </div>
  </div>    
</template>

<script setup lang="ts">

import {
  useEffectsStore
} from '@/sheet/stores/modifiers/modifiersStore';

import ToggleSwitch from '../shared/ToggleSwitch.vue';
import SidebarLink from '../shared/SidebarLink.vue';

const effectsStore = useEffectsStore();
</script>

<style lang="scss" scoped>
.effects-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  .list {
    > * { padding: 0.25rem 0 };
    > *:first-child { padding-top: 0 };
    > *:last-child { padding-bottom: 0 };
  }
}
.effects-group__toggle-wrap {
  display: grid;
  grid-template-columns: min-content 1fr;
  gap: 10px;
  .sidebar-link {
    text-align: left;
  }
}
.effects-group {
  &:not(:last-of-type) {
    margin-bottom: 5px;
  }
}
</style>
