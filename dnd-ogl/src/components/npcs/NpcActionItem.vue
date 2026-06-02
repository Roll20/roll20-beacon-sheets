<template>
  <details v-if="!editMode" class="accordion">
    <summary class="accordion__summary">
      <div class="npc-action-item__summary-grid">
        <strong class="npc-action-item__name">
          {{ action.name }}
          <span
            v-if="action.group === 'legendary' && action.legendaryCost"
            class="npc-action-item__cost"
          >
            ({{ t('titles.legendary-cost-label', { cost: action.legendaryCost }) }})
          </span>
        </strong>
        <button v-if="action.description || action.target || action.range"
          class="action-item__chat-button"
          :title="t('titles.icons.send-to-chat')"
          @click.stop="store.sendActionInfoToChat(npcId, action._id,t)"
        >
          <SvgIcon icon="chat" />
        </button>
        <span class="npc-action-item__damage" v-if="damagePool.value.final.length > 0">
          <DicePool :pool="damagePool" :rollArgs="damageRollArgs" />
        </span>
        <span class="npc-action-item__damage" v-else>-</span>
        <span class="npc-action-item__attack-bonus" v-if="action.isAttack">
          <RollModifier
            :finalBonus="attackBonus.value.final"
            :rollArgs="rollArgs"
            @rolled="handleAttackRolled"
          />
        </span>
        <span class="npc-action-item__dc" v-else-if="action.saving !== 'none'">
          <button class="button--link roll-dc" @click.stop="store.sendActionInfoToChat(npcId, action._id,t)">
            DC{{ action.savingDc }}
          </button>
        </span>
        <span v-else></span>
      </div>
    </summary>
    <div class="accordion__details">
      <p v-if="action.isAttack">
        <em
          >{{ t(`titles.attack-types.${action.attackType}`) }}
          {{ t(`titles.source-types.${action.sourceType}`) }} {{ t('titles.attack') }}</em
        >
      </p>
      <p v-if="action.target">
        <strong>{{ t('titles.target') }}:</strong> {{ action.target }}
      </p>
      <p v-if="action.range">
        <strong>{{ t('titles.range') }}:</strong> {{ action.range }}
      </p>
      <p v-if="action.saving !== 'none'">
        <strong>{{ t('titles.saving-throw') }}:</strong> {{ t('titles.dc') }} {{ action.savingDc }}
        {{ t(`titles.abilities.${action.saving}`) }}
      </p>
      <div v-if="action.description" class="description" v-html="parsedDescription"></div>
    </div>
  </details>

  <div v-else class="npc-action-editor">
    <div class="npc-action-editor__form">
      <div class="npc-action-editor__row">
        <input
          v-model="action.name"
          :placeholder="t('titles.name')"
          class="npc-action-editor__input--name"
          required
        />
        <button @click="$emit('remove')" class="npc-action-editor__remove-button">×</button>
      </div>
      <label class="checkbox-label">
        <input type="checkbox" v-model="action.isAttack" />
        {{ t('titles.is-attack') }}
      </label>

      <div class="npc-action-editor__grid">
        <div
          v-if="action.group !== 'legendary' && action.group !== 'lair'"
          class="npc-action-editor__labeled-input"
        >
          <strong>{{ t('titles.group') }}:</strong>
          <select v-model="action.group" required>
            <option value="actions">{{ t('titles.action-groups.actions') }}</option>
            <option value="bonus-actions">{{ t('titles.action-groups.bonus-actions') }}</option>
            <option value="reactions">{{ t('titles.action-groups.reactions') }}</option>
            <option value="free-actions">{{ t('titles.action-groups.free-actions') }}</option>
          </select>
        </div>
        <div v-if="action.isAttack" class="npc-action-editor__labeled-input">
          <strong>{{ t('titles.attack-type') }}:</strong>
          <select v-model="action.attackType">
            <option value="melee">{{ t('titles.attack-types.melee') }}</option>
            <option value="ranged">{{ t('titles.attack-types.ranged') }}</option>
          </select>
        </div>
        <div v-if="action.isAttack" class="npc-action-editor__labeled-input">
          <strong>{{ t('titles.source-type') }}:</strong>
          <select v-model="action.sourceType">
            <option value="weapon">{{ t('titles.source-types.weapon') }}</option>
            <option value="spell">{{ t('titles.source-types.spell') }}</option>
          </select>
        </div>
        <div class="npc-action-editor__labeled-input">
          <strong>{{ t('titles.range') }}:</strong>
          <input v-model="action.range" />
        </div>
        <div class="npc-action-editor__labeled-input">
          <strong>{{ t('titles.target') }}:</strong>
          <input v-model="action.target" />
        </div>
      </div>

      <div class="npc-action-editor__grid">
        <div v-if="action.isAttack" class="npc-action-editor__labeled-input">
          <strong>{{ t('titles.attack-bonus') }}:</strong>
          <input type="number" v-model.number="action.attackBonus" placeholder="-" />
        </div>
        <div v-if="action.isAttack" class="npc-action-editor__labeled-input">
          <strong>{{ t('titles.crit-range') }}:</strong>
          <input type="number" v-model.number="action.critRange" min="1" max="20" />
        </div>
        <div class="npc-action-editor__labeled-input">
          <strong>{{ t('titles.saving-throw') }}:</strong>
          <select v-model="action.saving">
            <option value="none">{{ t('titles.none') }}</option>
            <option v-for="ability in config.abilities" :key="ability" :value="ability">
              {{ t(`titles.abilities.${ability}`) }}
            </option>
          </select>
        </div>
        <div v-if="action.saving !== 'none'" class="npc-action-editor__labeled-input">
          <strong>{{ t('titles.save-dc') }}:</strong>
          <input type="number" v-model.number="action.savingDc" />
        </div>
        <div v-if="action.group === 'legendary'" class="npc-action-editor__labeled-input">
          <strong>{{ t('titles.legendary-cost') }}:</strong>
          <input type="number" v-model.number="action.legendaryCost" min="1" />
        </div>
      </div>

      <DamageType :damage="action.damage" :showCrit="action.isAttack" />
      <textarea
        v-model="action.description"
        :placeholder="t('titles.description')"
        rows="3"
      ></textarea>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useNpcStore, type NpcAction } from '@/sheet/stores/npc/npcStore';
