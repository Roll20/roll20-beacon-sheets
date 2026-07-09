<template>
  <div class="w-full">
    
    <ComicPanel class="identity-panel">
      
      <div class="grid gap-6 stats relative z-2">
        
        <div class="relative portrait-container-wrapper stats__portrait peer z-2">
          <div
            class="w-full h-full border-2 border-secondary bg-zinc-200 overflow-hidden relative"
          >
            <img 
              v-if="meta.avatar"
              class="w-full h-full object-cover block" 
              :src="meta.avatar" 
              :alt="meta.name" 
            />
            <div
              v-else
              class="absolute inset-0 flex items-center justify-center bg-zinc-200"
            >
              <span class="font-space-grotesk font-black text-zinc-400 uppercase text-center text-sm tracking-wider select-none p-4">
                {{ $t('sheet.no_avatar') }}
              </span>
            </div>
            
            <div class="red-mask" :style="{ opacity: (1 - healthPct) * 0.45 }" v-if="!sheet.biography.disableBloodOverlay"></div>
          </div>
          
          <BloodOverlay v-show="!sheet.biography.disableBloodOverlay" />
        </div>

        <div class="bg-white border-2 border-secondary action-shadow absolute z-1 top-0 left-0 w-0 h-[214px] opacity-0 overflow-hidden pointer-events-none transition-[width,opacity] duration-300 peer-hover:w-full peer-hover:opacity-100 peer-hover:pointer-events-auto hover:w-full hover:opacity-100 hover:pointer-events-auto">
          <div class="p-4 pl-[calc(214px+var(--spacing)*6)] grid grid-rows-[min-content_1fr_min-content] gap-0.5 h-full w-full box-border">
            <span data-v-d109d776="" class="font-space-grotesk font-black text-zinc-500 uppercase text-xs tracking-wider">{{ $t('sheet.appearance') }}</span>
            <LazyTextarea
              v-model="sheet.biography.appearance"
              rows="5"
              class="w-full text-sm font-lexend leading-relaxed bg-transparent focus:outline-none border border-transparent hover:border-t-zinc-400 hover:border-b-zinc-400 focus-within:border-t-black! focus-within:border-b-black! resize-y font-bold text-black py-0 pl-0 transition-colors"
              :placeholder="$t('sheet.empty_appearance')"
            />         
            <div class="flex gap-[5px] items-center justify-between mt-3.5">
              <div class="flex gap-[10px] items-center">
                <div class="relative w-[24px] h-[24px] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer flex items-center justify-center" title="Toggle Blood Overlay">
                  <input type="checkbox" v-model="sheet.biography.disableBloodOverlay" class="absolute top-0 left-0 w-full h-full opacity-0 box-border cursor-pointer">
                  <span v-if="sheet.biography.disableBloodOverlay" class="material-symbols-outlined text-base font-black select-none">check</span>
                </div>
                <span class="font-space-grotesk font-black text-zinc-500 uppercase text-xs tracking-wider">{{ $t('sheet.disable_blood') }}</span>
              </div>
              <div
                v-if="meta.avatar"
                class="flex gap-[5px] items-center"
              >
                <span data-v-d109d776="" class="font-space-grotesk font-black text-zinc-500 uppercase text-xs tracking-wider mr-[5px]">{{ $t('sheet.colors') }}</span>
                
                <div
                  class="relative w-[24px] h-[24px] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
                  :style="{ backgroundColor: `rgb(${sheet.biography.avatarColors?.heroColor || '249 234 45'})` }"
                  v-tooltip="'Primary Color'"
                >
                  <input
                    type="color"
                    :value="rgbToHex(sheet.biography.avatarColors?.heroColor || '249 234 45')"
                    @input="updatePrimaryColor"
                    class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
                
                <div
                  class="relative w-[24px] h-[24px] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
                  :style="{ backgroundColor: `rgb(${sheet.biography.avatarColors?.heroColorSecondary || '9 102 174'})` }"
                  v-tooltip="'Secondary Color'"
                >
                  <input
                    type="color"
                    :value="rgbToHex(sheet.biography.avatarColors?.heroColorSecondary || '9 102 174')"
                    @input="updateSecondaryColor"
                    class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
                
                <div
                  class="relative w-[24px] h-[24px] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
                  :style="{ backgroundColor: `rgb(${sheet.biography.avatarColors?.heroColorBlood || '255 0 0'})` }"
                  v-tooltip="'Blood Color'"
                >
                  <input
                    type="color"
                    :value="rgbToHex(sheet.biography.avatarColors?.heroColorBlood || '190 4 20')"
                    @input="updateBloodColor"
                    class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        
        <div class="flex flex-col justify-start space-y-4 stats__bio">
          <div class="space-y-1">
            <LazyInput
              v-model="sheet.meta.name"
              class="w-full font-space-grotesk font-black text-5xl text-secondary uppercase tracking-tighter bg-transparent focus:outline-none border-b-2 border-transparent focus:border-secondary p-0 leading-none"
              placeholder="Hero Name"
            />
            <div class="grid grid-cols-3 gap-3 pt-1">
              
              <div class="flex flex-col gap-0.5 border-b border-zinc-200 pb-0.5">
                <span class="font-space-grotesk font-black text-zinc-500 uppercase text-xs tracking-wider">{{ $t('sheet.civilian') }}</span>
                <LazyInput
                  v-model="sheet.biography.civilianName"
                  class="w-full font-space-grotesk font-bold text-zinc-700 bg-transparent focus:outline-none text-sm p-0 border-none"
                  :placeholder="$t('sheet.civilian')"
                />
              </div>

              
              <div class="flex flex-col gap-0.5 border-b border-zinc-200 pb-0.5 relative">
                <span class="font-space-grotesk font-black text-zinc-500 uppercase text-xs tracking-wider">{{ $t('sheet.rank') }}</span>
                <select
                  v-model.number="sheet.biography.rank"
                  class="w-full font-space-grotesk font-bold text-zinc-700 bg-transparent focus:outline-none text-sm p-0 cursor-pointer border-none appearance-none"
                  style="outline: none;"
                >
                  <option
                    v-for="r in [0, 1, 2, 3]"
                    :key="r"
                    :value="r"
                  >
                    {{ $t(`ranks.rank_${r}`) }}
                  </option>
                </select>
              </div>

              
              <div class="flex flex-col gap-0.5">
                <span class="font-space-grotesk font-black text-zinc-500 uppercase text-xs tracking-wider">{{ $t('sheet.role') }}</span>
                <SelectWithCustom
                  v-model="sheet.biography.role"
                  :options="[
                    { value: 'blaster', label: $t('roles.blaster') },
                    { value: 'brains', label: $t('roles.brains') },
                    { value: 'brawn', label: $t('roles.brawn') },
                    { value: 'controller', label: $t('roles.controller') },
                    { value: 'defender', label: $t('roles.defender') },
                    { value: 'leader', label: $t('roles.leader') },
                    { value: 'striker', label: $t('roles.striker') },
                    { value: 'wildcard', label: $t('roles.wildcard') }
                  ]"
                  :placeholder="$t('roles.select_role')"
                  spanClass="cursor-pointer select-span block w-full font-space-grotesk font-bold text-zinc-700 bg-transparent text-sm p-0 border-b border-zinc-200 pb-1.5 transition-colors text-left min-height-full"
                  selectClass="w-full font-space-grotesk font-bold text-zinc-700 bg-transparent focus:outline-none text-sm p-0 border-b border-zinc-200 pb-1.5 cursor-pointer appearance-none"
                  inputClass="w-full font-space-grotesk font-bold text-zinc-700 bg-transparent focus:outline-none text-sm p-0 border-b border-zinc-200 pb-1.5"
                />
              </div>
            </div>
          </div>

          
          <div class="grid grid-cols-[minmax(max-content,1fr)_1fr] gap-4">
            <div class="group relative border-2 border-secondary p-3 bg-zinc-50 flex flex-col justify-between hover:bg-primary-container transition-colors">
              <div class="absolute top-1 right-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                
                <RollButton
                  :characterName="meta.name"
                  :title="`Reputation Check`"
                  :components="reputationRollComponents"
                  :solver="actionRollSolver"
                  class="text-xs p-0.5 text-blue-600 hover:text-blue-800 focus:outline-none cursor-pointer"
                  v-if="Number(ruleSets.reputation().value) > 0"
                >
                  <span class="material-symbols-outlined text-sm">casino</span>
                </RollButton>
              </div>
              <span class="block text-xs font-black uppercase text-zinc-500 tracking-wider">{{ $t('sheet.reputation') }}</span>
              <ModifiedValueRangebar
                :modifiedValue="ruleSets.reputation()"
                @update:baseValue="sheet.biography.reputation = String($event)"
              />
            </div>

            <div class="border-2 border-secondary p-3 bg-zinc-50 flex flex-col justify-between hover:bg-primary-container transition-colors">
              <span class="block text-xs font-black uppercase text-zinc-500 tracking-wider">{{ $t('sheet.karma') }}</span>
              <LazyInput
                v-model="sheet.biography.karma"
                :isNumber="true"
                class="w-full font-space-grotesk font-black text-secondary text-2xl bg-transparent focus:outline-none p-0 border-none mt-1 h-6"
              />
            </div>
          </div>
        </div>

        
        <div class="stats__attributes">
          <h3 class="font-space-grotesk font-black text-xs text-zinc-500 uppercase tracking-widest mb-2 flex items-center gap-1 border-b border-zinc-200 pb-1">
            <span class="material-symbols-outlined text-sm">analytics</span>
            {{ $t('sheet.core_attributes') }}
          </h3>
          <div class="grid grid-cols-3 gap-2 abilities-grid">
            <AbilityScore :modifiedValue="ruleSets.fighting()" :baseValue="sheet.abilities.fighting" :characterName="sheet.meta.name" :showFull="showFullAbilities" />
            <AbilityScore :modifiedValue="ruleSets.agility()" :baseValue="sheet.abilities.agility" :characterName="sheet.meta.name" :showFull="showFullAbilities" />
            <AbilityScore :modifiedValue="ruleSets.strength()" :baseValue="sheet.abilities.strength" :characterName="sheet.meta.name" :showFull="showFullAbilities" />
            <AbilityScore :modifiedValue="ruleSets.reason()" :baseValue="sheet.abilities.reason" :characterName="sheet.meta.name" :showFull="showFullAbilities" />
            <AbilityScore :modifiedValue="ruleSets.intuition()" :baseValue="sheet.abilities.intuition" :characterName="sheet.meta.name" :showFull="showFullAbilities" />
            <AbilityScore :modifiedValue="ruleSets.presence()" :baseValue="sheet.abilities.presence" :characterName="sheet.meta.name" :showFull="showFullAbilities" />
          </div>
        </div>
      </div>
    </ComicPanel>

    
    <div
      ref="dummyEl"
      class="absolute pointer-events-none invisible flex flex-col font-space-grotesk font-black text-xs uppercase"
      style="white-space: nowrap;"
    >
      <span v-for="desc in scoreDescriptions" :key="desc">{{ $t(`score_description.${desc}`) }}</span>
      <span v-for="ability in abilitiesList" :key="ability">{{ $t(`abilities.${ability}`) }}</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch, onMounted, onUnmounted } from 'vue';
