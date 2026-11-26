export const editFlag = (value) => (value === undefined ? true : !!value);

export const mayEdit = (settings) =>
  editFlag(settings?.owned) || editFlag(settings?.gm);
