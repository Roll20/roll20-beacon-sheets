import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import RollButton from '../RollButton.vue';
import { ref } from 'vue';
import { createPinia, setActivePinia } from 'pinia';

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key
  }),
  createI18n: () => ({
    install: () => {},
    global: {
      t: (key: string) => key
    }
  })
}));

vi.mock('@/utility/rollToChat', () => ({
  default: vi.fn().mockResolvedValue(10)
}));

describe('RollButton.vue', () => {
  let pinia: any;

  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
    document.body.innerHTML = '';
  });

  it('renders correctly with default slot or simplified roll', () => {
    const wrapper = mount(RollButton, {
      props: {
        title: 'Attribute Test',
        components: [
          { rollFormula: '3d6', label: 'Attribute' }
        ]
      },
      global: {
        plugins: [pinia],
        directives: {
          tooltip: () => {}
        }
      }
    });

    expect(wrapper.text()).toContain('3d6');
  });

  it('opens modal on normal click and shows correct components', async () => {
    const wrapper = mount(RollButton, {
      props: {
        title: 'Fighting Check',
        subtitle: 'Close Combat',
        components: [
          { rollFormula: '4d6', label: 'Fighting' },
          { value: 2, label: 'Aim' }
        ]
      },
      global: {
        plugins: [pinia],
        directives: {
          tooltip: () => {}
        }
      }
    });

    
    expect(document.body.querySelector('[role="dialog"]')).toBeNull();

    
    await wrapper.find('button').trigger('click');
    await wrapper.vm.$nextTick();
    await new Promise(resolve => setTimeout(resolve, 50));

    
    const modal = document.body.querySelector('[role="dialog"]');
    expect(modal).not.toBeNull();
    expect(modal!.textContent).toContain('Fighting Check');
    expect(modal!.textContent).toContain('Close Combat');
    expect(modal!.textContent).toContain('Fighting');
    expect(modal!.textContent).toContain('4d6');
    expect(modal!.textContent).toContain('Aim');
    expect(modal!.textContent).toContain('+2');
  });

  it('bypasses modal and rolls directly on alt-click', async () => {
    const solverMock = vi.fn().mockResolvedValue({});
    const wrapper = mount(RollButton, {
      props: {
        title: 'Quick Check',
        components: [
          { rollFormula: '2d6', label: 'Agility' }
        ],
        solver: solverMock
      },
      global: {
        plugins: [pinia],
        directives: {
          tooltip: () => {}
        }
      }
    });

    
    await wrapper.find('button').trigger('click', { altKey: true });
    await wrapper.vm.$nextTick();
    await new Promise(resolve => setTimeout(resolve, 50));

    
    expect(solverMock).toHaveBeenCalled();
    expect(document.body.querySelector('[role="dialog"]')).toBeNull();
  });

  it('applies custom modifiers and sends them to the solver', async () => {
    const solverMock = vi.fn().mockResolvedValue({});
    const wrapper = mount(RollButton, {
      props: {
        title: 'Slugfest Attack',
        components: {
          action: [{ rollFormula: '3d6', label: 'Fighting' }],
          damage: [{ value: 3, label: 'Base Damage', isDamage: true }]
        },
        solver: solverMock
      },
      global: {
        plugins: [pinia],
        directives: {
          tooltip: () => {}
        }
      }
    });

    
    await wrapper.find('button').trigger('click');
    await wrapper.vm.$nextTick();
    await new Promise(resolve => setTimeout(resolve, 50));

    const modal = document.body.querySelector('[role="dialog"]');
    expect(modal).not.toBeNull();
    expect(modal!.textContent).toContain('Base Damage');
    expect(modal!.textContent).toContain('3');
    
    expect(modal!.textContent).not.toContain('+3');

    
    const inputs = modal!.querySelectorAll('input[type="number"]');
    expect(inputs).toHaveLength(2); 
    
    const diceInput = inputs[0] as HTMLInputElement;
    const dmgInput = inputs[1] as HTMLInputElement;

    
    diceInput.value = '2';
    diceInput.dispatchEvent(new Event('input'));
    dmgInput.value = '4';
    dmgInput.dispatchEvent(new Event('input'));
    await wrapper.vm.$nextTick();

    
    const rollButton = Array.from(document.body.querySelectorAll('button')).find(
      btn => btn.textContent?.trim() === 'Roll'
    );
    expect(rollButton).toBeDefined();
    rollButton?.click();
    await wrapper.vm.$nextTick();
    await new Promise(resolve => setTimeout(resolve, 50));

    
    expect(solverMock).toHaveBeenCalled();
    const solverArgs = solverMock.mock.calls[0][0];
    
    
    expect(solverArgs.components.action).toHaveLength(2);
    expect(solverArgs.components.action[1]).toEqual({
      value: 2,
      label: 'Custom Modifier',
      isDamage: false
    });
    
    expect(solverArgs.components.damage).toHaveLength(2);
    expect(solverArgs.components.damage[1]).toEqual({
      value: 4,
      label: 'Extra Damage',
      isDamage: true
    });
  });
});
