<template>
  <div class="play">
    <div class="play__main">
      <!-- Identity -->
      <div class="tof-panel play__id">
        <img v-if="d.bio.avatarImage" :src="d.bio.avatarImage" class="play__avatar" alt="" />
        <div>
          <h2 class="tof-h2" style="margin: 0">{{ d.identity.name || 'Unnamed' }}</h2>
          <div class="tof-small tof-muted">
            {{ raceLabel }} - {{ classLabel }} - {{ philLabel }}
          </div>
          <div v-if="d.bio.howYouDie" class="tof-small" style="color: #d98a8a">
            You will die {{ d.bio.howYouDie }}
          </div>
        </div>
      </div>

      <!-- Page tabs + roll mode -->
      <nav class="pagetabs">
        <button
          v-for="t in pages"
          :key="t.id"
          class="pagetab"
          :class="{ 'pagetab--on': page === t.id }"
          @click="page = t.id"
        >
          {{ t.label }}
        </button>
        <div class="rollmode" title="Advantage / Disadvantage applies to your next d20 rolls">
          <span class="tof-small tof-muted">Roll</span>
          <button :class="{ on: rollMode === 'dis' }" @click="setRollMode('dis')">Dis</button>
          <button :class="{ on: rollMode === 'normal' }" @click="setRollMode('normal')">
            Norm
          </button>
          <button :class="{ on: rollMode === 'adv' }" @click="setRollMode('adv')">Adv</button>
        </div>
      </nav>

      <!-- ============ MAIN ============ -->
      <!-- Static stats -->
      <div class="tof-panel statrow" v-show="page === 'main'">
        <div class="stat">
          <span class="stat__num">{{ store.derived.armorClass }}</span
          ><span>AC</span>
        </div>
        <div class="stat">
          <span class="stat__num">+{{ store.derived.proficiencyBonus }}</span
          ><span>Prof</span>
        </div>
        <button class="stat stat--btn" @click="r.rollInitiative(d)" title="Roll Initiative">
          <span class="stat__num">{{ fmt(store.modifiers.instinct) }}</span
          ><span>Initiative</span>
        </button>
        <div class="stat">
          <span class="stat__num">{{ store.derived.movementSpeed }}</span
          ><span>Move</span>
        </div>
      </div>

      <!-- Live vitals (editable resource tracking) -->
      <div class="tof-panel" v-show="page === 'main'">
        <div class="tof-h3" style="margin-top: 0; display: flex; align-items: center">
          Vitals
          <button
            class="rollpill"
            style="margin-left: auto"
            @click="store.fullRest()"
            title="Restore HP/Stamina/Aether, recover half your Hit Dice"
          >
            🌙 Full Rest
          </button>
          <button
            class="tof-btn tof-btn--ghost tof-small"
            style="margin-left: 0.4rem"
            @click="store.resetResources()"
          >
            Reset
          </button>
        </div>
        <div class="vitals">
          <!-- Health -->
          <div class="vital vital--hp" :class="{ 'vital--dying': res.dying }">
            <div class="vital__label">Health</div>
            <div class="vital__big">
              <span :class="{ vital__danger: res.dying }">{{ res.currentHp }}</span
              ><span class="vital__max"> / {{ res.maxHp }}</span>
              <span v-if="res.tempHp" class="vital__temp">+{{ res.tempHp }}</span>
            </div>
            <div class="vital__btns">
              <button
                class="hpbtn hpbtn--dmg"
                @click="store.adjustHp(-amt)"
                aria-label="Apply damage"
              >
                -
              </button>
              <input
                class="hpinput"
                type="number"
                min="1"
                v-model.number="amt"
                aria-label="HP change amount"
              />
              <button
                class="hpbtn hpbtn--heal"
                @click="store.adjustHp(amt)"
                aria-label="Apply healing"
              >
                +
              </button>
            </div>
            <label class="vital__temprow"
              >Temp HP
              <input
                class="miniinput"
                type="number"
                min="0"
                :value="res.tempHp"
                @input="store.setTempHp(num($event))"
                aria-label="Temporary HP"
              />
            </label>
          </div>

          <!-- Stamina -->
          <div class="vital">
            <div class="vital__label">Stamina</div>
            <div class="vital__big">
              {{ res.currentStamina }}<span class="vital__max"> / {{ res.maxStamina }}</span>
            </div>
            <div class="vital__btns">
              <button class="hpbtn" @click="store.adjustStamina(-1)" aria-label="Spend stamina">
                -
              </button>
              <button class="hpbtn" @click="store.adjustStamina(1)" aria-label="Regain stamina">
                +
              </button>
            </div>
          </div>

          <!-- Aether -->
          <div class="vital" v-if="res.isCaster">
            <div class="vital__label">Aether</div>
            <div class="vital__big">
              {{ res.currentAether }}<span class="vital__max"> / {{ res.maxAether }}</span>
            </div>
            <div class="vital__btns">
              <button class="hpbtn" @click="store.adjustAether(-1)" aria-label="Spend aether">
                -
              </button>
              <button class="hpbtn" @click="store.adjustAether(1)" aria-label="Regain aether">
                +
              </button>
            </div>
          </div>

          <!-- Hit Dice -->
          <div class="vital">
            <div class="vital__label">Hit Dice</div>
            <div class="vital__big">
              {{ res.hitDiceRemaining }}<span class="vital__max"> / {{ res.totalHitDice }}</span>
            </div>
            <div class="vital__btns">
              <button class="hpbtn" @click="store.spendHitDie(-1)" aria-label="Recover a hit die">
                +
              </button>
              <button class="hpbtn" @click="store.spendHitDie(1)" aria-label="Spend a hit die">
                -
              </button>
            </div>
          </div>

          <!-- Death failures -->
          <div class="vital vital--death" v-if="res.dying || res.deathFailures > 0">
            <div class="vital__label">Death Saves</div>
            <div class="deathpips">
              <button
                v-for="i in 6"
                :key="i"
                class="pip"
                :class="{ 'pip--on': i <= res.deathFailures }"
                :aria-label="`Death failure ${i}`"
                @click="store.setDeathFailures(i === res.deathFailures ? i - 1 : i)"
              />
            </div>
            <button class="rollpill rollpill--danger" @click="r.rollDeathSave()">Roll</button>
          </div>
        </div>
      </div>

      <!-- Conditions -->
      <div class="tof-panel" v-show="page === 'main'">
        <div class="tof-h3" style="margin-top: 0">
          Conditions
          <span v-if="res.conditions.length" class="tof-small tof-muted"
            >, {{ res.conditions.join(', ') }}</span
          >
        </div>
        <div class="condchips">
          <button
            v-for="c in CONDITIONS"
            :key="c.name"
            class="condchip"
            :class="{ 'condchip--on': res.conditions.includes(c.name) }"
            :title="c.text"
            @click="store.toggleCondition(c.name)"
          >
            {{ c.name }}
          </button>
        </div>
      </div>

      <!-- Attributes (click to roll a check) -->
      <div class="tof-panel" v-show="page === 'main'">
        <div class="tof-h3" style="margin-top: 0">
          Attributes <span class="tof-small tof-muted">, click to roll</span>
        </div>
        <div class="attrgrid">
          <button
            v-for="a in ATTRIBUTES"
            :key="a.key"
            class="rollcard"
            @click="r.rollAttribute(d, a.key)"
          >
            <span class="rollcard__label">{{ a.label }}</span>
            <span class="rollcard__big">{{ store.finalScores[a.key] }}</span>
            <span class="rollcard__mod">{{ fmt(store.modifiers[a.key]) }}</span>
          </button>
        </div>
      </div>

      <!-- Saves -->
      <div class="tof-panel" v-show="page === 'main'">
        <div class="tof-h3" style="margin-top: 0">Saving Throws</div>
        <div class="saverow">
          <button
            v-for="sv in saveButtons"
            :key="sv.group"
            class="rollpill"
            @click="r.rollSave(d, sv.group)"
          >
            {{ sv.group }} <strong>{{ fmt(sv.value) }}</strong>
          </button>
          <button class="rollpill rollpill--danger" @click="r.rollDeathSave()">
            Death Save (DC 10)
          </button>
        </div>
      </div>

      <!-- Talents -->
      <div class="tof-panel" v-show="page === 'main'">
        <div class="tof-h3" style="margin-top: 0">Talents</div>
        <div class="skillcols">
          <button
            v-for="s in skills"
            :key="s.name"
            class="skillbtn"
            :class="{ 'skillbtn--prof': s.tier !== 'none' }"
            @click="r.rollSkill(d, s.name)"
          >
            <span><span class="dot" :class="`dot--${s.tier}`" />{{ s.name }}</span>
            <span class="skillbtn__b">{{ fmt(s.bonus) }}</span>
          </button>
        </div>
      </div>

      <!-- Weapons -->
      <div class="tof-panel" v-show="page === 'main' && weapons.length">
        <div class="tof-h3" style="margin-top: 0">Weapons</div>
        <div v-for="w in weapons" :key="w.id" class="weapon">
          <span class="weapon__name">{{ w.name }}</span>
          <span class="tof-small tof-muted">{{ w.damage }} {{ w.damageTypes }}</span>
          <button class="rollpill" @click="r.rollWeaponAttack(d, w)">Attack</button>
          <button class="rollpill" @click="r.rollWeaponDamage(d, w)">Damage</button>
        </div>
      </div>

      <!-- ============ ARTES ============ -->
      <div class="tof-panel" v-show="page === 'artes' && caster.isCaster">
        <div class="tof-h3" style="margin-top: 0">Artes</div>
        <div class="tof-small tof-muted" style="margin-bottom: 0.4rem">
          Aether <strong class="tof-ok">{{ res.currentAether }}</strong> / {{ res.maxAether }} -
          Save DC {{ caster.arteSaveDC }} - Attack {{ fmt(caster.arteAttack) }} - Max Tier
          {{ caster.maxTier }}
          <button class="rollpill" style="margin-left: 0.5rem" @click="r.rollArteAttack(d)">
            Arte Attack
          </button>
        </div>
        <p v-if="castMsg" class="tof-small tof-warn" style="margin: 0 0 0.4rem">{{ castMsg }}</p>
        <div class="artegrid">
          <div v-for="a in artes" :key="a.id" class="arte" :title="a.description">
            <div class="arte__head">
              <strong>{{ a.name }}</strong>
              <button class="rollpill rollpill--cast" @click="cast(a)">Cast ✦</button>
            </div>
            <span class="tof-small tof-muted"
              >{{ a.tier === 0 ? 'Cantrip' : 'Tier-' + a.tier }} - {{ a.aetherCost }} Aether -
              {{ a.range }}</span
            >
          </div>
        </div>
      </div>

      <!-- Hit dice / rest -->
      <div class="tof-panel" v-show="page === 'main' && classes.length">
        <div class="tof-h3" style="margin-top: 0">Hit Dice &amp; Rest</div>
        <div class="saverow">
          <button
            v-for="c in classes"
            :key="c.cls.id"
            class="rollpill"
            @click="r.rollHitDie(c.cls, d)"
          >
            Spend 1d{{ c.cls.hitDie }} ({{ c.cls.name }})
          </button>
        </div>
      </div>

      <!-- ============ INVENTORY ============ -->
      <div class="tof-panel" v-show="page === 'inventory'">
        <div class="carrybar">
          <label class="carrybox">
            <span class="carrybox__label">Current Carry</span>
            <strong :class="{ 'tof-warn': inv.maxCarry > 0 && totalWeight > inv.maxCarry }">{{
              totalWeight
            }}</strong>
          </label>
          <div class="tof-h3" style="margin: 0">Equipment</div>
          <label class="carrybox">
            <span class="carrybox__label">Maximum Carry</span>
            <input
              class="carryinput"
              type="number"
              min="0"
              :value="inv.maxCarry"
              @input="store.patch('inventory', { maxCarry: num($event) })"
            />
          </label>
        </div>
        <EquipDoll :equipped="equippedMap" @unequip="(s) => unequipSlot(s)" />
      </div>

      <!-- Adventuring gear -->
      <div class="tof-panel" v-show="page === 'inventory'">
        <div class="tof-h3" style="margin-top: 0">Adventuring Gear</div>
        <div class="gearrow">
          <label class="gearitem"
            ><input
              type="checkbox"
              :checked="inv.gear.bedroll"
              @change="store.setGear({ bedroll: ($event.target as HTMLInputElement).checked })"
            />
            Bedroll</label
          >
          <label class="gearitem"
            >Water
            <input
              class="invnum"
              type="number"
              min="0"
              :value="inv.gear.water"
              @input="store.setGear({ water: num($event) })"
          /></label>
          <label class="gearitem"
            >Rope (ft)
            <input
              class="invnum"
              type="number"
              min="0"
              :value="inv.gear.rope"
              @input="store.setGear({ rope: num($event) })"
          /></label>
          <label class="gearitem"
            >Rations
            <input
              class="invnum"
              type="number"
              min="0"
              :value="inv.gear.rations"
              @input="store.setGear({ rations: num($event) })"
          /></label>
        </div>
      </div>

      <!-- Add item -->
      <div class="tof-panel" v-show="page === 'inventory'">
        <div class="additem">
          <input
            class="invname"
            v-model="newItem.name"
            placeholder="New item name..."
            @keyup.enter="addItem()"
          />
          <select class="tof-select additem__type" v-model="newItem.type">
            <option v-for="t in ITEM_TYPES" :key="t" :value="t">{{ t }}</option>
          </select>
          <select class="tof-select additem__type" v-model="newItem.container">
            <option v-for="c in CONTAINERS" :key="c" :value="c">{{ c }}</option>
          </select>
          <input
            class="invnum"
            type="number"
            min="0"
            v-model.number="newItem.amount"
            title="Amount"
          />
          <input
            class="invnum"
            type="number"
            min="0"
            step="0.1"
            v-model.number="newItem.weight"
            title="Weight"
          />
          <button class="tof-btn tof-btn--ghost tof-small" @click="addItem()">+ Add</button>
        </div>
      </div>

      <!-- Container lists -->
      <div class="tof-panel" v-show="page === 'inventory'" v-for="c in CONTAINERS" :key="c">
        <div class="tof-h3" style="margin-top: 0">{{ CONTAINER_LABELS[c] }}</div>
        <table class="invtable" v-if="itemsIn(c).length">
          <thead>
            <tr>
              <th style="width: 3.4rem">Amt</th>
              <th>Item</th>
              <th style="width: 6rem">Type</th>
              <th style="width: 3.6rem">Wt</th>
              <th style="width: 8.5rem">Equip</th>
              <th style="width: 1.6rem"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="it in itemsIn(c)" :key="it.id">
              <td>
                <input
                  class="invnum"
                  type="number"
                  min="0"
                  :value="it.amount"
                  @input="store.updateInvItem(it.id, { amount: num($event) })"
                />
              </td>
              <td>
                <input
                  class="invname"
                  :value="it.name"
                  placeholder="Item name"
                  @input="store.updateInvItem(it.id, { name: str($event) })"
                />
              </td>
              <td>
                <select
                  class="invtype"
                  :value="it.type || 'Gear'"
                  @change="store.updateInvItem(it.id, { type: str($event) as never })"
                >
                  <option v-for="t in ITEM_TYPES" :key="t" :value="t">{{ t }}</option>
                </select>
              </td>
              <td>
                <input
                  class="invnum"
                  type="number"
                  min="0"
                  step="0.1"
                  :value="it.weight"
                  @input="store.updateInvItem(it.id, { weight: num($event) })"
                />
              </td>
              <td>
                <select
                  class="invtype"
                  :value="it.slot || ''"
                  @change="store.equipItem(it.id, str($event) || null)"
                >
                  <option value="">- Stowed -</option>
                  <option v-for="s in SLOT_NAMES" :key="s" :value="s">{{ s }}</option>
                </select>
              </td>
              <td>
                <button class="invdel" aria-label="Remove" @click="store.removeInvItem(it.id)">
                  x
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <p v-else class="tof-small tof-muted">Empty.</p>
      </div>

      <!-- ============ BIO ============ -->
      <div class="tof-panel" v-show="page === 'bio'">
        <div class="tof-grid tof-grid--3">
          <div><span class="tof-label">Age</span> {{ d.identity.age || '-' }}</div>
          <div><span class="tof-label">Height</span> {{ d.identity.height || '-' }}</div>
          <div><span class="tof-label">Philosophy</span> {{ philLabel }}</div>
        </div>
        <div v-if="d.bio.howYouDie" class="tof-small" style="color: #d98a8a; margin-top: 0.4rem">
          You will die {{ d.bio.howYouDie }}
        </div>
      </div>

      <div class="tof-panel" v-show="page === 'bio' && racialTraits.length">
        <div class="tof-h3" style="margin-top: 0">Racial Traits</div>
        <div v-for="t in racialTraits" :key="t.name" class="biorow">
          <strong>{{ t.name }}</strong>
          <p class="tof-small tof-muted">{{ t.description }}</p>
        </div>
      </div>

      <div class="tof-panel" v-show="page === 'bio'">
        <label class="tof-label">Appearance &amp; Description</label>
        <textarea
          class="tof-textarea"
          :value="d.bio.description"
          @input="store.patch('bio', { description: txt($event) })"
        />
        <div v-if="bgList.length" style="margin-top: 0.5rem">
          <span class="tof-label">Background</span>
          <span v-for="b in bgList" :key="b" class="tof-tag">{{ b }}</span>
        </div>
        <div class="tof-grid tof-grid--2" style="margin-top: 0.5rem">
          <div>
            <label class="tof-label">Allies</label
            ><textarea
              class="tof-textarea"
              :value="d.bio.allies"
              @input="store.patch('bio', { allies: txt($event) })"
            />
          </div>
          <div>
            <label class="tof-label">Enemies</label
            ><textarea
              class="tof-textarea"
              :value="d.bio.enemies"
              @input="store.patch('bio', { enemies: txt($event) })"
            />
          </div>
        </div>
        <label class="tof-label" style="margin-top: 0.5rem">Lore &amp; Additional Traits</label>
        <textarea
          class="tof-textarea"
          :value="d.bio.lore"
          @input="store.patch('bio', { lore: txt($event) })"
        />
      </div>
    </div>

    <!-- Roll log -->
    <aside class="play__log tof-panel">
      <div class="tof-h3" style="margin-top: 0">
        Rolls
        <button
          v-if="history.length"
          class="tof-btn tof-btn--ghost tof-small"
          style="float: right"
          @click="history.length = 0"
        >
          Clear
        </button>
      </div>
      <p v-if="!history.length" class="tof-small tof-muted">
        Click anything on your sheet to roll. In Roll20 it posts to chat; here it shows below.
      </p>
      <transition-group name="tof-fade" tag="div">
        <div
          v-for="rec in history"
          :key="rec.id"
          class="rollrec"
          :class="{ 'rollrec--cast': rec.kind === 'cast' }"
        >
          <div class="rollrec__top">
            <span class="rollrec__title">{{ rec.title }}</span>
            <span v-if="rec.kind !== 'cast'" class="rollrec__total">{{ rec.total }}</span>
          </div>
          <div class="tof-small tof-muted">
            {{ rec.subtitle }}<span v-if="rec.parts">, {{ rec.parts }}</span>
          </div>
          <div v-if="rec.note" class="rollrec__note">{{ rec.note }}</div>
        </div>
      </transition-group>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useDraftStore } from '@/maker/store/draftStore';
