<template>
    <div style="    display: grid;
    gap: 10px;
    grid-template-columns: 1fr 1fr 1fr 50px;">
    <div>
        <input type="text"  class="form-control" placeholder="Attack Name"  v-model="mod.name" />
    </div>
    <div>
        <select class="age-atk-select form-select"
                data-testid="test-spell-weaponType-input"
                v-model="mod.weaponGroupAbility"
                placeholder="Ability Used"
                >
                <option v-for="abl in abilities" :key="abl" :value="abl">{{ abl }}</option>
        </select>
    </div>
    <div>
        <select class="age-atk-select form-select"
                data-testid="test-spell-weaponType-input"
                v-model="mod.weaponType"
                > 
                <option v-for="wt in weaponTypes" :key="wt" :value="wt">{{ wt }}</option>
        </select>
    </div>
    <div>
        <input type="text"  class="form-control" placeholder="1d6"  v-model="mod.damage" />

    </div>
                      
    </div>
</template>
<script setup>
import { ref } from 'vue';
import { useSettingsStore } from '@/sheet/stores/settings/settingsStore';
import { fage1e, fage2e } from '@/components/modifiers/focuses'

const props = defineProps({
    mod:{ type: Object}
})
const abilities = ['Accuracy', 'Communication','Constitution','Dexterity','Fighting','Intelligence','Perception','Strength','Willpower']
const weaponTypes = ['Melee','Natural','Ranged','Spell Melee','Spell Ranged']
</script>