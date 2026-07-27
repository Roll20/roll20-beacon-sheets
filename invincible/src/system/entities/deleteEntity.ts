
export function deleteEntity(stores: Record<string, any>, entityId: string): boolean {
  for (const storeName of Object.keys(stores)) {
    const store = stores[storeName];

    const stateKeys = Object.keys(store.$state || store);

    for (const key of stateKeys) {
      const stateProp = store[key];

      if (Array.isArray(stateProp)) {
        const index = stateProp.findIndex((item) => item && item._id === entityId);
        
        if (index !== -1) {
          const itemToDelete = stateProp[index];

          
          if (itemToDelete && Array.isArray(itemToDelete._children) && itemToDelete._children.length > 0) {
            for (const childId of itemToDelete._children) {
              deleteEntity(stores, childId);
            }
          }

          
          stateProp.splice(index, 1);
          return true;
        }
      }
    }
  }
  return false;
}
