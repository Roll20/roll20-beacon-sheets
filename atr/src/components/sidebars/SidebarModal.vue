<template>
  <teleport to="body">
    <div v-if="showSidebar" class="sidebar">
      <transition name="slide-sidebar" mode="out-in">
        <div class="sidebar__panel">
          <SidebarHeader />
          <div class="sidebar__content">
            <component
              :is="currentComponent"
              v-bind="currentProps"
              :key="JSON.stringify(currentProps)"
              ref="componentInstance"
              @close="close"
            />
          </div>
          <div v-if="hasSave || hasDelete || hasAdd || hasSum || hasSubtract" class="sidebar__footer">
            <button
              v-if="hasDelete"
              :class="deleteClasses"
              @click="handleDeleteClick"
            >
              <template v-if="!confirmingDelete">
                {{ $t('actions.delete') }}
              </template>
              <template v-else>
                {{ $t('actions.confirm') }} ({{ countdown }})
              </template>
            </button>
            <button v-if="hasAdd" class="button button--big button--secondary" @click="handleAdd">
              {{ computedAddLabel }}
            </button>
            <button v-if="hasSave" class="button button--big button--primary" @click="handleSave">
              {{ $t('actions.save') }}
            </button>
            <button v-if="hasClose" class="button button--big button--primary" @click="handleClose">
              {{ $t('actions.close') }}
            </button>
            <button v-if="hasSubtract" class="button button--big button--subtract" @click="handleSubtract">
              <template v-if="subtractLabel">{{ $t(`actions.${subtractLabel}`) }}</template>
              <template v-else>{{ $t('actions.subtract') }}</template>
            </button>
            <button v-if="hasSum" class="button button--big button--sum" @click="handleSum">
              <template v-if="sumLabel">{{ $t(`actions.${sumLabel}`) }}</template>
              <template v-else>{{ $t('actions.sum') }}</template>
            </button>
          </div>
        </div>
      </transition>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { useSidebar } from './useSidebar';
import SidebarHeader from '../shared/SidebarHeader.vue';
import { useI18n } from 'vue-i18n';
import { computed, ref } from 'vue'; 
import { template } from 'lodash';

const { t } = useI18n();
const {
  showSidebar,
  currentComponent,
  currentProps,
  close,
  componentInstance,
  hasSave,
  hasClose,
  hasDelete,
  hasAdd,
  addLabel,
  hasSum,
  sumLabel,
  hasSubtract,
  subtractLabel
} = useSidebar();

const computedAddLabel = computed(() => {
  if (addLabel.value) {
    return addLabel.value;
  }
  return t('actions.add');
});
const handleSave = () => {
  if (componentInstance.value && componentInstance.value.save) {
    componentInstance.value.save();
  }
};
const handleClose = () => {
  useSidebar().close();
};

const confirmingDelete = ref(false);
const countdown = ref(3);
let timer: ReturnType<typeof setInterval> | null = null;

const deleteClasses = computed(() => {
  const classes = ['button', 'button--big', 'button--negative'];
  if (confirmingDelete.value) {
    classes.push('button--negative-confirm');
  }
  return classes;
});

const handleDeleteClick = () => {
  if (!confirmingDelete.value) {
    confirmingDelete.value = true;
    countdown.value = 3;
    timer = setInterval(() => {
      countdown.value -= 1;
      if (countdown.value <= 0) {
        confirmingDelete.value = false;
        clearInterval(timer!);
        timer = null;
      }
    }, 1000);
  } else {
    handleRemove();
    confirmingDelete.value = false;
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }
};

const handleRemove = () => {
  if (componentInstance.value && componentInstance.value.remove) {
    componentInstance.value.remove();
  }
};

const handleAdd = () => {
  if (componentInstance.value && componentInstance.value.add) {
    componentInstance.value.add();
  }
};

const handleSubtract = () => {
  if (componentInstance.value && componentInstance.value.subtract) {
    componentInstance.value.subtract();
  }
};

const handleSum = () => {
  if (componentInstance.value && componentInstance.value.sum) {
    componentInstance.value.sum();
  }
};
</script>

<style lang="scss" scoped>
.sidebar {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 1000;
  display: flex;
  justify-content: flex-end;
  align-items: stretch;
  font-family: var(--font-family-primary);
  &__panel {
    background: white;
    width: 400px;
    max-width: 100%;
    height: 100%;
    box-shadow: -2px 0 8px rgba(0, 0, 0, 0.2);
    display: flex;
    flex-direction: column;
  }
  &__content {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
  }
  &__footer {
    padding: 1rem;
    border-top: 1px solid var(--color-tertiary);
    background-color: rgba(0,0,0,0.05);
    display: flex;
    gap: 1rem;
  }
  .slide-sidebar {
    &-enter-active,
    &-leave-active {
      transition: transform 0.3s ease;
    }
    &-enter-from {
      transform: translateX(100%);
    }
    &-leave-to {
      transform: translateX(100%);
    }
  }
}
</style>
<style lang="scss">
.sidebar {
  &__content {
    .columns {
      gap: var(--size-gap-medium);
      .columns {
        gap: var(--size-gap-small);
      }
    }
    label {
      input, select, textarea {
        margin-top: var(--size-gap-xsmall);
        border: 1px solid var(--color-primary);
        border-radius: 3px;
        font-size: var(--size-font-medium);
        line-height: calc(var(--size-font-medium) * 1.3);
      }
      .button {
        margin-top: var(--size-gap-xsmall);
      }
      &:has(input[type="checkbox"]) {
        display: flex;
        align-items: center;
        input {
          margin-top: 0;
        }
      }
      &:has([disabled]) {
        opacity: 0.35;
      }
    }
    .toggable-group {
      padding: var(--size-gap-small);
      border-radius: 5px;
      box-sizing: border-box;
      border: 1px solid var(--color-tertiary);
      &__options {
        margin-top: var(--size-gap-small);
      }
    }
    .damage-type {
      .damage-type__container {

      }
    }
  }
  .tags-input-container {
    label {
      display: block;
      margin-bottom: var(--size-gap-xsmall);
    }
    .vue-tags-input {
      .ti-input {
        border: 1px solid var(--color-tertiary);
        border-radius: 3px;
      }
    }
    input {
      font-size: var(--size-font-medium);
    }
    .ti-tag {
      background-color: var(--color-disabled);
      color: var(--color-primary);
      font-weight: var(--weight-bold);
      border-radius: 2px;
      display: flex;
      align-items: center;
      .ti-icon-undo, .ti-icon-close {
        line-height: normal;
        &:before {
          line-height: normal;
        }
      }
    }
  }
  input,
  select,
  textarea {
    width: 100%;
    padding: 0.5rem;
    font-size: 1rem;
    box-sizing: border-box;
  }
  .effects-editor {
    textarea {
      height: 120px;
    }
  }
}
</style>
