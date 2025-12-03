<template>
    <div class="col" style="display: flex; gap:10px">
        <select
            class="age-atk-select form-select"
            data-testid="test-spell-weaponType-input"
            placeholder="Toughtness Modify Option"
            v-model="mod.modifiedValue"
        >
            <option value="Modify">Modify</option>
            <option value="Set">Set</option>
        </select>
    </div>
    <div class="col">
        <input type="number"  class="form-control" placeholder="0" v-model="mod.variable" />
    </div>
</template>
<script setup>
import { ref } from 'vue';
import { useModifiersStore } from '@/sheet/stores/modifiers/modifiersStore';
const props = defineProps({
    mod:{ type: Object}
})
</script>