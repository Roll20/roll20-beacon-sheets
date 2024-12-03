import { computed, ref } from 'vue';
import { useItemStore } from '../character/characterQualitiesStore';

export const spellMod = computed(() => {
    const store = useItemStore();    
    // The computed property will automatically update when store.items changes
    return store.items.reduce((spell, itm) => {
      if (!itm.modifiers) return spell;
      
      itm.modifiers.forEach((mod:any) => {
        if (mod.option === 'Spell') {
            spell
        }
      });
  
      return spell;
    }, 0);
  });