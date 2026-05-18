<template>
    <div style="width: 100%;gap: 10px;display: flex;flex-direction: column;">
        <div class="section-card">            
            <div>
                <ul class="nav nav-tabs age-tabs-container">
                    <li class="nav-item age-tab" role="presentation">
                        <button class="nav-link active" id="combat" data-bs-toggle="tab" data-bs-target="#combat-pane" type="button" role="tab" aria-controls="combat-pane" aria-selected="true">
                            <div class="age-tab-icon age-ship-weapons-icon"></div>
                            <span class="age-tab-label">Weapons</span>                                
                        </button>
                    </li>
                    <li class="nav-item age-tab" role="presentation">
                        <button class="nav-link" id="spells" data-bs-toggle="tab" data-bs-target="#spells-pane" type="button" role="tab" aria-controls="spells-pane" aria-selected="false">
                            <div class="age-tab-icon age-ship-crew-icon"></div>
                            <span class="age-tab-label">Crew</span>
                        </button>
                    </li>
                    <li class="nav-item age-tab" role="presentation">
                        <button class="nav-link" id="inventory" data-bs-toggle="tab" data-bs-target="#inventory-pane" type="button" role="tab" aria-controls="inventory-pane" aria-selected="false">
                            <div class="age-tab-icon age-ship-details-icon"></div>
                            <span class="age-tab-label">Details</span>                                
                        </button>
                    </li>
                </ul>
            </div>  
            <!-- <div :id="'primaryBlock'" class="accordion-collapse age-accordion-collapse collapse show" data-bs-parent="#age-spell-accordion"> -->
              <div>
                <!-- <div class="accordion-body"> -->
                    <div class="age-label-content age-action-content">
                        <div class="age-content">
                            <div class="tab-content" id="myTabContent">
                            <div class="tab-pane fade show active" id="combat-pane" role="tabpanel" aria-labelledby="combat" tabindex="0">
                               <ShipWeaponsSection />
                            </div>
                            <div class="tab-pane fade" id="spells-pane" role="tabpanel" aria-labelledby="spells" tabindex="0">
                              <ShipCrewSection />
                            </div>
                            <div class="tab-pane fade" id="inventory-pane" role="tabpanel" aria-labelledby="inventory" tabindex="0">
                              <ShipQFSection />
                            </div>
                        </div>                     
                    <!-- </div> -->
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
import SidebarSection from '@/components/SidebarSection.vue';
import { attackGearList } from '@/system/attackGear';
import ShipCrewSection from '../ship/ShipCrewSection.vue';
import ShipWeaponsSection from '../ship/ShipWeaponsSection.vue';
import ShipQFSection from '../ship/ShipQFSection.vue';
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