import type { Dispatch } from '@roll20-official/beacon-sdk';
import { characterStore } from '@/sheet/stores';
import { validateEntry, applyCompendiumData } from '@/utility/compendiumDrop';
import { compendium } from '@/schemas/compendium';
import { NpcPayloadSchema } from '@/schemas/hydrate/npc';

export const applyNpcDrop = async (resolvedNode: any, dispatch: Dispatch, type: string = 'compact') => {
  const store = characterStore();

  
  store.powers.list = [];
  store.features.list = [];
  store.actions.list = [];
  store.gear.list = [];
  store.settings.mode = type;

  
  const payload = resolvedNode['data-payload'] || {};
  const validation = NpcPayloadSchema.safeParse(payload);
  
  if (validation.success) {
    const data = validation.data;

    store.settings.mode = type;
    
    if (data.name !== undefined) store.meta.name = data.name;
    
    const avatar = data.avatar || data.token;
    const token = data.token || data.avatar;
    
    if (avatar !== undefined) store.meta.avatar = avatar;
    if (token !== undefined) store.meta.token.imgsrc = token;
    
    if (data.about !== undefined) store.biography.about = data.about;
    if (data.civilianName !== undefined) store.biography.civilianName = data.civilianName;
    if (data.role !== undefined) store.biography.role = data.role;
    if (data.special !== undefined) store.biography.special = data.special;
    if (data.drawbacks !== undefined) store.biography.drawbacks = data.drawbacks;
    
    if (data.reputation !== undefined) store.biography.reputation = String(data.reputation);
    if (data.resources !== undefined) store.biography.resources = Number(data.resources) || 0;
    if (data.rank !== undefined) store.biography.rank = Number(data.rank) || 0;
    if (data.appearance !== undefined) store.biography.appearance = data.appearance;

    if (data.abilities) {
      for (const [key, value] of Object.entries(data.abilities)) {
        if (key in store.abilities) {
          (store.abilities as any)[key] = Number(value) || 0;
        }
      }
    }

    if (data.combat) {
      for (const [key, value] of Object.entries(data.combat)) {
        if (key in store.combat) {
          if (typeof (store.combat as any)[key] === 'number') {
             (store.combat as any)[key] = Number(value) || 0;
          } else {
             (store.combat as any)[key] = String(value);
          }
        }
      }
    }
  } else {
    console.error(`[NPC Drop] Invalid NPC payload:`, validation.error);
  }

  
  const children = resolvedNode['data-children'] || [];
  
  for (const childNode of children) {
    try {
      const categoryName = childNode.categoryName;
      if (!categoryName) continue;

      const handler = compendium.find((c) => c.category === categoryName);
      if (!handler) {
        console.warn(`[NPC Drop] No handler for category: ${categoryName}`);
        continue;
      }

      
      const childValidation = validateEntry(childNode, handler.schema);
      if (childValidation.success) {
        if (handler.onApply) {
          await handler.onApply(childValidation.data.node?.data ?? childValidation.data);
        } else {
          const rawTarget = handler.target;
          const resolvedTarget = typeof rawTarget === 'function' ? rawTarget() : rawTarget;
          applyCompendiumData(childValidation.data, resolvedTarget);
        }

        
        if (childNode.activeModifiers && childNode.activeModifiers.length > 0) {
          const materializedItemName = childValidation.data.node?.data?.name || childValidation.data.name;
          
          if (categoryName === 'Powers' && materializedItemName) {
            
            const power = store.powers.list.find(p => p.name === materializedItemName);
            if (power && power.modifiers) {
              for (const modName of childNode.activeModifiers) {
                
                const mod = power.modifiers.find((m: any) => m.name === modName);
                if (mod) {
                  mod.isActive = true;
                }
              }
            }
          }
        }
      } else {
        console.error(`[NPC Drop] Validation failed for child in ${categoryName}:`, childValidation.error);
      }
    } catch (e) {
      console.error(`[NPC Drop] Error processing child:`, e);
    }
  }
};
