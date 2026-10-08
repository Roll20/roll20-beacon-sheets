<template>
  <section>
    <div class="tof-panel">
      <h2 class="tof-h2">Starting Equipment</h2>
      <p class="tof-muted">
        Convergence is played across many settings and tech levels. Choose a setting, take a
        starting pack, and gather the gear you'll carry into the story.
      </p>
      <label class="tof-label">Tech Setting</label>
      <div class="settingrow">
        <button
          v-for="s in TECH_SETTINGS"
          :key="s"
          class="tof-btn tof-btn--ghost tof-small"
          :class="{ 'tof-btn--primary': eq.setting === s }"
          @click="setSetting(s)"
        >
          {{ s }}
        </button>
      </div>
    </div>

    <div class="tof-panel" v-for="pack in packs" :key="pack.id">
      <label
        class="tof-card"
        :class="{ 'tof-card--selected': eq.selectedPackId === pack.id }"
        style="display: block"
      >
        <input type="radio" :value="pack.id" v-model="selectedPack" />
        <strong>{{ pack.name }}</strong>
        <p class="tof-small tof-muted">{{ pack.description }}</p>
      </label>
      <div
        v-if="eq.selectedPackId === pack.id"
        class="tof-grid tof-grid--2"
        style="margin-top: 0.5rem"
      >
        <div v-for="item in pack.items" :key="item.category">
          <label class="tof-label">{{ item.category }}</label>
          <select
            class="tof-select"
            :value="eq.packChoices[item.category] || ''"
            @change="setPackChoice(item.category, $event)"
          >
            <option value="">,</option>
            <option v-for="o in item.options" :key="o" :value="o">{{ o }}</option>
          </select>
        </div>
      </div>
    </div>

    <div class="tof-panel">
      <h3 class="tof-h3" style="margin-top: 0">Armor & Shield</h3>
      <div class="tof-grid tof-grid--2">
        <div>
          <label class="tof-label">Armor</label>
          <select
            class="tof-select"
            :value="eq.selectedArmorId || ''"
            @change="patch({ selectedArmorId: val($event) })"
          >
            <option value="">None</option>
            <option v-for="a in armors" :key="a.id" :value="a.id">
              {{ a.name }} (+{{ a.acBonus }} AC, {{ a.type }})
            </option>
          </select>
        </div>
        <div>
          <label class="tof-label">Shield</label>
          <select
            class="tof-select"
            :value="eq.selectedShieldId || ''"
            @change="patch({ selectedShieldId: val($event) })"
          >
            <option value="">None</option>
            <option v-for="s in shields" :key="s.id" :value="s.id">
              {{ s.name }} (+{{ s.shieldAc }})
            </option>
          </select>
        </div>
        <div>
          <label class="tof-label">Misc AC Bonus (feature/racial)</label>
          <input
            class="tof-input"
            type="number"
            style="max-width: 100px"
            :value="eq.otherAcBonus"
            @input="patch({ otherAcBonus: Number(($event.target as HTMLInputElement).value) || 0 })"
          />
        </div>
      </div>
      <p class="tof-small tof-muted" style="margin-top: 0.5rem">
        Resulting Armor Class: <strong class="tof-ok">{{ store.derived.armorClass }}</strong>
        (armor + attribute cap + shield + racial natural armor are applied automatically).
      </p>
    </div>

    <div class="tof-panel">
      <h3 class="tof-h3" style="margin-top: 0">Weapons</h3>
      <input
        class="tof-input"
        v-model="weaponFilter"
        placeholder="Search weapons..."
        style="margin-bottom: 0.5rem"
      />
      <div class="weaponlist">
        <label
          v-for="wpn in weapons"
          :key="wpn.id"
          class="tof-card weaponrow"
          :class="{ 'tof-card--selected': eq.selectedWeaponIds.includes(wpn.id) }"
        >
          <input
            type="checkbox"
            :checked="eq.selectedWeaponIds.includes(wpn.id)"
            @change="toggleWeapon(wpn.id)"
          />
          <span class="weaponrow__name">{{ wpn.name }}</span>
          <span class="tof-small tof-muted"
            >{{ atk(wpn).attackText }} to hit - {{ atk(wpn).damageText }}</span
          >
        </label>
      </div>
    </div>

    <div class="tof-panel">
      <h3 class="tof-h3" style="margin-top: 0">Custom Items & Wealth</h3>
      <div class="addcustom">
        <input
          class="tof-input"
          v-model="customDraft"
          placeholder="Add a custom item..."
          @keyup.enter="addCustom"
        />
        <button class="tof-btn" @click="addCustom">Add</button>
      </div>
      <div class="chips">
        <span v-for="(item, i) in eq.customItems" :key="i" class="tof-tag">
          {{ item }} <button class="chipx" @click="removeCustom(i)">x</button>
        </span>
      </div>
      <label class="tof-label">Starting Wealth (optional)</label>
      <input
        class="tof-input"
        type="number"
        style="max-width: 160px"
        :value="eq.startingWealth ?? ''"
        @input="patch({ startingWealth: numVal($event) })"
      />
    </div>

    <StepWarnings step="equipment" />
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useDraftStore } from '@/maker/store/draftStore';
import { TECH_SETTINGS } from '@/maker/data/constants';
import { ARMORS, SHIELDS, WEAPONS, EQUIPMENT_PACKS } from '@/maker/data';
import { weaponLine } from '@/maker/rules/weapons';
import type { TechSetting, WeaponDef } from '@/maker/types';
import StepWarnings from '@/maker/components/StepWarnings.vue';

