<template>
    <div class="col" style="display: flex; gap:10px">
        <select
            class="age-atk-select form-select"
            data-testid="test-spell-weaponType-input"
            placeholder="Armor Modify Option"
            v-model="mod.modifiedValue"
        >
            <option value="Modify">Modify</option>
            <option value="Set">Set</option>
        </select>
    </div>
    <div class="col">
        <input v-if="mod.option === 'Armor Rating'" type="number"  class="form-control" placeholder="0" min="0" v-model="mod.variable" />
        <input v-if="mod.option === 'Armor Penalty'" type="number"  class="form-control" placeholder="0" max="0"  v-model="mod.variable" />
    </div>
</template>
<script setup>
import { ref } from 'vue';
import { useModifiersStore } from '@/sheet/stores/modifiers/modifiersStore';
const props = defineProps({
    mod:{ type: Object}
})
const damageType = ref('');
</script>