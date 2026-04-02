/**
 * Transforms a legacy proficiency page into a native payload.
 */
export const transformDnDProficiency = (
  rawPayload: any,
  _book: any,
  properties: any,
): Record<string, any> => {
  const category = properties['Type'];
  return {
    name: rawPayload.name,
    category,
  };
};