import { ATTRIBUTES } from '@/maker/data/attributes';
import {
  classById,
  raceById,
  philosophyById,
  subraceById,
  weaponById,
  arteById,
  backgroundTraitById,
} from '@/maker/data';
import { CONDITIONS } from '@/maker/data/reference';
import { EQUIP_SLOT_NAMES } from '@/maker/data/equipSlots';
import EquipDoll from '@/maker/components/EquipDoll.vue';
import { formatModifier } from '@/maker/rules/stats';
import { skillRows } from '@/maker/rules/proficiency';
import { casterInfo } from '@/maker/rules/casting';
import { rollHistory, rollMode, type RollMode } from '@/maker/rules/rolls';
import * as r from '@/maker/rules/rolls';
import type { ArteDef } from '@/maker/types';

const store = useDraftStore();
const d = store.draft;
const fmt = formatModifier;
const history = rollHistory;

const res = computed(() => store.resources);
const amt = ref(1);
const num = (e: Event) => Number((e.target as HTMLInputElement).value) || 0;
const str = (e: Event) => (e.target as HTMLInputElement).value;
const txt = (e: Event) => (e.target as HTMLTextAreaElement).value;

// --- Paged sheet (mirrors the four official sheet pages) ---
type Page = 'main' | 'inventory' | 'artes' | 'bio';
const page = ref<Page>('main');

