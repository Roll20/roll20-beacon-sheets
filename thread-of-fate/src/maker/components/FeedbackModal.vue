<template>
  <transition name="tof-fade">
    <div v-if="open" class="fbmodal" @click.self="$emit('close')">
      <div class="fbmodal__panel tof-panel">
        <button class="fbmodal__close" @click="$emit('close')" aria-label="Close">x</button>
        <h2 class="tof-h2" style="margin-top: 0">Send Feedback</h2>
        <p class="tof-small tof-muted">
          Found a bug, a wrong number, or have a suggestion? In a Roll20 game this whispers to your
          GM; standalone it copies to your clipboard so you can paste it anywhere.
        </p>

        <label class="tof-label" for="fb-cat">Type</label>
        <select id="fb-cat" class="tof-select" v-model="category" style="max-width: 220px">
          <option>Bug</option>
          <option>Wrong rule / number</option>
          <option>Suggestion</option>
          <option>Balance</option>
          <option>Other</option>
        </select>

        <label class="tof-label" for="fb-msg">Message</label>
        <textarea
          id="fb-msg"
          class="tof-textarea"
          v-model="message"
          rows="5"
          placeholder="What happened, or what would you like to see?"
        />

        <p class="tof-small tof-muted">
          Auto-included: <em>{{ context }}</em>
        </p>

        <div class="fbfooter">
          <a
            v-if="feedbackLink"
            :href="feedbackLink"
            target="_blank"
            rel="noopener"
            class="tof-btn tof-btn--ghost tof-small"
            >Open feedback form ^</a
          >
          <span style="flex: 1" />
          <button
            class="tof-btn tof-btn--ghost tof-small"
            :disabled="!message.trim()"
            @click="copy()"
          >
            Copy
          </button>
          <button class="tof-btn tof-small" :disabled="!message.trim()" @click="sendToChat()">
            Send to GM
          </button>
        </div>
        <p v-if="status" class="tof-small tof-ok" style="margin-top: 0.5rem">{{ status }}</p>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useDraftStore } from '@/maker/store/draftStore';
import { PRODUCT } from '@/maker/data/constants';
import { dispatchRef, initValues } from '@/relay/relay';

defineProps<{ open: boolean }>();
defineEmits<{ close: [] }>();

const store = useDraftStore();
const category = ref('Bug');
const message = ref('');
const status = ref('');
const feedbackLink = PRODUCT.feedbackLink;

const context = computed(() => {
  const d = store.draft;
  const cls =
    d.classBuild.classes
      .map((c) => c.classId)
      .filter(Boolean)
      .join('/') || 'none';
  return `${d.identity.name || 'Unnamed'} - Lv ${store.level} - ${cls} - step: ${d.currentStep}`;
});

function plainText() {
  return `[${PRODUCT.name} Feedback]\nType: ${category.value}\nContext: ${
    context.value
  }\n\n${message.value.trim()}`;
}

function escapeHtml(s: string) {
  return s.replace(
    /[&<>"]/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string),
  );
}

async function copy() {
  try {
    await navigator.clipboard.writeText(plainText());
    status.value = 'Copied to clipboard.';
  } catch {
    status.value =
      'Could not copy automatically, please select the message text and copy it manually.';
  }
}

async function sendToChat() {
  const dispatch = dispatchRef.value as { post?: (a: unknown) => Promise<unknown> } | undefined;
  try {
    if (dispatch?.post) {
      await dispatch.post({
        characterId: initValues.character?.id,
        content:
          `<div style="border:1px solid #b9923a;border-radius:6px;padding:6px;">` +
          `<strong>${escapeHtml(PRODUCT.name)} Feedback</strong>, ${escapeHtml(
            category.value,
          )}<br/>` +
          `${escapeHtml(message.value.trim())}<br/><small>${escapeHtml(
            context.value,
          )}</small></div>`,
        options: { whisper: 'gm' },
      });
      status.value = 'Sent to your GM in chat. Thank you!';
      message.value = '';
    } else {
      await copy();
      status.value = 'No Roll20 chat here, copied to clipboard instead.';
    }
  } catch {
    await copy();
    status.value = 'Could not reach chat, copied to clipboard instead.';
  }
}
</script>

<style scoped lang="scss">
.fbmodal {
  position: fixed;
  inset: 0;
  z-index: 131;
  background: rgba(8, 6, 14, 0.78);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}
.fbmodal__panel {
  position: relative;
  width: min(560px, 96vw);
  max-height: 88vh;
  overflow-y: auto;
}
.fbmodal__close {
  position: absolute;
  top: 0.5rem;
  right: 0.75rem;
  background: none;
  border: none;
  color: var(--tof-accent-blue);
  cursor: pointer;
  font-size: 1.4rem;
  line-height: 1;
}
.fbmodal__close:hover {
  color: var(--tof-cream);
}
.fbfooter {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.75rem;
}
</style>
