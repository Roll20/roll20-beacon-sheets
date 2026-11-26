import { characterStore } from '@/sheet/stores';
import { defineCompendium } from './common/CompendiumEntry';
import { ActionSchema } from './hydrate/actions';
import { PowerSchema } from './hydrate/powers';
import { FeatureSchema } from './hydrate/features';
import { GearSchema } from './hydrate/gear';
import { BaseFeatureSchema } from './hydrate/teams';
import { sharedSettings, dispatchRef } from '@/relay/relay';
import { ensureArray } from '@/utility/ensureArray';
import { v4 as uuidv4 } from 'uuid';

import { updateSharedData } from '@/utility/updateSharedData';

export const compendium = defineCompendium([
  {
    category: 'Actions',
    schema: ActionSchema,
    target: () => characterStore().actions.list,
  },
  {
    category: 'Features',
    schema: FeatureSchema,
    target: () => characterStore().features.list,
  },
  {
    category: 'Powers',
    schema: PowerSchema,
    target: () => characterStore().powers.list,
  },
  {
    category: 'Gear',
    schema: GearSchema,
    target: () => characterStore().gear.list,
  },
  {
    category: 'Team Features',
    schema: BaseFeatureSchema,
    onApply: async (data: any) => {
      const store = characterStore();
      const dispatch = dispatchRef.value;

      const raw = sharedSettings.value.teams;
      let teamsList: any[] = [];
      if (raw) {
        if (typeof raw === 'string') {
          try {
            teamsList = ensureArray(JSON.parse(raw));
          } catch {
            teamsList = [];
          }
        } else {
          teamsList = ensureArray(raw);
        }
      }

      const myTeam = teamsList.find((t: any) =>
        ensureArray(t.members).some((m: any) => m._id === store.meta.id)
      );

      if (!myTeam) {
        console.warn('[Team Features] Character is not in a team — drop ignored.');
        return;
      }

      const list = teamsList.map((t: any) => {
        if (t._id === myTeam._id) {
          const baseFeatures = [...ensureArray(t.baseFeatures)];
          baseFeatures.push({
            _id: data._id || uuidv4(),
            name: data.name,
            description: data.description || '',
          });
          return { ...t, baseFeatures };
        }
        return t;
      });

      sharedSettings.value = { ...sharedSettings.value, teams: list };

      try {
        await updateSharedData({ settings: { teams: JSON.stringify(list) } });
      } catch (err) {
        console.error('[teams] Failed to update settings on adding team feature from compendium:', err);
      }
    },
  },
]);

export type CompendiumCategory = (typeof compendium)[number]['category'];