import RollModifier from '@/components/shared/RollModifier.vue';
import DicePool from '@/components/shared/DicePool.vue';
import DamageType from '@/components/shared/DamageType.vue';
import { config } from '@/config';
import { useI18n } from 'vue-i18n';
import {
  type D20RollArgs,
  type DamageRollArgs,
  getRollProperties,
  type LabeledBonus
} from '@/utility/roll';
import { createComponentsFromFormula } from '@/utility/diceParser';
import { getDiceFromExpression } from '@/utility/getDiceFromExpression';
import { effectKeys } from '@/effects.config';
import { EffectsCalculator } from '@/utility/effectsCalculator';
import { parseSimpleMarkdown } from '@/utility/markdownParser';
import SvgIcon from '@/components/shared/SvgIcon.vue';
const props = defineProps<{
  npcId: string;
  action: NpcAction;
  editMode: boolean;
}>();

const emit = defineEmits(['remove']);
const store = useNpcStore();
const { t } = useI18n();
const parsedDescription = computed(() => parseSimpleMarkdown(props.action.description));
//Computed values
const attackBonus = computed(() => store.getNpcActionBonus(props.npcId, props.action));
const damagePool = computed(() => store.getNpcActionDamage(props.npcId, props.action));

const lastAttackResult = ref<'crit-success' | 'crit-fail' | undefined>(undefined);

//Capture attack roll result for use in critical damage
const handleAttackRolled = (result: 'crit-success' | 'crit-fail' | undefined) => {
  lastAttackResult.value = result;
};

const damageRollArgs = computed((): DamageRollArgs => {
  const npc = store.npcs.find((n) => n._id === props.npcId);
  if (!npc)
    return {
      rollName: '',
      subtitle: '',
      damageRolls: [],
      isCrit: false,
      t: function (key: string): string {
        throw new Error('Function not implemented.');
      },
    };

  const action = props.action;

  const damageModifierKeys = [
    effectKeys.damage,
    effectKeys[`${action.attackType}-damage`],
    effectKeys[`${action.sourceType}-damage`],
    effectKeys[`${action.attackType}-${action.sourceType}-damage`],
  ].filter(Boolean);

  const damageRollKeys = [
    effectKeys['damage-roll'],
    effectKeys[`${action.attackType}-damage-roll`],
    effectKeys[`${action.sourceType}-damage-roll`],
    effectKeys[`${action.attackType}-${action.sourceType}-damage-roll`],
  ].filter(Boolean);

  return {
    rollName: action.name,
    subtitle: t('rolls.damage-roll'),
    damageRolls: action.damage,
    isCrit: lastAttackResult.value === 'crit-success',
    canCrit: action.isAttack,
    whisper: false,
    sourceType: 'action',
    characterName: npc.name,
    effectsSource: npc.effects,
    damageModifierKeys,
    damageRollKeys,
    properties: getRollProperties(action, t, action.savingDc > 0 ? action.savingDc : undefined),
    description: action.description,
    t: t,
  };
});

