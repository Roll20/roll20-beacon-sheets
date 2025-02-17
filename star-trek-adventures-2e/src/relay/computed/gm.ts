export type GMAttr = 'momentum' | 'threat';

const getMomentum = (character: any) => {
  const gmHydrate = character.character.attributes.gm;
  return gmHydrate.momentum;
};
const getThreat = (character: any) => {
  const gmHydrate = character.character.attributes.gm;
  return gmHydrate.threat;
};

export const gmAttrs = () => {
  const attrs: Partial<
    Record<GMAttr, { get: (character: any) => number; tokenBarValue?: boolean }>
  > = {};
  attrs.momentum = {
    get: (character) => getMomentum(character),
    tokenBarValue: false,
  };
  attrs.threat = {
    get: (character) => getThreat(character),
    tokenBarValue: false,
  };
  return attrs;
};
