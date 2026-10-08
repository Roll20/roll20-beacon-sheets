import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import SelectWithCustom from '../SelectWithCustom.vue';
import LazyInput from '../LazyInput.vue';

describe('SelectWithCustom.vue', () => {
  const options = [
    { value: 'striker', label: 'Striker' },
    { value: 'defender', label: 'Defender' },
    { value: 'support', label: 'Support' }
  ];

  it('renders in unfocused mode showing span with value label or placeholder', async () => {
    
    let wrapper = mount(SelectWithCustom, {
      props: {
        modelValue: null,
        options,
        placeholder: 'Select Class...'
      }
    });

    const span = wrapper.find('.select-span');
    expect(span.exists()).toBe(true);
    expect(span.text()).toBe('Select Class...');
    expect(span.classes()).toContain('text-zinc-400');
    expect(wrapper.find('select').exists()).toBe(true);
    expect(wrapper.find('select').classes()).toContain('opacity-0');
    expect(wrapper.findComponent(LazyInput).exists()).toBe(false);

    
    wrapper = mount(SelectWithCustom, {
      props: {
        modelValue: 'defender',
        options,
        placeholder: 'Select Class...'
      }
    });
    expect(wrapper.find('.select-span').text()).toBe('Defender');
    expect(wrapper.find('.select-span').classes()).not.toContain('text-zinc-400');
  });

  it('focuses and displays a select if the value is null or in options list', async () => {
    const wrapper = mount(SelectWithCustom, {
      props: {
        modelValue: 'defender',
        options,
        placeholder: 'Select Class...'
      }
    });

    
    await wrapper.find('.select-span').trigger('click');
    expect(wrapper.find('select').exists()).toBe(true);
    expect(wrapper.findComponent(LazyInput).exists()).toBe(false);

    
    
    const selectOptions = wrapper.findAll('select option');
    expect((selectOptions[0].element as HTMLOptionElement).value).toBe('');
    expect(selectOptions[0].text()).toBe('Select Class...');

    
    expect((selectOptions[1].element as HTMLOptionElement).value).toBe('defender');
    expect(selectOptions[1].text()).toBe('Defender');
    expect((selectOptions[2].element as HTMLOptionElement).value).toBe('striker');
    expect(selectOptions[2].text()).toBe('Striker');
    expect((selectOptions[3].element as HTMLOptionElement).value).toBe('support');
    expect(selectOptions[3].text()).toBe('Support');

    
    expect((selectOptions[4].element as HTMLOptionElement).value).toBe('__CUSTOM__');
    expect(selectOptions[4].text()).toBe('Custom...');
  });

  it('disables options that are listed in disabledOptions prop', async () => {
    const wrapper = mount(SelectWithCustom, {
      props: {
        modelValue: 'defender',
        options,
        disabledOptions: ['striker'],
        placeholder: 'Select Class...'
      }
    });

    await wrapper.find('.select-span').trigger('click');
    const selectOptions = wrapper.findAll('select option');

    
    expect((selectOptions[1].element as HTMLOptionElement).disabled).toBe(false);

    
    expect((selectOptions[2].element as HTMLOptionElement).disabled).toBe(true);
  });

  it('emits update:modelValue and closes edit mode when a regular option is selected', async () => {
    const wrapper = mount(SelectWithCustom, {
      props: {
        modelValue: 'defender',
        options,
        placeholder: 'Select Class...'
      }
    });

    await wrapper.find('.select-span').trigger('click');
    
    
    const select = wrapper.find('select');
    await select.setValue('support');
    await select.trigger('change');

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['support']);
    
    
    expect(wrapper.find('.select-span').exists()).toBe(true);
  });

  it('enters custom mode with a LazyInput when Custom... is selected', async () => {
    const wrapper = mount(SelectWithCustom, {
      props: {
        modelValue: 'defender',
        options,
        placeholder: 'Select Class...'
      }
    });

    await wrapper.find('.select-span').trigger('click');
    
    
    const select = wrapper.find('select');
    await select.setValue('__CUSTOM__');
    await select.trigger('change');

    
    expect(wrapper.find('select').exists()).toBe(false);
    const lazyInput = wrapper.findComponent(LazyInput);
    expect(lazyInput.exists()).toBe(true);
    expect(lazyInput.props('modelValue')).toBe('');
  });

  it('opens directly in custom mode (LazyInput) if current value is not in options', async () => {
    const wrapper = mount(SelectWithCustom, {
      props: {
        modelValue: 'custom-class-name',
        options,
        placeholder: 'Select Class...'
      }
    });

    expect(wrapper.find('.select-span').text()).toBe('custom-class-name');

    
    await wrapper.find('.select-span').trigger('click');

    
    expect(wrapper.find('select').exists()).toBe(false);
    expect(wrapper.findComponent(LazyInput).exists()).toBe(true);
  });

  it('emits the custom value and exits custom mode on LazyInput commit', async () => {
    const wrapper = mount(SelectWithCustom, {
      props: {
        modelValue: 'custom-class-name',
        options,
        placeholder: 'Select Class...'
      }
    });

    await wrapper.find('.select-span').trigger('click');
    
    const lazyInput = wrapper.findComponent(LazyInput);
    const input = lazyInput.find('input');

    
    await input.setValue('Invincible Class');
    await input.trigger('blur');

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['Invincible Class']);
    expect(wrapper.find('.select-span').exists()).toBe(true);
  });

  it('emits null and returns to placeholder state if custom input is committed as empty/spaces', async () => {
    const wrapper = mount(SelectWithCustom, {
      props: {
        modelValue: 'custom-class-name',
        options,
        placeholder: 'Select Class...'
      }
    });

    await wrapper.find('.select-span').trigger('click');
    
    const lazyInput = wrapper.findComponent(LazyInput);
    const input = lazyInput.find('input');

    
    await input.setValue('   ');
    await input.trigger('blur');

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([null]);
    expect(wrapper.find('.select-span').exists()).toBe(true);
  });
});
