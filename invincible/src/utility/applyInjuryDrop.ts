import { characterStore } from '@/sheet/stores';
import { criticalInjuries } from '@/system/injuries/criticalInjuries';
import type { InjuryItem } from '@/schemas/hydrate/injury';
import { v4 as uuidv4 } from 'uuid';

export const applyInjuryDrop = (pageName: string): boolean => {
  const pageNameLower = pageName.toLowerCase();
  const match = criticalInjuries.find(injury => injury.name.toLowerCase() === pageNameLower);
  
  if (match) {
    const store = characterStore();
    const newInjury: InjuryItem = {
      _id: uuidv4(),
      roll: match.roll,
      name: match.name,
      description: match.description,
      healingTime: match.healingTime,
      effects: {
        label: match.effects?.label,
        disabled: match.effects?.disabled ?? false,
        value: (match.effects?.value ?? []).map((eff: any) => ({
          ...eff,
          _id: uuidv4()
        }))
      }
    };
    
    store.combat.criticalInjuries.push(newInjury);
    store.combat.normalizeCriticalInjuries();
    return true;
  }
  
  return false;
};
