export const getDice = (components) =>
  components.filter((prop) => prop.sides || prop.rollFormula);
