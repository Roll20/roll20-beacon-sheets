import { ref, onMounted, onUnmounted } from 'vue';

const BREAKPOINTS = {
  sm: '(min-width: 640px)',
  md: '(min-width: 768px)',
  lg: '(min-width: 1024px)',
  xl: '(min-width: 1280px)',
  '2xl': '(min-width: 1536px)',
};

export function useBreakpoints() {
  const isServer = typeof window === 'undefined';

  const sm = ref(isServer ? false : window.matchMedia(BREAKPOINTS.sm).matches);
  const md = ref(isServer ? false : window.matchMedia(BREAKPOINTS.md).matches);
  const lg = ref(isServer ? false : window.matchMedia(BREAKPOINTS.lg).matches);
  const xl = ref(isServer ? false : window.matchMedia(BREAKPOINTS.xl).matches);
  const xl2 = ref(isServer ? false : window.matchMedia(BREAKPOINTS['2xl']).matches);

  let mediaListeners: Array<{ mediaQuery: MediaQueryList; listener: (e: MediaQueryListEvent) => void }> = [];

  onMounted(() => {
    if (isServer) return;

    const setupListener = (queryStr: string, refVar: { value: boolean }) => {
      const mediaQuery = window.matchMedia(queryStr);
      const listener = (e: MediaQueryListEvent) => {
        refVar.value = e.matches;
      };

      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', listener);
      } else {
        (mediaQuery as any).addListener(listener);
      }

      mediaListeners.push({ mediaQuery, listener });
      refVar.value = mediaQuery.matches;
    };

    setupListener(BREAKPOINTS.sm, sm);
    setupListener(BREAKPOINTS.md, md);
    setupListener(BREAKPOINTS.lg, lg);
    setupListener(BREAKPOINTS.xl, xl);
    setupListener(BREAKPOINTS['2xl'], xl2);
  });

  onUnmounted(() => {
    mediaListeners.forEach(({ mediaQuery, listener }) => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', listener);
      } else {
        (mediaQuery as any).removeListener(listener);
      }
    });
    mediaListeners = [];
  });

  return {
    sm,
    md,
    lg,
    xl,
    '2xl': xl2,
  };
}
