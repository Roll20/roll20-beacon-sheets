<template>
  <div
    class="image-uploader"
  >
    <label class="image-uploader__label">
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        class="image-uploader__input"
        @change="handleFileChange"
      />

      <div v-if="modelValue" class="image-uploader__preview">
        <img :src="modelValue" alt="NPC Token" />
      </div>

      <div v-else class="image-uploader__placeholder">
        <SvgIcon icon="upload" />
        <span>{{ $t('actions.upload') }}</span>
      </div>
    </label>
    <button v-if="modelValue" @click.prevent="removeImage" class="image-uploader__remove-button">
      <SvgIcon icon="close" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import SvgIcon from '@/components/shared/SvgIcon.vue';

const props = defineProps<{
  modelValue: string;
  editMode: boolean;
}>();

const emit = defineEmits(['update:modelValue']);

const fileInput = ref<HTMLInputElement | null>(null);
const MAX_WIDTH = 200;
const MAX_HEIGHT = 200;
const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      const ratio = Math.min(MAX_WIDTH / img.width, MAX_HEIGHT / img.height);
      const newWidth = img.width * ratio;
      const newHeight = img.height * ratio;
      const xOffset = (MAX_WIDTH - newWidth) / 2;
      const yOffset = (MAX_HEIGHT - newHeight) / 2;

      canvas.width = MAX_WIDTH;
      canvas.height = MAX_HEIGHT;

      ctx?.drawImage(img, xOffset, yOffset, newWidth, newHeight);

      const dataUrl = canvas.toDataURL('image/png');
      emit('update:modelValue', dataUrl);
    };
    img.src = e.target?.result as string;
  };
  reader.readAsDataURL(file);
};
const removeImage = () => {
  emit('update:modelValue', '');
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};
</script>

<style lang="scss" scoped>
.image-uploader {
  width: 60px;
  height: 60px;
  flex-shrink: 0;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;

  &__label {
    display: block;
    width: 100%;
    height: 100%;
    cursor: pointer;
    border-radius: 50%;
    overflow: hidden;
    position: relative;
    border: 2px dashed var(--color-tertiary);

    &:hover {
      border-color: var(--color-highlight);
    }
  }

  &__input {
    display: none;
  }

  &__preview {
    width: 100%;
    height: 100%;
    position: relative;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  &__remove-button {
    position: absolute;
    top: -5px;
    right: -5px;
    background: var(--color-negative);
    color: white;
    border: 2px solid white;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2;
    padding: 0;

    .svg-icon {
      width: 12px;
      height: 12px;
      fill: white;
    }

    &:hover {
      background: #a12c2c;
    }
  }

  &__placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: var(--color-tertiary);
    font-size: 12px;

    svg {
      width: 24px;
      height: 24px;
    }
  }
}
</style>
