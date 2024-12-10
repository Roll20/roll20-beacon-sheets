<template>
    <div style="width: 100%;gap: 10px;display: flex;flex-direction: column;">
        <div class="section-card">  
            <div class="config-container">
                <button type="button" class="config-btn age-icon-btn" @click="openSidebar">
                    <font-awesome-icon :icon="['fa', 'circle-info']" />
                </button>
            </div>
            <h1 class="age-section-header">
                Attacks & Gear
            </h1>
            <div>
                <ul class="nav nav-tabs age-tabs-container">
                    <li class="nav-item age-tab" role="presentation">
                        <button class="nav-link active" id="combat" data-bs-toggle="tab" data-bs-target="#combat-pane" type="button" role="tab" aria-controls="combat-pane" aria-selected="true">
                            <div class="age-tab-icon age-combat-melee-icon"></div>
                            <span class="age-tab-label">Combat</span>                                
                        </button>
                    </li>
                    <li class="nav-item age-tab" role="presentation" v-if="settings.showArcana">
                        <button class="nav-link" id="spells" data-bs-toggle="tab" data-bs-target="#spells-pane" type="button" role="tab" aria-controls="spells-pane" aria-selected="false">
                            <div class="age-tab-icon age-spells-magic-icon"></div>
                            <span class="age-tab-label" v-if="settings.gameSystem === 'mage'">Powers</span>
                            <span class="age-tab-label" v-else>Arcana</span>
                        </button>
                    </li>
                    <li class="nav-item age-tab" role="presentation">
                        <button class="nav-link" id="inventory" data-bs-toggle="tab" data-bs-target="#inventory-pane" type="button" role="tab" aria-controls="inventory-pane" aria-selected="false">
                            <div class="age-tab-icon age-inventory-icon"></div>
                            <span class="age-tab-label">Inventory</span>                                
                        </button>
                    </li>
                    <li class="nav-item age-tab" role="presentation" v-if="settings.showCybernetics">
                        <button class="nav-link" id="inventory" data-bs-toggle="tab" data-bs-target="#augmentations-pane" type="button" role="tab" aria-controls="augmentations-pane" aria-selected="false">
                            <div class="age-tab-icon age-augmentations-icon"></div>
                            <span class="age-tab-label" v-if="settings.cyberpunk">Augmentations</span>                                
                            <span class="age-tab-label" v-if="settings.technofantasy">Cybernetics</span>                                
                        </button>
                    </li>
                </ul>
                            </div>       
                            <!-- <div class="accordion age-activity-accordon">
                            <div class="accordion-item age-activity-accordon-row">
                                <div class="accordion-header">
                            <div class="age-label-heading age-action-header">
                                <ul class="nav nav-tabs" style="flex-wrap: nowrap;border-bottom:none;">
                                    <li class="nav-item age-tab" role="presentation">
                                        <button class="nav-link active" id="combat" data-bs-toggle="tab" data-bs-target="#combat-pane" type="button" role="tab" aria-controls="combat-pane" aria-selected="true">
                                            <div class="age-tab-icon age-combat-melee-icon"></div>
                                            <span>Combat</span>                                
                                        </button>
                                    </li>
                                    <li class="nav-item age-tab" role="presentation" v-if="settings.showArcana">
                                        <button class="nav-link" id="spells" data-bs-toggle="tab" data-bs-target="#spells-pane" type="button" role="tab" aria-controls="spells-pane" aria-selected="false">
                                            <div class="age-tab-icon age-spells-magic-icon"></div>
                                            <span v-if="settings.gameSystem === 'mage'">Powers</span>
                                            <span v-else>Arcana</span>
                                        </button>
                                    </li>
                                    <li class="nav-item age-tab" role="presentation">
                                        <button class="nav-link" id="inventory" data-bs-toggle="tab" data-bs-target="#inventory-pane" type="button" role="tab" aria-controls="inventory-pane" aria-selected="false">
                                            <div class="age-tab-icon age-inventory-icon"></div>
                                            <span>Inventory</span>                                
                                        </button>
                                    </li>
                                    <li class="nav-item age-tab" role="presentation" v-if="settings.cyberpunk">
                                        <button class="nav-link" id="inventory" data-bs-toggle="tab" data-bs-target="#augmentations-pane" type="button" role="tab" aria-controls="augmentations-pane" aria-selected="false">
                                            <div class="age-tab-icon age-augmentations-icon"></div>
                                            <span>Augmentations</span>                                
                                        </button>
                                    </li>
                                </ul>
                                <button class="accordion-button age-expand-btn" type="button" data-bs-toggle="collapse" :data-bs-target="'#primaryBlock'"  aria-expanded="true" aria-controls="collapseOne"></button>
                            </div>
                            </div>
                            </div>
                            </div> -->
                            <div :id="'primaryBlock'" class="accordion-collapse age-accordion-collapse collapse show" data-bs-parent="#age-spell-accordion">
                                <div class="accordion-body">
                                    <div class="age-label-content age-action-content">
                                        <div class="age-content">
                                            <div class="tab-content" id="myTabContent">
                                            <div class="tab-pane fade show active" id="combat-pane" role="tabpanel" aria-labelledby="combat" tabindex="0">
                                                <AttackSection
                                                :aim="settings.aim"
                                                :aimValue="settings.aimValue"
                                                :aimOption="settings.aimToggle" />
                                            </div>
                                            <div class="tab-pane fade" id="spells-pane" role="tabpanel" aria-labelledby="spells" tabindex="0">
                                                <MagicSection
                                                :aim="settings.aim"
                                                :aimValue="settings.aimValue"
                                                :aimOption="settings.aimToggle" />  
                                            </div>
                                            <div class="tab-pane fade" id="inventory-pane" role="tabpanel" aria-labelledby="inventory" tabindex="0">
                                                <InventorySection />
                                            </div>
                                            <div class="tab-pane fade" id="augmentations-pane" role="tabpanel" aria-labelledby="augmentations" tabindex="0">
                                                Augmentations
                                            </div>
                                        </div>                     
                                    </div>
                                    </div>
                                </div>
                            </div>
                            
                    </div>
    </div>

    <Teleport to="body">
        <SidebarSection ref="sidebarRef" :className="'age-side-info'">
        <h2>Attacks & Gear Info</h2>
        <ul class="age-sidebar-list">
            <li v-for="(act,index) in filteredSections" :key="index">
                <span class="age-sidebar-list__title">{{ act.label }}</span>
                <span v-html="act.description"></span>
            </li>        
        </ul>
        </SidebarSection>
    </Teleport>
