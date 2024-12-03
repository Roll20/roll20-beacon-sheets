<template>
        <div class="age-sheet">
            <div class="player-sheet-wrapper">
                <section class="header-section">
                    <div class="section-card">  
                        <BioSection />
                        <div class="bio-sub-section">
                            <div>
                                <HPView />
                            </div>
                            <div>
                                <MPView />
                            </div>
                            <div>
                                <StuntPointsView />                                
                            </div>
                        </div>                   
                    </div>
                    <div class="section-card">    
                        <AbilitiesView />
                    </div>                        
                </section>
                <section class="age-action-con-section">
                    <DefenseView
                    :guard="settings.guard"
                    :guardValue="settings.guardValue"
                    :guardOption="settings.guardToggle"
                    />  
                    <MovementView
                    :guard="settings.guard"
                    :guardValue="settings.guardValue"
                    :guardOption="settings.guardToggle"
                    /> 
                    
                    
                    <div class="age-conditions-main">
                        <ActionsView
                    :guard="settings.guard"
                    :guardValue="settings.guardValue"
                    :guardOption="settings.guardToggle"
                    />  
                    </div>
                    <div class="age-conditions-main">
                        <ConditionsView />                    
                    </div>                  
                    <div class="section-card" v-if="settings.showXP" >
                        <h1 class="age-section-header">
                            Experience
                        </h1>
                        <div class="config-container">
                            <button type="button" class="config-btn age-icon-btn"  @click="showModal = true">
                            <font-awesome-icon :icon="['fa', 'gear']" />
                            </button>
                        </div>    
                        <div>
                            <input type="number" v-model="char.xp" style="background: none;border: none;height: 100%;font-weight: bold;width: 90%;color: #000;font-size: 1.5rem;padding:5px 10px;" />
                        </div>
                    </div>
                </section>  
            
                <section class="age-combat-skill-section">
                    <div style="display:flex;gap: 10px;flex-direction: column;">
                        <CombatTabsView />

                        <div class="age-conditions-secondary">
                            <ActionsView
                                :guard="settings.guard"
                                :guardValue="settings.guardValue"
                                :guardOption="settings.guardToggle"
                                />  
                        </div>
                        <div class="age-conditions-secondary">
                            <ConditionsView />                    
                        </div> 
                    </div>
                    <QualitiesTabsView />                                           
                </section>             
            </div>  
        </div>  
    <Teleport to="body">
      <XPSection v-if="showModal" :show="showModal" @close="showModal = false">
      <template #header>
          <h3 class="age-attack-details-header">Experience</h3>
      </template>
    </XPSection>
  </Teleport>
</template>
<script setup>
import { ref } from 'vue';
import { useMetaStore } from '@/sheet/stores/meta/metaStore';
import { useBioStore } from '@/sheet/stores/bio/bioStore';
import { useCharacterStore } from '@/sheet/stores/character/characterStore';
import BioSection from '@/components/character/BioSection.vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import AbilitiesView from '@/components/abilities/AbilitiesView.vue';
import HPView from '@/components/HPView.vue';
import MPView from '@/components/MPView.vue';
import AttackSection from '@/components/attack/AttackSection.vue';
import ConditionsView from '@/components/conditions/ConditionsView.vue';
import ActionsView from '@/components/ActionsView.vue';
import BackgroundView from '@/components/BackgroundView.vue';
import InventorySection from '@/components/inventory/InventorySection.vue';
import { useSettingsStore } from '@/sheet/stores/settings/settingsStore';
import MagicSection from '@/components/magic/MagicSection.vue';
import XPSection from '@/components/XPSection.vue';
import QualitySection from '@/components/qualities/QualitiesSection.vue';
import QualityClassSection from '@/components/qualities/QualitiesClassSection.vue';
import QualityTalentSection from '@/components/qualities/QualitiesTalentSection.vue';
import DefenseView from '@/components/DefenseView.vue';
import MovementView from '@/components/MovementView.vue';
import StuntPointsView from '@/components/StuntPointsView.vue';
import CombatTabsView from '@/components/tabs/CombatTabsView.vue';
import QualitiesTabsView from '@/components/tabs/QualitiesTabsView.vue';
const settings = useSettingsStore();
const meta = useMetaStore();
const bio = useBioStore();
const char = useCharacterStore();

const showModal = ref(false)

</script>