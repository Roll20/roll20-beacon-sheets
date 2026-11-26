<template>
  <div class="cine" :class="`cine--${phase}`" role="dialog" aria-label="Convergence intro">
    <!-- Battlefield ambiance -->
    <div class="cine__sky" />
    <div
      v-show="!branching"
      class="cine__horizon"
      :class="{ 'cine__horizon--break': phase === 'break' }"
    />
    <div class="cine__smoke"><span /><span /><span /></div>
    <div class="cine__embers"><i v-for="n in 22" :key="n" :style="emberStyle(n)" /></div>
    <div class="cine__vignette" />

    <button v-if="!branching" class="cine__skip" @click="$emit('complete')">Skip ></button>

    <!-- PHASE 1 ,  cinematic prologue -->
    <div v-if="phase === 'cinematic'" class="cine__scroll">
      <p
        v-for="(line, i) in lines"
        :key="i"
        class="cine__line"
        :style="{ animationDelay: `${0.5 + i * 2.3}s` }"
      >
        {{ line }}
      </p>
      <button
        class="cine__cta"
        :style="{ animationDelay: `${ctaDelay}s` }"
        @click="phase = 'death'"
      >
        Forge Your Fate
      </button>
    </div>

    <!-- PHASE 2 ,  How do you die? -->
    <div v-else-if="phase === 'death'" class="cine__death">
      <h2 class="cine__qtitle">How do you die?</h2>
      <p class="cine__qsub">Every thread ends. Before it begins, name how yours is cut.</p>
      <div class="deathgrid">
        <button v-for="m in DEATH_MANNERS" :key="m" class="deathchip" @click="pickDeath(m)">
          {{ m }}
        </button>
      </div>
    </div>

    <!-- PHASE 3 ,  break your fate -->
    <div v-else class="cine__break">
      <p class="cine__chosen">
        Your thread ends: <strong>{{ chosen }}</strong>
      </p>
      <p class="cine__line cine__line--instant">
        One thread among countless , and tonight, you cut your own.
      </p>
      <button class="cine__cta cine__cta--break" :disabled="branching" @click="breakFate">
        Are you ready to break your fate, Overture?
      </button>
    </div>

    <!-- Branching timeline: the Sacred-Timeline-style organic branches sprout off the central line -->
    <svg
      v-if="branching"
      class="threads"
      viewBox="0 0 1000 600"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <path
        v-for="(b, i) in branches"
        :key="i"
        class="tl-branch"
        :class="{ 'tl-branch--bright': b.bright }"
        :d="b.d"
        pathLength="100"
        :style="{ strokeWidth: b.width, animationDelay: `${b.delay}s` }"
      />
    </svg>
    <!-- Bloom to white, then the overlay fades out to reveal the sheet (smooth hand-off) -->
    <div v-if="branching" class="cine__whiteout" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { DEATH_MANNERS } from '@/maker/data/constants';

const emit = defineEmits<{ complete: []; chooseDeath: [manner: string] }>();

type Phase = 'cinematic' | 'death' | 'break';
const phase = ref<Phase>('cinematic');
const chosen = ref('');
const branching = ref(false);

const lines = [
  'Like so many cycles before this one.',
  'Before the first breath, before the first scar, you stand before the Garden of Rebirth.',
  'Here, body is hammered into weapon, mind sharpened into will, soul bound to purpose, and fate drawn like steel from flame.',
  'Beyond this forge wait gods, monsters, empires, and truths that break lesser things.',
  'Choose what you will become, and what the world must survive.',
];
const ctaDelay = 0.5 + lines.length * 2.3 + 0.6;

function pickDeath(manner: string) {
  chosen.value = manner;
  emit('chooseDeath', manner);
  phase.value = 'break';
}

function breakFate() {
  if (branching.value) return;
  branching.value = true;
  // Tree grows, blooms to white, then we hand off to the character creator.
  window.setTimeout(() => emit('complete'), 2900);
}