// --- Inventory ---
const inv = store.draft.inventory;
const ITEM_TYPES = ['Weapon', 'Armor', 'Gear', 'Consumable', 'Ring', 'Other'] as const;
const CONTAINERS = ['Inventory', 'Treasure', 'Potions', 'Misc'] as const;
type Container = (typeof CONTAINERS)[number];
const CONTAINER_LABELS: Record<Container, string> = {
  Inventory: 'Inventory',
  Treasure: 'Treasure',
  Potions: 'Potions & Poisons',
  Misc: 'Miscellaneous',
};
const SLOT_NAMES = EQUIP_SLOT_NAMES;
const itemsIn = (c: Container) => inv.items.filter((i) => (i.container || 'Inventory') === c);
const totalWeight = computed(
  () => Math.round(inv.items.reduce((s, i) => s + (i.amount || 0) * (i.weight || 0), 0) * 10) / 10,
);
const equippedMap = computed(() => {
  const m: Record<string, string> = {};
  inv.items.forEach((i) => {
    if (i.slot) m[i.slot] = i.name || i.type || 'Item';
  });
  return m;
});
const newItem = ref<{
  name: string;
  type: (typeof ITEM_TYPES)[number];
  container: Container;
  amount: number;
  weight: number;
}>({ name: '', type: 'Gear', container: 'Inventory', amount: 1, weight: 0 });
function addItem() {
  const name = newItem.value.name.trim();
  if (!name) return;
  store.addInvItem({
    name,
    type: newItem.value.type,
    container: newItem.value.container,
    amount: newItem.value.amount || 1,
    weight: newItem.value.weight || 0,
  });
  newItem.value = {
    name: '',
    type: 'Gear',
    container: newItem.value.container,
    amount: 1,
    weight: 0,
  };
}
function unequipSlot(slot: string) {
  const it = inv.items.find((i) => i.slot === slot);
  if (it) store.equipItem(it.id, null);
}