const store = useDraftStore();
const eq = computed(() => store.draft.equipment);
const weaponFilter = ref('');
const customDraft = ref('');

const inSetting = <T extends { setting: TechSetting[] }>(arr: T[]) =>
  arr.filter(
    (x) =>
      eq.value.setting === 'All' ||
      eq.value.setting === 'Custom' ||
      x.setting.includes(eq.value.setting) ||
      x.setting.includes('All'),
  );

const armors = computed(() => inSetting(ARMORS));
const shields = computed(() => inSetting(SHIELDS));
const packs = computed(() => inSetting(EQUIPMENT_PACKS));
const weapons = computed(() =>
  inSetting(WEAPONS).filter((w) => w.name.toLowerCase().includes(weaponFilter.value.toLowerCase())),
);

const atk = (wpn: WeaponDef) => weaponLine(store.draft, wpn);

const selectedPack = computed({
  get: () => eq.value.selectedPackId,
  set: (v) => store.patch('equipment', { selectedPackId: v }),
});

const patch = (v: Partial<typeof eq.value>) => store.patch('equipment', v);
const val = (e: Event) => {
  const v = (e.target as HTMLSelectElement).value;
  return v === '' ? null : v;
};
const numVal = (e: Event) => {
  const v = (e.target as HTMLInputElement).value;
  return v === '' ? null : Number(v);
};

function setSetting(s: TechSetting) {
  patch({ setting: s });
}
function setPackChoice(category: string, e: Event) {
  const choices = { ...eq.value.packChoices, [category]: (e.target as HTMLSelectElement).value };
  patch({ packChoices: choices });
}
function toggleWeapon(id: string) {
  const list = eq.value.selectedWeaponIds.includes(id)
    ? eq.value.selectedWeaponIds.filter((x) => x !== id)
    : [...eq.value.selectedWeaponIds, id];
  patch({ selectedWeaponIds: list });
}
function addCustom() {
  if (!customDraft.value.trim()) return;
  patch({ customItems: [...eq.value.customItems, customDraft.value.trim()] });
  customDraft.value = '';
}
function removeCustom(i: number) {
  patch({ customItems: eq.value.customItems.filter((_, idx) => idx !== i) });
}
</script>

<style scoped lang="scss">
.settingrow {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}
.weaponlist {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.4rem;
  max-height: 320px;
  overflow-y: auto;
}
@media (max-width: 720px) {
  .weaponlist {
    grid-template-columns: 1fr;
  }
}
.weaponrow {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.weaponrow__name {
  flex: 1;
}
.addcustom {
  display: flex;
  gap: 0.5rem;
}
.chips {
  margin: 0.5rem 0;
}
.chipx {
  background: none;
  border: none;
  color: #ffd7dd;
  cursor: pointer;
  font-size: 1rem;
}
</style>
