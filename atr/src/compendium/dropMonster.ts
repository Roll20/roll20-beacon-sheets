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

  //Features
  if(result.data.features) {
    result.data.features.forEach((feature) => {
      //Effects
      if(feature['data-effects']) {
        const uuid = uuidv4();
        feature.effectId = uuid;
        feature['data-effects']._id = uuid;
        
        if(!effects) effects = [];
        effects.push(feature['data-effects']);
        
        delete feature['data-effects'];
      }

      feature._id = uuidv4();
    });
  }

  result.data.isDefault = isNewSheet ? true : false;
  result.data.isCompanion = isNewSheet ? false : true;
  result.data.isCollapsed =  isNewSheet ? false : true;

  if(isNewSheet) npcs.npcs = [];

  if(isNewSheet) npcs.isNpc = true;
  npcs.isEditMode = false;
  const id = npcs.updateNpc(null,  result.data as Partial<Npc>);

  if(spells) {
    spells.forEach(async (spell: CompendiumSpell) => {
      const tags = spell['data-tags'] ?? [];
      const effects = spell['data-effects'] ?? [];
      delete spell['data-tags'];
      delete spell['data-effects'];
      await onDropSpell({ payload: spell, tags, effects, npcId: id });
    });
  }
};