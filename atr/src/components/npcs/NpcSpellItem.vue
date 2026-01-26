<template>
  <details v-if="!editMode" class="accordion">
    <summary class="accordion__summary">
      <div class="npc-spell-item__summary-grid">
        <strong class="npc-spell-item__name">
          {{ spell.name }}
          <span v-if="isInnate && spell.innateUsage" class="npc-spell-item__usage">
            ({{ spell.innateUsage }})
          </span>
        </strong>
        <button
          v-if="spell.description.default || spell.target || spell.range"
          class="spell-item__chat-button"
          :title="t('titles.icons.send-to-chat')"
          @click.stop="store.sendSpellInfoToChat(npcId, spell._id, t)"
        >
          <SvgIcon icon="chat" />
        </button>
        <span class="npc-spell-item__damage" v-if="damagePool.value.final.length > 0">
          <DicePool :pool="damagePool" :rollArgs="damageRollArgs" />
        </span>
        <span class="npc-spell-item__damage" v-else>-</span>
        <span class="npc-spell-item__attack-bonus" v-if="spell.isAttack">
          <RollModifier
            :finalBonus="attackBonus.value.final"
            :rollArgs="rollArgs"
            @rolled="handleAttackRolled"
          />
        </span>
        <span class="npc-spell-item__dc" v-else-if="spell.saving !== 'none'">
          <button class="button--link roll-dc" @click.stop="store.sendSpellInfoToChat(npcId, spell._id,t)">
            DC{{ saveDC.value.final }}
          </button>
        </span>
        <span v-else></span>
      </div>
    </summary>
    <div class="accordion__details">
      <p>
        <em
          >{{ t(`titles.spell-levels.${spell.level}`) }}
          {{ t(`titles.spell-schools.${spell.school}`) }}</em
        >
      </p>
      <p>
        <strong>{{ t('titles.casting-time') }}:</strong> {{ spell.castingTime }}
      </p>
      <p>
        <strong>{{ t('titles.range') }}:</strong> {{ spell.range }}
      </p>
      <p v-if="spell.target">
        <strong>{{ t('titles.target') }}:</strong> {{ spell.target }}
      </p>
      <p>
        <strong>{{ $t('titles.components') }}:</strong>
        {{ spell.components.map((c) => $t(`abbreviations.spell-components.${c}`)).join(', ') }}
        <span v-if="spell.material"> ({{ spell.material }})</span>
      </p>
      <hr />
      <p>
        <strong>{{ t('titles.duration') }}:</strong> {{ spell.duration }}
      </p>
      <div v-if="spell.description.default" class="description" v-html="parsedDescription"></div>

      <div v-if="spell.description.upcast">
        <strong>{{ $t('titles.at-higher-levels') }}.</strong>
        <div
          v-if="spell.description.upcast"
          class="description"
          v-html="parsedHigherLevelDescription"
        ></div>
      </div>
    </div>
  </details>

  <div v-else class="npc-spell-item__editor">
    <div class="npc-spell-item__row">
      <input
        v-model="spell.name"
        :placeholder="t('titles.name')"
        class="npc-spell-item__input--name"
        required
      />
      <button @click="$emit('remove')" class="npc-spell-item__remove-button">×</button>
    </div>
    <div class="npc-spell-item__grid">
      <select v-model.number="spell.level">
        <option v-for="lvl in config.spellLevels" :key="lvl" :value="lvl">
          {{ t(`titles.spell-levels.${lvl}`) }}
        </option>
      </select>
      <select v-model="spell.school">
        <option v-for="s in config.spellSchools" :key="s" :value="s">
          {{ t(`titles.spell-schools.${s}`) }}
        </option>
      </select>
      <select v-model="spell.spellSourceId" required>
        <option disabled value="">{{ t('actions.select-source') }}</option>
        <option v-for="source in spellSources" :key="source._id" :value="source._id">
          {{ source.name }}
        </option>
      </select>
      <input v-if="isInnate" v-model="spell.innateUsage" :placeholder="t('titles.innate-usage')" />
    </div>
    <div class="npc-spell-item__grid">
      <input v-model="spell.castingTime" :placeholder="t('titles.casting-time')" />
      <input v-model="spell.range" :placeholder="t('titles.range')" />
      <input v-model="spell.target" :placeholder="t('titles.target')" />
      <input v-model="spell.duration" :placeholder="t('titles.duration')" />
    </div>
    <label>
      {{ $t('titles.components') }}
      <select multiple v-model="spell.components">
        <option v-for="c in spellComponents" :key="c" :value="c">
          {{ $t(`titles.spell-components.${c}`) }}
        </option>
      </select>
    </label>
    <label>
      {{ $t('titles.material-optional') }}
      <input v-model="spell.material" />
    </label>
    <div class="npc-spell-item__checkboxes">
      <label
        ><input type="checkbox" v-model="spell.concentration" />{{
          t('titles.concentration')
        }}</label
      >
      <label><input type="checkbox" v-model="spell.ritual" />{{ t('titles.ritual') }}</label>
    </div>
    <div class="toggable-group">
      <label class="checkbox-label">
        <input type="checkbox" v-model="spell.isAttack" />
        <strong>{{ t('titles.is-attack') }}</strong>
      </label>
      <div v-if="spell.isAttack" class="toggable-group__options npc-spell-item__grid">
        <select v-model="spell.attackType">
          <option value="melee">{{ t('titles.attack-types.melee') }}</option>
          <option value="ranged">{{ t('titles.attack-types.ranged') }}</option>
        </select>
        <select v-model="spell.attackAbility">
          <option value="none">{{ t('titles.none') }}</option>
          <option v-for="ability in config.abilities" :key="ability" :value="ability">
            {{ t(`titles.abilities.${ability}`) }}
          </option>
        </select>
        <input type="number" v-model.number="spell.critRange" min="1" max="20" />
      </div>
    </div>
    <select v-model="spell.saving">
      <option value="none">{{ t('titles.saving-throw') }}</option>
      <option v-for="ability in config.abilities" :key="ability" :value="ability">
        {{ t(`titles.abilities.${ability}`) }}
      </option>
    </select>

    <DamageType :damage="spell.damage" />
    <textarea
      v-model="spell.description.default"
      :placeholder="t('titles.description')"
      rows="3"
    ></textarea>
    <!-- <textarea v-model="effectsJson" :placeholder="t('titles.effects')" rows="4"></textarea> -->
    <textarea
      v-model="spell.description.upcast"
      :placeholder="t('titles.at-higher-levels')"
      rows="2"
    ></textarea>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { config } from '@/config';
