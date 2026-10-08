import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import TalentsSection from '../TalentsSection.vue';
import { characterStore } from '@/sheet/stores';

describe('TalentsSection.vue features reordering', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.stubGlobal('matchMedia', vi.fn().mockImplementation(query => ({
      matches: true,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })));
  });

  it('correctly swaps position of an expanded feature with the previous one to avoid grid gaps', async () => {
    const sheet = characterStore();
    
    
    sheet.features.list = [
      { _id: 'A', name: 'Feature A', type: 'talent', description: 'Desc A', effects: { value: [] } },
      { _id: 'B', name: 'Feature B', type: 'talent', description: 'Desc B', effects: { value: [] } },
      { _id: 'C', name: 'Feature C', type: 'talent', description: 'Desc C', effects: { value: [] } }
    ];

    const wrapper = mount(TalentsSection, {
      global: {
        mocks: {
          $t: (msg: string) => msg
        }
      }
    });

    
    let cards = wrapper.findAllComponents({ name: 'FeatureCard' });
    expect(cards.map(c => c.props('feature')._id)).toEqual(['A', 'B', 'C']);

    
    
    await cards[1].vm.$emit('toggle-expand', true);
    
    
    cards = wrapper.findAllComponents({ name: 'FeatureCard' });
    expect(cards.map(c => c.props('feature')._id)).toEqual(['B', 'A', 'C']);

    
    await cards[0].vm.$emit('toggle-expand', false);
    
    cards = wrapper.findAllComponents({ name: 'FeatureCard' });
    expect(cards.map(c => c.props('feature')._id)).toEqual(['A', 'B', 'C']);
  });

  it('does NOT swap positions of features on small/mobile screen viewports', async () => {
    
    vi.stubGlobal('matchMedia', vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })));

    const sheet = characterStore();
    sheet.features.list = [
      { _id: 'A', name: 'Feature A', type: 'talent', description: 'Desc A', effects: { value: [] } },
      { _id: 'B', name: 'Feature B', type: 'talent', description: 'Desc B', effects: { value: [] } },
      { _id: 'C', name: 'Feature C', type: 'talent', description: 'Desc C', effects: { value: [] } }
    ];

    const wrapper = mount(TalentsSection, {
      global: {
        mocks: {
          $t: (msg: string) => msg
        }
      }
    });

    let cards = wrapper.findAllComponents({ name: 'FeatureCard' });
    expect(cards.map(c => c.props('feature')._id)).toEqual(['A', 'B', 'C']);

    
    await cards[1].vm.$emit('toggle-expand', true);
    
    
    cards = wrapper.findAllComponents({ name: 'FeatureCard' });
    expect(cards.map(c => c.props('feature')._id)).toEqual(['A', 'B', 'C']);
  });
});
