<template>
  <div v-if="entity" class="cru-sheet">
    <div class="cru-sheet__cols">
      <div class="cru-sheet__left">
        <div class="tof-panel cru-sheet__vitals">
          <h3 class="cru-sheet__name">{{ entity.identity.name }}</h3>
          <div class="tof-small tof-muted">{{ subtitle }}</div>
          <div v-if="bound" class="tof-small tof-ok">
            Bound to this Roll20 character - HP, Aether, and AP here drive the token bars.
          </div>
          <div class="cru-sheet__stats">
            <div class="cru-sheet__stat">
              <span>AC</span><strong>{{ entity.derived.armorClass }}</strong>
            </div>
            <div class="cru-sheet__stat">
              <span>HP</span>
              <strong>{{ hp }} / {{ entity.derived.hitPoints }}</strong>
              <div class="cru-sheet__hpbtns">
                <button class="tof-btn tof-btn--ghost tof-small" @click="adjustHp(-10)">-10</button>
                <button class="tof-btn tof-btn--ghost tof-small" @click="adjustHp(-1)">-1</button>
                <button class="tof-btn tof-btn--ghost tof-small" @click="adjustHp(1)">+1</button>
                <button class="tof-btn tof-btn--ghost tof-small" @click="adjustHp(10)">+10</button>
              </div>
            </div>
            <div class="cru-sheet__stat">
              <span>AP</span>
              <strong>{{ ap }} / {{ entity.derived.actionPoints }}</strong>
              <div class="cru-sheet__hpbtns">
                <button class="tof-btn tof-btn--ghost tof-small" @click="spendAp(1)">Spend</button>
                <button class="tof-btn tof-btn--ghost tof-small" @click="resetAp">Reset</button>
              </div>
            </div>
            <div v-if="entity.derived.aether" class="cru-sheet__stat">
              <span>Aether</span>
              <strong>{{ aether }} / {{ entity.derived.aether }}</strong>
              <div class="cru-sheet__hpbtns">
                <button class="tof-btn tof-btn--ghost tof-small" @click="adjustAether(-1)">
                  -1
                </button>
                <button class="tof-btn tof-btn--ghost tof-small" @click="adjustAether(1)">
                  +1
                </button>
              </div>
            </div>
            <div class="cru-sheet__stat">
              <span>Init</span><strong>{{ fmtMod(entity.derived.initiative) }}</strong>
            </div>
            <div class="cru-sheet__stat">
              <span>Effect DC</span><strong>{{ entity.derived.effectSaveDc }}</strong>
            </div>
          </div>
          <div class="cru-sheet__rollrow">
            <button class="tof-btn" @click="rollInitiative">Roll Initiative</button>
            <button class="tof-btn tof-btn--ghost" @click="rolls.defenses">Defenses to Chat</button>
            <button
              v-for="save in SAVE_IDS"
              :key="save"
              class="tof-btn tof-btn--ghost tof-small"
              @click="rolls.save(save)"
            >
              {{ SAVE_LABELS[save] }} {{ fmtMod(entity.derived.saves[save]) }}
            </button>
          </div>
          <div v-if="talentEntries.length" class="cru-sheet__rollrow">
            <button
              v-for="[talent, bonus] in talentEntries"
              :key="talent"
              class="tof-btn tof-btn--ghost tof-small"
              @click="rolls.talent(talent)"
            >
              {{ talent }} {{ fmtMod(bonus) }}
            </button>
          </div>
        </div>

        <div v-for="group in actionGroups" :key="group.label" class="tof-panel">
          <h4 class="tof-h2 tof-small">{{ group.label }}</h4>
          <div v-for="action in group.actions" :key="action.id" class="cru-sheet__action">
            <button
              class="tof-btn tof-small"
              :disabled="isSpent(action)"
              @click="useAction(action)"
            >
              {{ action.name }}
            </button>
            <span class="tof-small tof-muted">
              {{ action.actionPointCost ? `${action.actionPointCost} AP` : '' }}
              {{
                action.recharge
                  ? ` - Recharge ${action.recharge.min}+${isSpent(action) ? ' (spent)' : ''}`
                  : ''
              }}
              {{ damageSummary(action) }}
            </span>
            <span v-if="action.gmOnly" class="tof-tag">GM</span>
          </div>
        </div>

        <div v-if="hasRecharge" class="tof-panel">
          <button class="tof-btn tof-btn--ghost" @click="rechargeAll">
            Roll Recharges (round start)
          </button>
        </div>

        <div v-if="entity.boss?.phases.length" class="tof-panel">
          <h4 class="tof-h2 tof-small">Phases</h4>
          <div class="cru-sheet__phases">
            <button
              v-for="phase in entity.boss.phases"
              :key="phase.id"
              class="tof-tag cru-sheet__phase"
              :class="{ on: activePhase === phase.id }"
              @click="triggerPhase(phase)"
            >
              {{ phase.order }}. {{ phase.name }}
            </button>
          </div>
        </div>

        <div v-if="gm" class="tof-panel cru-sheet__gmrow">
          <button class="tof-btn tof-btn--ghost tof-small" @click="rolls.loot">Whisper Loot</button>
          <button class="tof-btn tof-btn--ghost tof-small" @click="rolls.gmNote">
            Whisper GM Notes
          </button>
          <button
            v-if="bound"
            class="tof-btn tof-btn--ghost tof-small"
            @click="characterStore.rest()"
          >
            Full Restore
          </button>
          <label class="tof-small tof-muted">
            <input
              type="checkbox"
              :checked="entity.roll20.defaultOutput === 'gmWhisper'"
              @change="toggleWhisper"
            />
            whisper all output
          </label>
        </div>
      </div>

      <div class="cru-sheet__right">
        <CrucibleStatblockPreview :entity="entity" :player-safe="!gm" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useCrucibleLibraryStore } from '@/crucible/store/crucibleLibrary.store';
