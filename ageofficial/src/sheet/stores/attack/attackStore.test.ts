import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';

const rollToChat = vi.fn();
vi.mock('@/utility/rollToChat', () => ({ default: (args: unknown) => rollToChat(args) }));
vi.mock('@/utility/sendToChat', () => ({ default: vi.fn() }));

import { useAttackStore } from './attackStore';
import { useSettingsStore } from '@/sheet/stores/settings/settingsStore';

const labels = () => rollToChat.mock.calls[0][0].components.map((c: any) => c.label);

describe('printAttack with thrown consumables', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    rollToChat.mockReset();
  });

  const thrown = (over = {}) => ({
    name: 'Frag Grenade',
    type: 'consumable',
    hasAttack: true,
    weaponType: 'Ranged',
    weaponGroup: '',
    weaponGroupAbility: 'Accuracy',
    ...over,
  });

  it('rolls Accuracy and the Grenades focus for a ranged throw', async () => {
    await useAttackStore().printAttack(thrown(), 3, 2);
    expect(labels()).toEqual(['Base Roll', 'Accuracy', 'Focus']);
    const comps = rollToChat.mock.calls[0][0].components;
    expect(comps[1].value).toBe(3);
    expect(comps[2].value).toBe(2);
  });

  it('adds no ability or focus for a melee throw', async () => {
    await useAttackStore().printAttack(thrown({ weaponType: 'Melee', weaponGroupAbility: '' }), 0, 0);
    expect(labels()).toEqual(['Base Roll']);
  });

  it('ignores Aim for a thrown item but not for a normal weapon', async () => {
    const settings = useSettingsStore();
    settings.aim = true;
    await useAttackStore().printAttack(thrown(), 3, 0);
    expect(labels()).not.toContain('Aim');
    rollToChat.mockReset();
    await useAttackStore().printAttack({ name: 'Pistol', type: 'weapon', weaponGroupAbility: 'Accuracy' }, 3, 0);
    expect(labels()).toContain('Aim');
  });
});