// --- Roll mode + casting (aether-spend + tier gating) ---
const setRollMode = (m: RollMode) => (rollMode.value = m);
const castMsg = ref('');
function cast(arte: ArteDef) {
  const ci = caster.value;
  const res = store.resources;
  if (arte.tier > ci.maxTier) {
    castMsg.value = `${arte.name}: Tier ${arte.tier} is above your max tier (${ci.maxTier}).`;
    return;
  }
  if (res.maxAether > 0 && res.currentAether < arte.aetherCost) {
    castMsg.value = `Not enough Aether for ${arte.name} (need ${arte.aetherCost}, have ${res.currentAether}).`;
    return;
  }
  if (arte.aetherCost > 0) store.adjustAether(-arte.aetherCost);
  castMsg.value = '';
  r.castArte(d, arte);
}

const skills = computed(() => skillRows(store.draft));
const caster = computed(() => casterInfo(store.draft));
const weapons = computed(() =>
  store.draft.equipment.selectedWeaponIds.map((id) => weaponById[id]).filter(Boolean),
);
const artes = computed(() =>
  store.draft.artes.selectedArteIds.map((id) => arteById[id]).filter(Boolean),
);
const classes = computed(() =>
  store.draft.classBuild.classes.map((c) => ({ cls: classById[c.classId] })).filter((c) => c.cls),
);

