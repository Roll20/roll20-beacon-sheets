import * as z from 'zod';
import { EffectCompendiumCoreSchema } from './common/effect.core';
import { SpellSchema, SpellSourceSchema } from './spell';

export const EffectCompendiumSchema = EffectCompendiumCoreSchema.extend({

});

export const EffectSchema = EffectCompendiumSchema.extend({
  _id: z.string().optional(),
  spells: z.array(SpellSchema).optional(),
  spellSources: z.array(SpellSourceSchema).optional(),
});
