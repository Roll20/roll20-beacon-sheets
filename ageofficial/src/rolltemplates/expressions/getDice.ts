import type { DiceComponent } from "../rolltemplates";

export const getDice = (components: DiceComponent[]) =>
  components.filter((prop) => prop.sides || prop.rollFormula);