// Drifting embers (scarlet motes rising from the field).
function emberStyle(n: number) {
  const left = (n * 53) % 100;
  const delay = (n * 1.3) % 11;
  const dur = 7 + ((n * 3) % 7);
  const size = 2 + (n % 3);
  return {
    left: `${left}%`,
    width: `${size}px`,
    height: `${size}px`,
    animationDelay: `-${delay}s`,
    animationDuration: `${dur}s`,
  };
}

// ONE massive horizontal tree: a single trunk enters from the left and grows
// rightward, recursively forking up and down while staying biased toward the
// horizontal, so the whole timeline fans across the screen like a great tree.
interface Branch {
  d: string;
  width: number;
  delay: number;
  bright: boolean;
}

function buildBranches(): Branch[] {
  const midY = 300;
  const MAX_DEPTH = 6;
  const out: Branch[] = [];

  // Deterministic pseudo-random (stable across renders).
  let seed = 1;
  const rand = () => {
    const x = Math.sin(seed++ * 12.9898) * 43758.5453;
    return x - Math.floor(x);
  };

  function grow(x: number, y: number, angle: number, len: number, depth: number, delay: number) {
    const x2 = x + Math.cos(angle) * len;
    const y2 = y + Math.sin(angle) * len;
    // Gentle bow so limbs look organic rather than ruler-straight.
    const bow = (rand() - 0.5) * len * 0.22;
    const mx = (x + x2) / 2 + Math.cos(angle + Math.PI / 2) * bow;
    const my = (y + y2) / 2 + Math.sin(angle + Math.PI / 2) * bow;
    out.push({
      d: `M ${x.toFixed(1)} ${y.toFixed(1)} Q ${mx.toFixed(1)} ${my.toFixed(1)}, ${x2.toFixed(
        1,
      )} ${y2.toFixed(1)}`,
      width: Math.max(0.5, 0.6 + depth * 0.85), // thick trunk, fine twigs
      delay,
      bright: depth <= 1 && rand() > 0.6, // a few glowing tips
    });
    if (depth <= 0) return;

    const children = depth >= 4 ? 2 : rand() > 0.5 ? 3 : 2;
    for (let i = 0; i < children; i++) {
      const spread = 0.36 + rand() * 0.34; // fork angle between children
      const offset = (i - (children - 1) / 2) * spread + (rand() - 0.5) * 0.16;
      // Damp back toward horizontal each level so the tree keeps growing across.
      const childAngle = (angle + offset) * 0.82;
      const childLen = len * (0.7 + rand() * 0.14);
      grow(x2, y2, childAngle, childLen, depth - 1, delay + 0.13 + rand() * 0.05);
    }
  }

  // Single trunk from the left edge, growing right.
  grow(30, midY, 0, 215, MAX_DEPTH, 0.05);
  return out;
}
const branches = buildBranches();
</script>

<style scoped lang="scss">
.cine {
  position: fixed;
  inset: 0;
  z-index: 200;
  overflow: hidden;
  background: #050103;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: cine-in 0.8s ease both;
}
@keyframes cine-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.cine__sky {
  position: absolute;
  inset: 0;
  background: radial-gradient(
      120% 90% at 50% 120%,
      rgba(153, 37, 56, 0.55) 0%,
      rgba(80, 12, 22, 0.25) 35%,
      transparent 65%
    ),
    radial-gradient(100% 80% at 50% -20%, rgba(60, 10, 18, 0.5) 0%, transparent 60%),
    linear-gradient(180deg, #070103 0%, #1a0309 60%, #2a0510 100%);
}
.cine__horizon {
  position: absolute;
  left: -10%;
  right: -10%;
  bottom: 30%;
  height: 2px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(214, 74, 92, 0.85),
    rgba(255, 150, 120, 0.6),
    rgba(214, 74, 92, 0.85),
    transparent
  );
  box-shadow: 0 0 40px 8px rgba(190, 50, 60, 0.55);
  filter: blur(0.5px);
  transition: box-shadow 0.6s ease, height 0.6s ease;
}
.cine__horizon--break {
  box-shadow: 0 0 70px 14px rgba(220, 70, 80, 0.85);
  height: 3px;
}

