# Variable Cost Stunts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the fixed-number stunt cost field with a string supporting three formats (`N`, `N-M`, `N+`), and show a modal SP picker when a variable-cost stunt is activated.

**Architecture:** A new `spCost.ts` utility owns all parsing and is imported wherever SP cost logic is needed. A new `SpCostModal.vue` handles the picker UI via Teleport. The existing stunt button handlers branch on whether the parsed options array has one entry (fire immediately) or multiple (open modal).

**Tech Stack:** Vue 3 Composition API, TypeScript, Pinia, Vitest

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `src/utility/spCost.ts` | **Create** | Parse cost strings → option arrays; get minimum cost |
| `src/utility/spCost.test.ts` | **Create** | Unit tests for the parser |
| `src/components/shared/SpCostModal.vue` | **Create** | SP picker modal component |
| `src/sheet/stores/character/characterQualitiesStore.ts` | **Modify** | `spCost` type: `number` → `string` |
| `src/sheet/stores/character/shipStore.ts` | **Modify** | `ShipStuntDef.sp` type: `number` → `string` |
| `src/components/qualities/QualitiesModal.vue` | **Modify** | SP cost input: `type="number"` → `type="text"`, default `"1"` |
| `src/components/qualities/CharacterQualitiesView.vue` | **Modify** | Disabled check + click handler + modal integration |
| `src/sheet/stores/modifiersCheck/attackDamage.ts` | **Modify** | SP affordability check uses `getMinSpCost` |
| `src/components/attack/CharacterAttack.vue` | **Modify** | SP deduction uses `getMinSpCost` instead of `Number()` |
| `src/components/ship/ShipStuntsView.vue` | **Modify** | Input type, sort, disabled check, click handler + modal |

---

## Task 1: Parser Utility

**Files:**
- Create: `src/utility/spCost.ts`
- Create: `src/utility/spCost.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/utility/spCost.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { parseSpOptions, getMinSpCost } from './spCost';

describe('parseSpOptions', () => {
  it('static cost returns single-element array', () => {
    expect(parseSpOptions('2', 5)).toEqual([2]);
  });

  it('static cost not affordable returns empty array', () => {
    expect(parseSpOptions('3', 2)).toEqual([]);
  });

  it('range returns every integer in range when fully affordable', () => {
    expect(parseSpOptions('1-3', 5)).toEqual([1, 2, 3]);
  });

  it('range clips to affordable values', () => {
    expect(parseSpOptions('1-3', 2)).toEqual([1, 2]);
  });

  it('range not affordable returns empty array', () => {
    expect(parseSpOptions('2-4', 1)).toEqual([]);
  });

  it('open-ended N+ returns multiples of N up to availableSP', () => {
    expect(parseSpOptions('2+', 6)).toEqual([2, 4, 6]);
  });

  it('open-ended 1+ returns every value up to availableSP', () => {
    expect(parseSpOptions('1+', 4)).toEqual([1, 2, 3, 4]);
  });

  it('open-ended not affordable returns empty array', () => {
    expect(parseSpOptions('3+', 2)).toEqual([]);
  });

  it('handles legacy numeric value coerced to string', () => {
    expect(parseSpOptions(String(2), 5)).toEqual([2]);
  });
});

describe('getMinSpCost', () => {
  it('static cost', () => expect(getMinSpCost('2')).toBe(2));
  it('range picks lower bound', () => expect(getMinSpCost('1-3')).toBe(1));
  it('open-ended picks N', () => expect(getMinSpCost('2+')).toBe(2));
  it('returns 0 for empty string', () => expect(getMinSpCost('')).toBe(0));
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```
npm run test:unit -- spCost
```

Expected: `FAIL — Cannot find module './spCost'`

- [ ] **Step 3: Implement the parser**

Create `src/utility/spCost.ts`:

```ts
export function parseSpOptions(cost: string | number, availableSP: number): number[] {
  const s = String(cost).trim();
  if (!s) return [];

  // N-M range
  const rangeMatch = s.match(/^(\d+)-(\d+)$/);
  if (rangeMatch) {
    const lo = parseInt(rangeMatch[1], 10);
    const hi = parseInt(rangeMatch[2], 10);
    const result: number[] = [];
    for (let i = lo; i <= hi && i <= availableSP; i++) result.push(i);
    return result;
  }

  // N+ open-ended (multiples of N)
  const openMatch = s.match(/^(\d+)\+$/);
  if (openMatch) {
    const step = parseInt(openMatch[1], 10);
    const result: number[] = [];
    for (let i = step; i <= availableSP; i += step) result.push(i);
    return result;
  }

  // Static N
  const n = parseInt(s, 10);
  if (!isNaN(n)) return n <= availableSP ? [n] : [];

  return [];
}

