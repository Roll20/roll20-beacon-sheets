<template>
    <div class="accordion-header age-enhancement-accordion-header">
        <div class="" style="font-size: 1rem; padding:0.5rem;">
            <div class="label" data-testid="test-spell-header" style="flex:1;">{{ enhancement.part }}</div>     
        </div>      
        
        <button type="button" class="config-btn age-icon-btn" @click="handlePrint" v-tippy="{ content: 'Share Enhancement in chat'}">
          <font-awesome-icon :icon="['fa', 'comment']" />
        </button> 
        <button type="button" class="config-btn age-icon-btn" @click="showModal = true" v-tippy="{ content: 'Edit Enhancement'}">
            <font-awesome-icon :icon="['fa', 'gear']" />
        </button> 
        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" :data-bs-target="'#collapse' + index"  aria-expanded="true" aria-controls="collapseOne"></button>
      </div>
    <div :id="'collapse'+ index" class="accordion-collapse age-accordion-collapse collapsed collapse" data-bs-parent="#age-spell-accordion">
        <div class="accordion-body">

          <div class="age-spell-accordion">
            <div>
              <h3>Description</h3>
              <div v-html="enhancement.description"></div>
            </div>            
          </div>
      </div>
    </div>
  <Teleport to="body">
    <!-- use the modal component, pass in the prop -->
    <EnhancementsModal :show="showModal" @close="showModal = false;" :enhancement="enhancement"
      :index="index" :magicLabel="magicLabel" @delete="handleDelete()">
      <template #header>
        <h3 class="age-spell-details-header">Enhancement Details</h3>
      </template>
    </EnhancementsModal>
  </Teleport>
</template>
<script setup>
import { ref } from 'vue';
import { useSpellStore } from '@/sheet/stores/magic/magicStore';
import { useAbilityScoreStore } from '@/sheet/stores/abilityScores/abilityScoresStore';
import EnhancementsModal from '@/components/enhancements/EnhancementsModalView.vue';
import { useBioStore } from '@/sheet/stores/bio/bioStore';
import { useCharacterStore } from '@/sheet/stores/character/characterStore';
import { useSettingsStore } from '@/sheet/stores/settings/settingsStore';
import { useAbilityFocusesStore } from '@/sheet/stores/abilityScores/abilityFocusStore';
import { useEnhancementStore } from '@/sheet/stores/enhancements/enhancementsStore';

const bio = useBioStore();
const char = useCharacterStore();
const settings = useSettingsStore();
const showModal = ref(false)
const open = ref(false)
const emit = defineEmits(['update:modelValue'])
const props = defineProps({
  enhancement: { type: Object },
  index: { type: Number },
  aim: { type: Boolean },
  aimValue: { type: Number },
  aimOption: String
});

const handlePrint = () => {
  const enhancementStore = useEnhancementStore();
  enhancementStore.printEnhancement(props.enhancement._id);
};
</script>