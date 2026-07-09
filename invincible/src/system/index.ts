import {
  fighting,
  agility,
  strength,
  reason,
  intuition,
  presence,
} from "./abilities/abilities";
import { health, health_max, resolve, resolve_max, slugfest_damage } from "./combat/combat";
import { armor } from "./armor/armor";
import { reputation } from "./biography/reputation";
import { rank } from "./biography/rank";
import { effects } from "./effects/effects";
import { resources } from "./gear/resources";

export const ruleSets = {
  get fighting() { return fighting; },
  get agility() { return agility; },
  get strength() { return strength; },
  get reason() { return reason; },
  get intuition() { return intuition; },
  get presence() { return presence; },
  get health() { return health; },
  get health_max() { return health_max; },
  get resolve() { return resolve; },
  get resolve_max() { return resolve_max; },
  get slugfest_damage() { return slugfest_damage; },
  get armor() { return armor; },
  get reputation() { return reputation; },
  get rank() { return rank; },
  get effects() { return effects; },
  get resources() { return resources; }
}