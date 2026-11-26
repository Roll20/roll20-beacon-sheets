import type { DiceComponent } from "../rolltemplates";
import { getDice } from "./getDice";
import { getStunt } from "./getStunt";

// The Price is picked by the raw Stunt Die face, not the degree of success.
export const stuntFace = (components: DiceComponent[]) =>
  Number(getStunt(getDice(components)));
