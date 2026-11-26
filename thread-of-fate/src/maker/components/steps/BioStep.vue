<template>
  <section>
    <div class="tof-panel">
      <h2 class="tof-h2">Writing Your Bio</h2>
      <p class="tof-muted">Who are you, really?</p>

      <div class="tof-grid tof-grid--3">
        <div>
          <label class="tof-label">Name</label>
          <input class="tof-input" :value="bio0.name" @input="patchIdentity('name', $event)" />
        </div>
        <div>
          <label class="tof-label">Age</label>
          <input class="tof-input" :value="bio0.age" @input="patchIdentity('age', $event)" />
        </div>
        <div>
          <label class="tof-label">Height</label>
          <input class="tof-input" :value="bio0.height" @input="patchIdentity('height', $event)" />
        </div>
      </div>
      <div style="margin-top: 0.75rem">
        <label class="tof-label">Thread's End , How You Die</label>
        <select
          class="tof-select"
          style="max-width: 240px"
          :value="bio.howYouDie"
          @change="patch({ howYouDie: ($event.target as HTMLSelectElement).value })"
        >
          <option value="">, unchosen ,</option>
          <option v-for="m in DEATH_MANNERS" :key="m" :value="m">{{ m }}</option>
        </select>
        <p class="tof-small tof-muted" style="margin-top: 0.2rem">
          The fate you named at the forge. It is yours to revise.
        </p>
      </div>
    </div>

    <div class="tof-panel">
      <h3 class="tof-h3" style="margin-top: 0">Portraits</h3>
      <p class="tof-small tof-muted">
        Avatar appears on the main sheet; the full reference appears on your bio page. Character art
        is optional. Images are stored in your browser (or via Roll20 in the VTT).
      </p>
      <div class="tof-grid tof-grid--2">
        <div class="upload">
          <label class="tof-label">Avatar Image</label>
          <img v-if="bio.avatarImage" :src="bio.avatarImage" class="upload__preview" alt="avatar" />
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            @change="onFile($event, 'avatarImage')"
          />
          <button
            v-if="bio.avatarImage"
            class="tof-btn tof-btn--ghost tof-small"
            @click="patch({ avatarImage: null })"
          >
            Clear
          </button>
        </div>
        <div class="upload">
          <label class="tof-label">Full Reference Image</label>
          <img
            v-if="bio.fullReferenceImage"
            :src="bio.fullReferenceImage"
            class="upload__preview"
            alt="reference"
          />
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            @change="onFile($event, 'fullReferenceImage')"
          />
          <button
            v-if="bio.fullReferenceImage"
            class="tof-btn tof-btn--ghost tof-small"
            @click="patch({ fullReferenceImage: null })"
          >
            Clear
          </button>
        </div>
      </div>
      <p v-if="sizeWarning" class="tof-warn--soft tof-small">{{ sizeWarning }}</p>
    </div>

    <div class="tof-panel">
      <label class="tof-label">Character Description</label>
      <textarea
        class="tof-textarea"
        :value="bio.description"
        @input="patch({ description: text($event) })"
        placeholder="Write a description for your character here..."
      />
      <label class="tof-label">Character Lore</label>
      <textarea
        class="tof-textarea"
        :value="bio.lore"
        @input="patch({ lore: text($event) })"
        placeholder="Write lore for your character here..."
      />
      <div class="tof-grid tof-grid--2">
        <div>
          <label class="tof-label">Allies</label>
          <textarea
            class="tof-textarea"
            :value="bio.allies"
            @input="patch({ allies: text($event) })"
            placeholder="ALLIES: Notable NPCs or allies from your background..."
          />
        </div>
        <div>
          <label class="tof-label">Enemies</label>
          <textarea
            class="tof-textarea"
            :value="bio.enemies"
            @input="patch({ enemies: text($event) })"
            placeholder="ENEMIES: Notable NPCs or enemies from your background..."
          />
        </div>
      </div>
    </div>

    <StepWarnings step="bio" />
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useDraftStore } from '@/maker/store/draftStore';
import { downscaleImage, dataUrlApproxKb } from '@/maker/util/image';
import { DEATH_MANNERS } from '@/maker/data/constants';
import StepWarnings from '@/maker/components/StepWarnings.vue';

const store = useDraftStore();
const bio = computed(() => store.draft.bio);
const bio0 = computed(() => store.draft.identity);
const sizeWarning = ref('');

const patch = (v: Partial<typeof bio.value>) => store.patch('bio', v);
const text = (e: Event) => (e.target as HTMLTextAreaElement).value;
function patchIdentity(field: string, e: Event) {
  store.patch('identity', { [field]: (e.target as HTMLInputElement).value } as never);
}

async function onFile(e: Event, key: 'avatarImage' | 'fullReferenceImage') {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  try {
    // Avatars stay small (sheet thumbnail); reference art a bit larger.
    const maxDim = key === 'avatarImage' ? 256 : 768;
    const result = await downscaleImage(file, maxDim);
    patch({ [key]: result } as never);
    const kb = dataUrlApproxKb(result);
    sizeWarning.value =
      kb > 700
        ? `Stored image is ~${kb} KB. Very large images may not persist in browser storage; a smaller source helps.`
        : '';
  } catch {
    sizeWarning.value = 'Could not process that image. Try a PNG, JPEG, or WebP.';
  }
}
</script>

<style scoped lang="scss">
.upload {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  align-items: flex-start;
}
.upload__preview {
  max-width: 160px;
  max-height: 160px;
  border-radius: 8px;
  border: 1px solid var(--tof-panel-border);
}
</style>
