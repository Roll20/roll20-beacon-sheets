<template>
  <div class="cru-actions">
    <div class="cru-actions__bar">
      <select v-model="pickId" class="tof-select">
        <option value="">Add from the action library...</option>
        <option v-for="t in templates" :key="t.id" :value="t.id">
          {{ t.name }} ({{ t.category }}, TR {{ t.minThreatRating }}+)
        </option>
      </select>
      <button class="tof-btn tof-btn--ghost" :disabled="!pickId" @click="addFromTemplate">
        Add
      </button>
      <button class="tof-btn tof-btn--ghost" @click="addBlank">New Blank Action</button>
    </div>

    <details
      v-for="(action, index) in modelValue"
      :key="action.id"
      class="cru-actions__item tof-card"
    >
      <summary>
        <strong>{{ action.name }}</strong>
        <span class="tof-tag">{{ action.category }}</span>
        <span v-if="action.actionPointCost" class="tof-small tof-muted"
          >{{ action.actionPointCost }} AP</span
        >
        <span v-if="action.gmOnly" class="tof-tag">GM</span>
        <span class="tof-small tof-muted cru-actions__preview">{{ previewLine(action) }}</span>
      </summary>
      <div class="cru-actions__form">
        <label class="tof-label"
          >Name
          <input
            class="tof-input"
            :value="action.name"
            @input="patch(index, { name: inputValue($event) })"
          />
        </label>
        <label class="tof-label"
          >Category
          <select
            class="tof-select"
            :value="action.category"
            @change="
              patch(index, { category: inputValue($event) as CrucibleActionInstance['category'] })
            "
          >
            <option v-for="c in ACTION_CATEGORIES" :key="c" :value="c">
              {{ ACTION_CATEGORY_LABELS[c] }}
            </option>
          </select>
        </label>
        <label class="tof-label"
          >AP Cost
          <input
            class="tof-input"
            type="number"
            min="0"
            max="6"
            :value="action.actionPointCost ?? 0"
            @input="patch(index, { actionPointCost: numberValue($event) })"
          />
        </label>
        <label class="tof-label"
          >Roll
          <select
            class="tof-select"
            :value="action.roll.type"
            @change="setRollType(index, inputValue($event))"
          >
            <option value="attack">Attack roll</option>
            <option value="save">Saving throw</option>
            <option value="automatic">Automatic</option>
          </select>
        </label>
        <label v-if="action.roll.type === 'attack'" class="tof-label"
          >Attack attribute
          <select
            class="tof-select"
            :value="action.roll.ability"
            @change="patchRoll(index, { ability: inputValue($event) as AttributeKey })"
          >
            <option v-for="a in ATTRIBUTES" :key="a.key" :value="a.key">{{ a.label }}</option>
          </select>
        </label>
        <label v-if="action.roll.type === 'save'" class="tof-label"
          >Save
          <select
            class="tof-select"
            :value="action.roll.save"
            @change="patchRoll(index, { save: inputValue($event) as 'body' | 'mind' | 'soul' })"
          >
            <option value="body">Body</option>
            <option value="mind">Mind</option>
            <option value="soul">Soul</option>
          </select>
        </label>
        <label class="tof-label"
          >Range (ft)
          <input
            class="tof-input"
            type="number"
            min="0"
            :value="action.range?.value ?? 5"
            @input="patchRange(index, numberValue($event))"
          />
        </label>
        <label class="tof-label cru-actions__wide"
          >Damage (count / die / type)
          <div class="cru-actions__damage" v-for="(d, di) in action.damage ?? []" :key="d.id">
            <input
              class="tof-input"
              type="number"
              min="0"
              :value="d.count"
              @input="patchDamage(index, di, { count: numberValue($event) })"
            />
            <span>d</span>
            <input
              class="tof-input"
              type="number"
              min="1"
              :value="d.die"
              @input="patchDamage(index, di, { die: numberValue($event) })"
            />
            <input
              class="tof-input"
              :value="d.damageType"
              @input="patchDamage(index, di, { damageType: inputValue($event) })"
            />
            <button class="tof-btn tof-btn--ghost tof-small" @click="removeDamage(index, di)">
              x
            </button>
          </div>
          <button class="tof-btn tof-btn--ghost tof-small" @click="addDamage(index)">
            + damage
          </button>
        </label>
        <label class="tof-label cru-actions__wide"
          >Description
          <textarea
            class="tof-textarea"
            rows="3"
            :value="action.description"
            @input="patch(index, { description: inputValue($event) })"
          />
        </label>
        <label class="tof-label tof-small">
          <input
            type="checkbox"
            :checked="action.gmOnly"
            @change="patch(index, { gmOnly: checkboxValue($event) })"
          />
          GM-only (hidden from players)
        </label>
        <label class="tof-label tof-small"
          >Recharge (0 = none)
          <input
            class="tof-input"
            type="number"
            min="0"
            max="6"
            :value="action.recharge?.min ?? 0"
            @input="setRecharge(index, numberValue($event))"
          />
        </label>
        <div class="cru-actions__rowend">
          <button class="tof-btn tof-btn--danger tof-small" @click="remove(index)">
            Remove Action
          </button>
        </div>
      </div>
    </details>
    <p v-if="!modelValue.length" class="tof-small tof-muted">No actions in this list yet.</p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import type { AttributeKey } from '@/maker/types';
