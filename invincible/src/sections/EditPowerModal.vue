<template>
  <Modal
    :show="show"
    :title="isNew ? 'Add Power' : 'Edit Power'"
    @close="handleClose"
  >
    <div v-if="editingPower" class="flex flex-col gap-4">
      
      <div class="flex flex-col gap-1 text-black">
        <label class="font-space-grotesk font-black uppercase text-sm text-zinc-500">
          {{ $t('sheet.name') }}
        </label>
        <LazyInput
          v-model="editingPower.name"
          class="w-full border-2 border-black p-2 text-base font-bold focus:outline-none"
        />
      </div>

      
      <div class="flex flex-col gap-1 text-black">
        <label class="font-space-grotesk font-black uppercase text-sm text-zinc-500">
          {{ $t('sheet.description') }}
        </label>
        <MarkdownEditor
          v-model="editingPower.description"
          height="180px"
        />
      </div>

      
      <div class="flex flex-col gap-1 text-black">
        <label class="font-space-grotesk font-black uppercase text-sm text-zinc-500">
          {{ $t('sheet.effects') }}
        </label>
        <EffectEditor
          v-model="editingPower.effects"
          placeholder="e.g. fighting += 1;"
          :modes="['text', 'builder']"
        />
      </div>

      
      <div class="border-t-2 border-black pt-4 mt-2">
        <div class="flex justify-between items-center mb-3">
          <h3 class="font-space-grotesk font-black uppercase text-sm text-zinc-500">Modifiers (Boosts & Limits)</h3>
          <button
            @click="addModifier"
            type="button"
            class="w-7 h-7 flex items-center justify-center border-2 border-black bg-white hover:bg-zinc-200 active:translate-y-0.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-bold text-xl focus:outline-none cursor-pointer"
            v-tooltip="'Add Modifier'"  
          >
            <span class="material-symbols-outlined text-sm font-black">add</span>
          </button>
        </div>

        <div v-if="editingPower.modifiers.length === 0" class="text-sm text-zinc-400 italic bg-zinc-50 p-4 border border-dashed border-zinc-200 text-center">
          No modifiers added yet.
        </div>

        <div v-else class="space-y-4">
          <GenericCollapsible
            v-for="(mod, mIdx) in editingPower.modifiers"
            :key="mod._id || mIdx"
            :open="isModifierExpanded(mIdx)"
            @update:open="toggleModifierExpand(mIdx)"
            :alwaysShowActions="activeDeleteIndex === mIdx"
            class="text-black border-b border-zinc-200 pb-3"
          >
            <template #summary>
              <div class="flex items-center gap-3 text-left flex-1 min-w-0">
                
                <ToggleButton
                  v-model="mod.isActive"
                  @click.stop
                  class="scale-75 shrink-0"
                />

                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-1.5">
                    <h4
                      class="font-space-grotesk font-black uppercase text-base tracking-wide truncate"
                      :class="mod.isActive ? 'text-black' : 'text-zinc-500'"
                    >
                      {{ mod.name || 'New Modifier' }}
                    </h4>

                    <span
                      class="px-1.5 py-0.5 border bg-zinc-100 font-mono text-[10px] font-black uppercase tracking-wider"
                      :class="{'border-zinc-500': mod.isActive, 'border-black': !mod.isActive}"
                    >
                      {{ mod.type }}
                    </span>
                  </div>
                </div>
              </div>
            </template>

            <template #actions>
              
              <button
                @click.stop="handleRemoveModifierClick(mIdx)"
                type="button"
                class="w-6 h-6 flex items-center justify-center rounded transition-colors cursor-pointer focus:outline-none"
                :class="activeDeleteIndex === mIdx ? 'bg-red-600 text-white hover:bg-red-700' : 'text-red-500 hover:text-red-700 hover:bg-zinc-200 active:bg-zinc-300'"
                v-tooltip="activeDeleteIndex === mIdx ? 'Confirm Delete' : 'Remove Modifier'"
              >
                <span v-if="activeDeleteIndex === mIdx" class="text-xs font-black font-space-grotesk">
                  {{ activeDeleteCount }}
                </span>
                <span v-else class="material-symbols-outlined text-base">delete</span>
              </button>
            </template>

            <template #content>
              <div class="mt-3 border-t-2 border-black pt-3 flex flex-col gap-3">
                
                <div class="grid grid-cols-3 gap-3">
                  <div class="col-span-2 flex flex-col gap-1 text-black">
                    <label class="font-space-grotesk font-black uppercase text-xs text-zinc-500">Name</label>
                    <LazyInput
                      v-model="mod.name"
                      class="border border-black p-1 text-sm font-bold bg-white focus:outline-none w-full"
                      placeholder="Modifier Name"
                    />
                  </div>
                  <div class="col-span-1 flex flex-col gap-1 text-black">
                    <label class="font-space-grotesk font-black uppercase text-xs text-zinc-500">Type</label>
                    <select
                      v-model="mod.type"
                      class="border border-black p-1 text-sm font-bold bg-white focus:outline-none cursor-pointer w-full"
                    >
                      <option value="boost">Boost</option>
                      <option value="limit">Limit</option>
                    </select>
                  </div>
                </div>

                
                <div class="flex flex-col gap-1 text-black">
                  <label class="font-space-grotesk font-black uppercase text-xs text-zinc-500">Description</label>
                  <textarea
                    v-model.lazy="mod.description"
                    rows="2"
                    class="w-full border border-black text-sm p-1 bg-white focus:outline-none resize-y"
                    placeholder="Modifier Description"
                  ></textarea>
                </div>

                
                <div class="flex flex-col gap-1 text-black">
                  <label class="font-space-grotesk font-black uppercase text-xs text-zinc-500">Effects</label>
                  <EffectEditor
                    v-model="mod.effects"
                    placeholder="e.g. fighting += 2;"
                    :modes="['text', 'builder']"
                  />
                </div>
              </div>
            </template>
          </GenericCollapsible>
        </div>
      </div>
    </div>

    <template #footer>
       <button
         v-if="isNew"
         @click="handleClose"
         type="button"
         class="justify-center w-40 h-9 px-4 border-2 border-black bg-zinc-500 text-white hover:bg-zinc-600 font-space-grotesk font-black uppercase tracking-wider text-sm action-shadow-xs transition-all cursor-pointer focus:outline-none flex items-center gap-1.5 mr-auto"
       >
         Cancel
       </button>

       <button
         v-else
         @click="handleDeleteClick"
         type="button"
         class="justify-center w-40 h-9 px-4 border-2 border-black text-white font-space-grotesk font-black uppercase tracking-wider text-sm action-shadow-xs transition-all cursor-pointer focus:outline-none flex items-center gap-1.5 mr-auto"
         :class="deleteConfirmCount === 0 ? 'bg-zinc-500 hover:bg-red-800' : 'bg-red-800 hover:bg-red-900'"
       >
         {{ deleteConfirmCount === 0 ? $t('sheet.delete') : `Confirm (${deleteConfirmCount})` }}
       </button>

       <button
         @click="handleSave"
         type="button"
         class="w-40 h-9 px-4 border-2 border-black bg-primary text-primary-foreground hover:bg-secondary hover:text-secondary-foreground font-space-grotesk font-black uppercase tracking-wider text-sm action-shadow-xs transition-all cursor-pointer focus:outline-none"
       >
         {{ $t('sheet.save') }}
       </button>
     </template>
  </Modal>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import Modal from '@/components/Modal.vue';