const saveButtons = computed(() => {
  const s = store.derived.saves;
  return [
    { group: 'Body' as const, value: s.body },
    { group: 'Mind' as const, value: s.mind },
    { group: 'Soul' as const, value: s.soul },
    { group: 'Concentration' as const, value: s.concentration },
  ];
});

const raceLabel = computed(() => {
  const race = d.race.selectedRaceId ? raceById[d.race.selectedRaceId] : null;
  if (!race) return 'No race';
  const sub = d.race.selectedSubraceId ? subraceById(race.id, d.race.selectedSubraceId) : null;
  return sub ? `${sub.name} ${race.name}` : race.name;
});
const classLabel = computed(
  () =>
    store.draft.classBuild.classes
      .filter((c) => c.classId)
      .map((c) => `${classById[c.classId]?.name} ${c.level}`)
      .join(', ') || `Level ${store.level}`,
);
const philLabel = computed(() => {
  const p = d.philosophy.selectedPhilosophyId
    ? philosophyById[d.philosophy.selectedPhilosophyId]
    : null;
  return d.philosophy.custom?.name || p?.name || 'No philosophy';
});

const pages = computed(() => {
  const list: { id: Page; label: string }[] = [
    { id: 'main', label: 'Main' },
    { id: 'inventory', label: 'Inventory' },
  ];
  if (caster.value.isCaster) list.push({ id: 'artes', label: 'Artes' });
  list.push({ id: 'bio', label: 'Bio' });
  return list;
});

