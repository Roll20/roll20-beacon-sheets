<template>
  <button
    v-bind="$attrs"
    type="button"
    @click="handleButtonClick"
    v-tooltip="isChatRoll ? 'Send to Chat' : tooltipInfo"
    :class="{
      'px-2 py-1 bg-gray-50 hover:bg-gray-100 active:bg-gray-200 border border-gray-300 rounded text-sm font-semibold font-mono text-gray-700 transition shadow-sm inline-flex items-center gap-1.5': !hasSlot,
      'cursor-pointer': true
    }"
  >
    <slot v-if="hasSlot" />
    <template v-else>
      <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="9" cy="9" r="1.5" />
        <circle cx="15" cy="15" r="1.5" />
      </svg>
      <span>{{ simplifiedRoll.value }}</span>
    </template>
  </button>

  <!-- Roll Details Modal -->
  <Modal
    :show="isRollDialogOpen"
    :title="title"
    @close="isRollDialogOpen = false"
  >
    <div class="text-black">
      <!-- Subtitle -->
      <div v-if="subtitle" class="text-xs text-zinc-500 font-space-grotesk font-black uppercase tracking-wider mb-4">
        {{ subtitle }}
      </div>

      <!-- Attribute Selector (only if isQuery is true) -->
      <div v-if="isQuery" class="mb-5 flex flex-col gap-1 text-left">
        <label class="font-space-grotesk font-black uppercase text-xs tracking-widest text-zinc-500">
          Attribute to Use
        </label>
        <select
          v-model="queryAttribute"
          class="w-full text-sm border-2 border-black p-2 font-bold focus:outline-none bg-white cursor-pointer"
        >
          <option value="fighting">FIGHTING</option>
          <option value="agility">AGILITY</option>
          <option value="strength">STRENGTH</option>
          <option value="reason">REASON</option>
          <option value="intuition">INTUITION</option>
          <option value="presence">PRESENCE</option>
        </select>
      </div>

      <!-- Exploded Components -->
      <div class="mb-5">
        <span class="block font-space-grotesk font-black uppercase text-xs tracking-widest text-zinc-500 mb-2">
          Roll Components
        </span>
        <div class="border-2 border-black divide-y divide-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <div
            v-for="(comp, idx) in flatComponents"
            :key="idx"
            class="flex justify-between items-center px-3 py-2.5 text-sm"
          >
            <span class="font-space-grotesk font-black text-xs uppercase tracking-wide">
              {{ comp.label || 'Modifier' }}
            </span>
            <span class="font-mono font-bold" :class="comp.isDamage ? 'text-red-600' : 'text-zinc-800'">
              {{ getComponentDisplayFormula(comp) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Modifiers Input Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <!-- Dice Pool Modifier -->
        <div class="flex flex-col gap-1">
          <label class="font-space-grotesk font-black uppercase text-xs tracking-widest text-zinc-500">
            Dice Modifier
          </label>
          <input
            v-model.number="customDiceModifier"
            type="number"
            class="w-full border-2 border-black p-2 font-bold focus:outline-none bg-white text-base"
            placeholder="e.g. +1 or -2..."
          />
          <span class="text-[10px] text-zinc-400 font-semibold italic">Adjusts the number of d6s rolled</span>
        </div>

        <!-- Damage Modifier -->
        <div v-if="isActionAndDamageRoll" class="flex flex-col gap-1">
          <label class="font-space-grotesk font-black uppercase text-xs tracking-widest text-zinc-500">
            Extra Damage
          </label>
          <input
            v-model.number="customDamageModifier"
            type="number"
            class="w-full border-2 border-black p-2 font-bold focus:outline-none bg-white text-base"
            placeholder="e.g. +2 or +4..."
          />
          <span class="text-[10px] text-zinc-400 font-semibold italic">Adds flat bonus to damage</span>
        </div>
      </div>
    </div>

    <!-- Footer Actions -->
    <template #footer>
      <button
        @click="isRollDialogOpen = false"
        type="button"
        class="w-40 h-9 px-4 border-2 border-black bg-zinc-500 text-white hover:bg-zinc-600 font-space-grotesk font-black uppercase tracking-wider text-sm action-shadow-xs transition-all cursor-pointer focus:outline-none mr-auto"
      >
        Cancel
      </button>
      <button
        @click="executeRoll(false)"
        type="button"
        class="w-40 h-9 px-4 border-2 border-black bg-primary text-primary-foreground hover:bg-secondary hover:text-secondary-foreground font-space-grotesk font-black uppercase tracking-wider text-sm action-shadow-xs transition-all cursor-pointer focus:outline-none"
      >
        Roll
      </button>
    </template>
  </Modal>
</template>

<script lang="ts" setup>
import { ref, computed, useSlots } from 'vue';
import type { RollParameters, DiceComponent, DiceComponentGroup } from '@/rolltemplates/rolltemplates';
import rollToChat from '@/utility/rollToChat';
import { resolveExpression } from '@/system/expression/resolveExpression';
import type { Resolved } from '@/system/interpolation/resolveInterpolations';
import { useI18n } from 'vue-i18n';
import type { Dispatch } from '@roll20-official/beacon-sdk';
import Modal from '@/components/Modal.vue';
import { ruleSets } from '@/system';

defineOptions({
  inheritAttrs: false
});

const props = withDefaults(
  defineProps<{
    characterName?: string;
    title: string;
    subtitle?: string;
    keyValues?: Record<string, string | number | boolean>;
    traits?: string[];
    textContent?: string | string[];
    components: DiceComponentGroup;
    multiplier?: number;
    resultType?: 'crit-success' | 'crit-fail';
    visibility?: 'gm' | 'secret';
    solver?: (args: RollParameters, dispatch?: Dispatch) => Promise<any>;
    rollTemplate?: string;
    isQuery?: boolean;
  }>(),
  {
    isQuery: false
  }
);

const { t } = useI18n();

const emit = defineEmits<{
  (e: 'done'): void;
  (e: 'error', error: unknown): void;
}>();

const slots = useSlots();
const hasSlot = computed(() => !!slots.default);

const rollArgs = computed((): RollParameters => ({
  characterName: props.characterName,
  title: props.title,
  subtitle: props.subtitle,
  keyValues: props.keyValues,
  traits: props.traits,
  textContent: props.textContent,
  components: props.components,
  multiplier: props.multiplier,
  resultType: props.resultType,
  visibility: props.visibility,
  rollTemplate: props.rollTemplate,
}));

const isChatRoll = computed(() => !props.solver);

const queryAttribute = ref<'fighting' | 'strength' | 'agility' | 'reason' | 'intuition' | 'presence'>('fighting');

const queryAttributeComponent = computed((): DiceComponent => {
  const attrKey = queryAttribute.value;
  const val = ruleSets[attrKey]().value;
  return {
    rollFormula: `${val}d6`,
    label: t(`sheet.${attrKey}`),
    isDamage: false
  };
});

const flatComponents = computed((): DiceComponent[] => {
  const baseComponents: DiceComponent[] = [];
  if (props.isQuery) {
    baseComponents.push(queryAttributeComponent.value);
  }
  if (!props.components) return baseComponents;
  if (Array.isArray(props.components)) return [...baseComponents, ...props.components];
  
  const action = props.components.action ? props.components.action.map(c => ({ ...c, isDamage: false })) : [];
  const damage = props.components.damage ? props.components.damage.map(c => ({ ...c, isDamage: true })) : [];
  
  const rest: DiceComponent[] = [];
  for (const key of Object.keys(props.components)) {
    if (key !== 'action' && key !== 'damage') {
      rest.push(...props.components[key]);
    }
  }
  return [...baseComponents, ...action, ...damage, ...rest];
});

const isActionAndDamageRoll = computed(() => {
  if (!props.components) return false;
  if (!Array.isArray(props.components)) {
    return !!(props.components.action && props.components.damage);
  }
  const hasDamage = props.components.some(c => c.isDamage);
  const hasAction = props.components.some(c => !c.isDamage);
  return hasDamage && hasAction;
});

const simplifiedRoll = computed((): Resolved => {
  if (flatComponents.value.length === 0) {
    return { expression: '', value: '', isValid: false, error: t('app.messages.errors.no-roll-components') };
  }
  let rawExpression = '';
  flatComponents.value.forEach((c) => {
    let part = '';
    if (c.rollFormula) {
      part = c.rollFormula.trim();
    } else if (c.sides) {
      part = `${c.count || 1}d${c.sides}`;
    } else if (c.value !== undefined && c.value !== 0) {
      const sign = c.value >= 0 ? '+' : '';
      part = `${sign}${c.value}`;
    }

    if (part) {
      if (!rawExpression) {
        rawExpression = part;
      } else {
        if (part.startsWith('-') || part.startsWith('+')) {
          rawExpression += ` ${part}`;
        } else {
          rawExpression += ` + ${part}`;
        }
      }
    }
  });

  return resolveExpression(rawExpression);
});

const tooltipInfo = computed(() => {
  if (flatComponents.value.length === 0) {
    return 'No roll components';
  }
  
  const content = flatComponents.value.map(c => {
    let rollStr = '';
    if (c.rollFormula) {
      rollStr = c.rollFormula;
    } else if (c.sides) {
      rollStr = `${c.count && c.count > 1 ? c.count : ''}d${c.sides}`;
    } else if (c.value !== undefined) {
      const sign = c.value >= 0 ? '+' : '';
      rollStr = `${sign}${c.value}`;
    }
    return `${c.label || 'Modifier'}: <strong>${rollStr}</strong>`;
  }).join('<br/>');

  return { content, html: true };
});

const isRollDialogOpen = ref(false);
const customDiceModifier = ref(0);
const customDamageModifier = ref(0);

function showRollDialog() {
  customDiceModifier.value = 0;
  customDamageModifier.value = 0;
  isRollDialogOpen.value = true;
}

function handleButtonClick(event: MouseEvent) {
  if (event.altKey && !(props.isQuery && !isChatRoll.value)) {
    executeRoll(true);
  } else {
    showRollDialog();
  }
}

function getComponentDisplayFormula(c: DiceComponent): string {
  if (c.rollFormula) {
    return c.rollFormula;
  } else if (c.sides) {
    return `${c.count && c.count > 1 ? c.count : ''}d${c.sides}`;
  } else if (c.value !== undefined) {
    if (c.isDamage) {
      return String(c.value);
    }
    const sign = c.value >= 0 ? '+' : '';
    return `${sign}${c.value}`;
  }
  return '';
}

function getAdjustedComponents(
  components: DiceComponentGroup,
  customDice: number,
  customDamage: number,
  isActionAndDamage: boolean,
  hasSolver: boolean
): DiceComponentGroup {
  if (hasSolver) {
    if (Array.isArray(components)) {
      const cloned = components.map(c => ({ ...c }));
      if (props.isQuery) {
        cloned.unshift({ ...queryAttributeComponent.value });
      }
      if (customDice !== 0) {
        cloned.push({ value: customDice, label: 'Custom Modifier', isDamage: false });
      }
      if (isActionAndDamage && customDamage !== 0) {
        cloned.push({ value: customDamage, label: 'Extra Damage', isDamage: true });
      }
      return cloned;
    } else {
      const cloned = { ...components };
      if (!cloned.action) {
        cloned.action = [];
      }
      cloned.action = cloned.action.map(c => ({ ...c }));
      if (props.isQuery) {
        cloned.action.unshift({ ...queryAttributeComponent.value });
      }
      if (customDice !== 0) {
        cloned.action.push({ value: customDice, label: 'Custom Modifier', isDamage: false });
      }
      if (cloned.damage) {
        cloned.damage = cloned.damage.map(c => ({ ...c }));
        if (isActionAndDamage && customDamage !== 0) {
          cloned.damage.push({ value: customDamage, label: 'Extra Damage', isDamage: true });
        }
      }
      return cloned;
    }
  } else {
    const flat = Array.isArray(components)
      ? components.map(c => ({ ...c }))
      : Object.values(components).flat().map(c => ({ ...c }));
    
    if (props.isQuery) {
      flat.unshift({ ...queryAttributeComponent.value });
    }
    
    if (customDice !== 0) {
      const d6Index = flat.findIndex(c => c.rollFormula && /^\d+d6$/i.test(c.rollFormula.trim()));
      if (d6Index !== -1) {
        const comp = flat[d6Index];
        const currentCount = parseInt(comp.rollFormula!, 10);
        const newCount = Math.max(0, currentCount + customDice);
        comp.rollFormula = `${newCount}d6`;
      } else {
        const diceIndex = flat.findIndex(c => c.sides !== undefined);
        if (diceIndex !== -1) {
          const comp = flat[diceIndex];
          const newCount = Math.max(0, (comp.count ?? 1) + customDice);
          comp.count = newCount;
        } else {
          if (customDice > 0) {
            flat.push({ rollFormula: `${customDice}d6`, label: 'Custom Dice' });
          } else {
            flat.push({ value: customDice, label: 'Custom Modifier' });
          }
        }
      }
    }
    
    if (customDamage !== 0) {
      flat.push({ value: customDamage, label: 'Extra Damage', isDamage: true });
    }
    
    return flat;
  }
}

async function executeRoll(bypassDialog: boolean): Promise<void> {
  const diceMod = bypassDialog ? 0 : (Number(customDiceModifier.value) || 0);
  const dmgMod = bypassDialog ? 0 : (Number(customDamageModifier.value) || 0);

  if (!bypassDialog) {
    isRollDialogOpen.value = false;
  }

  const adjustedComponents = getAdjustedComponents(
    props.components,
    diceMod,
    dmgMod,
    isActionAndDamageRoll.value,
    !!props.solver
  );

  const finalArgs: RollParameters = {
    ...rollArgs.value,
    components: adjustedComponents
  };

  try {
    if (props.solver) {
      await props.solver(finalArgs);
    } else {
      await rollToChat(finalArgs);
    }
    emit('done');
  } catch (err) {
    emit('error', err);
  }
}
</script>