export function getMinSpCost(cost: string | number): number {
  const s = String(cost).trim();
  if (!s) return 0;

  const rangeMatch = s.match(/^(\d+)-(\d+)$/);
  if (rangeMatch) return parseInt(rangeMatch[1], 10);

  const openMatch = s.match(/^(\d+)\+$/);
  if (openMatch) return parseInt(openMatch[1], 10);

  const n = parseInt(s, 10);
  return isNaN(n) ? 0 : n;
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```
npm run test:unit -- spCost
```

Expected: All 13 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/utility/spCost.ts src/utility/spCost.test.ts
git commit -m "feat: add SP cost parser utility (parseSpOptions, getMinSpCost)"
```

---

## Task 2: Type Definition Changes

**Files:**
- Modify: `src/sheet/stores/character/characterQualitiesStore.ts:25`
- Modify: `src/sheet/stores/character/shipStore.ts:75`

- [ ] **Step 1: Update `Quality.spCost` type**

In `src/sheet/stores/character/characterQualitiesStore.ts`, change line 25:

```ts
// Before
spCost?:number;

// After
spCost?: string;
```

- [ ] **Step 2: Update `ShipStuntDef.sp` type**

In `src/sheet/stores/character/shipStore.ts`, change line 75:

```ts
// Before
sp: number;

// After
sp: string;
```

- [ ] **Step 3: Run type-check to see expected errors**

```
npm run type-check
```

Expected: TypeScript errors in `QualitiesModal.vue`, `CharacterQualitiesView.vue`, `ShipStuntsView.vue`, `attackDamage.ts`, `CharacterAttack.vue` — these will be fixed in later tasks.

- [ ] **Step 4: Commit**

```bash
git add src/sheet/stores/character/characterQualitiesStore.ts src/sheet/stores/character/shipStore.ts
git commit -m "feat: change spCost/sp store types from number to string"
```

---

## Task 3: SpCostModal Component

**Files:**
- Create: `src/components/shared/SpCostModal.vue`

- [ ] **Step 1: Create the component**

Create `src/components/shared/SpCostModal.vue`:

```vue
<template>
  <Transition name="modal">
    <div v-if="show" class="modal-mask" @click.self="$emit('cancel')">
      <div class="modal-container age-modal sp-cost-modal">
        <div class="age-modal-header">
          <h3 class="age-modal-details-header">{{ stuntName }}</h3>
          <button type="button" class="btn-close" @click="$emit('cancel')" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <p class="sp-cost-prompt">How many stunt points?</p>
          <div class="sp-cost-options">
            <button
              v-for="amount in options"
              :key="amount"
              class="age-btn sp-cost-btn"
              @click="$emit('confirm', amount)"
            >
              {{ amount }} SP
            </button>
          </div>
          <div class="sp-cost-cancel">
            <button type="button" class="age-btn-link" @click="$emit('cancel')">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
defineProps<{
  show: boolean;
  stuntName: string;
  options: number[];
}>();

defineEmits<{
  confirm: [amount: number];
  cancel: [];
}>();
</script>

<style scoped>
.sp-cost-modal {
  min-width: 240px;
  max-width: 320px;
}
.sp-cost-prompt {
  font-size: 0.9rem;
  margin-bottom: 12px;
  text-align: center;
  opacity: 0.8;
}
.sp-cost-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  margin-bottom: 12px;
}
.sp-cost-btn {
  min-width: 56px;
}
.sp-cost-cancel {
  text-align: center;
}
.age-btn-link {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 0.8rem;
  opacity: 0.6;
}
.age-btn-link:hover {
  opacity: 1;
  text-decoration: underline;
}
</style>
```

- [ ] **Step 2: Run type-check on the new component**

```
npm run type-check
```

Expected: No new errors from this file.

- [ ] **Step 3: Commit**

```bash
git add src/components/shared/SpCostModal.vue
git commit -m "feat: add SpCostModal component for variable SP cost picker"
```

---

## Task 4: Update CharacterQualitiesView

**Files:**
- Modify: `src/components/qualities/CharacterQualitiesView.vue`

- [ ] **Step 1: Add imports at top of script block**

In `CharacterQualitiesView.vue`, update the `<script setup>` imports section. Find the line:

```js
import { computed, ref } from 'vue';
```

Replace it with:

```js
import { computed, ref } from 'vue';
import { parseSpOptions, getMinSpCost } from '@/utility/spCost';
import SpCostModal from '@/components/shared/SpCostModal.vue';
```

- [ ] **Step 2: Add reactive state for the SP picker modal**

In the `<script setup>` block, after the line `const showModal = ref(false)`, add:

```js
const showSpCostModal = ref(false);
const spCostOptions = ref<number[]>([]);
```

- [ ] **Step 3: Update the disabled check and button label in the template**

Find this block (lines 33–43):

```vue
<div v-tippy="{ content: (char.stunts < feature.spCost) ? 'Not enough stunt points' : '' }">
  <!-- <div v-if="!feature.modifiers || feature.modifiers.length === 0"> -->
  <button class="age-btn"
          :disabled="(char.stunts < feature.spCost)"
          :class="{ 'age-btn-disabled':(char.stunts < feature.spCost)}"
          @click="printStunt"
          >
          <span>
            {{ feature.spCost }} SP
          </span>
  </button>
