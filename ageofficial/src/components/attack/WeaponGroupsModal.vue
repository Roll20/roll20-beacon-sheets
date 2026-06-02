<template>
    <Transition name="modal">
      <div v-if="show" class="modal-mask">
          <div class="modal-container age-modal">
            <div class="age-modal-header">
              <slot name="header">default header</slot>
              <button type="button" class="btn-close" @click="$emit('close')" aria-label="Close"></button>
  
              </div>
  
                <div class="modal-body age-wg-list">
                  <div v-for="(wg, index) in weaponGroups" :key="index" class="age-wg-item">
                    <input type="checkbox"
                    :value="wg" 
      :checked="wgs.includes(wg)" 
      @change="handleCheckboxChange(wg)" />
                    <span>{{ wg }}</span>
                  </div>
                </div>
            </div>
        </div>
    </Transition>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue';
import { useCharacterStore } from '@/sheet/stores/character/characterStore';
import { blueRoseWG, cthulhuWG, fage1eWG, fage2eWG, mageWG, technofantasyWG } from '@/components/attack/weaponGroups';
import { useSettingsStore } from '@/sheet/stores/settings/settingsStore';

const props = defineProps({
  show: Boolean,
})
const settings = useSettingsStore();
const char = useCharacterStore();
const wgs = ref(char.weaponGroups ? JSON.parse(char.weaponGroups) : [])

const weaponGroups = computed(() => {
  let base: string[];
  switch (settings.gameSystem) {
    case 'mage':   base = mageWG;     break;
    case 'fage1e': base = fage1eWG;   break;
    case 'bluerose': base = blueRoseWG; break;
    case 'cthulhu': base = cthulhuWG; break;
    default:       base = fage2eWG;   break;
  }
  if (settings.technofantasy) {
    return [...new Set([...base, ...technofantasyWG])].sort();
  }
  return base;
});

function handleCheckboxChange(wg: string) {
  if (wgs.value.includes(wg)) {
    wgs.value = wgs.value.filter((item: string) => item !== wg);
  } else {
    wgs.value.push(wg)
  }
  char.weaponGroups = JSON.stringify(wgs.value);
}
</script>