import ComicPanel from '@/components/ComicPanel.vue';
import { extractColorsFromImage } from '@/utility/colorExtractor';
import AbilityScore from '@/components/AbilityScore.vue';
import BloodOverlay from '@/components/BloodOverlay.vue';
import LazyInput from '@/components/LazyInput.vue';
import { characterStore } from '@/sheet/stores';
import { metaStore } from '@/sheet/stores/meta/metaStore';
import { ruleSets } from '@/system';
import { useBreakpoints } from '@/utility/useBreakpoints';
import ModifiedValueRangebar from '@/components/ModifiedValueRangebar.vue';
import { modifiedHealthMax } from '@/sheet/stores/combat/combatStore';
import { useI18n } from 'vue-i18n';
import SelectWithCustom from '@/components/SelectWithCustom.vue';
import { calculateRollComponents } from '@/system/effects/calculateRollComponents';
import { actionRollSolver } from '@/system/rolls/action';
import RollButton from '@/components/RollButton.vue';
import LazyTextarea from '@/components/LazyTextarea.vue';

const { t } = useI18n();

const sheet = characterStore();
const meta = metaStore();

const { lg, xl, '2xl': xl2 } = useBreakpoints();

const reputationRollComponents = computed(() => {
  const label = t(`sheet.reputation`);
  return calculateRollComponents({
    attributes: [`reputation_roll` as any],
    baseComponents: [
      { rollFormula: `${ruleSets.reputation().value}d6`, label: 'Base' }
    ],
  });
});