</template>
<script setup>
import { computed, ref } from 'vue';
import { useSettingsStore } from '@/sheet/stores/settings/settingsStore';
import AttackSection from '@/components/attack/AttackSection.vue';
import MagicSection from '@/components/magic/MagicSection.vue';
import InventorySection from '@/components/inventory/InventorySection.vue';
import SidebarSection from '@/components/SidebarSection.vue';
import { attackGearList } from '@/system/attackGear';

const settings = useSettingsStore();
const gameSystem = ref('fage')
switch(settings.gameSystem){
  case 'fage1e':
  case 'fage2e':
    gameSystem.value = 'fage';
  break;
  case 'mage':
    gameSystem.value = 'mage';
  break;
}
const filteredSections = computed(() => {
  return attackGearList.filter(section => {
    if (gameSystem.value === 'fage' && settings.showArcana) {
      return ['Combat', 'Arcana', 'Inventory'].includes(section.label);
    } else if (gameSystem.value === 'fage' && !settings.showArcana) {
      return ['Combat', 'Inventory'].includes(section.label);
    } else if (gameSystem.value === 'mage' && settings.showArcana) {
      return ['Combat', 'Powers', 'Inventory'].includes(section.label);
    } else if (gameSystem.value === 'mage' && !settings.showArcana) {
      return ['Combat', 'Inventory'].includes(section.label);
    }
    return false;
  });
});

// Reference to the SlidingSidebar component
const sidebarRef = ref(null);

// Method to open the sidebar by calling the component's method
const openSidebar = () => {
  sidebarRef.value?.openSidebar(); // Optional chaining ensures sidebarRef is defined
};
</script>