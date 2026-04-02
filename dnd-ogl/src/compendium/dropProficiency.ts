import { v4 as uuidv4 } from 'uuid';
import { useUnrankedProficienciesStore } from '@/sheet/stores/proficiencies/unrankedProficienciesStore';
import { useProficienciesStore } from '@/sheet/stores/proficiencies/proficienciesStore';
import { config } from '@/config';
import type { DropContext } from './drop';
import type { AbilityKey } from '@/sheet/stores/abilities/abilitiesStore';

export const onDropProficiency = async ({ payload }: DropContext) => {
  if (!payload?.name || !payload?.category) {
    console.error('Invalid proficiency data', payload);
    return;
  }

  const category: string = payload.category;
  const name: string = payload.name;
  const nameKey = name.toLowerCase().replace(/['']/g, '').replace(/ /g, '-');

  switch (category) {
    case 'Language': {
      const store = useUnrankedProficienciesStore();
      const isKnown = (config.autocomplete.languages as readonly string[]).includes(nameKey);
      const tagText = isKnown ? nameKey : name;
      const exists = store.combinedLanguages.some(
        (t) => t.text.toLowerCase() === nameKey,
      );
      if (!exists) {
        store.languages.push({
          _id: uuidv4(),
          text: tagText,
          isDefault: isKnown,
        });
      }
      break;
    }

    case 'Weapon': {
      const store = useUnrankedProficienciesStore();
      const isKnown = (config.autocomplete.weaponProficiencies as readonly string[]).includes(nameKey);
      const tagText = isKnown ? nameKey : name;
      const exists = store.combinedWeaponProficiencies.some(
        (t) => t.text.toLowerCase() === nameKey,
      );
      if (!exists) {
        store.weapons.push({
          _id: uuidv4(),
          text: tagText,
          isDefault: isKnown,
        });
      }
      break;
    }

    case 'Armor': {
      const store = useUnrankedProficienciesStore();
      const isKnown = (config.autocomplete.armorProficiencies as readonly string[]).includes(nameKey);
      const tagText = isKnown ? nameKey : name;
      const exists = store.combinedArmorProficiencies.some(
        (t) => t.text.toLowerCase() === nameKey,
      );
      if (!exists) {
        store.armor.push({
          _id: uuidv4(),
          text: tagText,
          isDefault: isKnown,
        });
      }
      break;
    }

    case 'Tool': {
      const profStore = useProficienciesStore();
      const toolLabel = name;
      const existingTool = profStore.combinedTools.find(
        (t) => t.label.toLowerCase() === toolLabel.toLowerCase(),
      );
      if (!existingTool) {
        const knownTools = config.autocomplete.toolProficiencies as Record<string, { ability: string }>;
        const ability = (knownTools[nameKey]?.ability ?? 'dexterity') as AbilityKey;
        profStore.updateRanked(undefined, {
          label: toolLabel,
          ability,
          level: 1,
          group: 'tools',
        });
      } else if (existingTool.level <= 0) {
        profStore.updateRanked(existingTool._id, { level: 1 });
      }
      break;
    }

    case 'Skill': {
      const profStore = useProficienciesStore();
      const skillKey = nameKey;
      const existingSkill = profStore.ranked.find(
        (p) => p.group === 'default-skills' && p.label === skillKey,
      );
      if (existingSkill && existingSkill.level <= 0) {
        profStore.updateRanked(existingSkill._id, { level: 1 });
      }
      break;
    }

    default:
      console.warn(`Unknown proficiency category: "${category}" for "${name}"`);
  }
};
