import { config } from '@/config';
import { type CompendiumSpell, type DropContext } from './drop';
import { v4 as uuidv4 } from 'uuid';
import { NpcSchema } from '@/schemas/npc';
import { type Npc, useNpcStore } from '@/sheet/stores/npc/npcStore';
import { onDropSpell } from './dropSpell';
import { type Dispatch } from '@roll20-official/beacon-sdk';
import { dispatchRef, initValues } from '@/relay/relay';
import { useMetaStore } from '@/sheet/stores/meta/metaStore';

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
  const maxHitPoints = result.data.hitPoints.max ?? result.data.hitPoints.current;
  await dispatch.updateTokensByCharacter({
    characterId: characterId,
    token: {
      name: result.data.name,
      imgsrc: result.data.token,
      width: size * 70,
      height: size * 70,
      bar1_value: `${result.data.hitPoints.current}`,
      bar1_max: `${maxHitPoints}`,
      bar2_value: `${result.data.armorClass}`,
    }
  });
}

export const onDropMonster = async ({
  payload,
  effects,
  spells,
  isNewSheet,
  dispatch,
  character,
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

  const isNPCModeActive = isNewSheet || npcs.isNpc;

  if (isNPCModeActive) {
    result.data.isDefault = true;
    result.data.isCompanion = false;
    result.data.isCollapsed = false;

    if (isNewSheet) {
      npcs.npcs = [];
    } else {
      npcs.npcs = npcs.npcs.filter((n) => !(n.isDefault && !n.isCompanion));
    }
    npcs.isNpc = true;

    const meta = useMetaStore();
    meta.name = result.data.name;
    if (result.data.token) {
      meta.avatar = result.data.token;
    }
  } else {
    result.data.isDefault = false;
    result.data.isCompanion = true;
    result.data.isCollapsed = true;
  }

  npcs.isEditMode = false;
  const id = npcs.updateNpc(null, result.data as Partial<Npc>);

  if (isNPCModeActive && !isNewSheet) {
    const actualCharacterId = character?.id || initValues.character?.id;
    const actualDispatch = dispatch || dispatchRef.value;
    if (actualCharacterId && actualDispatch) {
      await setToken({ characterId: actualCharacterId, payload, dispatch: actualDispatch });
    }
  }

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