</div>
```

Replace it with:

```vue
<div v-tippy="{ content: (char.stunts < getMinSpCost(String(feature.spCost || '1'))) ? 'Not enough stunt points' : '' }">
  <button class="age-btn"
          :disabled="char.stunts < getMinSpCost(String(feature.spCost || '1'))"
          :class="{ 'age-btn-disabled': char.stunts < getMinSpCost(String(feature.spCost || '1')) }"
          @click="handleStuntClick"
          >
          <span>
            {{ feature.spCost || '1' }} SP
          </span>
  </button>
</div>
```

- [ ] **Step 4: Add the SpCostModal to the template**

Find the `<Teleport to="body">` block that contains `QualitiesModal`. After the closing `</Teleport>` tag, add:

```vue
<Teleport to="body">
  <SpCostModal
    :show="showSpCostModal"
    :stuntName="feature.name"
    :options="spCostOptions"
    @confirm="onSpCostConfirm"
    @cancel="showSpCostModal = false"
  />
</Teleport>
```

- [ ] **Step 5: Replace `printStunt` with the new handler**

Find and replace the `printStunt` function:

```js
// Remove this:
const printStunt = () => {
  char.stunts = char.stunts - props.feature.spCost;
  if(!props.feature.modifiers) return;
  props.feature.modifiers.forEach(mod => {
    if(mod.option === 'Damage'){
      const attackStore = useAttackStore();
      attackStore.printAttackDamage({name:props.feature.name,damage:mod.roll}); 
    }
  })
}
```

Replace with:

```js
const handleStuntClick = () => {
  const options = parseSpOptions(String(props.feature.spCost || '1'), char.stunts);
  if (options.length === 1) {
    fireStunt(options[0]);
  } else if (options.length > 1) {
    spCostOptions.value = options;
    showSpCostModal.value = true;
  }
};

const onSpCostConfirm = (amount) => {
  showSpCostModal.value = false;
  fireStunt(amount);
};

const fireStunt = (spAmount) => {
  char.stunts = char.stunts - spAmount;
  if (!props.feature.modifiers) return;
  props.feature.modifiers.forEach(mod => {
    if (mod.option === 'Damage') {
      const attackStore = useAttackStore();
      attackStore.printAttackDamage({ name: props.feature.name, damage: mod.roll });
    }
  });
};
```

- [ ] **Step 6: Run type-check**

```
npm run type-check
```

Expected: No errors in this file.

- [ ] **Step 7: Commit**

```bash
git add src/components/qualities/CharacterQualitiesView.vue
git commit -m "feat: wire variable SP cost button and modal into CharacterQualitiesView"
```

---

## Task 5: Update QualitiesModal Input

**Files:**
- Modify: `src/components/qualities/QualitiesModal.vue`

- [ ] **Step 1: Fix default value on Favored Stunt creation**

Find line 12:

```vue
<button v-for="qty in qualityOptions" :key="qty" class="age-quality-select-btn" @click="feature.type = qty;if(qty === 'Favored Stunt') feature.spCost = 1">
```

Replace with:

```vue
<button v-for="qty in qualityOptions" :key="qty" class="age-quality-select-btn" @click="feature.type = qty;if(qty === 'Favored Stunt') feature.spCost = '1'">
```

- [ ] **Step 2: Fix the SP cost input field**

Find line 165:

```vue
<input type="number" class="form-control" placeholder="1" aria-label="Stunt Point Cost" v-model="feature.spCost"  aria-describedby="basic-addon1" min="1">
```

Replace with:

```vue
<input type="text" class="form-control" placeholder="1" aria-label="Stunt Point Cost" v-model="feature.spCost" aria-describedby="basic-addon1">
```

- [ ] **Step 3: Run type-check**

```
npm run type-check
```

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/qualities/QualitiesModal.vue
git commit -m "feat: change SP cost input to text field in QualitiesModal"
```

