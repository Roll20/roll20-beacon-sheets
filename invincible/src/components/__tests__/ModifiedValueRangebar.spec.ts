import { describe, it, expect, beforeEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import ModifiedValueRangebar from '@/components/ModifiedValueRangebar.vue';
import { characterStore } from '@/sheet/stores';

describe('ModifiedValueRangebar.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('renders correct number of stars/buttons', () => {
    const wrapper = mount(ModifiedValueRangebar, {
      props: {
        modifiedValue: { value: 3, baseValue: 3, modifiers: [] },
        max: 6
      }
    });

    const buttons = wrapper.findAll('button');
    expect(buttons).toHaveLength(6);
  });

  it('correctly maps states: base filled, bonus, penalty, empty', () => {
    
    const wrapper = mount(ModifiedValueRangebar, {
      props: {
        modifiedValue: { value: 5, baseValue: 4, modifiers: [{ name: 'Bonus', value: 1 }] },
        max: 6,
        baseFilledClass: 'base-class',
        bonusFilledClass: 'bonus-class',
        penaltyClass: 'penalty-class',
        emptyClass: 'empty-class'
      }
    });

    const icons = wrapper.findAll('.material-symbols-outlined');
    
    
    for (let i = 0; i < 4; i++) {
      expect(icons[i].classes()).toContain('base-class');
      expect(icons[i].element.getAttribute('style')).toContain("'FILL' 1");
    }

    
    expect(icons[4].classes()).toContain('bonus-class');
    expect(icons[4].element.getAttribute('style')).toContain("'FILL' 1");

    
    expect(icons[5].classes()).toContain('empty-class');
    expect(icons[5].element.getAttribute('style')).toContain("'FILL' 0");
  });

  it('correctly maps penalty lost states', () => {
    
    const wrapper = mount(ModifiedValueRangebar, {
      props: {
        modifiedValue: { value: 2, baseValue: 4, modifiers: [{ name: 'Penalty', value: -2 }] },
        max: 6,
        baseFilledClass: 'base-class',
        bonusFilledClass: 'bonus-class',
        penaltyClass: 'penalty-class',
        emptyClass: 'empty-class'
      }
    });

    const icons = wrapper.findAll('.material-symbols-outlined');

    
    expect(icons[0].classes()).toContain('base-class');
    expect(icons[0].element.getAttribute('style')).toContain("'FILL' 1");
    expect(icons[1].classes()).toContain('base-class');
    expect(icons[1].element.getAttribute('style')).toContain("'FILL' 1");

    
    expect(icons[2].classes()).toContain('penalty-class');
    expect(icons[2].element.getAttribute('style')).toContain("'FILL' 0");
    expect(icons[3].classes()).toContain('penalty-class');
    expect(icons[3].element.getAttribute('style')).toContain("'FILL' 0");

    
    expect(icons[4].classes()).toContain('empty-class');
    expect(icons[4].element.getAttribute('style')).toContain("'FILL' 0");
    expect(icons[5].classes()).toContain('empty-class');
    expect(icons[5].element.getAttribute('style')).toContain("'FILL' 0");
  });

  it('emits update:baseValue on click when no attributes are present', async () => {
    const wrapper = mount(ModifiedValueRangebar, {
      props: {
        modifiedValue: { value: 3, baseValue: 3, modifiers: [] },
        max: 6
      }
    });

    const buttons = wrapper.findAll('button');
    
    
    await buttons[4].trigger('click');

    const emitted = wrapper.emitted('update:baseValue');
    expect(emitted).toBeDefined();
    expect(emitted![0]).toEqual([5]);
  });

  it('updates character store custom effects on click when attributes are present', async () => {
    const sheet = characterStore();
    
    const wrapper = mount(ModifiedValueRangebar, {
      props: {
        modifiedValue: { value: 3, baseValue: 3, modifiers: [], attributes: ['reputation' as any] },
        max: 6
      }
    });

    const buttons = wrapper.findAll('button');
    
    
    await buttons[4].trigger('click');

    
    const customEffects = sheet.effects.effects.value;
    expect(customEffects).toHaveLength(1);
    expect(customEffects[0]).toEqual({
      _id: 'reputation_custom',
      attribute: 'reputation',
      value: 2,
      operation: 'add',
      label: 'Custom Adjustment'
    });
  });

  it('toggles value off if clicking current total', async () => {
    const wrapper = mount(ModifiedValueRangebar, {
      props: {
        modifiedValue: { value: 3, baseValue: 3, modifiers: [] },
        max: 6
      }
    });

    const buttons = wrapper.findAll('button');
    
    
    await buttons[2].trigger('click');

    
    const emitted = wrapper.emitted('update:baseValue');
    expect(emitted).toBeDefined();
    expect(emitted![0]).toEqual([2]);
  });
});
