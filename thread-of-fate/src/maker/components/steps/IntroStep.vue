<template>
  <section class="tof-panel intro">
    <img class="intro__hero" :src="STEP_ART.intro" alt="" />
    <h2 class="tof-h2">A Spark, Not Yet Taken Form</h2>
    <p class="tof-muted">
      Every legend of Convergence begins as you are now, unwritten, unshaped, a thread of
      possibility waiting to be woven into the Storyteller's world. Together we'll decide who you
      were, what you can do, and the fate you'll carry into the tale to come.
    </p>
    <p class="tof-muted">
      Take your time. Nothing here is final until you choose to begin your story.
    </p>

    <div class="intro__cta">
      <button class="tof-btn tof-btn--primary" @click="store.visit('stats')">
        {{ PRODUCT.openingCta }}
      </button>
      <button class="tof-btn tof-btn--ghost" @click="confirmReset">Start a New Thread</button>
    </div>
    <p class="tof-small tof-muted intro__note">
      Your progress saves automatically in this browser. In Roll20, it syncs to your character.
    </p>
  </section>
</template>

<script setup lang="ts">
import { useDraftStore } from '@/maker/store/draftStore';
import { STEP_ART } from '@/maker/data/art';
import { PRODUCT } from '@/maker/data/constants';

const store = useDraftStore();
function confirmReset() {
  if (confirm('Start over? This clears the current character draft in this browser.')) {
    store.reset();
    store.visit('intro');
  }
}
</script>

<style scoped lang="scss">
.intro {
  text-align: center;
}
.intro__hero {
  width: 100%;
  max-height: 320px;
  object-fit: cover;
  border-radius: var(--tof-radius);
  margin-bottom: 1rem;
  border: 1px solid var(--tof-panel-border);
  mask-image: linear-gradient(180deg, #000 70%, transparent);
}
.intro__cta {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  margin-top: 1.25rem;
  flex-wrap: wrap;
}
.intro__note {
  margin-top: 1rem;
}
</style>