---

## Task 6: Fix attackDamage.ts

**Files:**
- Modify: `src/sheet/stores/modifiersCheck/attackDamage.ts`

- [ ] **Step 1: Add import**

At the top of `src/sheet/stores/modifiersCheck/attackDamage.ts`, add after the existing imports:

```ts
import { getMinSpCost } from '@/utility/spCost';
```

- [ ] **Step 2: Update the SP affordability checks**

Find line 53 (appears twice in a similar pattern):

```ts
if(mod.source === 'Favored Stunt' && (parent.spCost || 0) <= char.stunts){
```

Replace with:

```ts
if(mod.source === 'Favored Stunt' && getMinSpCost(String(parent.spCost || '0')) <= char.stunts){
```

Find line 67:

```ts
if (mod.source === 'Favored Stunt' && ((parent.spCost || 0) <= char.stunts)) {
```

Replace with:

```ts
if (mod.source === 'Favored Stunt' && (getMinSpCost(String(parent.spCost || '0')) <= char.stunts)) {
```

- [ ] **Step 3: Run type-check**

```
npm run type-check
```

Expected: No errors in this file.

- [ ] **Step 4: Commit**

```bash
git add src/sheet/stores/modifiersCheck/attackDamage.ts
git commit -m "fix: use getMinSpCost for Favored Stunt affordability check in attackDamage"
```

---

## Task 7: Fix CharacterAttack.vue

**Files:**
- Modify: `src/components/attack/CharacterAttack.vue`

- [ ] **Step 1: Add import**

In `src/components/attack/CharacterAttack.vue`, find the imports in the `<script setup>` block and add:

```ts
import { getMinSpCost } from '@/utility/spCost';
```

- [ ] **Step 2: Fix the SP deduction**

Find lines 264–268 in `handlePrintDamage`:

```ts
if(attackDmgLabel){
  attackDamage.damageLabel = attackDmgLabel.label;
  attackDamage.source = attackDmgLabel.source;
  attackDamage.spCost = Number(attackDmgLabel.spCost);
}
```

Replace with:

```ts
if(attackDmgLabel){
  attackDamage.damageLabel = attackDmgLabel.label;
  attackDamage.source = attackDmgLabel.source;
  attackDamage.spCost = getMinSpCost(String(attackDmgLabel.spCost));
}
```

- [ ] **Step 3: Run type-check**

```
npm run type-check
```

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/attack/CharacterAttack.vue
git commit -m "fix: use getMinSpCost instead of Number() for attack damage SP deduction"
```

---

## Task 8: Update ShipStuntsView

**Files:**
- Modify: `src/components/ship/ShipStuntsView.vue`

- [ ] **Step 1: Add imports**

In `ShipStuntsView.vue`, find the `<script setup>` imports and add:

```js
import { parseSpOptions, getMinSpCost } from '@/utility/spCost';
import SpCostModal from '@/components/shared/SpCostModal.vue';
```

- [ ] **Step 2: Add reactive state**

After `const spHover = ref(false);`, add:

```js
const showSpCostModal = ref(false);
const spCostOptions = ref<number[]>([]);
const pendingStunt = ref<any>(null);
```

- [ ] **Step 3: Fix the `emptyStunt` default and sort**

Find line 145:

```js
const emptyStunt = (role = 'commander') => ({ _id: '', role, sp: 1, name: '', description: '' });
```

Replace with:

```js
const emptyStunt = (role = 'commander') => ({ _id: '', role, sp: '1', name: '', description: '' });
```

Find line 151:

```js
.sort((a, b) => a.sp - b.sp);
```

Replace with:

```js
.sort((a, b) => getMinSpCost(a.sp) - getMinSpCost(b.sp));
```

- [ ] **Step 4: Fix the SP cost input field**

Find line 89:

```vue
<input type="number" class="form-control" v-model.number="stuntObj.sp" min="1" />
```

Replace with:

```vue
<input type="text" class="form-control" v-model="stuntObj.sp" />
```

- [ ] **Step 5: Add disabled state and click handler to the send-to-chat button**

The stunt table is currently commented out in `ShipStuntsView.vue` (lines 27–71). The `sendStuntToChat` function is still used elsewhere. Update `sendStuntToChat` to handle variable costs:

Find:

```js
const sendStuntToChat = async (stunt) => {
    const roleName = ROLES.find((r) => r.key === stunt.role)?.name ?? stunt.role;
    await sendToChat({
        characterName: meta.name,
        title: stunt.name,
        subtitle: `${roleName} Stunt — ${stunt.sp} SP`,
        description: stunt.description,
        traits: [roleName, `${stunt.sp} SP`],
    });
};
```

Replace with:

```js
const handleStuntChat = (stunt) => {
    const options = parseSpOptions(String(stunt.sp || '1'), ship.shipStunts[stunt.role] ?? 0);
    if (options.length === 1) {
        doSendStuntToChat(stunt, options[0]);
    } else if (options.length > 1) {
        pendingStunt.value = stunt;
        spCostOptions.value = options;
        showSpCostModal.value = true;
    }
};