.cine__smoke {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.cine__smoke span {
  position: absolute;
  left: -50%;
  width: 200%;
  border-radius: 50%;
  background: radial-gradient(ellipse at center, rgba(40, 8, 14, 0.55), transparent 70%);
  filter: blur(34px);
  animation: cine-smoke linear infinite;
}
.cine__smoke span:nth-child(1) {
  bottom: 2%;
  height: 320px;
  animation-duration: 42s;
}
.cine__smoke span:nth-child(2) {
  bottom: 18%;
  height: 240px;
  opacity: 0.7;
  animation-duration: 58s;
  animation-direction: reverse;
}
.cine__smoke span:nth-child(3) {
  bottom: 36%;
  height: 180px;
  opacity: 0.5;
  animation-duration: 74s;
}
@keyframes cine-smoke {
  from {
    transform: translateX(-6%);
  }
  to {
    transform: translateX(6%);
  }
}

.cine__embers {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.cine__embers i {
  position: absolute;
  bottom: -12px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 140, 90, 0.95), rgba(190, 50, 50, 0) 70%);
  box-shadow: 0 0 6px rgba(220, 90, 70, 0.7);
  animation-name: cine-ember;
  animation-timing-function: ease-in;
  animation-iteration-count: infinite;
}
@keyframes cine-ember {
  0% {
    transform: translateY(0) translateX(0);
    opacity: 0;
  }
  12% {
    opacity: 0.95;
  }
  100% {
    transform: translateY(-92vh) translateX(28px);
    opacity: 0;
  }
}
.cine__vignette {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(120% 100% at 50% 45%, transparent 45%, rgba(0, 0, 0, 0.85) 100%);
}

.cine__skip {
  position: absolute;
  top: 1.1rem;
  right: 1.3rem;
  z-index: 4;
  background: none;
  border: 1px solid rgba(214, 120, 120, 0.4);
  border-radius: 999px;
  color: #e8c9c9;
  padding: 0.3rem 0.9rem;
  cursor: pointer;
  font-size: 0.85rem;
  letter-spacing: 0.05em;
  transition: border-color 0.2s, color 0.2s;
}
.cine__skip:hover {
  border-color: #d64a5c;
  color: #fff;
}
.cine__sound {
  position: absolute;
  bottom: 1.1rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 4;
  color: #d9b3b3;
  font-size: 0.8rem;
  letter-spacing: 0.06em;
  opacity: 0.8;
}

.cine__scroll {
  position: relative;
  z-index: 2;
  max-width: 760px;
  padding: 2rem;
  text-align: center;
}
.cine__line {
  font-family: var(--tof-font-subheading), serif;
  font-size: clamp(1.05rem, 2.4vw, 1.55rem);
  line-height: 1.55;
  color: #f2dede;
  text-shadow: 0 0 18px rgba(160, 30, 40, 0.6), 0 2px 8px rgba(0, 0, 0, 0.8);
  margin: 0 0 1.15rem;
  opacity: 0;
  animation: cine-rise 1.7s ease both;
}
.cine__line--instant {
  animation-delay: 0.3s;
}
.cine__line:nth-child(odd) {
  color: #ffe9e3;
}

