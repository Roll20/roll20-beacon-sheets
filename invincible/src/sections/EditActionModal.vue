<template>
  <Modal
    :show="show"
    :title="isNew ? 'Add Action' : 'Edit Action'"
    @close="handleClose"
  >
    <div v-if="editingAction" class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-black">
      
      <div class="flex flex-col gap-1">
        <label class="font-space-grotesk font-black uppercase text-sm text-zinc-500">
          Name
        </label>
        <LazyInput
          v-model="editingAction.name"
          class="w-full border-2 border-black p-2 text-base font-bold focus:outline-none"
        />
      </div>

      
      <div class="flex flex-col gap-1">
        <label class="font-space-grotesk font-black uppercase text-sm text-zinc-500">
          Type
        </label>
        <select
          v-model="editingAction.type"
          class="w-full border-2 border-black p-2 text-base font-bold bg-white focus:outline-none cursor-pointer"
        >
          <option value="quick">Quick Action</option>
          <option value="full">Full Action</option>
        </select>
      </div>

      
      <div class="flex flex-col gap-1">
        <label class="font-space-grotesk font-black uppercase text-sm text-zinc-500">
          Attribute Used
        </label>
        <select
          v-model="editingAction.attributeUsed"
          class="w-full border-2 border-black p-2 text-base font-bold bg-white focus:outline-none cursor-pointer"
        >
          <option value="-">-</option>
          <option value="fighting">FIGHTING</option>
          <option value="agility">AGILITY</option>
          <option value="strength">STRENGTH</option>
          <option value="reason">REASON</option>
          <option value="intuition">INTUITION</option>
          <option value="presence">PRESENCE</option>
          <option value="varies">Varies</option>
        </select>
      </div>

      
      <div class="flex flex-col gap-1">
        <label class="font-space-grotesk font-black uppercase text-sm text-zinc-500">
          Bonus
        </label>
        <LazyInput
          v-model="editingAction.bonus"
          type="number"
          class="w-full border-2 border-black p-2 text-base font-bold focus:outline-none"
        />
      </div>

      
      <div class="flex flex-col gap-1">
        <label class="font-space-grotesk font-black uppercase text-sm text-zinc-500">
          Range
        </label>
        <LazyInput
          v-model="editingAction.range"
          placeholder="e.g. - or 10/20"
          class="w-full border-2 border-black p-2 text-base font-bold focus:outline-none"
        />
      </div>

      
      <div class="flex flex-col gap-1">
        <label class="font-space-grotesk font-black uppercase text-sm text-zinc-500">
          Damage Expression
        </label>
        <LazyInput
          v-model="editingAction.damage"
          class="w-full border-2 border-black p-2 text-base font-bold focus:outline-none font-mono"
        />
      </div>

      
      <div class="flex flex-col gap-1 sm:col-span-2">
        <label class="font-space-grotesk font-black uppercase text-sm text-zinc-500">
          Description
        </label>
        <MarkdownEditor
          v-model="editingAction.description"
          height="180px"
        />
      </div>

      
      <div class="flex flex-col gap-1 sm:col-span-2">
        <label class="font-space-grotesk font-black uppercase text-sm text-zinc-500">
          Special Features
        </label>
        <LazyInput
          v-model="editingAction.specialFeatures"
          class="w-full border-2 border-black p-2 text-base font-bold focus:outline-none"
        />
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
        v-else-if="editingAction && !editingAction.isDefault"
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
import Modal from '@/components/Modal.vue';
import MarkdownEditor from '@/components/MarkdownEditor.vue';
import LazyInput from '@/components/LazyInput.vue';
import type { ActionItem } from '@/schemas/hydrate/actions';

defineOptions({ inheritAttrs: false });

const props = defineProps<{
  show: boolean;
  action: ActionItem | null;
  isNew?: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'save', action: ActionItem): void;
  (e: 'delete', id: string): void;
}>();

const editingAction = ref<ActionItem | null>(null);
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
    if (isShown && props.action) {
      editingAction.value = JSON.parse(JSON.stringify(props.action));
      deleteConfirmCount.value = 0;
      clearDeleteTimer();
    } else {
      editingAction.value = null;
      clearDeleteTimer();
    }
  },
  { immediate: true }
);

watch(
  () => props.action,
  (newAction) => {
    if (props.show && newAction) {
      editingAction.value = JSON.parse(JSON.stringify(newAction));
      deleteConfirmCount.value = 0;
      clearDeleteTimer();
    }
  },
  { deep: true }
);

const handleClose = () => {
  clearDeleteTimer();
  emit('close');
};

const handleSave = () => {
  if (editingAction.value) {
    emit('save', editingAction.value);
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
    if (editingAction.value && editingAction.value._id) {
      emit('delete', editingAction.value._id);
    }
  }
};
</script>
