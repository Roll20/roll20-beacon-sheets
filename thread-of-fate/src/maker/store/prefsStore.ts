import { defineStore } from 'pinia';
import { reactive, computed, watch } from 'vue';

/**
 * User interface preferences, visual ambiance + accessibility. Persisted to
 * localStorage separately from the character draft so they follow the player,
 * not the character.
 */
export interface UiPrefs {
  // Ambiance toggles
  stars: boolean;
  twinkle: boolean;
  shootingStars: boolean;
  mist: boolean;
  embers: boolean;
  flowers: boolean;
  showNaomi: boolean;
  music: boolean;
  musicVolume: number;
  // Accessibility
  motion: 'full' | 'reduced';
  highContrast: boolean;
  textScale: 'normal' | 'large' | 'xl';
  dyslexiaFont: boolean;
}

const STORAGE_KEY = 'thread-of-fate:prefs';

function defaults(): UiPrefs {
  // Default reduced-motion to whatever the OS asks for.
  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  return {
    stars: true,
    twinkle: true,
    shootingStars: true,
    mist: true,
    embers: true,
    flowers: true,
    showNaomi: true,
    music: true,
    musicVolume: 0.4,
    motion: prefersReduced ? 'reduced' : 'full',
    highContrast: false,
    textScale: 'normal',
    dyslexiaFont: false,
  };
}

function load(): UiPrefs {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults();
    return { ...defaults(), ...JSON.parse(raw) };
  } catch {
    return defaults();
  }
}

export const usePrefsStore = defineStore('threadOfFatePrefs', () => {
  const prefs = reactive<UiPrefs>(load());

  watch(
    prefs,
    () => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
      } catch {
        /* ignore quota */
      }
    },
    { deep: true },
  );

  /** When motion is reduced, also suppress the busier ambient layers. */
  const motionOk = computed(() => prefs.motion === 'full');
  const showStars = computed(() => prefs.stars);
  const showTwinkle = computed(() => prefs.twinkle && motionOk.value);
  const showShooting = computed(() => prefs.shootingStars && motionOk.value);
  const showMist = computed(() => prefs.mist);
  const showEmbers = computed(() => prefs.embers && motionOk.value);
  const showFlowers = computed(() => prefs.flowers);

  /** Root classes that drive accessibility CSS. */
  const rootClasses = computed(() => ({
    'tof-a11y--contrast': prefs.highContrast,
    'tof-a11y--text-large': prefs.textScale === 'large',
    'tof-a11y--text-xl': prefs.textScale === 'xl',
    'tof-a11y--dyslexia': prefs.dyslexiaFont,
    'tof-a11y--reduced': prefs.motion === 'reduced',
  }));

  function reset() {
    Object.assign(prefs, defaults());
  }

  return {
    prefs,
    motionOk,
    showStars,
    showTwinkle,
    showShooting,
    showMist,
    showEmbers,
    showFlowers,
    rootClasses,
    reset,
  };
});
