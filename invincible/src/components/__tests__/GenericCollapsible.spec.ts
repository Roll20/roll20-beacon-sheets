import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import GenericCollapsible from '../GenericCollapsible.vue';

describe('GenericCollapsible.vue', () => {
  it('renders summary slot and does not display content when closed', () => {
    const wrapper = mount(GenericCollapsible, {
      props: {
        open: false
      },
      slots: {
        summary: '<div class="summary-slot">Summary Header</div>',
        content: '<div class="content-slot">Collapsible Content</div>'
      }
    });

    expect(wrapper.find('.summary-slot').exists()).toBe(true);
    expect(wrapper.find('.content-slot').exists()).toBe(true);
    expect(wrapper.find('.grid').classes()).not.toContain('grid-rows-[1fr]');
  });

  it('displays content slot when open is true', () => {
    const wrapper = mount(GenericCollapsible, {
      props: {
        open: true
      },
      slots: {
        summary: '<div class="summary-slot">Summary Header</div>',
        content: '<div class="content-slot">Collapsible Content</div>'
      }
    });

    expect(wrapper.find('.summary-slot').exists()).toBe(true);
    expect(wrapper.find('.content-slot').exists()).toBe(true);
    expect(wrapper.find('.content-slot').text()).toBe('Collapsible Content');
  });

  it('toggles open state and emits update:open on summary click', async () => {
    const wrapper = mount(GenericCollapsible, {
      props: {
        open: false,
        'onUpdate:open': (val: boolean) => wrapper.setProps({ open: val })
      },
      slots: {
        summary: '<div class="summary-slot">Summary Header</div>',
        content: '<div class="content-slot">Collapsible Content</div>'
      }
    });

    
    expect(wrapper.find('.content-slot').exists()).toBe(true);
    expect(wrapper.find('.grid').classes()).not.toContain('grid-rows-[1fr]');

    
    await wrapper.find('.cursor-pointer').trigger('click');

    
    expect(wrapper.emitted('update:open')).toBeTruthy();
    expect(wrapper.emitted('update:open')?.[0]).toEqual([true]);
  });

  it('does not toggle open state when clicking action slot buttons', async () => {
    const wrapper = mount(GenericCollapsible, {
      props: {
        open: false
      },
      slots: {
        summary: '<div class="summary-slot">Summary Header</div>',
        actions: '<button class="action-btn">Action</button>',
        content: '<div class="content-slot">Collapsible Content</div>'
      }
    });

    
    const actionBtn = wrapper.find('.action-btn');
    await actionBtn.trigger('click');

    
    expect(wrapper.emitted('update:open')).toBeFalsy();
    expect(wrapper.find('.content-slot').exists()).toBe(true);
    expect(wrapper.find('.grid').classes()).not.toContain('grid-rows-[1fr]');
  });
});