import MarkdownEditor from '@/components/MarkdownEditor.vue';
import EffectEditor from '@/components/EffectEditor.vue';
import LazyInput from '@/components/LazyInput.vue';
import ToggleButton from '@/components/ToggleButton.vue';
import GenericCollapsible from '@/components/GenericCollapsible.vue';
import type { PowerItem } from '@/schemas/hydrate/powers';

defineOptions({ inheritAttrs: false });

const props = defineProps<{
  show: boolean;
  power: PowerItem | null;
  isNew?: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'save', power: PowerItem): void;
  (e: 'delete', id: string): void;
}>();

const editingPower = ref<PowerItem | null>(null);
const deleteConfirmCount = ref(0);
let deleteTimer: ReturnType<typeof setInterval> | null = null;

const activeDeleteIndex = ref<number | null>(null);
const activeDeleteCount = ref(0);
let activeDeleteTimer: ReturnType<typeof setInterval> | null = null;

const clearActiveDeleteTimer = () => {
  if (activeDeleteTimer) {
    clearInterval(activeDeleteTimer);
    activeDeleteTimer = null;
  }
};

const expandedModifierIndexes = ref<number[]>([]);

const toggleModifierExpand = (index: number) => {
  if (expandedModifierIndexes.value.includes(index)) {
    expandedModifierIndexes.value = expandedModifierIndexes.value.filter(i => i !== index);
  } else {
    expandedModifierIndexes.value.push(index);
  }
};

