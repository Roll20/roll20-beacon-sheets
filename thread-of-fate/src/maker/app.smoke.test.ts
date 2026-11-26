import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia } from 'pinia';
import { createI18n } from 'vue-i18n';
import App from '@/App.vue';

/** Mount the whole app shell in jsdom to catch any setup/render crash (blank-page guard). */
describe('App shell', () => {
  beforeEach(() => localStorage.clear());

  it('mounts without throwing and renders the header', () => {
    const wrapper = mount(App, {
      global: { plugins: [createPinia(), createI18n({ legacy: false })] },
    });
    expect(wrapper.html()).toContain('Thread of Fate');
  });

  it('survives a stale/partial saved draft (migration)', () => {
    // An old draft missing classSkills/growth/otherAcBonus must not crash.
    localStorage.setItem(
      'thread-of-fate:draft',
      JSON.stringify({
        id: 'old',
        schemaVersion: 1,
        classBuild: {
          startingLevel: 4,
          classes: [{ classId: 'reclaimer', level: 4 }],
          aspects: [],
        },
      }),
    );
    const wrapper = mount(App, {
      global: { plugins: [createPinia(), createI18n({ legacy: false })] },
    });
    expect(wrapper.html()).toContain('Thread of Fate');
  });
});
