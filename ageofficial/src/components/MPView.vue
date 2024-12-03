<template>
    <div v-if="settings.showArcana" >
        <div class="d-flex flex-column justify-content-between" style="height: 50px;">
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
        <h4 class="age-subsection-header">
            {{settings.gameSystem === 'mage' ? 'Power' : 'Magic'}}
        </h4>
    </div>
</template>
<script setup>
import { useCharacterStore } from '@/sheet/stores/character/characterStore';
import { useSettingsStore } from '@/sheet/stores/settings/settingsStore';
const char = useCharacterStore();
const settings = useSettingsStore();
</script>