.cine__cta {
  margin-top: 1.6rem;
  font-family: var(--tof-font-heading), serif;
  font-weight: 700;
  font-size: clamp(1.1rem, 2.6vw, 1.6rem);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #fff;
  background: linear-gradient(180deg, #b3243a, #6f0f1d);
  border: 1px solid #e06576;
  border-radius: 10px;
  padding: 0.8rem 2.2rem;
  cursor: pointer;
  opacity: 0;
  animation: cine-rise 1.2s ease both, cine-pulse 2.6s ease-in-out 13s infinite;
  box-shadow: 0 0 30px rgba(190, 40, 55, 0.55);
}
.cine__cta:hover {
  background: linear-gradient(180deg, #d12c46, #8a1525);
  box-shadow: 0 0 44px rgba(220, 60, 75, 0.8);
  transform: translateY(-1px);
}
.cine__cta--break {
  animation: cine-rise 1s ease both, cine-pulse 2.4s ease-in-out 1.2s infinite;
}
.cine__cta:disabled {
  opacity: 0.5;
  cursor: default;
}

/* How do you die? */
.cine__death {
  position: relative;
  z-index: 2;
  max-width: 880px;
  padding: 2rem 1.5rem;
  text-align: center;
}
.cine__qtitle {
  font-family: var(--tof-font-heading), serif;
  font-size: clamp(1.6rem, 4vw, 2.6rem);
  color: #ffdede;
  letter-spacing: 0.08em;
  margin: 0 0 0.3rem;
  text-shadow: 0 0 22px rgba(190, 40, 55, 0.7);
  animation: cine-rise 0.9s ease both;
}
.cine__qsub {
  color: #d9b3b3;
  margin: 0 0 1.3rem;
  animation: cine-rise 0.9s ease 0.15s both;
}
.deathgrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 0.5rem;
  max-height: 56vh;
  overflow-y: auto;
  padding: 0.25rem;
  animation: cine-rise 0.9s ease 0.25s both;
}
.deathchip {
  background: rgba(40, 8, 14, 0.55);
  border: 1px solid rgba(214, 90, 100, 0.4);
  border-radius: 8px;
  color: #f2dede;
  padding: 0.55rem 0.4rem;
  cursor: pointer;
  font-family: var(--tof-font-subheading), serif;
  font-size: 0.92rem;
  transition: background 0.15s, border-color 0.15s, transform 0.1s, box-shadow 0.2s;
}
.deathchip:hover {
  background: rgba(150, 30, 45, 0.6);
  border-color: #e06576;
  color: #fff;
  transform: translateY(-1px);
  box-shadow: 0 0 16px rgba(210, 60, 70, 0.6);
}

/* Break your fate */
.cine__break {
  position: relative;
  z-index: 2;
  max-width: 700px;
  padding: 2rem;
  text-align: center;
}
.cine__chosen {
  font-family: var(--tof-font-subheading), serif;
  color: #ffd9d0;
  font-size: 1.05rem;
  margin: 0 0 1rem;
  animation: cine-rise 0.8s ease both;
}
.cine__chosen strong {
  color: #ff8a7a;
  letter-spacing: 0.05em;
}

/* Branching timeline (Sacred-Timeline style) */
.threads {
  position: absolute;
  inset: 0;
  z-index: 3;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
.tl-branch {
  fill: none;
  stroke: rgba(255, 255, 255, 0.95);
  stroke-linecap: round;
  stroke-dasharray: 100;
  stroke-dashoffset: 100;
  animation: tl-grow 1.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
.tl-branch--bright {
  stroke: #fff;
  filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.95));
}
/* One soft global white glow on the whole tree is cheaper than per-path shadows. */
.threads {
  filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.55));
}
@keyframes tl-grow {
  to {
    stroke-dashoffset: 0;
  }
}

/* Bloom to white, then the overlay fades out to reveal the sheet (smooth hand-off). */
.cine__whiteout {
  position: absolute;
  inset: 0;
  z-index: 5;
  pointer-events: none;
  background: radial-gradient(
    circle at 50% 50%,
    #ffffff 0%,
    #ffffff 45%,
    rgba(255, 255, 255, 0.92) 100%
  );
  opacity: 0;
  animation: cine-whiteout 1.7s ease-in 1.15s forwards;
}
@keyframes cine-whiteout {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

@keyframes cine-rise {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@keyframes cine-pulse {
  0%,
  100% {
    box-shadow: 0 0 30px rgba(190, 40, 55, 0.5);
  }
  50% {
    box-shadow: 0 0 48px rgba(220, 70, 80, 0.85);
  }
}

@media (prefers-reduced-motion: reduce) {
  .cine,
  .cine__line,
  .cine__cta,
  .cine__qtitle,
  .cine__qsub,
  .deathgrid,
  .cine__chosen {
    animation-duration: 0.001ms !important;
    animation-delay: 0s !important;
    opacity: 1 !important;
  }
  .cine__smoke,
  .cine__embers,
  .threads {
    display: none;
  }
}
</style>
