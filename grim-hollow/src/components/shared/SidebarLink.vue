<template>
  <button :class="componentClass" @click.prevent="openSidebar" type="button">
    <SvgIcon :icon="label" v-if="display && display === 'icon'" />
    <template v-else>{{ label }}</template>
  </button>
</template>

<script setup lang="ts">
import { useSidebar } from '../sidebars/useSidebar';
import { computed } from 'vue';

import FeatureSidebar from '../sidebars/FeatureSidebar.vue';
import ActionSidebar from '../sidebars/ActionSidebar.vue';
import EquipmentSidebar from '../sidebars/EquipmentSidebar.vue';
import ClassesSidebar from '../sidebars/ClassesSidebar.vue';
import ArmorClassSidebar from '../sidebars/ArmorClassSidebar.vue';
import HitPointsSidebar from '../sidebars/HitPointsSidebar.vue';
import SpeedSidebar from '../sidebars/SpeedSidebar.vue';
import CurrencySidebar from '../sidebars/CurrencySidebar.vue';
import ResourceSidebar from '../sidebars/ResourceSidebar.vue';
import SkillSidebar from '../sidebars/SkillSidebar.vue';
import SpellSidebar from '../sidebars/SpellSidebar.vue';
import AbilitySidebar from '../sidebars/AbilitySidebar.vue';
import DamageHealSidebar from '../sidebars/DamageHealSidebar.vue';
import SvgIcon from './SvgIcon.vue';
import CompanionSidebar from '../sidebars/CompanionsSidebar.vue';
import DefensesSidebar from '../sidebars/DefensesSidebar.vue';
import OtherProficienciesSidebar from '../sidebars/OtherProficienciesSidebar.vue';
import AttunementSidebar from '../sidebars/AttunementSidebar.vue';
import ConditionsSidebar from '../sidebars/ConditionsSidebar.vue';
import SensesSidebar from '../sidebars/SensesSidebar.vue';
import HitDiceSidebar from '../sidebars/HitDiceSidebar.vue';
import SpellSlotsSidebar from '../sidebars/SpellSlotsSidebar.vue';
import AncestrySidebar from '../sidebars/AncestrySidebar.vue';
import EffectSidebar from '../sidebars/EffectSidebar.vue';
import BackgroundSidebar from '../sidebars/BackgroundSidebar.vue';
import TransformationSidebar from '../sidebars/TransformationSidebar.vue';
const sidebarRegistry = {
  FeatureSidebar,
  ActionSidebar,
  EquipmentSidebar,
  ClassesSidebar,
  ArmorClassSidebar,
  HitPointsSidebar,
  SpeedSidebar,
  CurrencySidebar,
  ResourceSidebar,
  SkillSidebar,
  SpellSidebar,
  AbilitySidebar,
  DamageHealSidebar,
  CompanionSidebar,
  DefensesSidebar,
  OtherProficienciesSidebar,
  AttunementSidebar,
  ConditionsSidebar,
  SensesSidebar,
  HitDiceSidebar,
  SpellSlotsSidebar,
  AncestrySidebar,
  EffectSidebar,
  BackgroundSidebar,
  TransformationSidebar,
};
type SidebarComponent = keyof typeof sidebarRegistry;

const props = defineProps<{
  componentName: SidebarComponent;
  props?: Record<string, any>;
  options?: {
    title?: string;
    hasSave?: boolean;
    hasDelete?: boolean;
    hasAdd?: boolean;
    addLabel?: string;
    hasSum?: boolean;
    sumLabel?: string;
    hasSubtract?: boolean;
    subtractLabel?: string;
    hasClose?: boolean;
  };
  label: string;
  display?: 'text' | 'button' | 'icon';
  onBeforeOpen?: () => Record<string, any>;
}>();

const { open } = useSidebar();

const componentClass = computed(() => {
  return ['sidebar-link', props.display ? `sidebar-link--${props.display}` : 'sidebar-link--text'];
});

const openSidebar = () => {
  const componentToOpen = sidebarRegistry[props.componentName];
  if (componentToOpen) {
    let dynamicProps = {};
    if (props.onBeforeOpen) {
      dynamicProps = props.onBeforeOpen();
    }

    const finalProps = { ...props.props, ...dynamicProps };

    open(componentToOpen, finalProps, props.options);
  } else {
    console.error(
      `SidebarLink Error: Component with name "${props.componentName}" not found in the registry.`,
    );
  }
};

defineExpose({
  openSidebar
});
</script>

<style lang="scss" scoped>
.sidebar-link {
  &--button {
    padding: 5px;
    border: 1px solid black;
    border-radius: 5px;
    font-family: var(--font-family);
  }
  &--text {
    display: inline;
    min-width: auto !important;
    font-family: var(--font-family);
    &:hover {
      text-decoration: underline;
    }
  }
  .svg-icon {
    width: 100%;
    height: 100%;
  }
}
</style>
