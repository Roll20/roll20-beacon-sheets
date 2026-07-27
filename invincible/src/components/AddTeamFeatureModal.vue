<template>
  <Modal :show="show" title="Add Team Feature" @close="handleClose">
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
        @click="handleClose"
        type="button"
        class="justify-center w-40 h-9 px-4 border-2 border-black bg-zinc-500 text-white hover:bg-zinc-600 font-space-grotesk font-black uppercase tracking-wider text-sm action-shadow-xs transition-all cursor-pointer focus:outline-none flex items-center gap-1.5 mr-auto"
      >
        Cancel
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

const props = defineProps<{
  show: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'save', feature: { name: string; description: string }): void;
}>();

const name = ref('');
const description = ref('');

watch(
  () => props.show,
  (newVal) => {
    if (newVal) {
      name.value = '';
      description.value = '';
    }
  }
);

const handleClose = () => {
  emit('close');
};

const handleSave = () => {
  const nameVal = name.value.trim();
  const descVal = description.value.trim();
  if (!nameVal) return;

  emit('save', { name: nameVal, description: descVal });
  handleClose();
};
</script>
