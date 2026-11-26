<script setup>
import { computed, onMounted, nextTick, ref, watch } from 'vue'
import { devChatLog, clearDevChat } from '@/relay/devRelay.js'
import { initValues } from '@/relay/relay.js'
import { themeOf } from '@/theme.js'

const dark = computed(() => themeOf(initValues.settings?.colorTheme) === 'dark')

const scroller = ref(null)

onMounted(() => {
  const href = `${import.meta.env.BASE_URL}host.css`
  if (!document.querySelector(`link[href="${href}"]`)) {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = href
    document.head.appendChild(link)
  }
})

watch(
  () => devChatLog.length,
  async () => {
    await nextTick()
    if (scroller.value) scroller.value.scrollTop = scroller.value.scrollHeight
  },
)
</script>

<template>
  <aside class="dev-chat">
    <header class="dev-chat__bar">
      <span>Chat preview</span>
      <small>dev only</small>
      <button type="button" @click="clearDevChat()">Clear</button>
    </header>

    <div ref="scroller" class="dev-chat__log" :class="{ 'sheet-darkmode': dark }">
      <p v-if="devChatLog.length === 0" class="dev-chat__empty">
        Roll something and the card will appear here, styled by host.css exactly as
        Roll20 will render it.
      </p>
      <div v-for="entry in devChatLog" :key="entry.id" class="dev-chat__card" v-html="entry.content" />
    </div>
  </aside>
</template>

<style scoped lang="scss">
.dev-chat {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 310px;
  display: flex;
  flex-direction: column;
  background: #2b2b2b;
  border-left: 3px solid #b49b57;
  z-index: 50;
  font-family: 'Segoe UI', sans-serif;

  &__bar {
    display: flex;
    align-items: baseline;
    gap: 6px;
    padding: 6px 8px;
    background: #1f3864;
    color: #fff;
    font-size: 12px;
    font-weight: 700;

    small { color: #d8c893; font-weight: 400; font-size: 9px; }

    button {
      margin-left: auto;
      background: transparent;
      border: 1px solid rgba(255, 255, 255, 0.5);
      color: #fff;
      border-radius: 4px;
      font-size: 10px;
      padding: 1px 7px;
      cursor: pointer;

      &:hover { background: rgba(255, 255, 255, 0.15); }
    }
  }

  &__log {
    flex: 1;
    overflow-y: auto;
    padding: 8px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__empty {
    color: #bbb;
    font-size: 11px;
    line-height: 1.5;
    margin: 0;
  }
}
</style>
