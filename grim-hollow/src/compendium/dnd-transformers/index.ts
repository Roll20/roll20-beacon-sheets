import { transformDnDBackground } from './transformBackground';
import { transformDnDClass } from './transformClass';
import { transformDnDEquipment } from './transformEquipment';
import { transformDnDFeatureSet } from './transformFeature';
import { transformDnDMonster } from './transformMonster';
import { transformDnDRace } from './transformRace';
import { transformDnDSpell } from './transformSpell';
import { transformDnDSubclass } from './transformSubclass';

export const transformers: Record<string, Function> = {
  Classes: transformDnDClass,
  Subclasses: transformDnDSubclass,
  Spells: transformDnDSpell,
  Species: transformDnDRace,
  Races: transformDnDRace,
  Subraces: transformDnDRace,
  'Species Options': transformDnDRace,
  Monsters: transformDnDMonster,
  Features: transformDnDFeatureSet,
  Feats: transformDnDFeatureSet,
  Backgrounds: transformDnDBackground,
  Items: transformDnDEquipment,
  Armor: transformDnDEquipment,
  Weapons: transformDnDEquipment,
  Equipment: transformDnDEquipment,
};