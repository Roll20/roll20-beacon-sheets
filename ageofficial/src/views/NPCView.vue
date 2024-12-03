<template>
    <main class="npc-sheet-wrapper">
            <section class="header-section">
                <div class="section-card">
                    <BioSection />
                    <div class="age-stats">
                        <HPView />
                        <MPView />
                    </div>                   
                </div>
            </section>
        <section>
            <div class="section-card">     
                <AbilitiesView />
            </div>
        </section>
        <section>
            <div class="npc-sheet-wrapper">
                <ActionsView />
            </div>
        </section>
        <section>
                <div class="section-card">
                    <AttackSection
                            :aim="settings.aim"
                            :aimValue="settings.aimValue" />
                            <MagicSection
                            :aim="settings.aim"
                            :aimValue="settings.aimValue" />  
                            <TalentSection />   
                            <InventorySection />
                                

                  
                    </div>
                
            </section> 
    </main>
</template>
<script setup>
import { ref } from 'vue';
import { useMetaStore } from '@/sheet/stores/meta/metaStore';
import { useBioStore } from '@/sheet/stores/bio/bioStore';
import { useCharacterStore } from '@/sheet/stores/character/characterStore';
import BioSection from '@/components/character/BioSection.vue';
import AbilitiesView from '@/components/abilities/AbilitiesView.vue';
import HPView from '@/components/HPView.vue';
import MPView from '@/components/MPView.vue';
import AttackSection from '@/components/attack/AttackSection.vue';
import ActionsView from '@/components/ActionsView.vue';
import InventorySection from '@/components/inventory/InventorySection.vue';
import { useSettingsStore } from '@/sheet/stores/settings/settingsStore';
import MagicSection from '@/components/magic/MagicSection.vue';
import CurrencyView from '@/components/resources/CurrencyView.vue';

const settings = useSettingsStore();
const meta = useMetaStore();
const bio = useBioStore();
const char = useCharacterStore();

</script>