import { type Effect } from '@/sheet/stores/modifiers/modifiersStore';
import { v4 as uuidv4 } from 'uuid';
import DamageType from '@/components/shared/DamageType.vue';
import {
  useNpcStore,
  type Npc,
  type NpcSpell,
  type NpcSpellSource,
} from '@/sheet/stores/npc/npcStore';
import { stripIds } from '@/utility/jsonTools';
import { effectKeys } from '@/effects.config';
import { type D20RollArgs, type DamageRollArgs, getRollProperties, type LabeledBonus } from '@/utility/roll';
import DicePool from '@/components/shared/DicePool.vue';
import RollModifier from '@/components/shared/RollModifier.vue';
import { parseSimpleMarkdown } from '@/utility/markdownParser';
import SvgIcon from '@/components/shared/SvgIcon.vue';

const props = defineProps<{
  spell: NpcSpell;
  spellSources: NpcSpellSource[];
  editMode: boolean;
  localNpc: Npc;
  npcId: string;
}>();
defineEmits(['remove']);
const { t } = useI18n();
const spellComponents = config.spellComponents;
const parsedDescription = computed(() => parseSimpleMarkdown(props.spell.description.default));
const parsedHigherLevelDescription = computed(() =>
  parseSimpleMarkdown(props.spell.description.upcast),
);

const store = useNpcStore();

const attackBonus = computed(() =>
  store.getNpcSpellAttackBonus(props.npcId, props.spell.spellSourceId),
);
const damagePool = computed(() => store.getNpcSpellDamage(props.npcId, props.spell));
const saveDC = computed(() => store.getNpcSpellSaveDC(props.npcId, props.spell.spellSourceId));

const lastAttackResult = ref<'crit-success' | 'crit-fail' | undefined>(undefined);

const handleAttackRolled = (result: 'crit-success' | 'crit-fail' | undefined) => {
  store.setLastNpcSpellAttackResult(props.spell._id, result);
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

  return {
    rollName: props.spell.name,
    subtitle: t('rolls.damage-roll'),
    damageRolls: props.spell.damage,
    isCrit:
      store.lastNpcSpellAttack?.spellId === props.spell._id &&
      store.lastNpcSpellAttack.resultType === 'crit-success',
    canCrit: props.spell.isAttack,
    whisper: false,
    sourceType: 'spell',
    characterName: npc.name,
    effectsSource: npc.effects,
    damageModifierKeys: [
      effectKeys.damage,
      effectKeys['spell-damage'],
      effectKeys[`${props.spell.attackType}-spell-damage`],
      effectKeys[`${props.spell.attackType}-damage`],
    ].filter(Boolean),
    damageRollKeys: [
      effectKeys['damage-roll'],
      effectKeys['spell-damage-roll'],
      effectKeys[`${props.spell.attackType}-spell-damage-roll`],
      effectKeys[`${props.spell.attackType}-damage-roll`],
    ].filter(Boolean),
    properties: getRollProperties(props.spell, t, saveDC.value.value.final),
    description: props.spell.description.default,
    t: t,
  };
});

