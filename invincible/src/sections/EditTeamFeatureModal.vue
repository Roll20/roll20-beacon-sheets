<template>
  <Modal
    :show="show"
    :title="isNew ? 'Add Team Feature' : 'Edit Team Feature'"
    @close="handleClose"
  >
    <div class="flex flex-col gap-4 text-black">
      
      <div class="flex flex-col gap-1">
        <label class="font-space-grotesk font-black uppercase text-sm text-zinc-500">
          Feature Name
        </label>
        <input
          v-model="name"
          type="text"
          class="w-full border-2 border-black p-2 text-base font-bold focus:outline-none bg-white"
          placeholder="Feature name..."
        />
      </div>

      
      <div class="flex flex-col gap-1">
        <label class="font-space-grotesk font-black uppercase text-sm text-zinc-500">
          Description
        </label>
        <textarea
          v-model="description"
          rows="4"
          class="w-full border-2 border-black p-2 text-base font-bold focus:outline-none bg-white resize-none"
          placeholder="Feature description..."
        ></textarea>
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
        {{ deleteConfirmCount === 0 ? 'Delete' : `Confirm (${deleteConfirmCount})` }}
      </button>

      <button
        @click="handleSave"
        type="button"
        class="w-40 h-9 px-4 border-2 border-black bg-primary text-primary-foreground hover:bg-secondary hover:text-secondary-foreground font-space-grotesk font-black uppercase tracking-wider text-sm action-shadow-xs transition-all cursor-pointer focus:outline-none"
      >
        Save
      </button>
    </template>
  </Modal>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import Modal from '@/components/Modal.vue';

defineOptions({ inheritAttrs: false });

const props = defineProps<{
  show: boolean;
  feature?: { _id: string; name: string; description: string } | null;
  isNew?: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'save', feature: { name: string; description: string }): void;
  (e: 'delete', id: string): void;
}>();

const name = ref('');
const description = ref('');
const deleteConfirmCount = ref(0);
let deleteTimer: ReturnType<typeof setInterval> | null = null;

const clearDeleteTimer = () => {
  if (deleteTimer) {
    clearInterval(deleteTimer);
    deleteTimer = null;
  }
};

watch(
  () => props.show,
  (isShown) => {
    if (isShown) {
      if (!props.isNew && props.feature) {
        name.value = props.feature.name;
        description.value = props.feature.description;
      } else {
        name.value = '';
        description.value = '';
      }
      deleteConfirmCount.value = 0;
      clearDeleteTimer();
    } else {
      clearDeleteTimer();
    }
  }
);

const handleClose = () => {
  clearDeleteTimer();
  emit('close');
};

const handleSave = () => {
  const nameVal = name.value.trim();
  const descVal = description.value.trim();
  if (!nameVal) return;

  emit('save', { name: nameVal, description: descVal });
  handleClose();
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
    if (props.feature?._id) {
      emit('delete', props.feature._id);
      handleClose();
    }
  }
};
</script>
