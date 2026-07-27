import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import LazyInput from '../LazyInput.vue';

describe('LazyInput.vue with isIncremental', () => {
  it('updates modelValue with addition and subtraction offsets', async () => {
    const wrapper = mount(LazyInput, {
      props: {
        modelValue: 10,
        isNumber: true,
        isIncremental: true
      }
    });

    const input = wrapper.find('input');

    
    await input.setValue('+5');
    await input.trigger('blur');
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([15]);

    
    await wrapper.setProps({ modelValue: 10 });
    await input.setValue('-3');
    await input.trigger('blur');
    expect(wrapper.emitted('update:modelValue')?.[1]).toEqual([7]);

    
    await wrapper.setProps({ modelValue: 10 });
    await input.setValue('5');
    await input.trigger('blur');
    expect(wrapper.emitted('update:modelValue')?.[2]).toEqual([5]);
  });

  it('respects min and max bounds for incremental calculations', async () => {
    const wrapper = mount(LazyInput, {
      props: {
        modelValue: 10,
        isNumber: true,
        isIncremental: true,
        min: 5,
        max: 12
      }
    });

    const input = wrapper.find('input');

    
    await input.setValue('+5');
    await input.trigger('blur');
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([12]);

    
    await wrapper.setProps({ modelValue: 10 });
    await input.setValue('-8');
    await input.trigger('blur');
    expect(wrapper.emitted('update:modelValue')?.[1]).toEqual([5]);
  });

  it('reverts to the original value when empty or lone signs are committed', async () => {
    const wrapper = mount(LazyInput, {
      props: {
        modelValue: 10,
        isNumber: true,
        isIncremental: true
      }
    });

    const input = wrapper.find('input');

    
    await input.setValue('+');
    await input.trigger('blur');
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([10]);

    
    await input.setValue('-');
    await input.trigger('blur');
    expect(wrapper.emitted('update:modelValue')?.[1]).toEqual([10]);
  });

  it('blanks out on focus in isIncremental + isNumber mode', async () => {
    const wrapper = mount(LazyInput, {
      props: {
        modelValue: 10,
        isNumber: true,
        isIncremental: true
      }
    });

    const input = wrapper.find('input');
    expect(input.element.value).toBe('10');

    
    await input.trigger('focus');
    expect(input.element.value).toBe('');
  });
});