const onSpCostConfirm = (amount) => {
    showSpCostModal.value = false;
    if (pendingStunt.value) {
        doSendStuntToChat(pendingStunt.value, amount);
        pendingStunt.value = null;
    }
};

const doSendStuntToChat = async (stunt, spAmount) => {
    const roleName = ROLES.find((r) => r.key === stunt.role)?.name ?? stunt.role;
    await sendToChat({
        characterName: meta.name,
        title: stunt.name,
        subtitle: `${roleName} Stunt — ${spAmount} SP`,
        description: stunt.description,
        traits: [roleName, `${spAmount} SP`],
    });
};
```

Note: the stunt table in the template is currently commented out, so there are no active template calls to `sendStuntToChat`. The function is being replaced entirely by `handleStuntChat` / `doSendStuntToChat`. No template search-and-replace is needed here — the new functions will be picked up when the stunt table is uncommented in a future task.

- [ ] **Step 6: Add SpCostModal to the template**

After the closing `</Teleport>` tag of the existing ship modal, add:

```vue
<Teleport to="body">
  <SpCostModal
    :show="showSpCostModal"
    :stuntName="pendingStunt?.name ?? ''"
    :options="spCostOptions"
    @confirm="onSpCostConfirm"
    @cancel="showSpCostModal = false; pendingStunt = null"
  />
</Teleport>
```

- [ ] **Step 7: Run type-check**

```
npm run type-check
```

Expected: No errors.

- [ ] **Step 8: Run all tests**

```
npm run test:unit
```

Expected: All tests pass.

- [ ] **Step 9: Commit**

```bash
git add src/components/ship/ShipStuntsView.vue
git commit -m "feat: wire variable SP cost handling into ShipStuntsView"
```

---

## Task 9: Final Verification

- [ ] **Step 1: Full CI check**

```
npm run ci-check
```

Expected: Format, lint, type-check, and unit tests all pass.

- [ ] **Step 2: Manual smoke test — Favored Stunt static cost**

1. `npm run dev` → open http://localhost:5173
2. Create a character, add a Favored Stunt with SP Cost `2`
3. Confirm the button shows `2 SP`
4. With 1 SP available, confirm button is disabled with tooltip "Not enough stunt points"
5. With 2+ SP available, click button — SP deducts immediately, no modal

- [ ] **Step 3: Manual smoke test — variable range cost**

1. Add a Favored Stunt with SP Cost `1-3`
2. With 2 SP available, confirm button is active and shows `1-3 SP`
3. Click — modal appears with options [1 SP] [2 SP]
4. Pick 2 SP — modal closes, stunt points deduct by 2

- [ ] **Step 4: Manual smoke test — open-ended cost**

1. Add a Favored Stunt with SP Cost `2+`
2. With 5 SP available, confirm button is active
3. Click — modal shows [2 SP] [4 SP]
4. With 1 SP available, confirm button is disabled

- [ ] **Step 5: Commit if any lint/format fixes were auto-applied**

```bash
git add -p
git commit -m "chore: apply lint/format fixes from ci-check"
```
