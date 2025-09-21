<template>
    <div class="d-flex flex-column justify-content-between" style="height: 50px;"  @mouseenter="spHover = true" @mouseleave="spHover = false">
        <div class="age-container-content">
            <button class="age-icon-btn age-reset-btn" v-if="char.stunts > 0 && spHover" @click="char.resetStunts" v-tippy="{ content: 'Click to reset stunt points to 0'}">
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
        Stunts
    </h4>
</template>
<script setup>
import { useCharacterStore } from '@/sheet/stores/character/characterStore';
import { ref } from 'vue';
const char = useCharacterStore();
const spHover = ref(false);
</script>
