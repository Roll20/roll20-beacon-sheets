import { ref } from 'vue';
import type { EventListeners } from 'overlayscrollbars';
import type { OverlayScrollbarsComponentRef } from 'overlayscrollbars-vue';

export const useOverlayScrollArea = () => {
  const scroll = ref<OverlayScrollbarsComponentRef | HTMLDivElement | null>(null);
  const isScrollAtEnd = ref(false);
  const isScrollNotAtStart = ref(false);

  const resetScrollState = () => {
    isScrollNotAtStart.value = false;
    isScrollAtEnd.value = true;
  };

  const getScrollElement = () => {
    const current = scroll.value;
    if (!current) return null;
    if ('osInstance' in current) {
      return current.osInstance()?.elements().scrollOffsetElement ?? null;
    }
    return current;
  };

  const syncScrollState = () => {
    const scrollElement = getScrollElement();
    if (!scrollElement) {
      resetScrollState();
      return;
    }

    const maxScrollTop = scrollElement.scrollHeight - scrollElement.clientHeight;
    isScrollNotAtStart.value = scrollElement.scrollTop > 1;
    isScrollAtEnd.value = maxScrollTop <= 0 || scrollElement.scrollTop >= maxScrollTop - 1;
  };

  const scrollEvents: EventListeners = {
    initialized: () => syncScrollState(),
    updated: () => syncScrollState(),
    scroll: () => syncScrollState()
  };

  return {
    scroll,
    isScrollAtEnd,
    isScrollNotAtStart,
    resetScrollState,
    syncScrollState,
    scrollEvents
  };
};