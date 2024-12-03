<template>
    <div>
        <div class="d-flex flex-column justify-content-between" style="height: 50px;">
            <div class="hpmp-container">
                <div class="hpmp-current">
                    <input class="age-input"
                        type="number"
                        v-model="char.health"
                        :max="char.healthMax"
                        :min="0"
                        autocomplete="off" />
                </div>
                /
                <div class="hpmp-max">
                    {{ char.healthMax }}
                </div>
            </div>        
            <div class="progress" role="progressbar" aria-label="Success example"
            v-bind:aria-valuenow="char.health"
            aria-valuemin="0"
            v-bind:aria-valuemax="char.healthMax">
                <div class="progress-bar" :class="{ 'bg-success':(char.health / char.healthMax)*100 >= 50, 'bg-warning':(char.health / char.healthMax)*100 < 50, 'bg-danger':(char.health / char.healthMax)*100 < 25 }" v-bind:style="{ width: (char.health / char.healthMax)*100 + '%'}"></div>
            </div>
        </div>
        <h4 class="age-subsection-header">
            Health
        </h4>
    </div>
</template>
<script setup>
import { useBioStore } from '@/sheet/stores/bio/bioStore';
import { useCharacterStore } from '@/sheet/stores/character/characterStore';
const bio = useBioStore();
const char = useCharacterStore();
</script>