const rollArgs = computed((): D20RollArgs => {
  const npc = store.npcs.find((n) => n._id === props.npcId);
  if (!npc)
    return {
      rollName: '',
      subtitle: '',
      bonuses: [],
    };

  const bonuses: LabeledBonus[] = [];
  const bonusValue = store.getNpcSpellAttackBonus(props.npcId, props.spell.spellSourceId);
  const effectsTotal = bonusValue.value.modifiers.reduce((sum, mod) => sum + mod.value, 0);
  const baseModifier = bonusValue.value.final - effectsTotal;

  if (baseModifier !== 0) {
    bonuses.push({ label: t('titles.spell-attack-bonus'), value: baseModifier });
  }
  bonusValue.value.modifiers.forEach((mod) => {
    bonuses.push({ label: mod.name, value: mod.value });
  });

  return {
    rollName: props.spell.name,
    subtitle: t('rolls.attack-roll'),
    bonuses: bonuses,
    rollBonusKeys: [
      effectKeys['spell-attack-roll'],
      effectKeys['attack-roll'],
      effectKeys[`${props.spell.attackType}-spell-attack-roll`],
      effectKeys[`${props.spell.attackType}-attack-roll`],
    ],
    actionDieKeys: [
      effectKeys['spell-attack-action-die'],
      effectKeys['attack-action-die'],
      effectKeys[`${props.spell.attackType}-spell-attack-action-die`],
      effectKeys[`${props.spell.attackType}-attack-action-die`],
    ].filter(Boolean),
    critRange: store.getNpcSpellCritRange(props.npcId, props.spell).value.final,
    properties: getRollProperties(props.spell, t, saveDC.value.value.final),
    description: props.spell.description.default,
    effectsSource: npc.effects,
    sourceType: 'spell',
    characterName: npc.name,
  };
});

/**
 * A computed property that returns the associated effects as a JSON string.
 * - get: Finds the effect, strips its internal IDs, and returns it as a formatted JSON string.
 * - set: Parses the JSON string and updates the effect in the localNpc's effects array.
 * It creates the effect object on-demand when editing if it doesn't already exist.
 */
const effectsJson = computed({
  get() {
    const effect = props.localNpc.effects.find((e) => e._id === props.spell.effectId);
    if (!effect) return '{}';
    const cleanEffect = stripIds(JSON.parse(JSON.stringify(effect)));
    return JSON.stringify(cleanEffect, null, 2);
  },
  set(newJson) {
    if (!props.localNpc) return;
    let effectIndex = props.localNpc.effects.findIndex((e) => e._id === props.spell.effectId);

    // If the effect doesn't exist, create it on-demand before applying changes.
    if (effectIndex === -1) {
      const newEffect: Effect = {
        _id: props.spell.effectId,
        label: props.spell.name,
        description: '',
        enabled: false,
        toggleable: false,
        removable: false,
        effects: [],
      };
      props.localNpc.effects.push(newEffect);
      effectIndex = props.localNpc.effects.length - 1;
    }

    if (effectIndex > -1) {
      try {
        const parsedEffect = JSON.parse(newJson);
        const originalEffect = props.localNpc.effects[effectIndex];

        parsedEffect._id = originalEffect._id;
        (parsedEffect.effects || []).forEach((singleEffect: any, index: number) => {
          const originalSingle = originalEffect.effects?.[index];
          singleEffect._id = originalSingle?._id ?? uuidv4();
        });

        if (!parsedEffect.label) {
          parsedEffect.label = props.spell.name;
        }

        props.localNpc.effects[effectIndex] = parsedEffect;
      } catch (e) {
        /* ignore */
      }
    }
  },
});

const isInnate = computed(() => {
  const source = props.spellSources.find((s) => s._id === props.spell.spellSourceId);
  return source?.isInnate ?? false;
});
</script>

<style lang="scss" scoped>
.npc-spell-item__editor {
  border: 1px dashed #1e90ff;
  padding: 0.5rem;
  border-radius: 4px;
  margin-bottom: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.npc-spell-item__row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.npc-spell-item__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.5rem;
}
.npc-spell-item__input--name {
  font-weight: bold;
  width: 100%;
}
.npc-spell-item__remove-button {
  background-color: #ff4d4f;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  flex-shrink: 0;
}
.npc-spell-item__usage {
  font-style: italic;
  margin-left: 0.5rem;
}
.npc-spell-item__checkboxes {
  display: flex;
  gap: 1rem;
}
.npc-spell-item__checkboxes label {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.npc-spell-item__summary-grid {
  display: grid;
  grid-template-columns: 1fr min-content 50px 50px;
  gap: 0.5rem 1rem;
  align-items: center;
  width: 100%;
}

.npc-spell-item__name {
  justify-self: start;
  font-weight: bold;
}

.npc-spell-item__damage {
  justify-self: center;
}

.npc-spell-item__dc,
.npc-spell-item__attack-bonus {
  justify-self: end;
  font-weight: bold;
}
.toggable-group {
  padding: var(--size-gap-small);
  border-radius: 5px;
  box-sizing: border-box;
  border: 1px solid var(--color-tertiary);

  &__options {
    margin-top: var(--size-gap-small);
  }
}
.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  input {
    width: auto;
  }
}
.spell-item__chat-button {
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
