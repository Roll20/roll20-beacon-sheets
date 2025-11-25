<template>
    <div style="display: grid;gap: 10px;grid-template-columns: repeat(auto-fill, minmax(125px, 1fr));width: 100%;">
    <!-- <div style="display: flex;gap: 10px;width: 100%;flex-wrap: wrap;"> -->
    <div >
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
    <div >
        <select class="age-atk-select form-select"
                data-testid="test-spell-weaponType-input"
                v-model="mod.weaponType"
                > 
                <option v-for="wt in weaponTypes" :key="wt" :value="wt">{{ wt }}</option>
        </select>
    </div>
    <div v-if="mod.weaponType === 'Spell Ranged' || mod.weaponType === 'Ranged'">
        <input type="number"  class="form-control" placeholder="Short Range"  v-model="mod.shortRange" />
    </div>
    <div v-if="mod.weaponType === 'Spell Ranged' || mod.weaponType === 'Ranged'">
        <input type="number"  class="form-control" placeholder="Long Range"  v-model="mod.longRange" />
    </div>
    <div style="width: 75px;">
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