import { useCrucibleCharacterStore } from '@/crucible/store/crucibleCharacter.store';
import type { CrucibleActionInstance } from '@/crucible/schemas/crucibleAction.schema';
import type { CruciblePhase } from '@/crucible/schemas/cruciblePhase.schema';
import { SAVE_IDS, SAVE_LABELS } from '@/crucible/schemas/crucibleCommon';
import { subtitleLine } from '@/crucible/engine/formatStatblock';
import { dispatchRef, initValues } from '@/relay/relay';
import {
  crucibleRollInitiative,
  crucibleRollTalent,
  crucibleRollSave,
  crucibleUseAction,
  crucibleRecharge,
  cruciblePhaseTransition,
  crucibleLootCard,
  crucibleGmNote,
  crucibleShowDefenses,
} from '@/crucible/engine/crucibleRolls';
import CrucibleStatblockPreview from './CrucibleStatblockPreview.vue';

const props = withDefaults(
  defineProps<{
    /** Library entity to run (preview mode), or null when running the bound entity. */
    entityId?: string | null;
    /** Run the entity bound to this Roll20 character (play state syncs to token bars). */
    bound?: boolean;
    /** GM view (full statblock + GM tools); false renders the player-safe sheet. */
    gm?: boolean;
  }>(),
  { entityId: null, bound: false, gm: true },
);

const library = useCrucibleLibraryStore();
const characterStore = useCrucibleCharacterStore();

const entity = computed(() =>
  props.bound ? characterStore.bound : props.entityId ? library.byId(props.entityId) : null,
);

// Library-preview play state (local only; bound mode persists via the store).
const localHpLost = ref(0);
const localApSpent = ref(0);
const localAetherSpent = ref(0);
const localPhase = ref<string | null>(null);
const localSpent = ref<Set<string>>(new Set());

const hp = computed(() =>
  props.bound
    ? characterStore.currentHp
    : Math.max(0, (entity.value?.derived.hitPoints ?? 0) - localHpLost.value),
);
const ap = computed(() =>
  props.bound
    ? characterStore.currentAp
    : Math.max(0, (entity.value?.derived.actionPoints ?? 0) - localApSpent.value),
);
const aether = computed(() =>
  props.bound
    ? characterStore.currentAether
    : Math.max(0, (entity.value?.derived.aether ?? 0) - localAetherSpent.value),
);
const activePhase = computed(() =>
  props.bound ? characterStore.play.activePhaseId : localPhase.value,
);

const subtitle = computed(() => (entity.value ? subtitleLine(entity.value) : ''));
const talentEntries = computed(() => Object.entries(entity.value?.derived.talentBonuses ?? {}));

const fmtMod = (n: number) => (n >= 0 ? `+${n}` : `${n}`);

const actionGroups = computed(() => {
  const e = entity.value;
  if (!e) return [];
  return [
    { label: 'Core Actions', actions: e.actions },
    { label: 'Quick Actions', actions: e.quickActions },
    { label: 'Reactions', actions: e.reactions },
    { label: 'Apex Actions', actions: e.apexActions },
    { label: 'Overture Actions', actions: e.overtureActions },
  ]
    .map((g) => ({ ...g, actions: props.gm ? g.actions : g.actions.filter((a) => !a.gmOnly) }))
    .filter((g) => g.actions.length);
});

const hasRecharge = computed(() =>
  actionGroups.value.some((g) => g.actions.some((a) => a.recharge)),
);

function adjustHp(delta: number) {
  if (props.bound) characterStore.adjustHp(delta);
  else localHpLost.value = Math.max(0, localHpLost.value - delta);
}
function spendAp(n: number) {
  if (props.bound) characterStore.adjustAp(-n);
  else
    localApSpent.value = Math.min(entity.value?.derived.actionPoints ?? 0, localApSpent.value + n);
}
function resetAp() {
  if (props.bound) characterStore.resetAp();
  else localApSpent.value = 0;
}
function adjustAether(delta: number) {
  if (props.bound) characterStore.adjustAether(delta);
  else localAetherSpent.value = Math.max(0, localAetherSpent.value - delta);
}

