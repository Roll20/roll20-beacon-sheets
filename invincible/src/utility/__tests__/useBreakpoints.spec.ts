import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useBreakpoints } from '../useBreakpoints';
import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';

describe('useBreakpoints', () => {
  beforeEach(() => {
    vi.stubGlobal('matchMedia', vi.fn().mockImplementation(query => ({
      matches: query.includes('640px') || query.includes('768px'),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })));
  });

  it('correctly resolves matched breakpoints initially', () => {
    const TestComponent = defineComponent({
      setup() {
        const bp = useBreakpoints();
        return { bp };
      },
      template: '<div></div>',
    });

    const wrapper = mount(TestComponent);
    expect(wrapper.vm.bp.sm.value).toBe(true);
    expect(wrapper.vm.bp.md.value).toBe(true);
    expect(wrapper.vm.bp.lg.value).toBe(false);
    expect(wrapper.vm.bp.xl.value).toBe(false);
  });
});
