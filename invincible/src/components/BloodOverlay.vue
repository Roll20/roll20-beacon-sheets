<template>
  <canvas
    ref="canvasRef"
    class="absolute pointer-events-none"
    style="top: -40px; left: -40px; width: calc(100% + 80px); height: calc(100% + 80px); z-index: 10;"
  />
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { characterStore } from '@/sheet/stores';
import { modifiedHealthMax } from '@/sheet/stores/combat/combatStore';
import { v4 as uuidv4 } from 'uuid';

const props = withDefaults(defineProps<{
  
  minOpacity?: number;
  maxOpacity?: number;
}>(), {
  minOpacity: 0.55,
  maxOpacity: 0.95,
});

const sheet = characterStore();
const canvasRef = ref<HTMLCanvasElement | null>(null);

interface AnimatingSplat {
  _id: string;
  x: number; y: number; size: number;
  threshold: number; seed: number;
  opacity: number;
  startTime: number;
  duration: number;
}

interface FadingSplat {
  _id: string;
  x: number; y: number; size: number;
  threshold: number; seed: number;
  opacity: number;
  fadeStartTime: number;
  duration: number;
}

const animatingSplats = ref<AnimatingSplat[]>([]);
const fadingSplats    = ref<FadingSplat[]>([]);

const splatOpacities  = ref<Map<string, number>>(new Map());

let animationFrameId = 0;

function lcg(seed: number) {
  let s = Math.abs(Math.floor(seed)) || 1;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

function easeOutBack(x: number): number {
  const c1 = 1.70158, c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
}

function easeOutQuad(x: number): number {
  return 1 - (1 - x) * (1 - x);
}

function parseRgb(colorStr: string): string {
  if (colorStr.startsWith('#')) {
    const hex = colorStr.slice(1);
    if (hex.length === 3) {
      const r = parseInt(hex[0] + hex[0], 16);
      const g = parseInt(hex[1] + hex[1], 16);
      const b = parseInt(hex[2] + hex[2], 16);
      return `${r}, ${g}, ${b}`;
    } else if (hex.length === 6) {
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      return `${r}, ${g}, ${b}`;
    }
  }

  const matches = colorStr.match(/\d+/g);
  if (matches && matches.length >= 3) {
    return `${matches[0]}, ${matches[1]}, ${matches[2]}`;
  }
  return '190, 4, 20';
}

function drawSplat(
  ctx: CanvasRenderingContext2D,
  width: number, height: number,
  x: number, y: number,
  size: number, seed: number,
  progress: number, opacity: number,
  bloodColorRGB: string,
) {
  const cx = width  * (x / 100);
  const cy = height * (y / 100);
  const r  = size   * Math.max(0, easeOutBack(progress));
  if (r <= 0) return;

  const rand  = lcg(seed);
  const canvasColor = parseRgb(bloodColorRGB);
  const color = `rgba(${canvasColor}, ${opacity})`;
  ctx.fillStyle   = color;
  ctx.strokeStyle = color;

  
  const numNodes = 7 + Math.floor(rand() * 5);
  ctx.beginPath();
  for (let i = 0; i < numNodes; i++) {
    const angle      = (i / numNodes) * Math.PI * 2;
    const offset     = r * (0.1 + rand() * 0.22);
    const nodeRadius = r * (0.38 + rand() * 0.32);
    ctx.arc(cx + Math.cos(angle) * offset, cy + Math.sin(angle) * offset, nodeRadius, 0, Math.PI * 2);
  }
  ctx.fill();

  
  const numDroplets = 5 + Math.floor(rand() * 9);
  const flyP        = easeOutQuad(progress);
  for (let i = 0; i < numDroplets; i++) {
    const angle      = rand() * Math.PI * 2;
    const distance   = size * (1.2 + rand() * 2.8) * flyP;
    const dropRadius = size * (0.06 + rand() * 0.12) * progress;
    ctx.beginPath();
    ctx.arc(cx + Math.cos(angle) * distance, cy + Math.sin(angle) * distance, dropRadius, 0, Math.PI * 2);
    ctx.fill();
  }
}

function syncSize() {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const { offsetWidth: w, offsetHeight: h } = canvas;
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width  = w;
    canvas.height = h;
  }
}

function getOpacity(id: string, seed: number): number {
  if (!splatOpacities.value.has(id)) {
    const rand = lcg(seed + 999999);
    const op   = props.minOpacity + rand() * (props.maxOpacity - props.minOpacity);
    splatOpacities.value.set(id, op);
  }
  return splatOpacities.value.get(id)!;
}

