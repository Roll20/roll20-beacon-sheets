<template>
    <div v-if="settings.showArcana">
        <div v-if="settings.userPowerFatigue" tabindex="0" style="position: relative;" @mouseenter="pfHover = true" @mouseleave="pfHover = false">
            <div class="age-pf-cntr">
                <div class="age-pf-label">{{ powerFatigueLabel }}</div>
                <div class="age-pf-details">
                    <div>
                        <button class="age-icon-btn" v-show="char.powerFatigue > 0 && pfHover" @click="char.resetPowerFatigue" v-tippy="{ content: 'Click to reset to No Fatigue'}">
                            <font-awesome-icon :icon="['fa', 'rotate']" />
                        </button>
                    </div>
                    
                    <div :class="'age-pf ' + powerFatigueClass"></div>
                    <div class="age-pf-manual-change" v-show="pfHover">
                        <button class="age-icon-btn-sm" :disabled="char.powerFatigue > 3" @click="char.powerFatigue++" v-tippy="{ content: 'Manually increase Power Fatigue'}">
                            <font-awesome-icon :icon="['fa', 'caret-up']" />
                        </button>
                        <button class="age-icon-btn-sm" :disabled="char.powerFatigue === 0" @click="char.powerFatigue--" v-tippy="{ content: 'Manually decrease Power Fatigue'}">
                            <font-awesome-icon :icon="['fa', 'caret-down']" />
                        </button>
                    </div>                    
                </div>
            </div>
            <h4 class="age-subsection-header" style="display: flex; align-items: center; justify-content: center; gap: 2px; flex-wrap: nowrap;">
                <span style="white-space: nowrap;">
                    Power Fatigue 
                </span>
                <button class="age-icon-btn"  v-if="pfHover" style="position:absolute; bottom: 0px; right: -15px;" @click="showPFTestModal = true;" v-tippy="{ content: 'Manually roll for Power Fatigue'}">
                    <font-awesome-icon :icon="['fa', 'dice']" />
                </button>
            </h4>
        </div>
        <div v-else>
            <div class="d-flex flex-column justify-content-between" style="height: 50px;" v-if="settings.gameSystem !== 'blue rose'">
                <div class="hpmp-container">
                    <div class="hpmp-current">
                        <input class="age-input"
                            type="number"
                            v-model="char.magic"
                            :max="char.magicMax"
                            :min="0"
                            autocomplete="off" />
                    </div>
                    <div>/</div>
                    <div class="hpmp-max">
                        {{ char.magicMax }}
                    </div>
                </div>        
                <div class="progress" role="progressbar" aria-label="Success example" 
                    v-bind:aria-valuenow="char.magic"
                    aria-valuemin="0"
                    v-bind:aria-valuemax="char.magicMax">
                    <div class="progress-bar" :class="{ 'bg-success':(char.magic / char.magicMax)*100 >= 50, 'bg-warning':(char.magic / char.magicMax)*100 < 50, 'bg-danger':(char.magic / char.magicMax)*100 < 25 }" v-bind:style="{ width: (char.magic / char.magicMax)*100 + '%'}"></div>
                </div>
            </div>  
            <div class="d-flex flex-column justify-content-between" style="height: 50px; padding: 0 20px;" v-if="settings.gameSystem === 'blue rose'">
                <div class="age-container-content">
                    <button class="age-icon-btn age-reset-btn" v-if="char.stunts > 0" @click="char.resetStunts" v-tippy="{ content: 'Click to reset stunt points to 0'}">
                        <font-awesome-icon :icon="['fa', 'rotate']" />
                    </button>
                    <input  class="age-input age-num-input" type="number" id="char.stunts" v-model="char.stunts" min="0"
                            autocomplete="off" />
                <!-- Additional corner elements -->
                    <div class="age-container-content-corner-top-right"></div>
                    <div class="age-container-content-corner-bottom-left"></div>
                </div>
            </div>
            <h4 class="age-subsection-header">
                {{settings.gameSystem === 'blue rose' ? 'Fatigue' : settings.gameSystem === 'mage' ? 'Power' : 'Magic'}}
            </h4>
        </div>        
    </div>
    <Teleport to="body">
        <!-- use the modal component, pass in the prop -->
        <PowerFatigueModalView v-if="showPFTestModal" :show="showPFTestModal" @close="showPFTestModal = false;" >
        <template #header>
            <h3 class="age-modal-details-header">Power Fatigue Test</h3>
        </template>
        </PowerFatigueModalView>
    </Teleport>
</template>
<script setup>
import { useCharacterStore } from '@/sheet/stores/character/characterStore';
import { useSettingsStore } from '@/sheet/stores/settings/settingsStore';
import { computed, ref } from 'vue';
import PowerFatigueModalView from './modifiers/PowerFatigueModalView.vue';
const char = useCharacterStore();
const settings = useSettingsStore();
const showPFTestModal = ref(false);
const pfHover = ref(false);
const powerFatigueClass = computed(() => {
    switch (char.powerFatigue) {
        case 0:
            return 'age-pf-default';
        case 1:
            return 'age-pf-winded';
        case 2:
            return 'age-pf-fatigued';
        case 3:
            return 'age-pf-exhausted';
        case 4:
            return 'age-pf-dying';
        default:
            return 'age-pf-default';
    }
});
const powerFatigueLabel = computed(() => {
    switch (char.powerFatigue) {
        case 0:
            return 'Fatigue: None ';
        case 1:
            return 'Fatigue: Winded';
        case 2:
            return 'Fatigue: Fatigued';
        case 3:
            return 'Fatigue: Exhausted';
        case 4:
            return 'Fatigue: Dying';
        default:
            return 'Fatigue: None ';
    }
});

</script>