const racialTraits = computed(() => {
  const race = d.race.selectedRaceId ? raceById[d.race.selectedRaceId] : null;
  if (!race) return [] as { name: string; description: string }[];
  const sub = d.race.selectedSubraceId ? subraceById(race.id, d.race.selectedSubraceId) : null;
  return [...(race.traits ?? []), ...(sub?.traits ?? [])];
});
const bgList = computed(() =>
  d.background.selectedTraits.map((t) => backgroundTraitById[t.traitId]?.name).filter(Boolean),
);
</script>

<style scoped lang="scss">
.play {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 1.25rem;
  align-items: start;
}
@media (max-width: 920px) {
  .play {
    grid-template-columns: 1fr;
  }
}
.play__id {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.play__avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--tof-panel-border-strong);
}
.statrow {
  display: flex;
  gap: 1.1rem;
  flex-wrap: wrap;
}
.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  border: none;
  background: none;
  color: var(--tof-cream);
}
.stat__num {
  font-family: var(--tof-font-heading);
  font-size: 1.5rem;
  color: var(--tof-gold);
}
.stat--btn {
  cursor: pointer;
}
.stat--btn:hover .stat__num {
  text-shadow: 0 0 12px var(--tof-gold);
}

.vitals {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.75rem;
}
.vital {
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  padding: 0.6rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
}
.vital--hp {
  border-color: rgba(159, 224, 166, 0.4);
}
.vital--dying {
  border-color: var(--tof-accent-red-bright);
  box-shadow: 0 0 14px rgba(200, 60, 60, 0.4);
}
.vital--death {
  border-color: var(--tof-accent-red-bright);
}
.vital__label {
  font-size: 0.78rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #c9c3da;
}
.vital__big {
  font-family: var(--tof-font-heading);
  font-size: 1.5rem;
  color: var(--tof-gold);
}
.vital__max {
  font-size: 1rem;
  color: #8a85a0;
}
.vital__danger {
  color: var(--tof-accent-red-bright);
}
.vital__temp {
  font-size: 0.95rem;
  color: #9fe0a6;
  margin-left: 0.25rem;
}
.vital__btns {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}
.vital__temprow {
  font-size: 0.72rem;
  color: #8a85a0;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}
.hpbtn {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.18);
  color: var(--tof-cream);
}
.hpbtn:hover {
  background: rgba(235, 167, 46, 0.2);
}
.hpbtn--dmg:hover {
  background: rgba(200, 60, 60, 0.35);
}
.hpbtn--heal:hover {
  background: rgba(80, 170, 90, 0.35);
}
.hpinput {
  width: 40px;
  text-align: center;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 6px;
  color: var(--tof-cream);
  padding: 0.2rem;
}
.miniinput {
  width: 42px;
  text-align: center;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 5px;
  color: var(--tof-cream);
}
.deathpips {
  display: flex;
  gap: 0.25rem;
}
.pip {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 1px solid var(--tof-accent-red-bright);
  background: transparent;
  cursor: pointer;
  padding: 0;
}
.pip--on {
  background: var(--tof-accent-red-bright);
  box-shadow: 0 0 6px var(--tof-accent-red-bright);
}
.condchips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}
.condchip {
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 999px;
  color: #c9c3da;
  padding: 0.25rem 0.7rem;
  cursor: pointer;
  font-size: 0.8rem;
}
.condchip:hover {
  border-color: var(--tof-gold);
}
.condchip--on {
  background: rgba(200, 60, 60, 0.3);
  border-color: var(--tof-accent-red-bright);
  color: #fff;
}

