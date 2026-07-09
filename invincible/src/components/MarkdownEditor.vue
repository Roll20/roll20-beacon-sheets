<template>
  <div class="markdown-editor border-2 border-black bg-zinc-50" :style="{ '--editor-height': height }">
    
    <div class="toolbar flex items-center gap-0.5 border-b-2 border-black px-2 py-1 bg-zinc-100">
      <template v-if="isEditing">
        <button
          v-tooltip="$t('markdown_editor.bold')"
          @click="wrapSelection('**')"
          type="button"
          class="toolbar-btn"
        >
          <span class="material-symbols-outlined text-lg">format_bold</span>
        </button>

        <button
          v-tooltip="$t('markdown_editor.italic')"
          @click="wrapSelection('*')"
          type="button"
          class="toolbar-btn"
        >
          <span class="material-symbols-outlined text-lg">format_italic</span>
        </button>

        <button
          v-tooltip="$t('markdown_editor.code')"
          @click="wrapSelection('`')"
          type="button"
          class="toolbar-btn"
        >
          <span class="material-symbols-outlined text-lg">code</span>
        </button>

        <button
          v-tooltip="$t('markdown_editor.bullet_list')"
          @click="insertBulletList()"
          type="button"
          class="toolbar-btn"
        >
          <span class="material-symbols-outlined text-lg">format_list_bulleted</span>
        </button>

        <button
          v-tooltip="$t('markdown_editor.heading')"
          @click="insertHeading()"
          type="button"
          class="toolbar-btn"
        >
          <span class="material-symbols-outlined text-lg">title</span>
        </button>

        <div class="flex-1" />

        <button
          v-tooltip="$t('markdown_editor.preview')"
          @click="isEditing = false; emit('update:modelValue', rawText)"
          type="button"
          class="toolbar-btn text-primary"
        >
          <span class="material-symbols-outlined text-lg">visibility</span>
        </button>
      </template>

      <template v-else>
        <div class="flex-1" />
        <button
          v-tooltip="$t('markdown_editor.edit')"
          @click="isEditing = true"
          type="button"
          class="toolbar-btn text-primary"
        >
          <span class="material-symbols-outlined text-lg">edit</span>
        </button>
      </template>
    </div>

    <!-- Scrollable Editor -->
    <OverlayScrollbarsComponent
      v-if="isEditing"
      :options="{ scrollbars: { autoHide: 'leave', theme: 'os-theme-dark' }, overflow: { x: 'hidden', y: 'scroll' } }"
      class="scroll-area w-full"
      @click="focusTextarea"
    >
      <textarea
        id="markdown-editor"
        ref="textareaRef"
        v-model="rawText"
        @blur="emit('update:modelValue', rawText)"
        class="w-full resize-none p-3 text-base font-lexend bg-transparent focus:outline-none leading-relaxed block overflow-hidden"
        spellcheck="true"
      />
    </OverlayScrollbarsComponent>

    <!-- Scrollable Preview -->
    <OverlayScrollbarsComponent
      v-else
      :options="{ scrollbars: { autoHide: 'leave', theme: 'os-theme-dark' }, overflow: { x: 'hidden', y: 'scroll' } }"
      class="scroll-area w-full"
    >
      <div
        class="preview w-full p-3 text-base font-lexend leading-relaxed"
        v-html="renderedHtml"
      />
    </OverlayScrollbarsComponent>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import MarkdownIt from 'markdown-it'
import DOMPurify from 'dompurify'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-vue'

const DEFAULT_HEIGHT = '12rem' 

interface Props {
  modelValue?: string
  
  height?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  height: DEFAULT_HEIGHT,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const md = new MarkdownIt({
  html: false,
  linkify: true,
  breaks: true,
})

const isEditing = ref(true)

const rawText = ref(props.modelValue)

const textareaRef = ref<HTMLTextAreaElement | null>(null)

const adjustHeight = () => {
  const textarea = textareaRef.value
  if (textarea) {
    textarea.style.height = 'auto'
    textarea.style.height = `${textarea.scrollHeight}px`
  }
}

onMounted(() => {
  adjustHeight()
})

watch(rawText, () => {
  nextTick(() => {
    adjustHeight()
  })
})

watch(isEditing, (editing) => {
  if (editing) {
    nextTick(() => {
      adjustHeight()
    })
  }
})

const focusTextarea = () => {
  textareaRef.value?.focus()
}

watch(
  () => props.modelValue,
  (newVal) => {
    rawText.value = newVal ?? ''
  }
)

const renderedHtml = computed(() => {
  const dirtyHtml = md.render(rawText.value)
  return DOMPurify.sanitize(dirtyHtml)
})

function wrapSelection(before: string, after = before) {
  const textarea = document.getElementById(
    'markdown-editor'
  ) as HTMLTextAreaElement

  if (!textarea) return

  const start = textarea.selectionStart
  const end = textarea.selectionEnd

  const selected = rawText.value.substring(start, end)

  const replacement = `${before}${selected}${after}`

  rawText.value =
    rawText.value.substring(0, start) +
    replacement +
    rawText.value.substring(end)

  emit('update:modelValue', rawText.value)

  textarea.focus()

  textarea.setSelectionRange(
    start + before.length,
    end + before.length
  )
}

function insertBulletList() {
  const textarea = document.getElementById(
    'markdown-editor'
  ) as HTMLTextAreaElement

  if (!textarea) return

  const start = textarea.selectionStart
  const end = textarea.selectionEnd

  const selected = rawText.value.substring(start, end)

  const lines = selected.split('\n')

  const bulleted = lines
    .map((line) => `- ${line}`)
    .join('\n')

  rawText.value =
    rawText.value.substring(0, start) +
    bulleted +
    rawText.value.substring(end)

  emit('update:modelValue', rawText.value)

  textarea.focus()
}

function insertHeading() {
  wrapSelection('# ', '')
}
</script>

<style lang="scss" scoped>
.toolbar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 0.25rem;
  transition: all 150ms ease;
  outline: none;
  color: #52525b;
  cursor: pointer;

  &:hover {
    background-color: #e4e4e7;
    color: #18181b;
  }

  &:active {
    background-color: #d4d4d8;
  }
}

.scroll-area {
  height: var(--editor-height);
}
</style>
