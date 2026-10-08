<template>
  <main
    :class="{ 'character-broken': sheet.combat.health === 0 }"
    class="max-w-[1440px] mx-auto p-4 md:p-8 flex flex-col gap-8 font-lexend bg-background text-on-background selection:bg-secondary-container selection:text-on-secondary-container"
  > 
    <div class="logo flex align-center justify-center relative z-2">
      <SheetLogo class="pointer-events-none w-50" />
    </div>
    
    <template v-if="lg">
      <div class="grid grid-cols-2 gap-8 relative z-2">
        
        <div class="flex flex-col gap-8">
          <IdentitySection class="identity-section w-[130%]!" />
          
          <ActionsSection
            class="actions-section"
            @add-action="handleAddAction"
            @edit-action="handleEditAction"
          />
          <TalentsSection
            @add-feature="handleAddFeature"
            @edit-feature="openEditModal"
          />
          
          <GearSection
            class="gear-section"
            @add-gear="handleAddGear"
            @edit-gear="handleEditGear"
          />
        </div>

        
        <div class="flex flex-col gap-8">
          <VitalStatsSection class="vital-stats-section w-[70%] self-end min-h-[543px]" />
          
          <PowersSection
            class="powers-section"
            @add-power="handleAddPower"
            @edit-power="handleEditPower"
          />
          
          <BiographySection
            class="biography-section"
            @add-feature="handleAddFeature"
            @edit-feature="openEditModal"
          />
          
          <TeamSection />
        </div>
      </div>
    </template>

    <!-- Mobile/Tablet Layout (stacked) -->
    <template v-else>
      
      <div class="grid grid-cols-1 gap-8 relative z-2">
        <IdentitySection class="identity-section" />
        <VitalStatsSection class="vital-stats-section" />
      </div>

      <div class="grid grid-cols-1 gap-8">
        
        <ActionsSection
          class="actions-section relative z-2"
          @add-action="handleAddAction"
          @edit-action="handleEditAction"
        />

        
        <PowersSection
          class="powers-section relative z-2"
          @add-power="handleAddPower"
          @edit-power="handleEditPower"
        />
      </div>
      <div class="grid grid-cols-1 gap-8">
        <TalentsSection
          class="relative z-2"
          @add-feature="handleAddFeature"
          @edit-feature="openEditModal"
        />
        
        <GearSection
          class="gear-section relative z-2"
          @add-gear="handleAddGear"
          @edit-gear="handleEditGear"
        />
        
        <BiographySection
          class="biography-section relative z-2"
          @add-feature="handleAddFeature"
          @edit-feature="openEditModal"
        />
        
        <TeamSection class="relative z-2" />
      </div>
    </template>

    <!-- Footer Stats Cards Section -->
    <!-- <FooterStatsSection class="footer-stats-section relative z-2" /> -->

    <!-- Developer & Sandbox Debug Panel -->
    <SandboxSection class="sandbox-section relative z-2" v-if="cheatMode"/>

    <!-- Edit Feature Modal -->
    <EditFeatureModal
      :show="isEditModalOpen"
      :feature="editingFeature"
      :isNew="isNewFeature"
      @close="isEditModalOpen = false"
      @save="handleSaveFeature"
      @delete="handleDeleteFeature"
    />

    <!-- Edit Action Modal -->
    <EditActionModal
      :show="isActionModalOpen"
      :action="editingAction"
      :isNew="isNewAction"
      @close="isActionModalOpen = false"
      @save="handleSaveAction"
      @delete="handleDeleteAction"
    />

    <!-- Edit Power Modal -->
    <EditPowerModal
      :show="isPowerModalOpen"
      :power="editingPower"
      :isNew="isNewPower"
      @close="isPowerModalOpen = false"
      @save="handleSavePower"
      @delete="handleDeletePower"
    />

    <!-- Edit Gear Modal -->
    <EditGearModal
      :show="isGearModalOpen"
      :gear="editingGear"
      :isNew="isNewGear"
      @close="isGearModalOpen = false"
      @save="handleSaveGear"
      @delete="handleDeleteGear"
    />
    <div class="background fixed z-1 top-0 left-0 w-full h-full object-cover pointer-events-none"></div>
  </main>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import { characterStore } from '@/sheet/stores';
