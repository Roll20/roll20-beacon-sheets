import {
  brArcana,
  fageArcana,
  fageMythosArcana,
  fageTechnoArcana,
  magePowers,
  magePsychicPowers,
} from "@/components/magic/magicTypes";

export type PowerSourceId = "arcana" | "eldritch" | "psychic";
export type CostModel = "points" | "fatigue" | "price";
export type TypeListOptions = {
  gameSystem?: string;
  technofantasy?: boolean;
  threefold?: boolean;
};

export const POWER_SOURCE_IDS: PowerSourceId[] = ["arcana", "eldritch", "psychic"];
export const COST_MODELS: CostModel[] = ["points", "fatigue", "price"];
export const COST_MODEL_LABELS: Record<CostModel, string> = {
  points: "Points",
  fatigue: "Fatigue",
  price: "Price",
};
export const MAX_POWER_FATIGUE = 4;

export const spellSourceId = (spell?: { sourceId?: string }): PowerSourceId =>
  POWER_SOURCE_IDS.includes(spell?.sourceId as PowerSourceId)
    ? (spell!.sourceId as PowerSourceId)
    : "arcana";

// Characters saved before power sources existed have no arcanaCostModel.
export const legacyArcanaCostModel = ({
  stored,
  userPowerFatigue,
  gameSystem,
}: {
  stored?: CostModel;
  userPowerFatigue?: boolean;
  gameSystem?: string;
}): CostModel => {
  if (stored) return stored;
  if (userPowerFatigue) return "fatigue";
  if (gameSystem === "blue rose") return "fatigue";
  return "points";
};

export const sourceLabel = (id: PowerSourceId, gameSystem?: string) => {
  if (id === "eldritch") return "Eldritch Arcana";
  if (id === "psychic") return "Psychic Power";
  return gameSystem === "mage" ? "Power" : "Arcana";
};

export const sourcePluralLabel = (id: PowerSourceId, gameSystem?: string) => {
  if (id === "eldritch") return "Eldritch Arcana";
  if (id === "psychic") return "Psychic Powers";
  return gameSystem === "mage" ? "Powers" : "Arcana";
};

export const powersTabLabel = (enabled: PowerSourceId[], gameSystem?: string) =>
  enabled.length > 1 ? "Powers" : sourcePluralLabel(enabled[0] ?? "arcana", gameSystem);

export const poolHeading = (id: PowerSourceId, gameSystem?: string) => {
  if (id === "eldritch") return "Eldritch";
  if (id === "psychic") return "Psychic";
  return gameSystem === "mage" ? "Power" : "Magic";
};

export const pointsLabel = (id: PowerSourceId, gameSystem?: string) =>
  id === "psychic" || (id === "arcana" && gameSystem === "mage") ? "PP" : "MP";

export const costLabel = (id: PowerSourceId, model: CostModel, gameSystem?: string) => {
  if (model === "points") return `${pointsLabel(id, gameSystem)} Cost`;
  if (model === "fatigue") return "Power Cost";
  return "";
};

export const sourceTypeList = (
  id: PowerSourceId,
  { gameSystem, technofantasy, threefold }: TypeListOptions
): string[] => {
  if (id === "eldritch") return fageMythosArcana;
  if (id === "psychic") return magePsychicPowers;
  switch (gameSystem) {
    case "fage1e":
    case "fage2e":
      return technofantasy ? [...fageArcana, ...fageTechnoArcana].sort() : fageArcana;
    case "mage":
      return threefold
        ? [...new Set([...magePowers, ...magePsychicPowers])].sort()
        : magePowers;
    case "blue rose":
      return brArcana;
    default:
      return [];
  }
};

export const fatigueTestTN = (cost: number) => 9 + Math.floor((Number(cost) || 0) / 2);
