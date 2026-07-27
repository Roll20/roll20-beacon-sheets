<template>
  <Modal
    :show="show"
    :title="isNew ? (editingFeature?.type === 'talent' ? 'Add Talent' : 'Add Drawback') : (editingFeature?.type === 'talent' ? $t('sheet.edit_talent') : $t('sheet.edit_drawback'))"
    @close="handleClose"
  >
    <div v-if="editingFeature" class="flex flex-col gap-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        <div class="flex flex-col gap-1 text-black">
          <label class="font-space-grotesk font-black uppercase text-sm text-zinc-500">
            {{ $t('sheet.name') }}
          </label>
          <LazyInput
            v-model="editingFeature.name"
            class="w-full border-2 border-black p-2 text-base font-bold focus:outline-none"
          />
        </div>

        
        <div class="flex flex-col gap-1 text-black">
          <label class="font-space-grotesk font-black uppercase text-sm text-zinc-500">
            {{ $t('sheet.type') }}
          </label>
          <select
            v-model="editingFeature.type"
            class="w-full border-2 border-black p-2 text-base font-bold bg-white focus:outline-none cursor-pointer"
          >
            <option value="talent">{{ $t('sheet.talent') }}</option>
            <option value="drawback">{{ $t('sheet.drawback') }}</option>
          </select>
        </div>
      </div>

      
      <div class="flex flex-col gap-1 text-black">
        <label class="font-space-grotesk font-black uppercase text-sm text-zinc-500">
          {{ $t('sheet.description') }}
        </label>
        <MarkdownEditor
          v-model="editingFeature.description"
          height="180px"
        />
      </div>

      
      <div class="flex flex-col gap-1 text-black">
        <label class="font-space-grotesk font-black uppercase text-sm text-zinc-500">
          {{ $t('sheet.effects') }}
        </label>
        <EffectEditor
          v-model="editingFeature.effects"
          placeholder="e.g. fighting += 1;"
          :modes="['text', 'builder']"
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
import Modal from '@/components/Modal.vue';
import MarkdownEditor from '@/components/MarkdownEditor.vue';
import EffectEditor from '@/components/EffectEditor.vue';
import LazyInput from '@/components/LazyInput.vue';
import type { FeatureItem } from '@/schemas/hydrate/features';

defineOptions({ inheritAttrs: false });

const props = defineProps<{
  show: boolean;
  feature: FeatureItem | null;
  isNew?: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'save', feature: FeatureItem): void;
  (e: 'delete', id: string): void;
}>();

const editingFeature = ref<FeatureItem | null>(null);
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
    if (isShown && props.feature) {
      editingFeature.value = JSON.parse(JSON.stringify(props.feature));
      deleteConfirmCount.value = 0;
      clearDeleteTimer();
    } else {
      editingFeature.value = null;
      clearDeleteTimer();
    }
  },
  { immediate: true }
);

watch(
  () => props.feature,
  (newFeature) => {
    if (props.show && newFeature) {
      editingFeature.value = JSON.parse(JSON.stringify(newFeature));
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
  if (editingFeature.value) {
    emit('save', editingFeature.value);
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
    if (editingFeature.value && editingFeature.value._id) {
      emit('delete', editingFeature.value._id);
    }
  }
};
</script>
