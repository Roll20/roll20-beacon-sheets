<template>
  <header class="pc-header">
    <div class="pc-header__resource-display">
      Momentum: {{ gmStore.resources.momentum }}
    </div>
    <div class="pc-header__resource-display">
      Threat: {{ gmStore.resources.threat }}
    </div>
    <SwitchGroup>
      <SwitchLabel>
        {{ editing ? "Edit Mode:": "View Mode:" }}
      </SwitchLabel>
      <Switch 
        v-model="editing"
        class="switch"
        :class="editing ? 'switch--enabled': ''"
        >
        <span 
        class="switch__handle"
        :class="editing ? 'switch__handle--enabled': ''"
        ></span>
      </Switch>
    </SwitchGroup>
  </header>

</template>

<script setup lang="ts">
import { useGMStore } from '@/sheet/stores/gmStore/gmStore';
import { useUIStore } from '@/sheet/stores/uiStore/uiStore';
import { Switch, SwitchGroup, SwitchLabel } from "@headlessui/vue";
import { computed } from 'vue';

const gmStore = useGMStore();
const uiStore = useUIStore();

const editing = computed({
  get: () => uiStore.editMode,
  set: (newValue) => uiStore.editMode = newValue 
})

</script>

<style lang="scss">
  @use "../../common/scss/vars";
  .pc-header {
    display: flex;
    gap: 8px;
  }
</style>