.attrgrid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 0.6rem;
}
@media (max-width: 720px) {
  .attrgrid {
    grid-template-columns: repeat(3, 1fr);
  }
}
.rollcard {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.1rem;
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  padding: 0.5rem;
  cursor: pointer;
  color: var(--tof-cream);
  transition: border-color 0.15s, transform 0.1s, box-shadow 0.2s;
}
.rollcard:hover {
  border-color: var(--tof-gold);
  transform: translateY(-1px);
  box-shadow: 0 0 12px rgba(235, 167, 46, 0.3);
}
.rollcard__label {
  font-size: 0.8rem;
}
.rollcard__big {
  font-family: var(--tof-font-heading);
  font-size: 1.4rem;
  color: var(--tof-gold);
}
.rollcard__mod {
  font-size: 0.78rem;
  color: var(--tof-accent-blue);
}

.saverow {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.rollpill {
  background: linear-gradient(180deg, rgba(235, 167, 46, 0.18), rgba(235, 167, 46, 0.04));
  border: 1px solid var(--tof-panel-border);
  border-radius: 999px;
  color: var(--tof-cream);
  padding: 0.3rem 0.8rem;
  cursor: pointer;
  font-size: 0.85rem;
  transition: box-shadow 0.2s, transform 0.1s;
}
.rollpill:hover {
  box-shadow: 0 0 12px rgba(235, 167, 46, 0.35);
  transform: translateY(-1px);
}
.rollpill--danger {
  border-color: var(--tof-accent-red-bright);
}

.skillcols {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.15rem 1rem;
}
@media (max-width: 720px) {
  .skillcols {
    grid-template-columns: 1fr;
  }
}
.skillbtn {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: none;
  border: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  color: #c9c3da;
  padding: 0.25rem 0.2rem;
  cursor: pointer;
  font-size: 0.86rem;
  text-align: left;
}
.skillbtn:hover {
  color: var(--tof-cream);
  background: rgba(235, 167, 46, 0.08);
}
.skillbtn--prof {
  color: var(--tof-cream);
}
.skillbtn__b {
  color: var(--tof-gold);
  font-variant-numeric: tabular-nums;
}
.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 0.4rem;
  background: rgba(255, 255, 255, 0.15);
  display: inline-block;
}
.dot--proficient {
  background: var(--tof-gold);
}
.dot--expert {
  background: #9fe0a6;
  box-shadow: 0 0 6px #9fe0a6;
}