const isSpent = (action: CrucibleActionInstance) =>
  Boolean(
    action.recharge &&
      (props.bound
        ? characterStore.play.spentRecharges[action.id]
        : localSpent.value.has(action.id)),
  );

function damageSummary(action: CrucibleActionInstance): string {
  const d = action.damage?.[0];
  return d ? ` - ${d.count}d${d.die} ${d.damageType}` : '';
}

async function rollInitiative() {
  const e = entity.value;
  if (!e) return;
  const total = await crucibleRollInitiative(e);
  // In the VTT, drop the creature into the turn tracker like the D&D sheet does.
  if (props.bound && initValues.character.id) {
    try {
      const dispatch = dispatchRef.value;
      const { tokens } = await dispatch.getTokens({ characterId: initValues.character.id });
      if (tokens.length) await dispatch.addToTracker({ tokenId: tokens[0].id, value: total });
      else await dispatch.addToTracker({ custom: { name: e.identity.name }, value: total });
    } catch {
      // Standalone: no tracker to add to.
    }
  }
}

async function useAction(action: CrucibleActionInstance) {
  const e = entity.value;
  if (!e) return;
  if (action.actionPointCost) spendAp(action.actionPointCost);
  if (action.recharge) {
    if (props.bound) characterStore.markRechargeSpent(action.id, true);
    else localSpent.value.add(action.id);
  }
  await crucibleUseAction(e, action.id);
}

async function rechargeAll() {
  const e = entity.value;
  if (!e) return;
  resetAp();
  const spentIds = props.bound
    ? Object.keys(characterStore.play.spentRecharges).filter(
        (id) => characterStore.play.spentRecharges[id],
      )
    : [...localSpent.value];
  const recovered = await crucibleRecharge(e, spentIds);
  for (const [id, back] of Object.entries(recovered)) {
    if (!back) continue;
    if (props.bound) characterStore.markRechargeSpent(id, false);
    else localSpent.value.delete(id);
  }
}

async function triggerPhase(phase: CruciblePhase) {
  const e = entity.value;
  if (!e) return;
  if (props.bound) characterStore.setPhase(phase.id);
  else localPhase.value = phase.id;
  await cruciblePhaseTransition(e, phase);
}

function toggleWhisper(event: Event) {
  const e = entity.value;
  if (!e) return;
  const next = {
    ...e,
    roll20: {
      ...e.roll20,
      defaultOutput: ((event.target as HTMLInputElement).checked ? 'gmWhisper' : 'public') as
        | 'gmWhisper'
        | 'public',
    },
  };
  if (props.bound) characterStore.replace(next);
  else library.upsert(next);
}

const rolls = {
  talent: (talent: string) => entity.value && crucibleRollTalent(entity.value, talent),
  save: (save: 'body' | 'mind' | 'soul') => entity.value && crucibleRollSave(entity.value, save),
  defenses: () => entity.value && crucibleShowDefenses(entity.value),
  loot: () => entity.value && crucibleLootCard(entity.value),
  gmNote: () => entity.value && crucibleGmNote(entity.value),
};
</script>

<style scoped lang="scss">
.cru-sheet__cols {
  display: grid;
  grid-template-columns: minmax(320px, 1.1fr) minmax(300px, 1fr);
  gap: 0.9rem;
  align-items: start;
}
.cru-sheet__left {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}
.cru-sheet__name {
  font-family: var(--tof-font-heading);
  color: var(--tof-gold);
  margin: 0;
}
.cru-sheet__stats {
  display: flex;
  flex-wrap: wrap;
  gap: 0.9rem;
  margin: 0.6rem 0;
}
.cru-sheet__stat {
  span {
    display: block;
    font-size: 0.68rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--tof-muted, #999);
  }
  strong {
    font-size: 1.15rem;
  }
}
.cru-sheet__hpbtns {
  display: flex;
  gap: 0.2rem;
  margin-top: 0.2rem;
}
.cru-sheet__rollrow {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-top: 0.45rem;
}
.cru-sheet__action {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0;
  flex-wrap: wrap;
}
.cru-sheet__phases {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
}
.cru-sheet__phase {
  cursor: pointer;
  border: 1px solid var(--tof-panel-border);
  background: transparent;
  &.on {
    background: linear-gradient(180deg, var(--tof-gold), #c4861a);
    color: #2a1d05;
    font-weight: 700;
  }
}
.cru-sheet__gmrow {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
}
@media (max-width: 950px) {
  .cru-sheet__cols {
    grid-template-columns: 1fr;
  }
}
</style>