const isModifierExpanded = (index: number) => {
  return expandedModifierIndexes.value.includes(index);
};

const clearDeleteTimer = () => {
  if (deleteTimer) {
    clearInterval(deleteTimer);
    deleteTimer = null;
  }
  clearActiveDeleteTimer();
  activeDeleteIndex.value = null;
  activeDeleteCount.value = 0;
};

watch(
  () => props.show,
  (isShown) => {
    if (isShown && props.power) {
      editingPower.value = JSON.parse(JSON.stringify(props.power));
      deleteConfirmCount.value = 0;
      clearDeleteTimer();
      expandedModifierIndexes.value = []; 
    } else {
      editingPower.value = null;
      clearDeleteTimer();
      expandedModifierIndexes.value = [];
    }
  },
  { immediate: true }
);

watch(
  () => props.power,
  (newPower) => {
    if (props.show && newPower) {
      editingPower.value = JSON.parse(JSON.stringify(newPower));
      deleteConfirmCount.value = 0;
      clearDeleteTimer();
    }
  },
  { deep: true }
);

watch(
  () => editingPower.value?.modifiers,
  (newModifiers) => {
    if (newModifiers) {
      newModifiers.forEach(mod => {
        if (!mod.effects) {
          mod.effects = { value: [] };
        }
        mod.effects.disabled = !mod.isActive;
      });
    }
  },
  { deep: true }
);

const handleClose = () => {
  clearDeleteTimer();
  emit('close');
};

const handleSave = () => {
  if (editingPower.value) {
    emit('save', editingPower.value);
  }
};

const handleDeleteClick = () => {
  if (deleteConfirmCount.value === 0) {
    deleteConfirmCount.value = 3;
    clearDeleteTimer();
    deleteTimer = setInterval(() => {
      if (deleteConfirmCount.value > 1) {
        deleteConfirmCount.value--;
      } else {
        deleteConfirmCount.value = 0;
        clearDeleteTimer();
      }
    }, 1000);
  } else {
    clearDeleteTimer();
    deleteConfirmCount.value = 0;
    if (editingPower.value && editingPower.value._id) {
      emit('delete', editingPower.value._id);
    }
  }
};

const addModifier = () => {
  if (editingPower.value) {
    editingPower.value.modifiers.push({
      _id: uuidv4(),
      name: 'New Modifier',
      type: 'boost',
      description: '',
      effects: { value: [] },
      _children: [],
      isActive: true,
    });
    
    expandedModifierIndexes.value.push(editingPower.value.modifiers.length - 1);
  }
};

const removeModifier = (index: number) => {
  if (editingPower.value) {
    editingPower.value.modifiers.splice(index, 1);
    
    expandedModifierIndexes.value = expandedModifierIndexes.value
      .filter(i => i !== index)
      .map(i => (i > index ? i - 1 : i));
  }
};

const handleRemoveModifierClick = (index: number) => {
  if (activeDeleteIndex.value === index) {
    clearActiveDeleteTimer();
    activeDeleteIndex.value = null;
    activeDeleteCount.value = 0;
    removeModifier(index);
  } else {
    clearActiveDeleteTimer();
    activeDeleteIndex.value = index;
    activeDeleteCount.value = 3;
    activeDeleteTimer = setInterval(() => {
      if (activeDeleteCount.value > 1) {
        activeDeleteCount.value--;
      } else {
        activeDeleteIndex.value = null;
        activeDeleteCount.value = 0;
        clearActiveDeleteTimer();
      }
    }, 1000);
  }
};
</script>
