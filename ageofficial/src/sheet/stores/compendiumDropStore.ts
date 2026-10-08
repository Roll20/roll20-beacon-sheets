import { defineStore } from 'pinia';
import { ref } from 'vue';

export type PendingClassDrop = {
  name: string;
  healthBase: number;
  magicBase: number | null;
  weaponGroupChoices: string[];
  requiresConfirm: boolean;
};

export type PendingBackgroundDrop = {
  name: string;
  focusChoices: string[];
};

export const useCompendiumDropStore = defineStore('classDrop', () => {
  const pendingClass = ref<PendingClassDrop | null>(null);
  const pendingBackground = ref<PendingBackgroundDrop | null>(null);

  function setPendingClass(data: PendingClassDrop) {
    pendingClass.value = data;
  }

  function clearPendingClass() {
    pendingClass.value = null;
  }

  function setPendingBackground(data: PendingBackgroundDrop) {
    pendingBackground.value = data;
  }

  function clearPendingBackground() {
    pendingBackground.value = null;
  }

  return {
    pendingClass, setPendingClass, clearPendingClass,
    pendingBackground, setPendingBackground, clearPendingBackground,
  };
});
