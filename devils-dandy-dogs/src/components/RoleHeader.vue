<script setup>
import { computed, ref, watch } from 'vue'
import { useSheetStore } from '@/stores/sheetStore.js'
import { useMetaStore } from '@/stores/metaStore.js'

const sheet = useSheetStore()
const meta = useMetaStore()

// Rendered from the source role, not unconditionally: `Custom` would otherwise read "The Custom".
const hasArticle = computed(() => /^The\s+/i.test(sheet.role))
const displayRole = computed(() => sheet.role.replace(/^The\s+/i, ''))

// `meta.avatar` is '' for every new character and can also hold a url whose image
// is gone. Either way an unguarded <img> paints the browser's broken-image icon
// and its alt text inside the panel, where it reads as part of the design — so the
// slot collapses instead (ddd-4ys). A dead url only announces itself via `error`,
// which is why the empty check alone is not enough.
const tokenFailed = ref(false)
watch(
  () => meta.avatar,
  () => (tokenFailed.value = false) // a replacement token deserves a fresh attempt
)
const showToken = computed(() => Boolean(meta.avatar) && !tokenFailed.value)

const onSelect = (event) => {
  const name = event.target.value
  if (!sheet.selectRole(name)) {
    const ok = window.confirm(
      'Replace Role details? Traits, Drive, Storytelling, and Tricks will be overwritten. Your name, Devil’s Mark, tracks, and pacts are kept.'
    )
    if (ok) {
      sheet.selectRole(name, { force: true })
    } else {
      event.target.value = sheet.role // revert the <select>
    }
  }
}
</script>

<template>
  <header class="role-header ddd-section">
    <h2 class="ddd-banner">Dog</h2>
    <div class="ddd-panel">
      <!-- Two columns at width, one when narrow (ddd-93d). Source order is the collapsed
           order, so the identity fields stay above the role prose either way. -->
      <div class="role-header__layout">
        <div class="role-header__bar">
          <!-- alt is empty on purpose: the token is decorative, and the Name field
               beside it already carries the character's identity -->
          <div v-if="showToken" class="avatar">
            <img :src="meta.avatar" alt="" @error="tokenFailed = true" />
          </div>
          <div class="role-header__fields">
            <label class="label" for="char-name">Name</label>
            <input id="char-name" v-model="meta.name" />
            <label class="label" for="role-select">Role</label>
            <select id="role-select" class="role-select" :value="sheet.role" @change="onSelect">
              <option v-for="r in sheet.roles" :key="r.role" :value="r.role">{{ r.role }}</option>
            </select>
          </div>
        </div>
        <div class="role-header__role">
          <!-- the trailing space in the article is deliberate: without it the accessible name
               reads "TheBeloved" -->
          <h1 class="role-header__title">
            <span v-if="hasArticle" class="the">The </span>{{ displayRole }}
          </h1>
          <!-- description is trusted bundled HTML and already contains its own <p> -->
          <div class="role-header__desc" v-html="sheet.description"></div>
        </div>
      </div>
    </div>
  </header>
</template>