function rgbToHex(rgbStr: string | undefined): string {
  if (!rgbStr) return '#000000';
  const parts = rgbStr.trim().split(/\s+/);
  if (parts.length !== 3) return '#000000';
  const r = parseInt(parts[0], 10);
  const g = parseInt(parts[1], 10);
  const b = parseInt(parts[2], 10);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return '#000000';
  return '#' + [r, g, b].map(x => {
    const hex = Math.max(0, Math.min(255, x)).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

function hexToRgb(hex: string): string {
  const cleanHex = hex.replace(/^#/, '');
  if (cleanHex.length !== 6) return '0 0 0';
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return '0 0 0';
  return `${r} ${g} ${b}`;
}

const updatePrimaryColor = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (!target) return;
  const rgb = hexToRgb(target.value);
  sheet.biography.avatarColors = {
    avatarUrl: meta.avatar || '',
    heroColor: rgb,
    heroColorSecondary: sheet.biography.avatarColors?.heroColorSecondary || '9 102 174',
    heroColorBlood: sheet.biography.avatarColors?.heroColorBlood || '190 4 20',
  };
};

const updateSecondaryColor = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (!target) return;
  const rgb = hexToRgb(target.value);
  sheet.biography.avatarColors = {
    avatarUrl: meta.avatar || '',
    heroColor: sheet.biography.avatarColors?.heroColor || '249 234 45',
    heroColorSecondary: rgb,
    heroColorBlood: sheet.biography.avatarColors?.heroColorBlood || '190 4 20',
  };
};

const updateBloodColor = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (!target) return;
  const rgb = hexToRgb(target.value);
  sheet.biography.avatarColors = {
    avatarUrl: meta.avatar || '',
    heroColor: sheet.biography.avatarColors?.heroColor || '249 234 45',
    heroColorSecondary: sheet.biography.avatarColors?.heroColorSecondary || '9 102 174',
    heroColorBlood: rgb,
  };
};

const showFullAbilities = ref(false);
const dummyEl = ref<HTMLElement | null>(null);

const scoreDescriptions = [
  'poor', 'typical', 'good', 'great', 'extraordinary',
  'incredible', 'amazing', 'spectacular', 'phenomenal',
  'astounding', 'tremendous', 'invincible'
];
const abilitiesList = [
  'fighting', 'agility', 'strength', 'reason', 'intuition', 'presence'
];

let observer: ResizeObserver | null = null;

onMounted(() => {
  const grids = document.querySelectorAll('.abilities-grid');
  if (grids.length === 0) return;

  observer = new ResizeObserver(() => {
    if (!dummyEl.value) return;
    
    
    let maxTextWidth = 0;
    for (const child of Array.from(dummyEl.value.children)) {
      maxTextWidth = Math.max(maxTextWidth, (child as HTMLElement).getBoundingClientRect().width);
    }
    
    const requiredBoxWidth = maxTextWidth + 28;

    
    let maxActualBoxWidth = 0;
    grids.forEach(grid => {
      const firstChild = grid.firstElementChild;
      if (firstChild) {
        maxActualBoxWidth = Math.max(maxActualBoxWidth, firstChild.getBoundingClientRect().width);
      }
    });

    
    showFullAbilities.value = maxActualBoxWidth >= requiredBoxWidth;
  });

  grids.forEach(grid => observer?.observe(grid));
});

onUnmounted(() => {
  observer?.disconnect();
});

const characterClass = ref('Defender');

const healthPct = computed(() => {
  const max = modifiedHealthMax.value || 1;
  return Math.min(1, Math.max(0, sheet.combat.health / max));
});

watch(
  () => meta.avatar,
  (newAvatar) => {
    if (!newAvatar) {
      sheet.biography.avatarColors = {
        avatarUrl: '',
        heroColor: '',
        heroColorSecondary: '',
        heroColorBlood: '',
      };
      return;
    }

    const saved = sheet.biography.avatarColors;
    if (saved && saved.avatarUrl === newAvatar && saved.heroColor && saved.heroColorSecondary) {
      
      return;
    }

    
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = newAvatar;
    
    img.onload = () => {
      try {
        const colors = extractColorsFromImage(img);
        if (colors) {
          sheet.biography.avatarColors = {
            avatarUrl: newAvatar,
            heroColor: colors.heroColor,
            heroColorSecondary: colors.heroColorSecondary,
            heroColorBlood: '190 4 20',
          };
        } else {
          sheet.biography.avatarColors = {
            avatarUrl: '',
            heroColor: '',
            heroColorSecondary: '',
            heroColorBlood: '',
          };
        }
      } catch (err) {
        console.warn('[IdentitySection] Failed to extract colors from avatar:', err);
        sheet.biography.avatarColors = {
          avatarUrl: '',
          heroColor: '',
          heroColorSecondary: '',
          heroColorBlood: '',
        };
      }
    };
    
    img.onerror = () => {
      sheet.biography.avatarColors = {
        avatarUrl: '',
        heroColor: '',
        heroColorSecondary: '',
        heroColorBlood: '',
      };
    };
  },
  { immediate: true }
);
</script>

<style lang="scss" scoped>
.stats {
  grid-template-areas:
    "portrait bio"
    "attributes attributes";

  grid-template-columns: min-content 1fr;
  
  &__portrait {
    grid-area: portrait;
    width: 214px;
    height: 214px;
  }
  &__bio {
    grid-area: bio;
  }
  &__attributes {
    grid-area: attributes;
  }
}
@media (width <= 640px) {
  .stats {
    grid-template-areas:
      "portrait"
      "bio"
      "attributes";
    grid-template-columns: 1fr;
  }
  .stats__portrait {
    margin: 0 auto;
  }
}

.red-mask {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 5;
  background: var(--color-accent);
  transition: opacity 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
</style>