function tick() {
  const canvas = canvasRef.value;
  if (!canvas) { animationFrameId = requestAnimationFrame(tick); return; }
  syncSize();
  const ctx = canvas.getContext('2d');
  if (!ctx)  { animationFrameId = requestAnimationFrame(tick); return; }

  const { width, height } = canvas;
  ctx.clearRect(0, 0, width, height);
  const now = Date.now();

  
  const computedStyle = getComputedStyle(document.documentElement);
  const bloodColorRGB = computedStyle.getPropertyValue('--color-accent').trim() || '190 4 20';

  
  const storeSplats = sheet.combat.bloodSplats || [];
  storeSplats.forEach((splat) => {
    const id      = splat._id ?? '';
    const anim    = animatingSplats.value.find((a) => a._id === id);
    const opacity = anim?.opacity ?? getOpacity(id, splat.seed);
    let progress  = 1.0;

    if (anim) {
      const elapsed = now - anim.startTime;
      progress = Math.min(1.0, elapsed / anim.duration);
      if (progress >= 1.0) {
        animatingSplats.value = animatingSplats.value.filter((a) => a._id !== id);
      }
    }

    drawSplat(ctx, width, height, splat.x, splat.y, splat.size, splat.seed, progress, opacity, bloodColorRGB);
  });

  
  fadingSplats.value.forEach((splat) => {
    const elapsed  = now - splat.fadeStartTime;
    const progress = Math.min(1.0, elapsed / splat.duration);
    const opacity  = splat.opacity * (1.0 - progress);
    drawSplat(ctx, width, height, splat.x, splat.y, splat.size, splat.seed, 1.0, opacity, bloodColorRGB);
  });

  fadingSplats.value = fadingSplats.value.filter((s) => (now - s.fadeStartTime) < s.duration);

  animationFrameId = requestAnimationFrame(tick);
}

watch(
  [() => sheet.combat.health, () => modifiedHealthMax.value],
  ([newHealth, newMax], [oldHealth, oldMax]) => {
    if (newHealth === undefined || newMax === undefined) return;

    const prevHealth = oldHealth !== undefined ? oldHealth : newHealth;
    const prevMax    = oldMax !== undefined ? oldMax : newMax;

    const maxVal       = Math.max(newMax || 1, 1);
    const currentRatio = newHealth / maxVal;
    
    const prevMaxVal   = Math.max(prevMax || 1, 1);
    const prevRatio    = prevHealth / prevMaxVal;

    
    if (newHealth < prevHealth) {
      const lostPoints     = prevHealth - newHealth;
      const splatCount     = Math.min(Math.max(Math.round(lostPoints * 1.5), 1), 6);
      const damageScale    = Math.min(lostPoints / 10, 1);
      const newStoreSplats = [...(sheet.combat.bloodSplats || [])];

      for (let i = 0; i < splatCount; i++) {
        const id   = uuidv4();
        const x    = 15 + Math.random() * 70;
        const y    = 15 + Math.random() * 70;
        const baseSize = i === 0
          ? 18 + damageScale * 30
          : 8  + damageScale * 18 + Math.random() * 10;
        const size = baseSize;
        const seed = Math.floor(Math.random() * 1_000_000);

        const rand    = lcg(seed + 999999);
        const opacity = props.minOpacity + rand() * (props.maxOpacity - props.minOpacity);
        splatOpacities.value.set(id, opacity);

        newStoreSplats.push({ _id: id, x, y, size, threshold: currentRatio, seed });
        animatingSplats.value.push({
          _id: id, x, y, size, threshold: currentRatio, seed,
          opacity,
          startTime: Date.now() + i * 80,
          duration:  420,
        });
      }

      sheet.combat.bloodSplats = newStoreSplats;
    }

    
    if (newHealth > prevHealth || currentRatio > prevRatio || newHealth >= newMax) {
      const remaining: typeof sheet.combat.bloodSplats = [];
      (sheet.combat.bloodSplats || []).forEach((splat) => {
        if (newHealth >= newMax || splat.threshold < currentRatio) {
          const id      = splat._id ?? uuidv4();
          const opacity = getOpacity(id, splat.seed);
          fadingSplats.value.push({
            _id: id, x: splat.x, y: splat.y, size: splat.size,
            threshold: splat.threshold, seed: splat.seed,
            opacity,
            fadeStartTime: Date.now(),
            duration: 700,
          });
          splatOpacities.value.delete(id);
        } else {
          remaining.push(splat);
        }
      });
      sheet.combat.bloodSplats = remaining;
    }
  },
);

const resizeObserver = new ResizeObserver(() => syncSize());

onMounted(() => {
  syncSize();
  if (canvasRef.value?.parentElement) {
    resizeObserver.observe(canvasRef.value.parentElement);
  }
  tick();
});

onUnmounted(() => {
  resizeObserver.disconnect();
  cancelAnimationFrame(animationFrameId);
});
</script>