const rollArgs = computed((): D20RollArgs => {
  const action = props.action;
  const npc = store.npcs.find((n) => n._id === props.npcId);
  if (!npc) return { rollName: '', subtitle: '', bonuses: [] };

  const bonuses: LabeledBonus[] = [];

  const bonusValue = store.getNpcActionBonus(props.npcId, action);
  const effectsTotal = bonusValue.value.modifiers.reduce((sum, mod) => sum + mod.value, 0);
  const baseModifier = bonusValue.value.final - effectsTotal;

  if (baseModifier !== 0) {
    bonuses.push({ label: t('titles.attack-bonus'), value: baseModifier });
  }

  bonusValue.value.modifiers.forEach((mod) => {
    bonuses.push({ label: mod.name, value: mod.value });
  });

  const rollBonusKeys = [
    effectKeys['attack-roll'],
    effectKeys[`${action.attackType}-attack-roll`],
    effectKeys[`${action.sourceType}-attack-roll`],
    effectKeys[`${action.attackType}-${action.sourceType}-attack-roll`],
  ].filter(Boolean);

  const actionDieKeys = [
    effectKeys['attack-action-die'],
    effectKeys[`${action.attackType}-attack-action-die`],
    effectKeys[`${action.sourceType}-attack-action-die`],
    effectKeys[`${action.attackType}-${action.sourceType}-attack-action-die`],
  ].filter(Boolean);

  const critRange = store.getNpcActionCritRange(props.npcId, action).value.final;

  return {
    rollName: action.name,
    subtitle: t('rolls.attack-roll'),
    bonuses: bonuses,
    rollBonusKeys: rollBonusKeys,
    actionDieKeys: actionDieKeys,
    critRange: critRange,
    properties: getRollProperties(action, t, action.savingDc > 0 ? action.savingDc : undefined),
    description: action.description,
    effectsSource: npc?.effects || [],
    sourceType: 'action',
    characterName: store.npcs.find((n) => n._id === props.npcId)?.name,
  };
});
</script>
<style lang="scss" scoped>
.npc-action-editor {
  border: 1px dashed #1e90ff;
  padding: 0.5rem;
  border-radius: 4px;
  margin-bottom: 0.5rem;
}
.npc-action-editor__form {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.npc-action-editor__row {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}
.npc-action-editor__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.5rem;
}
.npc-action-editor__input--name {
  font-weight: bold;
  width: 100%;
}
.npc-action-editor__remove-button {
  background-color: #ff4d4f;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  flex-shrink: 0;
}
.npc-action-editor__labeled-input {
  display: flex;
  flex-direction: column;
}
.npc-action-editor__labeled-input > strong {
  font-size: 0.8em;
  margin-bottom: 0.25rem;
  color: #555;
}
.npc-action-editor__label-text {
  flex-shrink: 0;
}
.action-summary__cost {
  font-weight: normal;
  font-style: italic;
  font-size: 0.9em;
  margin-left: 0.5rem;
}
.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  input {
    width: auto;
  }
}

.npc-action-item__summary-grid {
  display: grid;
  grid-template-columns: 1fr min-content 50px 50px;
  gap: 0.5rem 1rem;
  align-items: center;
  width: 100%;
}
.npc-action-item__name {
  justify-self: start;
  font-weight: bold;
}
.npc-action-item__damage {
  justify-self: center;
}
.npc-action-item__dc,
.npc-action-item__attack-bonus {
  justify-self: end;
  font-weight: bold;
}
.action-item__chat-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  .svg-icon {
    width: 1rem;
    height: 1rem;
    color: var(--color-tertiary);
    &:hover {
      color: var(--color-highlight);
    }
  }
}
.roll-dc {
  white-space: nowrap;
  background: transparent;
  border: none;
  padding: 0;
  font-weight: var(--weight-bold);
  cursor: pointer;
  color: var(--color-primary);
  font-size: 10px;
}
</style>