import type { FeatureItem } from '@/schemas/hydrate/features';
import type { ActionItem } from '@/schemas/hydrate/actions';
import type { PowerItem } from '@/schemas/hydrate/powers';
import type { GearItem } from '@/schemas/hydrate/gear';

import IdentitySection from '@/sections/IdentitySection.vue';
import VitalStatsSection from '@/sections/VitalStatsSection.vue';
import PowersSection from '@/sections/PowersSection.vue';
import BiographySection from '@/sections/BiographySection.vue';
import ActionsSection from '@/sections/ActionsSection.vue';
import FooterStatsSection from '@/sections/FooterStatsSection.vue';
import SandboxSection from '@/sections/SandboxSection.vue';
import EditFeatureModal from '@/sections/EditFeatureModal.vue';
import EditActionModal from '@/sections/EditActionModal.vue';
import EditPowerModal from '@/sections/EditPowerModal.vue';
import GearSection from '@/sections/GearSection.vue';
import EditGearModal from '@/sections/EditGearModal.vue';
import TeamSection from '@/sections/TeamSection.vue';
import SheetLogo from '@/components/SheetLogo.vue';
import TalentsSection from '@/sections/TalentsSection.vue';
import { useBreakpoints } from '@/utility/useBreakpoints';

const { lg } = useBreakpoints();

const sheet = characterStore();

const isEditModalOpen = ref(false);
const editingFeature = ref<FeatureItem | null>(null);
const isNewFeature = ref(false);

const openEditModal = (feature: FeatureItem) => {
  isNewFeature.value = false;
  editingFeature.value = feature;
  isEditModalOpen.value = true;
};

const handleSaveFeature = (updatedFeature: FeatureItem) => {
  if (isNewFeature.value) {
    sheet.features.list.push(updatedFeature);
    isNewFeature.value = false;
  } else {
    const index = sheet.features.list.findIndex(f => f._id === updatedFeature._id);
    if (index !== -1) {
      sheet.features.list[index] = { ...updatedFeature };
    }
  }
  isEditModalOpen.value = false;
  editingFeature.value = null;
};

const handleAddFeature = () => {
  const newFeature: FeatureItem = {
    _id: uuidv4(),
    name: 'New Feature',
    type: 'talent',
    description: '',
    effects: { value: [] },
  };
  isNewFeature.value = true;
  editingFeature.value = newFeature;
  isEditModalOpen.value = true;
};

const handleDeleteFeature = (id: string) => {
  sheet.deleteEntity(id);
  isEditModalOpen.value = false;
  editingFeature.value = null;
};

const isActionModalOpen = ref(false);
const editingAction = ref<ActionItem | null>(null);
const isNewAction = ref(false);

const handleEditAction = (action: ActionItem) => {
  isNewAction.value = false;
  editingAction.value = action;
  isActionModalOpen.value = true;
};

const handleAddAction = (type: 'quick' | 'full') => {
  const newAction: ActionItem = {
    _id: uuidv4(),
    name: 'New Action',
    type,
    attributeUsed: '-',
    bonus: 0,
    range: '-',
    damage: '',
    description: '',
    specialFeatures: '',
    isDefault: false,
    isActive: true,
  };
  isNewAction.value = true;
  editingAction.value = newAction;
  isActionModalOpen.value = true;
};

const handleSaveAction = (updatedAction: ActionItem) => {
  if (isNewAction.value) {
    sheet.actions.list.push(updatedAction);
    isNewAction.value = false;
  } else {
    const index = sheet.actions.list.findIndex(a => a._id === updatedAction._id);
    if (index !== -1) {
      sheet.actions.list[index] = { ...updatedAction };
    }
  }
  isActionModalOpen.value = false;
  editingAction.value = null;
};

const handleDeleteAction = (id: string) => {
  sheet.deleteEntity(id);
  isActionModalOpen.value = false;
  editingAction.value = null;
};

