import { beforeEach, describe, expect, it } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useInventoryStore } from './inventoryStore';

describe('inventoryStore thrown consumables', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  const grenade = {
    name: 'Frag Grenade',
    type: 'consumable',
    quantity: 2,
    hasAttack: true,
    damage: '3d6',
    weaponType: 'Ranged',
  };

  it('keeps attack data on a thrown consumable', () => {
    const store = useInventoryStore();
    store.addItem(grenade);
    const item: any = store.items[0];
    expect(item.hasAttack).toBe(true);
    expect(item.equipped).toBe(false);
    expect(item.damage).toBe('3d6');
    expect(item.configurable).toBe(false);
  });

  it('does not add attack data to a plain consumable', () => {
    const store = useInventoryStore();
    store.addItem({ name: 'Potion', type: 'consumable', quantity: 1 });
    const item: any = store.items[0];
    expect(item.hasAttack).toBeUndefined();
    expect(item.damage).toBeUndefined();
  });

  it('spends one use at a time and stops at zero', () => {
    const store = useInventoryStore();
    store.addItem(grenade);
    const id = store.items[0]._id;
    expect(store.spendItem(id)).toBe(true);
    expect(store.spendItem(id)).toBe(true);
    expect(store.items[0].quantity).toBe(0);
    expect(store.spendItem(id)).toBe(false);
    expect(store.items[0].quantity).toBe(0);
  });

  it('gives a use back with restoreItem', () => {
    const store = useInventoryStore();
    store.addItem(grenade);
    const id = store.items[0]._id;
    store.spendItem(id);
    store.restoreItem(id);
    expect(store.items[0].quantity).toBe(2);
  });

  it('defaults weaponGroup to an empty string on a thrown item', () => {
    const store = useInventoryStore();
    store.addItem(grenade);
    expect((store.items[0] as any).weaponGroup).toBe('');
  });

  it('unequips a thrown consumable when it is stowed', () => {
    const store = useInventoryStore();
    store.addItem(grenade);
    const item: any = store.items[0];
    item.equipped = true;
    store.swapItem(item._id, false);
    expect(item.equipped).toBe(false);
    expect(store.itemsStowed).toHaveLength(1);
  });
});
