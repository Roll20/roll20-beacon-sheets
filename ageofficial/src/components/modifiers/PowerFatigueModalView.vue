<template>
    <Transition name="modal">
        <div v-if="show" class="modal-mask">
            <div class="modal-container age-modal">
                <div class="age-modal-header">
                    <slot name="header">default header</slot>
                    <button type="button" class="btn-close" @click="$emit('close')" aria-label="Close"></button>
                </div>    
                <div class="modal-body">
                    <div class="mb-3 col" style="flex-direction: column;padding: 0 2px;">
                        <span id="basic-addon1" class="age-input-label">Test Power Cost</span>
                        <div>
                            <input type="number" class="form-control" aria-label="Test Power Cost" v-model="powerTestCost"  aria-describedby="basic-addon1" @change="levelUp">
                        </div>
                        <div class=" input-group">
                            <label class="age-checkbox-toggle" style="margin:1rem;">
                                <input type="checkbox"  v-model="focus" />
                                <span class="slider round" ></span>
                            </label>
                            <span class="age-toggle-label">Power Focus</span>
                        </div>  
                        <div class=" input-group">
                            <label class="age-checkbox-toggle" style="margin:1rem;">
                                <input type="checkbox"  v-model="doubleFocus" />
                                <span class="slider round"></span>
                            </label>
                            <span class="age-toggle-label">Power Double Focus</span>
                        </div>      
                    </div>
                </div>
                <div class="modal-footer-actions">
                <slot name="footer">              
                    <button
                        class="confirm-btn"
                        @click="manualRollPowerFatigueTest();$emit('close')">
                        Test
                    </button>
                </slot>
            </div>
            </div>
            </div>
    </Transition>
</template>
<script setup>
import { useCharacterStore } from '@/sheet/stores/character/characterStore';
import { ref } from 'vue';
const props = defineProps({
  show: Boolean,
})
const char = useCharacterStore();
const powerTestCost = ref(0);
const focus = ref(0);
const doubleFocus = ref(0);
const manualRollPowerFatigueTest = () => {
    const focusMod = doubleFocus.value ? 4 : focus.value ? 2 : 0;
    char.rollPowerFatigueTest(powerTestCost.value,focusMod);
};
</script>
<style>
</style>