import { useStarTrekStore } from "@/sheet/stores";
import { createPinia } from "pinia";

export class StoreClass {
  static store: any;
  constructor() {};

  static getInstance(storeHydrate: any): ReturnType<typeof useStarTrekStore> {
    if (!this.store) {
      const pinia = createPinia();
      this.store = useStarTrekStore();
    }
    this.store.hydrateStore(storeHydrate ?? {});
    return this.store;
  }
}