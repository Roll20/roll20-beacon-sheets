<template>
  <div
    class="tof-app"
    :class="[{ 'tof-app--grounded': store.currentStep === 'review' }, prefs.rootClasses]"
    :style="[bgStyle, uiVars]"
  >
    <div v-if="prefs.showStars" class="tof-stars" />
    <div v-if="prefs.showTwinkle" class="tof-twinkle" />
    <div v-if="prefs.showShooting" class="tof-shooting"><span /><span /><span /></div>
    <div v-if="prefs.showMist" class="tof-mist"><span /><span /><span /></div>
    <div v-if="prefs.showEmbers" class="tof-embers">
      <i v-for="n in 16" :key="n" :style="emberStyle(n)" />
    </div>
    <FlowerField v-if="prefs.showFlowers" />
    <div class="tof-shell">
      <header class="tof-header">
        <img class="tof-header__logo" :src="ART.logo" alt="Convergence" />
        <div>
          <h1 class="tof-header__title">{{ PRODUCT.name }}</h1>
          <div class="tof-header__sub">Convergence Character Maker</div>
        </div>
        <div class="tof-vdivider" aria-hidden="true" style="margin-left: auto" />
        <div style="display: flex; align-items: center; gap: 0.6rem">
          <div class="modeswitch">
            <button class="tof-small" :class="{ on: mode === 'build' }" @click="mode = 'build'">
              ✎ Build
            </button>
            <button class="tof-small" :class="{ on: mode === 'play' }" @click="mode = 'play'">
              ▶ Play Sheet
            </button>
            <button
              v-if="crucibleAvailable"
              class="tof-small"
              :class="{ on: mode === 'crucible' }"
              title="The Crucible - the Storyteller's entity forge"
              @click="mode = 'crucible'"
            >
              ⚒ Crucible
            </button>
          </div>
          <button class="tof-btn tof-btn--ghost tof-small" @click="showReference = true">
            📖 Reference
          </button>
          <button
            class="tof-btn tof-btn--ghost tof-small"
            @click="showSettings = true"
            aria-label="Settings and accessibility options"
          >
            ⚙ Settings
          </button>
          <button
            class="tof-btn tof-btn--ghost tof-small"
            @click="showFeedback = true"
            aria-label="Send feedback"
          >
            💬 Feedback
          </button>
          <span v-if="campaignId" class="tof-small tof-muted">#{{ campaignId }}</span>
        </div>
      </header>

      <PlaySheet v-if="mode === 'play'" />

      <main v-else-if="mode === 'crucible'" class="tof-crucible-main">
        <CrucibleHome :gm="isGm" />
      </main>

      <div v-else class="tof-layout">
        <div>
          <StepTabs />
          <AttributeSidebar />
        </div>

        <main>
          <div v-if="store.currentStep !== 'intro'" class="tof-banner" :key="store.currentStep">
            <div class="tof-banner__img" :style="{ backgroundImage: `url(${stepArt})` }" />
            <div class="tof-banner__label">{{ stepLabel }}</div>
          </div>
          <transition name="tof-fade" mode="out-in">
            <component :is="activeStepComponent" :key="store.currentStep" />
          </transition>

          <div class="tof-navrow" v-if="store.currentStep !== 'intro'">
            <button class="tof-btn tof-btn--ghost" @click="store.back()">Back</button>
            <button v-if="store.currentStep !== 'review'" class="tof-btn" @click="store.next()">
              Next
            </button>
          </div>
        </main>
      </div>
    </div>

    <transition name="tof-fade">
      <OvertureFinale v-if="store.finale" />
    </transition>

    <NaomiHelper v-if="mode === 'build' && prefs.prefs.showNaomi" :line="naomiLine" />
    <ReferenceModal :open="showReference" @close="showReference = false" />
    <SettingsModal :open="showSettings" @close="showSettings = false" />
    <FeedbackModal :open="showFeedback" @close="showFeedback = false" />

    <transition name="cine">
      <IntroCinematic
        v-if="showIntro"
        @choose-death="onChooseDeath"
        @complete="enterFromCinematic"
      />
    </transition>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useDraftStore } from '@/maker/store/draftStore';
