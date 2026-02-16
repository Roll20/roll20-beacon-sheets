import { config } from '@/config';
import { type CompendiumSpell, type DropContext } from './drop';
import { v4 as uuidv4 } from 'uuid';
import { NpcSchema } from '@/schemas/npc';
import { type Npc, useNpcStore } from '@/sheet/stores/npc/npcStore';
import { onDropSpell } from './dropSpell';
import { type Dispatch } from '@roll20-official/beacon-sdk';

const getMonsterSize = (source: string = 'medium'): number => {
  const sizes = config.sizes;
  const sizeMap: Record<typeof sizes[number], number> = {
    tiny: 1,
    small: 1,
    medium: 1,
    large: 2,
    huge: 3,
    gargantuan: 4,
  };
  let size = 1;
  for (const key in sizeMap) {
    if (source.toLowerCase().includes(key)) {
      size = sizeMap[key as typeof sizes[number]];
      break;
    }
  }
  return size;
}

export const setToken = async ({ characterId, payload, dispatch }: { characterId: string; payload: Record<string, any>; dispatch: Dispatch }) => {
  const result = NpcSchema.safeParse(payload);
  if (!result.success) {
    console.error('Invalid monster data', result.error);
    return;
  }
  //Setting Default Token && Size
  const size = getMonsterSize(result.data.shortDescription);
  await dispatch.updateTokensByCharacter({
    characterId: characterId,
    token: {
      name: result.data.name,
      imgsrc: result.data.token,
      width: size * 70,
      height: size * 70,
    }
  });
}

export const onDropMonster = async ({
  payload,
  effects,
  spells,
  isNewSheet,
}: DropContext) => {

  const npcs = useNpcStore();

  const result = NpcSchema.safeParse(payload);
  if (!result.success) {
    console.error('Invalid monster data', result.error);
    return;
  }

  const collectedEffects: any[] = Array.isArray(effects) ? effects : [];

  //Features
    if(result.data.features) {
    result.data.features.forEach((feature) => {
      //Effects
      if(feature['data-effects']) {
        const uuid = uuidv4();
        feature.effectId = uuid;
        const effectData = feature['data-effects'];
        effectData._id = uuid;
        
        ['effects', 'actions', 'resources', 'spellSources', 'spells', 'pickers'].forEach((key) => {
          // @ts-ignore
          if (effectData[key] && Array.isArray(effectData[key])) {
            // @ts-ignore
            effectData[key].forEach((item: any) => {
              if (!item._id) item._id = uuidv4();
            });
          }
        });
        
        collectedEffects.push(effectData);
        
        delete feature['data-effects'];
      }

      feature._id = uuidv4();
    });
  }

  if (collectedEffects.length > 0) {
    result.data.effects = collectedEffects;
  }

  result.data.isDefault = isNewSheet ? true : false;
  result.data.isCompanion = isNewSheet ? false : true;
  result.data.isCollapsed =  isNewSheet ? false : true;

  if(isNewSheet) npcs.npcs = [];

  if(isNewSheet) npcs.isNpc = true;
  npcs.isEditMode = false;
  const id = npcs.updateNpc(null,  result.data as Partial<Npc>);

  if(spells) {
    console.log("Dropping spells for monster", spells);
    spells.forEach(async (spell: CompendiumSpell) => {
      const tags = spell['data-tags'] ?? [];
      const effects = spell['data-effects'] ?? [];
      delete spell['data-tags'];
      delete spell['data-effects'];
      await onDropSpell({ payload: spell, tags, effects, npcId: id });
    });
  }
};