const isPowerModalOpen = ref(false);
const editingPower = ref<PowerItem | null>(null);
const isNewPower = ref(false);

const handleEditPower = (power: PowerItem) => {
  isNewPower.value = false;
  editingPower.value = power;
  isPowerModalOpen.value = true;
};

const handleAddPower = () => {
  const newPower: PowerItem = {
    _id: uuidv4(),
    name: 'New Power',
    description: '',
    effects: { value: [] },
    modifiers: [],
  };
  isNewPower.value = true;
  editingPower.value = newPower;
  isPowerModalOpen.value = true;
};

const handleSavePower = (updatedPower: PowerItem) => {
  if (isNewPower.value) {
    sheet.powers.list.push(updatedPower);
    isNewPower.value = false;
  } else {
    const index = sheet.powers.list.findIndex(p => p._id === updatedPower._id);
    if (index !== -1) {
      sheet.powers.list[index] = { ...updatedPower };
    }
  }
  isPowerModalOpen.value = false;
  editingPower.value = null;
};

const handleDeletePower = (id: string) => {
  sheet.deleteEntity(id);
  isPowerModalOpen.value = false;
  editingPower.value = null;
};

const isGearModalOpen = ref(false);
const editingGear = ref<GearItem | null>(null);
const isNewGear = ref(false);

const handleEditGear = (gear: GearItem) => {
  isNewGear.value = false;
  editingGear.value = gear;
  isGearModalOpen.value = true;
};

const handleAddGear = () => {
  const newGear: GearItem = {
    _id: uuidv4(),
    name: 'New Gear',
    type: 'other',
    description: '',
    effects: { value: [] },
    isActive: true,
  };
  isNewGear.value = true;
  editingGear.value = newGear;
  isGearModalOpen.value = true;
};

const handleSaveGear = (updatedGear: GearItem) => {
  if (isNewGear.value) {
    sheet.gear.list.push(updatedGear);
    isNewGear.value = false;
  } else {
    const index = sheet.gear.list.findIndex(g => g._id === updatedGear._id);
    if (index !== -1) {
      sheet.gear.list[index] = { ...updatedGear };
    }
  }
  isGearModalOpen.value = false;
  editingGear.value = null;
};

const handleDeleteGear = (id: string) => {
  sheet.deleteEntity(id);
  isGearModalOpen.value = false;
  editingGear.value = null;
};

const cheatMode = ref(false);

const toggleCheatMode = () => {
  cheatMode.value = !cheatMode.value;
  console.log('[CheatMode] cheatMode toggled to:', cheatMode.value);
};

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.repeat) return;
  const isCtrlOrMeta = event.ctrlKey || event.metaKey;
  if (isCtrlOrMeta && event.code === 'Backquote') {
    event.preventDefault();
    toggleCheatMode();
  }
};

onMounted(() => {
  console.log('[CheatMode] Registering keydown listener on document');
  document.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown);
});
</script>

<style lang="scss" scoped>
@use '../common/scss/vars.scss' as vars;
</style>

<style lang="scss">

.character-broken {
  pointer-events: none !important;

  
  .vital-stats-panel {
    pointer-events: auto !important;
  }

  
  .identity-section,
  .powers-section,
  .biography-section,
  .actions-section,
  .gear-section,
  .footer-stats-section,
  .background,
  .logo,
  .sandbox-section {
    filter: grayscale(100%);
  }
}

.identity-section .class-indicator-dropdown,
.identity-section .bio-attributes-column,
.vital-stats-section .vital-stats-panel > div:first-child,
.vital-stats-section .vital-stats-top-item,
.powers-section,
.biography-section,
.actions-section,
.gear-section,
.footer-stats-section,
.sandbox-section {
  transition: filter 0.4s ease;
}

.background {
  background-image: url('@/assets/sheet_background_grayscale.png');
  background-size: cover;
  background-position: center;
  background-color: var(--color-secondary);
  background-blend-mode: hard-light;
  opacity: 0.5;
}
</style>
