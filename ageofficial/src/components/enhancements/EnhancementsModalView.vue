<template>
  <Transition name="modal">
    <div v-if="show" class="modal-mask">
        <div class="modal-container age-modal">
            <div class="age-modal-header">
            <slot name="header">default header</slot>
            <button type="button" class="btn-close" @click="$emit('close')" aria-label="Close"></button>

            </div>
      <div class="modal-body">
        <div class="row">
                <div class="mb-3 col">
                    <span class="age-input-label" id="basic-addon1">Part</span>
                    <input type="text" class="form-control" aria-label="Augmentation Part" aria-describedby="basic-addon1" v-model="enhancement.part">
                </div>
                <div class="mb-3 col">
                  <span class="age-input-label" id="basic-addon1">Cost</span>
                  <input type="text" class="form-control" aria-label="Augmentation Cost" aria-describedby="basic-addon1" v-model="enhancement.cost">
              </div>
        </div>
        <div class="row">  
            <div class="col" style="min-height: 100px;padding-bottom: 20px;">
                <span class="age-input-label" id="basic-addon1">Details</span>
                <QuillEditor ref="quillEditor" contentType="html" toolbar="" :options="{
                      modules: {
                        keyboard: {
                            bindings: {
                                enter: {
                                    key: 13, // 'Enter' key
                                    handler: (range, context) => {
                                    // Default behavior of Quill (inserts a single paragraph)
                                    const quill = this.$refs.quillEditor.quill;
                                    quill.formatLine(range.index, 1, 'block', true);
                                    },
                                },
                            },
                        },
                      },
                      scrollingContainer: true}"  v-model:content="enhancement.description" />  
            </div>    
        </div>
      </div>
      <div class="modal-footer-actions" v-if="mode === 'create'">
          <slot name="footer">
              <button 
                class="confirm-btn"
                @click="enhancements.addEnhancement(enhancement);$emit('close')"
              >
                Create
              </button>
          </slot>
      </div>
      <div class="modal-footer-actions"  v-else>
        <slot name="footer">
            <button 
              class="confirm-btn"
              @click="$emit('close')"
            >
              OK
            </button>
            <div class="delete-container">
              <button class="delete-icon-btn delete" title="Delete" @click="$emit('close');$emit('delete')" v-tippy="{ 'content': 'Delete Spell'}">
                <font-awesome-icon :icon="['fa', 'trash-alt']" />
              </button>
            </div>
            
        </slot>
      </div>
    </div>
    </div>
    </Transition>
    
</template>
<script setup>
import { computed, ref } from 'vue';
import { useMetaStore } from '@/sheet/stores/meta/metaStore';
import { useBioStore } from '@/sheet/stores/bio/bioStore';
import { useCharacterStore } from '@/sheet/stores/character/characterStore';
import { useSettingsStore } from '@/sheet/stores/settings/settingsStore';
import { useEnhancementStore } from '@/sheet/stores/enhancements/enhancementsStore';
const props = defineProps({
  show: Boolean,
  mode: String,  
  enhancement: { type: Object },
})
const meta = useMetaStore();
const bio = useBioStore();
const char = useCharacterStore();
const settings = useSettingsStore();
const isGM = computed(() => meta.permissions.isGM);

const charLevel = ref(1)
charLevel.value = char.level;
const enhancements = useEnhancementStore();
const classChange = () => {
  // if(bio.profession === 'Mage'){
  //   attack.mageAttack()
  // } else {
  //   const blast = attack.attacks.find(atk => atk.name === 'Arcane Blast')
  //   const blastId = blast._id;
  //   attack.removeAttack(blastId);
  // }
}
const levelUp = () => {
  if (char.level === null) {
    char.level = charLevel.value;
    return;
  }
  // Compare current value with the previous value
  if (charLevel.value > char.level) {
    char.levelUp();
  } else if (charLevel.value < char.level) {
    char.levelDown();
  }
}
</script>