<template>
    <div style="width: 100%;gap: 10px;display: flex;flex-direction: column;">
        <div class="section-card">
            <div class="config-container">
                <button type="button" class="config-btn age-icon-btn" @click="openSidebar">
                    <font-awesome-icon :icon="['fa', 'circle-info']" />
                </button>
            </div>
            <h1 class="age-section-header">
                Skills & History
            </h1>  
            <ul class="nav nav-tabs age-tabs-container">
            
            <li class="nav-item age-tab" role="presentation">
                <button class="nav-link active" id="spells" data-bs-toggle="tab" data-bs-target="#talents-pane" type="button" role="tab" aria-controls="talents-pane" aria-selected="false">
                    <div class="age-tab-icon age-talents-focus-spec-icon"></div>
                    <span class="age-tab-label">Skills</span>                                
                </button>
            </li>
            <li class="nav-item age-tab" role="presentation">
                <button class="nav-link" id="spells" data-bs-toggle="tab" data-bs-target="#expertise-pane" type="button" role="tab" aria-controls="expertise-pane" aria-selected="false">
                    <div class="age-tab-icon age-expertise-icon"></div>
                    <span class="age-tab-label">Expertise</span>                                
                </button>
            </li>
            <li class="nav-item age-tab" role="presentation">
                <button class="nav-link" id="biography" data-bs-toggle="tab" data-bs-target="#biography-pane" type="button" role="tab" aria-controls="biography-pane" aria-selected="false">
                    <div class="age-tab-icon age-bio-icon"></div>
                    <span class="age-tab-label">Biography</span>                                
                </button>
            </li>
            </ul>
                        <div class="accordion age-activity-accordon">
                            <div :id="'secondaryBlock'" class="accordion-collapse age-accordion-collapse collapse show" data-bs-parent="#age-spell-accordion">
                                <div style="padding: 6px;width: min-content;min-width: 100%;">
                            <div class="age-label-content age-action-content">
                                <div class="age-content">
                                    <div class="tab-content" id="myTabContent">
                                   
                                    <div class="tab-pane fade  show active" id="talents-pane" role="tabpanel" aria-labelledby="spells" tabindex="0">
                                
                                         <QualityClassSection />
                                    </div>
                                    <div class="tab-pane fade" id="expertise-pane" role="tabpanel" aria-labelledby="inventory" tabindex="0">
                                        <QualityTalentSection />

                                    </div>
                                    <div class="tab-pane fade" id="biography-pane" role="tabpanel" aria-labelledby="biography" tabindex="0">
                                        <BackgroundView />
                                    </div>
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
            <h2>Skills & History Info</h2>
        <ul class="age-sidebar-list">
            <li v-for="(act,index) in skillHistoryList" :key="index">
                <span class="age-sidebar-list__title">{{ act.label }}</span>
                <span v-html="act.description"></span>
            </li>        
        </ul>
        </SidebarSection>
    </Teleport>
</template>
<script setup>
import { ref } from 'vue';
import { useSettingsStore } from '@/sheet/stores/settings/settingsStore';
import QualityClassSection from '@/components/qualities/QualitiesClassSection.vue';
import QualityTalentSection from '@/components/qualities/QualitiesTalentSection.vue';
import BackgroundView from '@/components/BackgroundView.vue';
import SidebarSection from '@/components/SidebarSection.vue';
import {skillHistoryList} from '@/system/skillHistory';
const settings = useSettingsStore();
// Reference to the SlidingSidebar component
const sidebarRef = ref(null);

// Method to open the sidebar by calling the component's method
const openSidebar = () => {
  sidebarRef.value?.openSidebar(); // Optional chaining ensures sidebarRef is defined
};
</script>