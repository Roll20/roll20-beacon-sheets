<template>
    <div style="display: flex; flex-direction: column; gap:4px;">
        <div class="row" style="display: flex; gap:10px">
            <input class="form-control col" type="text" placeholder="Spell Name" v-model="mod.customName" />
            <select
                class="age-atk-select form-select col"
                data-testid="test-spell-weaponType-input"
                placeholder="Spell Cost"
                v-model="mod.costType"
            >
                <option value="Magic Points">Magic Points</option>
                <option value="Stunt Points">Stunt Points</option>
            </select>
            <input class="form-control col" type="number" placeholder="0" v-model="mod.variable" />
        </div>
        <div class="row" style="display: flex; gap:10px">
            <input class="form-control col" type="text" placeholder="Spell Test" v-model="mod.spellTest" />
            <input class="form-control col" type="text" placeholder="1d6" v-model="mod.spellSuccessDamage" />
            <input class="form-control col" type="text" placeholder="1d6" v-model="mod.spellFailDamage" />

        </div>
    </div>
</template>
<script setup>
const props = defineProps({
    mod:{ type: Object}
})
</script>