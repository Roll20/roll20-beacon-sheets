import { describe, it, expect, beforeEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import ModifiedValueInput from '@/components/ModifiedValueInput.vue';
import { characterStore } from '@/sheet/stores';

describe('ModifiedValueInput.vue with Custom Effects compensation', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('updates effectStore on numeric changes', async () => {
    const sheet = characterStore();
    
    
    const modifiedValue = {
      value: 3,
      baseValue: 3,
      modifiers: [],
      attributes: ['fighting' as any]
    };

    const wrapper = mount(ModifiedValueInput, {
      props: {
        modifiedValue
      }
    });

    const input = wrapper.find('input');
    
    
    await input.setValue('5');

    
    const customEffects = sheet.effects.effects.value;
    expect(customEffects).toHaveLength(1);
    expect(customEffects[0]).toEqual({
      _id: 'fighting_custom',
      attribute: 'fighting',
      value: 2,
      operation: 'add',
      label: 'Custom Adjustment'
    });
  });

  it('removes custom effect and resets baseValue on empty input', async () => {
    const sheet = characterStore();
    
    
    sheet.effects.updateEffect({
      _id: 'fighting_custom',
      attribute: 'fighting',
      value: 2,
      operation: 'add',
      label: 'Custom Adjustment'
    });

    const modifiedValue = {
      value: 5,
      baseValue: 3,
      modifiers: [{ name: 'Custom Adjustment', value: 2 }],
      attributes: ['fighting' as any]
    };

    const wrapper = mount(ModifiedValueInput, {
      props: {
        modifiedValue
      }
    });

    const input = wrapper.find('input');
    
    
    await input.setValue('   ');

    
    const customEffects = sheet.effects.effects.value;
    expect(customEffects).toHaveLength(0);

    
    const emitted = wrapper.emitted('update:baseValue');
    expect(emitted).toBeDefined();
    expect(emitted![0]).toEqual(['']);
  });
});