import { usePrefsStore } from '@/maker/store/prefsStore';
import { useThreadOfFateStore } from '@/sheet/stores';
import { ART, STEP_ART, UI } from '@/maker/data/art';
import { PRODUCT, NAOMI_LINES } from '@/maker/data/constants';
import { STEP_LABELS, STEP_ORDER } from '@/maker/draftModel';
import NaomiHelper from '@/maker/components/NaomiHelper.vue';
import FlowerField from '@/maker/components/FlowerField.vue';
import OvertureFinale from '@/maker/components/OvertureFinale.vue';
import ReferenceModal from '@/maker/components/ReferenceModal.vue';
import SettingsModal from '@/maker/components/SettingsModal.vue';
import IntroCinematic from '@/maker/components/IntroCinematic.vue';
import FeedbackModal from '@/maker/components/FeedbackModal.vue';
import PlaySheet from '@/maker/components/PlaySheet.vue';
import StepTabs from '@/maker/components/StepTabs.vue';
import AttributeSidebar from '@/maker/components/AttributeSidebar.vue';
// The Crucible (GM entity forge) is lazy-loaded: it carries its own registries
// and should not weigh down the player-facing bundle path.
import { defineAsyncComponent } from 'vue';
const CrucibleHome = defineAsyncComponent(() => import('@/crucible/components/CrucibleHome.vue'));

import IntroStep from '@/maker/components/steps/IntroStep.vue';
import StatsStep from '@/maker/components/steps/StatsStep.vue';
import BackgroundStep from '@/maker/components/steps/BackgroundStep.vue';
import EquipmentStep from '@/maker/components/steps/EquipmentStep.vue';
import PhilosophyStep from '@/maker/components/steps/PhilosophyStep.vue';
import RaceStep from '@/maker/components/steps/RaceStep.vue';
import ClassStep from '@/maker/components/steps/ClassStep.vue';
import ArtesStep from '@/maker/components/steps/ArtesStep.vue';
import BioStep from '@/maker/components/steps/BioStep.vue';
import ReviewStep from '@/maker/components/steps/ReviewStep.vue';

const store = useDraftStore();
const prefs = usePrefsStore();
const sheet = useThreadOfFateStore();
const campaignId = computed(() => sheet.meta.campaignId);
const showReference = ref(false);
const showSettings = ref(false);
const showFeedback = ref(false);
const showIntro = ref(true);
const mode = ref<'build' | 'play' | 'crucible'>('build');

/**
 * GM detection: in the Roll20 VTT, Beacon settings say who is the GM. Outside a
 * campaign (dev server, desktop app) `gm` is undefined and the user is treated
 * as the Storyteller of their own browser. Explicit `false` = a player session.
 */
const isGm = computed(() => sheet.meta.permissions.isGM !== false);
/** True when this Roll20 character IS a deployed Crucible entity. */
const isCrucibleCharacter = computed(() => sheet.crucibleCharacter.isBound);
/**
 * Players only see the Crucible when this character is a deployed entity they
 * are allowed to view (the player-safe projection is all that ever hydrates).
 */
const crucibleAvailable = computed(
  () =>
    isGm.value ||
    (isCrucibleCharacter.value && sheet.crucibleCharacter.bound?.roll20.playerVisible === true),
);

// A character that IS a Crucible entity opens on its statblock sheet - the same
// experience as opening an NPC sheet in Roll20's D&D system. The intro cinematic
// is a character-creation flourish; an NPC sheet skips it.
watch(
  isCrucibleCharacter,
  (bound) => {
    if (bound && crucibleAvailable.value) {
      mode.value = 'crucible';
      showIntro.value = false;
    }
  },
  { immediate: true },
);

// Background music is disabled for now (kept in the codebase for later).
function enterFromCinematic() {
  showIntro.value = false;
}
function onChooseDeath(manner: string) {
  store.patch('bio', { howYouDie: manner });
}

// Expose the official UI-kit assets as CSS vars so theme.scss url()s respect the base path.
const uiVars = {
  '--ui-moon': `url(${UI.moon})`,
  '--ui-hourglass': `url(${UI.hourglass})`,
  '--ui-attr-box': `url(${UI.attrBox})`,
  '--ui-attr-button': `url(${UI.attrButton})`,
  '--ui-attr-divider': `url(${UI.attrDivider})`,
  '--ui-total-box': `url(${UI.totalBox})`,
  '--ui-overview-divider': `url(${UI.overviewDivider})`,
  '--ui-menu-box': `url(${UI.menuBox})`,
  '--ui-chevron': `url(${UI.chevron})`,
} as Record<string, string>;

// Deterministic-but-varied drifting ember positions/timings.
function emberStyle(n: number) {
  const left = (n * 61) % 100;
  const delay = (n * 1.7) % 12;
  const dur = 9 + ((n * 3) % 8);
  const size = 2 + (n % 3);
  return {
    left: `${left}%`,
    width: `${size}px`,
    height: `${size}px`,
    animationDelay: `-${delay}s`,
    animationDuration: `${dur}s`,
  };
}

