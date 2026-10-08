<template>
  <transition name="tof-fade">
    <div v-if="open" class="setmodal" @click.self="$emit('close')">
      <div class="setmodal__panel tof-panel">
        <button class="setmodal__close" @click="$emit('close')" aria-label="Close">x</button>
        <h2 class="tof-h2" style="margin-top: 0">Settings &amp; Accessibility</h2>

        <h3 class="tof-h3">Ambiance</h3>
        <p class="tof-small tof-muted">
          Tune the scene. Turning effects off can also help performance or focus.
        </p>
        <div class="setgrid">
          <label class="settoggle"><input type="checkbox" v-model="p.stars" /> Starfield</label>
          <label class="settoggle"><input type="checkbox" v-model="p.twinkle" /> Twinkle</label>
          <label class="settoggle"
            ><input type="checkbox" v-model="p.shootingStars" /> Shooting stars</label
          >
          <label class="settoggle"><input type="checkbox" v-model="p.mist" /> Drifting mist</label>
          <label class="settoggle"
            ><input type="checkbox" v-model="p.embers" /> Rising embers</label
          >
          <label class="settoggle"
            ><input type="checkbox" v-model="p.flowers" /> Spider lilies</label
          >
          <label class="settoggle"
            ><input type="checkbox" v-model="p.showNaomi" /> Show Naomi (guide)</label
          >
        </div>

        <h3 class="tof-h3">Accessibility</h3>
        <div class="setrow">
          <span class="tof-label" style="margin: 0">Motion</span>
          <div class="segmented">
            <button :class="{ on: p.motion === 'full' }" @click="p.motion = 'full'">Full</button>
            <button :class="{ on: p.motion === 'reduced' }" @click="p.motion = 'reduced'">
              Reduced
            </button>
          </div>
        </div>
        <div class="setrow">
          <span class="tof-label" style="margin: 0">Text size</span>
          <div class="segmented">
            <button :class="{ on: p.textScale === 'normal' }" @click="p.textScale = 'normal'">
              Normal
            </button>
            <button :class="{ on: p.textScale === 'large' }" @click="p.textScale = 'large'">
              Large
            </button>
            <button :class="{ on: p.textScale === 'xl' }" @click="p.textScale = 'xl'">
              Largest
            </button>
          </div>
        </div>
        <div class="setgrid">
          <label class="settoggle"
            ><input type="checkbox" v-model="p.highContrast" /> High contrast</label
          >
          <label class="settoggle"
            ><input type="checkbox" v-model="p.dyslexiaFont" /> Readable / dyslexia-friendly
            font</label
          >
        </div>

        <div class="setfooter">
          <button class="tof-btn tof-btn--ghost tof-small" @click="prefs.reset()">
            Reset to defaults
          </button>
          <button class="tof-btn tof-small" @click="$emit('close')">Done</button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { usePrefsStore } from '@/maker/store/prefsStore';

defineProps<{ open: boolean }>();
defineEmits<{ close: [] }>();

const prefs = usePrefsStore();
const p = prefs.prefs;
</script>

<style scoped lang="scss">
.setmodal {
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
.setmodal__panel {
  position: relative;
  width: min(620px, 96vw);
  max-height: 88vh;
  overflow-y: auto;
}
.setmodal__close {
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
.setmodal__close:hover {
  color: var(--tof-cream);
}
.setgrid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: 0.5rem 1rem;
  margin: 0.5rem 0 1rem;
}
.settoggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  color: var(--tof-cream);
}
.setrow {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 0.6rem 0;
}
.segmented {
  display: inline-flex;
  border: 1px solid var(--tof-panel-border);
  border-radius: 999px;
  overflow: hidden;
}
.segmented button {
  background: transparent;
  border: none;
  color: var(--tof-cream);
  padding: 0.3rem 0.9rem;
  cursor: pointer;
}
.segmented button.on {
  background: linear-gradient(180deg, var(--tof-gold), #c4861a);
  color: #2a1d05;
  font-weight: 700;
}
.setfooter {
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
}
</style>