import { ATTRIBUTES } from '@/maker/data/attributes';
import {
  ACTION_CATEGORIES,
  ACTION_CATEGORY_LABELS,
  createAction,
  type CrucibleActionInstance,
} from '@/crucible/schemas/crucibleAction.schema';
import {
  CREATURE_ACTIONS,
  actionTemplateById,
} from '@/crucible/data/registries/creatureActions.registry';

const props = defineProps<{
  modelValue: CrucibleActionInstance[];
  /** Restrict the library picker to these categories. */
  categories?: string[];
}>();
const emit = defineEmits<{ (e: 'update:modelValue', value: CrucibleActionInstance[]): void }>();

const pickId = ref('');

const templates = computed(() =>
  props.categories?.length
    ? CREATURE_ACTIONS.filter((a) => props.categories?.includes(a.category))
    : CREATURE_ACTIONS,
);

const inputValue = (e: Event) => (e.target as HTMLInputElement).value;
const numberValue = (e: Event) => Number((e.target as HTMLInputElement).value) || 0;
const checkboxValue = (e: Event) => (e.target as HTMLInputElement).checked;

const update = (next: CrucibleActionInstance[]) => emit('update:modelValue', next);

function addFromTemplate() {
  const template = actionTemplateById[pickId.value];
  if (!template) return;
  update([
    ...props.modelValue,
    createAction({ ...template, id: uuidv4(), registryId: template.id, origin: 'userProvided' }),
  ]);
  pickId.value = '';
}

function addBlank() {
  update([...props.modelValue, createAction({ id: uuidv4(), origin: 'userProvided' })]);
}

function patch(index: number, value: Partial<CrucibleActionInstance>) {
  const next = [...props.modelValue];
  next[index] = { ...next[index], ...value };
  update(next);
}

function patchRoll(index: number, value: Record<string, unknown>) {
  const action = props.modelValue[index];
  patch(index, { roll: { ...action.roll, ...value } as CrucibleActionInstance['roll'] });
}

function setRollType(index: number, type: string) {
  if (type === 'attack') {
    patch(index, { roll: { type: 'attack', ability: 'might', bonusFormula: 'attr+pb' } });
  } else if (type === 'save') {
    patch(index, { roll: { type: 'save', save: 'body', dcFormula: 'effectDc' } });
  } else {
    patch(index, { roll: { type: 'automatic' } });
  }
}

function patchRange(index: number, value: number) {
  const action = props.modelValue[index];
  patch(index, {
    range: { kind: action.range?.kind ?? 'melee', value, unit: 'ft', long: action.range?.long },
  });
}

function addDamage(index: number) {
  const action = props.modelValue[index];
  patch(index, {
    damage: [
      ...(action.damage ?? []),
      {
        id: uuidv4(),
        count: 1,
        die: 8,
        flat: 0,
        abilityBonus: 'might' as AttributeKey,
        damageType: 'Bludgeoning',
      },
    ],
  });
}

function patchDamage(index: number, damageIndex: number, value: Record<string, unknown>) {
  const action = props.modelValue[index];
  const damage = [...(action.damage ?? [])];
  damage[damageIndex] = { ...damage[damageIndex], ...value };
  patch(index, { damage });
}

function removeDamage(index: number, damageIndex: number) {
  const action = props.modelValue[index];
  patch(index, { damage: (action.damage ?? []).filter((_, i) => i !== damageIndex) });
}

function setRecharge(index: number, min: number) {
  patch(index, { recharge: min > 0 ? { min, die: 6 } : null });
}

function remove(index: number) {
  update(props.modelValue.filter((_, i) => i !== index));
}

function previewLine(action: CrucibleActionInstance): string {
  const d = action.damage?.[0];
  return d ? `${d.count}d${d.die} ${d.damageType}` : action.roll.type;
}
</script>

<style scoped lang="scss">
.cru-actions__bar {
  display: flex;
  gap: 0.4rem;
  margin-bottom: 0.6rem;
  flex-wrap: wrap;
  .tof-select {
    flex: 1;
    min-width: 220px;
  }
}
.cru-actions__item {
  margin-bottom: 0.45rem;
  summary {
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.45rem;
    flex-wrap: wrap;
  }
}
.cru-actions__preview {
  margin-left: auto;
}
.cru-actions__form {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 0.5rem;
  margin-top: 0.6rem;
}
.cru-actions__wide {
  grid-column: 1 / -1;
}
.cru-actions__damage {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  margin-bottom: 0.3rem;
  input {
    max-width: 70px;
  }
  input:nth-of-type(3) {
    max-width: 140px;
  }
}
.cru-actions__rowend {
  grid-column: 1 / -1;
  display: flex;
  justify-content: flex-end;
}
</style>
