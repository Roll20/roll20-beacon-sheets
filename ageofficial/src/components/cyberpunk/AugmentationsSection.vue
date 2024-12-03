<template>
    <div class="age-content">
        <div style="padding: 6px;" >
            <button data-testid="test-add-trait-btn" class="link-btn" @click="showModal = true" style="background: none; font-weight: bold;border:none;">
                + Add Augmentation
            </button>
        </div>
    </div>
</template>
<script setup>
import { ref } from 'vue';
const showModal = ref(false)

</script>