.weapon {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.3rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}
.weapon__name {
  flex: 1;
  font-family: var(--tof-font-subheading);
}
.artegrid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.4rem;
}
@media (max-width: 720px) {
  .artegrid {
    grid-template-columns: 1fr;
  }
}
.arte {
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 0.4rem 0.6rem;
  display: flex;
  flex-direction: column;
}
.arte__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.4rem;
}
.rollpill--cast {
  border-color: var(--tof-gold);
  background: linear-gradient(180deg, rgba(235, 167, 46, 0.3), rgba(235, 167, 46, 0.08));
  padding: 0.15rem 0.7rem;
  font-size: 0.8rem;
  flex: 0 0 auto;
}

.play__log {
  position: sticky;
  top: 1rem;
  max-height: 80vh;
  overflow-y: auto;
}
.rollrec {
  padding: 0.4rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
.rollrec__top {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}
.rollrec__title {
  font-family: var(--tof-font-subheading);
}
.rollrec__total {
  font-family: var(--tof-font-heading);
  font-size: 1.4rem;
  color: var(--tof-gold);
}
.rollrec--cast {
  border-left: 2px solid var(--tof-gold);
  padding-left: 0.5rem;
}
.rollrec__note {
  margin-top: 0.25rem;
  font-size: 0.78rem;
  line-height: 1.4;
  color: #c9c3da;
  max-height: 7.5rem;
  overflow-y: auto;
  white-space: pre-line;
}

/* Page tabs */
.pagetabs {
  display: flex;
  gap: 0.3rem;
  margin-bottom: 0.9rem;
  flex-wrap: wrap;
}
.pagetab {
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid var(--tof-panel-border);
  border-radius: 999px;
  color: var(--tof-cream);
  font-family: var(--tof-font-subheading);
  padding: 0.35rem 1.1rem;
  cursor: pointer;
  transition: background 0.15s, box-shadow 0.2s;
}
.pagetab:hover {
  background: rgba(235, 167, 46, 0.12);
}
.pagetab--on {
  background: linear-gradient(180deg, var(--tof-gold), #c4861a);
  color: #2a1d05;
  font-weight: 700;
  border-color: var(--tof-gold);
}
.rollmode {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}
.rollmode button {
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid var(--tof-panel-border);
  color: var(--tof-cream);
  border-radius: 6px;
  padding: 0.25rem 0.55rem;
  cursor: pointer;
  font-size: 0.78rem;
}
.rollmode button.on {
  background: linear-gradient(180deg, var(--tof-gold), #c4861a);
  color: #2a1d05;
  font-weight: 700;
  border-color: var(--tof-gold);
}

/* Inventory tables */
.invtable {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 0.5rem;
}
.invtable th {
  text-align: left;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--tof-accent-blue);
  padding: 0 0.3rem 0.3rem;
}
.invtable td {
  padding: 0.1rem 0.3rem;
}
.invnum,
.invname {
  width: 100%;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 6px;
  color: var(--tof-cream);
  padding: 0.25rem 0.4rem;
}
.invnum {
  text-align: center;
}
.invtype {
  width: 100%;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 6px;
  color: var(--tof-cream);
  padding: 0.2rem 0.3rem;
  font-size: 0.82rem;
}
.additem {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-bottom: 0.6rem;
  align-items: center;
}
.additem .invname {
  flex: 1 1 9rem;
}
.additem__type {
  flex: 0 0 8rem;
}
.additem .invnum {
  flex: 0 0 4rem;
}
.carrybar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.6rem;
}
.carrybox {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.15rem;
}
.carrybox__label {
  font-size: 0.62rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--tof-accent-blue);
}
.carrybox strong {
  font-family: var(--tof-font-heading);
  font-size: 1.3rem;
  color: var(--tof-gold);
}
.carryinput {
  width: 4rem;
  text-align: center;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 6px;
  color: var(--tof-gold);
  font-family: var(--tof-font-heading);
  font-size: 1.1rem;
  padding: 0.1rem;
}
.gearrow {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1.4rem;
  align-items: center;
}
.gearitem {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--tof-cream);
  font-size: 0.9rem;
}
.gearitem .invnum {
  width: 3.4rem;
}
.invdel {
  background: none;
  border: none;
  color: var(--tof-accent-red-bright);
  cursor: pointer;
  font-size: 1.1rem;
  line-height: 1;
}
.invdel:hover {
  color: #ff9aa6;
}

.equipgrid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.4rem 0.8rem;
}
.equipslot {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}
.equipslot__name {
  flex: 0 0 4.2rem;
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--tof-accent-blue);
}
.equipslot input {
  flex: 1;
  background: rgba(0, 0, 0, 0.3);
  border: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.18);
  color: var(--tof-cream);
  padding: 0.2rem 0.3rem;
}
.biorow {
  padding: 0.3rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}
.biorow strong {
  color: var(--tof-gold);
}
</style>