const stepComponents: Record<string, unknown> = {
  intro: IntroStep,
  stats: StatsStep,
  background: BackgroundStep,
  equipment: EquipmentStep,
  philosophy: PhilosophyStep,
  race: RaceStep,
  class: ClassStep,
  artes: ArtesStep,
  bio: BioStep,
  review: ReviewStep,
};

const activeStepComponent = computed(() => stepComponents[store.currentStep]);
const naomiLine = computed(() =>
  store.finale ? NAOMI_LINES.overture : NAOMI_LINES[store.currentStep] ?? '',
);
const stepArt = computed(() => STEP_ART[store.currentStep] ?? ART.logo);
const stepLabel = computed(() => STEP_LABELS[store.currentStep] ?? '');

// Night (Intro) -> pre-dawn (Review): the sky lightens as the character takes form.
function mix(c1: number[], c2: number[], t: number) {
  const r = Math.round(c1[0] + (c2[0] - c1[0]) * t);
  const g = Math.round(c1[1] + (c2[1] - c1[1]) * t);
  const b = Math.round(c1[2] + (c2[2] - c1[2]) * t);
  return `rgb(${r},${g},${b})`;
}
const NIGHT_TOP = [22, 20, 44];
const NIGHT_HZ = [11, 11, 22];
const DAWN_TOP = [58, 56, 110];
const DAWN_HZ = [86, 58, 78];
const bgStyle = computed(() => {
  const idx = STEP_ORDER.indexOf(store.currentStep);
  const t = STEP_ORDER.length > 1 ? idx / (STEP_ORDER.length - 1) : 0;
  const top = mix(NIGHT_TOP, DAWN_TOP, t);
  const hz = mix(NIGHT_HZ, DAWN_HZ, t);
  return { background: `radial-gradient(ellipse at 50% -10%, ${top} 0%, ${hz} 60%, #0b0810 100%)` };
});
</script>

<style scoped lang="scss">
/* Cinematic hand-off: after the white-out, fade gently to the sheet. */
.cine-leave-active {
  transition: opacity 1s ease;
}
.cine-leave-to {
  opacity: 0;
}

.tof-navrow {
  display: flex;
  justify-content: space-between;
  margin-top: 1.25rem;
}
.modeswitch {
  display: inline-flex;
  border: 1px solid var(--tof-panel-border);
  border-radius: 999px;
  overflow: hidden;
}
.modeswitch button {
  background: transparent;
  border: none;
  color: var(--tof-cream);
  padding: 0.35rem 0.8rem;
  cursor: pointer;
}
.modeswitch button.on {
  background: linear-gradient(180deg, var(--tof-gold), #c4861a);
  color: #2a1d05;
  font-weight: 700;
}
.tof-banner {
  position: relative;
  height: 230px;
  border-radius: var(--tof-radius);
  overflow: hidden;
  margin-bottom: 1.1rem;
  border: 1px solid var(--tof-panel-border-strong);
  box-shadow: var(--tof-shadow), 0 0 26px rgba(235, 167, 46, 0.15);
}
.tof-banner__img {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  animation: tof-kenburns 18s ease-in-out infinite alternate;
}
.tof-banner::after {
  content: '';
  position: absolute;
  inset: 0;
  /* keep the art clearly viewable: only a gentle bottom + edge vignette */
  background: linear-gradient(
      180deg,
      rgba(11, 11, 22, 0.05) 0%,
      rgba(11, 11, 22, 0) 35%,
      rgba(11, 11, 22, 0.65) 100%
    ),
    radial-gradient(120% 120% at 50% 40%, transparent 60%, rgba(11, 11, 22, 0.5) 100%);
}
.tof-banner__label {
  position: absolute;
  left: 1rem;
  bottom: 0.7rem;
  z-index: 2;
  font-family: var(--tof-font-heading);
  font-weight: 700;
  font-size: 1.7rem;
  letter-spacing: 0.04em;
  color: #fff;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.8), 0 0 18px rgba(235, 167, 46, 0.4);
}
@keyframes tof-kenburns {
  from {
    transform: scale(1.04) translate(0, 0);
  }
  to {
    transform: scale(1.14) translate(-1.5%, -2%);
  }
}
@media (max-width: 700px) {
  .tof-banner {
    height: 160px;
  }
}
</style>
