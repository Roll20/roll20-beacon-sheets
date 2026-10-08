<template>
  <div class="overture tof-app--grounded">
    <div class="overture__sky" />
    <div class="overture__sun" />
    <div class="overture__clouds"><span /><span /><span /></div>
    <FlowerField />

    <div class="overture__content">
      <div class="overture__eyebrow">Your thread is woven</div>
      <h1 class="overture__title">{{ draft.identity.name || 'Unnamed Wanderer' }}</h1>
      <div class="overture__sub">{{ raceLabel }} - {{ philLabel }} - Level {{ store.level }}</div>

      <div class="overture__stats">
        <div>
          <span class="bignum">{{ store.derived.health }}</span
          ><span>Health</span>
        </div>
        <div>
          <span class="bignum">{{ store.derived.stamina }}</span
          ><span>Stamina</span>
        </div>
        <div>
          <span class="bignum">{{ store.derived.armorClass }}</span
          ><span>Armor Class</span>
        </div>
      </div>

      <p class="overture__line">
        The night gives way to dawn, and you step into the Storyteller's world, fully formed at
        last.
      </p>

      <div class="overture__btns">
        <button class="tof-btn tof-btn--primary" @click="downloadPdf">
          📜 Open Character Sheet (PDF)
        </button>
        <button class="tof-btn tof-btn--ghost" @click="downloadJson">Export JSON</button>
        <button class="tof-btn tof-btn--ghost" @click="copyRoll20">Copy for Roll20</button>
        <button class="tof-btn tof-btn--ghost" @click="store.exitFinale()">Back to Edit</button>
      </div>
      <p v-if="toast" class="tof-ok tof-small">{{ toast }}</p>
      <p class="tof-small overture__note">
        In the Roll20 VTT, your character has been synced to the sheet automatically. Standalone,
        use the PDF for in-person play or import the JSON.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useDraftStore } from '@/maker/store/draftStore';
import { raceById, philosophyById, subraceById, classById, aspectById } from '@/maker/data';
import FlowerField from './FlowerField.vue';

const store = useDraftStore();
const draft = computed(() => store.draft);
const toast = ref('');

const raceLabel = computed(() => {
  const r = draft.value.race.selectedRaceId ? raceById[draft.value.race.selectedRaceId] : null;
  if (!r) return 'No race';
  const sub = draft.value.race.selectedSubraceId
    ? subraceById(r.id, draft.value.race.selectedSubraceId)
    : null;
  return sub ? `${sub.name} ${r.name}` : r.name;
});
const philLabel = computed(() => {
  if (draft.value.philosophy.custom)
    return draft.value.philosophy.custom.name || 'Custom Philosophy';
  const p = draft.value.philosophy.selectedPhilosophyId
    ? philosophyById[draft.value.philosophy.selectedPhilosophyId]
    : null;
  return p ? p.name : 'No philosophy';
});

async function downloadPdf() {
  const { exportCharacterPdf } = await import('@/maker/rules/pdfExport');
  await exportCharacterPdf(draft.value);
  toast.value = 'Your character sheet PDF has been generated.';
}
function downloadJson() {
  const blob = new Blob([store.exportJson()], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${(draft.value.identity.name || 'character').replace(
    /\s+/g,
    '_',
  )}.thread-of-fate.json`;
  a.click();
  URL.revokeObjectURL(url);
}
async function copyRoll20() {
  const d = draft.value;
  const classes = d.classBuild.classes
    .filter((c) => c.classId)
    .map((c) => `${classById[c.classId]?.name} ${c.level}`)
    .join(', ');
  const aspects = d.classBuild.aspects
    .filter((a) => a.aspectId)
    .map((a) => aspectById[a.aspectId]?.name)
    .join(', ');
  const lines = [
    `${d.identity.name}, ${raceLabel.value}, ${philLabel.value}, Level ${store.level}`,
    `HP ${store.derived.health} | Stamina ${store.derived.stamina} | AC ${store.derived.armorClass}`,
    `Classes: ${classes || 'Level 0'}${aspects ? ` | Aspects: ${aspects}` : ''}`,
  ];
  try {
    await navigator.clipboard.writeText(lines.join('\n'));
    toast.value = 'Character summary copied, paste it into Roll20 chat or a handout.';
  } catch {
    toast.value = 'Could not access the clipboard.';
  }
}

// Pull up the sheet automatically when the finale opens.
onMounted(() => {
  setTimeout(downloadPdf, 900);
});
</script>

<style scoped lang="scss">
.overture {
  position: fixed;
  inset: 0;
  z-index: 100;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: overture-in 1s ease both;
}
@keyframes overture-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.overture__sky {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    #1a2754 0%,
    #3a4a86 22%,
    #8a6aa0 45%,
    #e98a6a 68%,
    #ffb86b 85%,
    #ffd98a 100%
  );
  animation: overture-warm 6s ease-in both;
}
@keyframes overture-warm {
  from {
    filter: brightness(0.55) saturate(0.8);
  }
  to {
    filter: brightness(1) saturate(1);
  }
}
.overture__sun {
  position: absolute;
  left: 50%;
  bottom: -120px;
  width: 360px;
  height: 360px;
  margin-left: -180px;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    #fff7e0 0%,
    #ffe39a 35%,
    rgba(255, 200, 110, 0.55) 60%,
    transparent 72%
  );
  filter: drop-shadow(0 0 80px rgba(255, 214, 130, 0.8));
  animation: overture-rise 5s cubic-bezier(0.22, 1, 0.36, 1) both;
}
@keyframes overture-rise {
  from {
    transform: translateY(220px) scale(0.7);
    opacity: 0.4;
  }
  to {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}
.overture__clouds span {
  position: absolute;
  height: 26px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.35);
  filter: blur(8px);
}
.overture__clouds span:nth-child(1) {
  top: 18%;
  left: -30%;
  width: 240px;
  animation: overture-drift 26s linear infinite;
}
.overture__clouds span:nth-child(2) {
  top: 30%;
  left: -40%;
  width: 320px;
  animation: overture-drift 34s linear infinite 4s;
}
.overture__clouds span:nth-child(3) {
  top: 12%;
  left: -35%;
  width: 180px;
  animation: overture-drift 30s linear infinite 8s;
}
@keyframes overture-drift {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(160vw);
  }
}

.overture__content {
  position: relative;
  z-index: 3;
  text-align: center;
  color: #2a1a08;
  max-width: 640px;
  padding: 2rem;
  animation: overture-content 1.2s ease 0.4s both;
}
@keyframes overture-content {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.overture__eyebrow {
  font-family: var(--tof-font-subheading);
  letter-spacing: 0.2em;
  text-transform: uppercase;
  font-size: 0.8rem;
  color: #5a3410;
}
.overture__title {
  font-family: var(--tof-font-heading);
  font-size: 3rem;
  margin: 0.2rem 0;
  color: #3a230a;
  text-shadow: 0 2px 16px rgba(255, 240, 200, 0.7);
}
.overture__sub {
  font-family: var(--tof-font-subheading);
  color: #4a2c0e;
  font-size: 1.05rem;
}
.overture__stats {
  display: flex;
  gap: 2rem;
  justify-content: center;
  margin: 1.25rem 0;
}
.overture__stats > div {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #3a230a;
}
.bignum {
  font-family: var(--tof-font-heading);
  font-size: 2rem;
  color: #7f2030;
}
.overture__line {
  font-style: italic;
  color: #4a2c0e;
}
.overture__btns {
  display: flex;
  gap: 0.6rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 1rem;
}
.overture__note {
  color: #5a3410;
  margin-top: 0.75rem;
}
</style>
