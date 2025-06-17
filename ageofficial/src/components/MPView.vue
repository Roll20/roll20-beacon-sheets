<template>
    <div v-if="settings.showArcana" >
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
</template>
<script setup>
import { useCharacterStore } from '@/sheet/stores/character/characterStore';
import { useSettingsStore } from '@/sheet/stores/settings/settingsStore';
const char = useCharacterStore();
const settings = useSettingsStore();
</script>
