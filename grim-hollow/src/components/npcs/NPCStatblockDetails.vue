<template>
  <div class="npc-statblock__details">
    <EditableTextField :editMode="editMode" v-model="localNpc.shortDescription" :is-italic="true" />
    <LabeledTextField
      :editMode="editMode"
      :label="t('titles.armor-class')"
      v-model:primary="localNpc.armorClass"
      v-model:secondary="localNpc.acDescription"
      :displayValue="
        store.getNpcModifiedValue(npc._id, npc.armorClass, effectKeys['armor-class']).value.final
      "
      :is-numeric="true"
      min="0"
    />
    <LabeledTextField
      :editMode="editMode"
      :label="t('titles.hit-points')"
      v-model:primary="localNpc.hitPoints.max"
      v-model:secondary="localNpc.hitPoints.formula"
      :displayValue="
        store.getNpcModifiedValue(npc._id, npc.hitPoints.max, effectKeys['hit-points-max']).value
          .final
      "
      :is-numeric="true"
      min="0"
    />
    <LabeledTextField
      :editMode="editMode"
      :label="t('titles.speed')"
      v-model:primary="localNpc.speed"
      :displayValue="npc.speed"
    />
    <!-- Abilities Section -->
    <div class="npc-statblock__abilities">
      <div v-for="key in config.abilities" :key="key" class="npc-statblock__ability">
        <strong class="npc-statblock__ability-label">{{ t(`abbreviations.${key}`) }}</strong>
        <div v-if="!editMode" class="npc-statblock__ability-view">
          <span class="npc-statblock__ability-score">{{
            modifiedAbilities[key]?.score.value.final
          }}</span>
          <RollModifier
            class="npc-statblock__ability-modifier"
            :finalBonus="modifiedAbilities[key]?.bonus.value.final"
            :rollArgs="abilityCheckRollArgs(key)"
          />
        </div>
        <input v-else type="number" v-model.number="localNpc.abilities[key]" min="1" />
      </div>
    </div>
    <!-- Saving Throws Section -->
    <ProficiencySection
      :editMode="editMode"
      :title="t('titles.saving-throws')"
      :items="config.abilities.slice()"
      item-type="saving-throws"
      :base-values="localNpc.savingThrows"
      :modified-abilities="modifiedAbilities"
      :npc-id="npc._id"
      :visible-keys="savingThrowsWithBonuses"
      @update:base-value="(key, value) => (localNpc.savingThrows[key as AbilityKey] = value)"
    />
    <!-- Skills Section -->
    <ProficiencySection
      :editMode="editMode"
      :title="t('titles.skills')"
      :items="Object.keys(config.skills)"
      item-type="skills"
      :base-values="localNpc.skills"
      :modified-abilities="modifiedAbilities"
      :npc-id="npc._id"
      :visible-keys="skillsWithBonuses"
      @update:base-value="(key, value) => (localNpc.skills[key as keyof typeof config.skills] = value)"
    />
    <!-- Damage resistances, senses, etc -->
    <EditableTextarea
      v-if="npc.damageResistances || editMode"
      :editMode="editMode"
      v-model="localNpc.damageResistances"
      :label="t('titles.damage-resistances')"
    />
    <EditableTextarea
      v-if="npc.damageImmunities || editMode"
      :editMode="editMode"
      v-model="localNpc.damageImmunities"
      :label="t('titles.damage-immunities')"
    />
    <EditableTextarea
      v-if="npc.damageVulnerabilities || editMode"
      :editMode="editMode"
      v-model="localNpc.damageVulnerabilities"
      :label="t('titles.damage-vulnerabilities')"
    />
    <EditableTextarea
      v-if="npc.conditionImmunities || editMode"
      :editMode="editMode"
      v-model="localNpc.conditionImmunities"
      :label="t('titles.condition-immunities')"
    />
    <EditableTextarea
      v-if="npc.senses || editMode"
      :editMode="editMode"
      v-model="localNpc.senses"
      :label="t('titles.senses')"
    />
    <EditableTextarea
      v-if="npc.languages || editMode"
      :editMode="editMode"
      v-model="localNpc.languages"
      :label="t('titles.languages')"
    />
    <!-- Challenge Rating Section -->
    <div class="npc-statblock__challenge">
      <p v-if="!editMode">
        <strong>{{ t('titles.challenge') }}:</strong> {{ npc.challenge }}
      </p>
      <div v-else class="npc-statblock__edit-row">
        <strong>{{ t('titles.challenge') }}:</strong>
        <select
          :value="challengeRatingValue"
          @input="$emit('update:challengeRatingValue', ($event.target as HTMLSelectElement).value)"
          class="npc-statblock__full-width-input"
        >
          <option v-for="cr in challengeRatings" :key="cr" :value="cr">
            {{ cr }} ({{
              config.challengeRatingXP[cr as keyof typeof config.challengeRatingXP].toLocaleString()
            }} XP; PB +{{
              config.challengeRatingPB[cr as keyof typeof config.challengeRatingPB]
            }})
          </option>
        </select>
      </div>
    </div>
    <hr />

    <!-- Effects List Editor and Display -->
    <div v-if="editMode" class="npc-statblock__list-editor">
      <h4>{{ t('titles.effects') }}</h4>
      <textarea
        :value="newEffectJson"
        @input="$emit('update:newEffectJson', ($event.target as HTMLTextAreaElement).value)"
        rows="5"
      ></textarea>
      <div>
        <button type="button" @click="$emit('addEffect')">
          {{ t('actions.add') }} {{ t('titles.effects') }}
        </button>
      </div>
    </div>
    <NpcEffectsList
      :effects="npc.effects"
      :editMode="editMode" 
      @toggle-effect="$emit('toggleEffect', $event)"
      @remove-effect="$emit('removeEffect', $event)"
    />

    <!-- Features, Actions, and Spells Sections -->
    <div class="tabs" v-if="editMode">
      <button
        :class="{ active: activeTab === 'features' }"
        @click="activeTab = 'features'"
        type="button"
      >
        {{ t('titles.features') }}
      </button>
      <button
        :class="{ active: activeTab === 'actions' }"
        @click="activeTab = 'actions'"
        type="button"
      >
        {{ t('titles.actions') }}
      </button>
      <button
        :class="{ active: activeTab === 'spellcasting' }"
        @click="activeTab = 'spellcasting'"
        type="button"
      >
        {{ t('titles.spellcasting') }}
      </button>
    </div>
    <div class="tab-content" v-if="activeTab === 'features' || !editMode">
      <ListSection
        v-if="npc.features.length > 0 || editMode"
        :title="t('titles.features')"
        :items="localNpc.features"
        :editMode="editMode"
        @add="$emit('addFeature')"
      >
        <template #item="{ item, index }">
          <NpcFeatureItem
            :feature="item"
            :localNpc="localNpc"
            :editMode="editMode"
            @remove="$emit('removeFeature', index)"
          />
        </template>
      </ListSection>
    </div>
    <div class="tab-content" v-if="activeTab === 'actions' || !editMode">
      <ListSection
        v-if="displayActions.length > 0 || editMode"
        :title="t('titles.actions')"
        :items="displayActions"
        :editMode="editMode"
        @add="$emit('addAction', 'actions')"
      >
        <template #item="{ item, index }">
          <NpcActionItem
            :action="item"
            :npcId="npc._id"
            :editMode="editMode"
            @remove="$emit('removeAction', index, 'actions')"
          />
        </template>
      </ListSection>

      <DescribedListSection
        v-if="displayLegendaryActions.length > 0 || editMode"
        :title="t('titles.legendary-actions')"
        :items="displayLegendaryActions"
        v-model:description="localNpc.legendaryActions.description"
        :editMode="editMode"
        @add="$emit('addAction', 'legendary')"
      >
        <template #item="{ item, index }">
          <NpcActionItem
            :action="item"
            :npcId="npc._id"
            :editMode="editMode"
            @remove="$emit('removeAction', index, 'legendary')"
          />
        </template>
      </DescribedListSection>

      <DescribedListSection
        v-if="displayLairActions.length > 0 || editMode"
        :title="t('titles.lair-actions')"
        :items="displayLairActions"
        v-model:description="localNpc.lairActions.description"
        :editMode="editMode"
        @add="$emit('addAction', 'lair')"
      >
        <template #item="{ item, index }">
          <NpcActionItem
            :action="item"
            :npcId="npc._id"
            :editMode="editMode"
            @remove="$emit('removeAction', index, 'lair')"
          />
        </template>
      </DescribedListSection>
    </div>
    <div class="tab-content" v-if="activeTab === 'spellcasting' || !editMode">
      <div class="npc-statblock__section" v-if="npc.spellSources.length > 0 || editMode">
        <div class="npc-statblock__section-header">
          <h3>{{ t('titles.spellcasting') }}</h3>
          <button
            v-if="editMode"
            @click="$emit('addSpellSource')"
            type="button"
            class="npc-statblock__add-button"
          >
            {{ t('actions.add-spell-source') }}
          </button>
        </div>

        <div v-if="editMode" class="npc-statblock__sources-editor">
          <NpcSpellSourceItem
            v-for="(source, index) in localNpc.spellSources"
            :key="source._id"
            :source="source"
            @remove="$emit('removeSpellSource', index)"
          />
        </div>

        <!-- Spell Display Logic -->
        <div v-if="!editMode" class="source-list">
          <div
            v-for="source in npc.spellSources"
            :key="source._id"
            class="npc-statblock__source-block"
          >
            <div class="npc-statblock__source-details">
              <strong>{{ source.name }} ({{ t(`abbreviations.${source.ability}`) }}):</strong>
              <span
                >{{ t('titles.save-dc') }}:{{
                  store.getNpcSpellSaveDC(npc._id, source._id).value.final
                }}</span
              >
              <span>
                <span>{{ t('titles.attack-bonus') }}:</span>
                <RollModifier
                  :finalBonus="store.getNpcSpellAttackBonus(npc._id, source._id).value.final"
                  :rollArgs="spellAttackRollArgs(source._id)"
                />
              </span>
            </div>
            <!-- Innate Spells -->
            <div
              v-if="source.isInnate && groupedSpells[source._id]?.innate"
              class="npc-statblock__level-group"
            >
              <NpcSpellItem
                v-for="spell in groupedSpells[source._id]?.innate"
                :key="spell._id"
                :spell="spell"
                :localNpc="localNpc"
                :spellSources="localNpc.spellSources"
                :editMode="editMode"
                @remove="$emit('removeSpell', spell._id)"
                :npcId="npc._id"
              />
            </div>
            <!-- Slot Spells -->
            <div v-if="!source.isInnate">
              <div
                v-for="level in config.spellLevels"
                :key="level"
                class="npc-statblock__level-group"
              >
                <div
                  v-if="shouldShowGroup(source, level, groupedSpells[source._id]?.[level] || [])"
                >
                  <div class="npc-statblock__level-header">
                    <h4>{{ t(`titles.spell-levels.${level}`) }}</h4>
                    <div v-if="level > 0" class="npc-statblock__slots-tracker">
                      ({{ t('titles.slots') }}:
                      <input
                        type="number"
                        :value="source.spellSlotsUsed[level] || 0"
                        min="0"
                        :placeholder="$t('titles.used')"
                      />
                      /
                      <input
                        type="number"
                        :value="source.spellSlots[level] || 0"
                        min="0"
                        :placeholder="$t('titles.total')"
                      />
                      )
                    </div>
                  </div>
                  <NpcSpellItem
                    v-for="spell in groupedSpells[source._id]?.[level.toString()]"
                    :key="spell._id"
                    :spell="spell"
                    :spellSources="localNpc.spellSources"
                    :editMode="editMode"
                    :localNpc="localNpc"
                    :npcId="npc._id"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- Spell Editor -->
        <div v-else class="npc-statblock__spells-editor">
          <NpcSpellItem
            v-for="spell in localNpc.spells"
            :key="spell._id"
            :spell="spell"
            :spellSources="localNpc.spellSources"
            :editMode="editMode"
            :localNpc="localNpc"
            @remove="$emit('removeSpell', spell._id)"
            :npcId="npc._id"
          />
        </div>

        <button
          v-if="editMode && localNpc.spellSources.length > 0"
          @click="$emit('addSpell')"
          type="button"
          class="npc-statblock__add-button"
        >
          {{ t('actions.add-spell') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, type PropType } from 'vue';
import { useI18n } from 'vue-i18n';
import {
  useNpcStore,
  type Npc,
  type NpcSpell,
  type NpcSpellSource,
} from '@/sheet/stores/npc/npcStore';
import { config } from '@/config';
import { effectKeys } from '@/effects.config';
import type { LabeledBonus } from '@/utility/roll';

import RollModifier from '@/components/shared/RollModifier.vue';
import NpcEffectsList from '@/components/npcs/NpcEffectsList.vue';
import NpcFeatureItem from '@/components/npcs/NpcFeatureItem.vue';
import NpcActionItem from '@/components/npcs/NpcActionItem.vue';
import NpcSpellSourceItem from './NpcSpellSourceItem.vue';
import NpcSpellItem from './NpcSpellItem.vue';
import EditableTextField from '@/components/npcs/shared/EditableTextField.vue';
import EditableTextarea from '@/components/npcs/shared/EditableTextArea.vue';
import LabeledTextField from '@/components/npcs/shared/LabeledTextField.vue';
import ProficiencySection from '@/components/npcs/ProficiencySection.vue';
import ListSection from '@/components/npcs/shared/ListSection.vue';
import DescribedListSection from '@/components/npcs/shared/DescribedListSection.vue';
import { type AbilityKey } from '@/sheet/stores/abilities/abilitiesStore';
import type { ModifierBreakdown } from '@/sheet/stores/modifiers/modifiersStore';
import CurrentMaxNumber from '@/components/shared/CurrentMaxNumber.vue';
import { jsonClone } from '@/utility/jsonTools';

const props = defineProps({
  npc: { type: Object as PropType<Npc>, required: true },
  localNpc: { type: Object as PropType<Npc>, required: true },
  editMode: { type: Boolean, required: true },
  modifiedAbilities: { type: Object, required: true },
  savingThrowsWithBonuses: { type: Array as PropType<string[]>, required: true },
  skillsWithBonuses: { type: Array as PropType<string[]>, required: true },
  challengeRatings: { type: Array as PropType<string[]>, required: true },
  challengeRatingValue: { type: String, required: true },
  newEffectJson: { type: String, required: true },
});

const emit = defineEmits([
  'update:challengeRatingValue',
  'update:newEffectJson',
  'addEffect',
  'toggleEffect',
  'removeEffect',
  'addFeature',
  'removeFeature',
  'addAction',
  'removeAction',
  'addSpellSource',
  'removeSpellSource',
  'addSpell',
  'removeSpell',
  'save-npc',
  'update-spell-slots-used',
]);

const store = useNpcStore();
const { t } = useI18n();

type ActiveTab = 'features' | 'actions' | 'spellcasting';
const activeTab = ref<ActiveTab>('features');

const effectActions = computed(() => {
  if (props.localNpc.effects) {
    props.localNpc.effects.forEach(e => e.enabled);
  }
  return store.getNpcActionsFromEffects(props.localNpc);
});
const displayActions = computed(() => {
  const base = props.localNpc.actions;
  const added = effectActions.value.filter(
    (a) =>
      !a.group ||
      a.group === 'actions' ||
      a.group === 'bonus-actions' ||
      a.group === 'reactions' ||
      a.group === 'free-actions',
  );
  return [...base, ...added];
});

const displayLegendaryActions = computed(() => {
  const base = props.localNpc.legendaryActions.actions;
  const added = effectActions.value.filter((a) => a.group === 'legendary');
  return [...base, ...added];
});

const displayLairActions = computed(() => {
  const base = props.localNpc.lairActions.actions;
  const added = effectActions.value.filter((a) => a.group === 'lair');
  return [...base, ...added];
});

// Grouping spells per source
const groupedSpells = computed(() => {
  const groups: Record<string, Record<string, NpcSpell[]>> = {};

  const addToGroup = (sourceId: string, levelKey: string, spell: NpcSpell) => {
    if (!groups[sourceId]) groups[sourceId] = {};
    if (!groups[sourceId][levelKey]) groups[sourceId][levelKey] = [];
    groups[sourceId][levelKey].push(spell);
  };

  for (const spell of props.localNpc.spells) {
    if (!spell.spellSourceId) continue;
    const source = props.localNpc.spellSources.find((s) => s._id === spell.spellSourceId);
    if (!source) continue;

    const groupKey = source.isInnate ? 'innate' : spell.level.toString();
    addToGroup(source._id, groupKey, spell);

    if (!source.isInnate && spell.level > 0 && spell.upcast && spell.upcast.length > 0) {
      console.log('Processing upcasts for spell:', spell.name);
      spell.upcast.forEach((upcastMod, index) => {
        const targetLevel = upcastMod.level;

        // Only add upcast variant if the source has slots for this level
        if (source.spellSlots && source.spellSlots[targetLevel] > 0) {
          let mergedDamage = jsonClone(spell.damage);
          if (Array.isArray(spell.damage) && Array.isArray(upcastMod.damage)) {
            mergedDamage = spell.damage.map((base, idx) =>
              upcastMod.damage && upcastMod.damage[idx]
                ? { ...base, ...upcastMod.damage[idx] }
                : base,
            );
          }

          const upcastedSpell: NpcSpell = {
            ...spell,
            ...upcastMod,
            damage: mergedDamage,
            description: spell.description,
            _id: `${spell._id}-upcast-${index}`,
            level: targetLevel,
          };

          addToGroup(source._id, targetLevel.toString(), upcastedSpell);
        }
      });
    }
  }

  // Sort spells by name within each group
  for (const sourceId in groups) {
    for (const level in groups[sourceId]) {
      groups[sourceId][level].sort((a, b) => a.name.localeCompare(b.name));
    }
  }

  return groups;
});

function updateUsedSlots(sourceId: string, level: number, value: number) {
  emit('update-spell-slots-used', { sourceId, level, value });
}

const abilityCheckRollArgs = (abilityKey: AbilityKey) => {
  const npc = props.npc;
  if (!npc) return { rollName: '', subtitle: '', bonuses: [] };

  const bonusValue = props.modifiedAbilities[abilityKey].bonus.value;
  const bonuses: LabeledBonus[] = [];
  const effectsTotal = bonusValue.modifiers.reduce(
    (sum: number, mod: ModifierBreakdown) => sum + mod.value,
    0,
  );
  const baseModifier = bonusValue.final - effectsTotal;

  if (baseModifier !== 0) {
    bonuses.push({ label: t(`titles.abilities.${abilityKey}`), value: baseModifier });
  }
  bonusValue.modifiers.forEach((mod: ModifierBreakdown) => {
    bonuses.push({ label: mod.name, value: mod.value });
  });

  const rollBonusKeys = [effectKeys[`${abilityKey}-check-roll`], effectKeys['check-roll']].filter(
    Boolean,
  );

  const actionDieKeys = [
    effectKeys[`${abilityKey}-check-action-die`],
    effectKeys['check-action-die'],
  ].filter(Boolean);

  return {
    rollName: t(`titles.abilities.${abilityKey}`),
    subtitle: t('rolls.ability-check'),
    bonuses,
    rollBonusKeys,
    actionDieKeys,
    critRange: 20,
    effectsSource: npc.effects,
    characterName: npc.name,
  };
};

const spellAttackRollArgs = (sourceId: string) => {
  const source = props.npc?.spellSources.find((s) => s._id === sourceId);
  if (!props.npc || !source) return { rollName: '', subtitle: '', bonuses: [] };
  const bonusValue = store.getNpcSpellAttackBonus(props.npc._id, sourceId).value;
  const effectsTotal = bonusValue.modifiers.reduce(
    (sum: number, mod: ModifierBreakdown) => sum + mod.value,
    0,
  );
  const baseModifier = bonusValue.final - effectsTotal;
  const bonuses: LabeledBonus[] = [];
  if (baseModifier !== 0) {
    bonuses.push({ label: t('titles.spell-attack-bonus'), value: baseModifier });
  }
  bonusValue.modifiers.forEach((mod: ModifierBreakdown) => {
    bonuses.push({ label: mod.name, value: mod.value });
  });

  return {
    rollName: t('rolls.attack-roll'),
    subtitle: `${source.name}`,
    bonuses,
    rollBonusKeys: [effectKeys['spell-attack-roll'], effectKeys['attack-roll']],
    actionDieKeys: [effectKeys['spell-attack-action-die'], effectKeys['attack-action-die']],
    critRange: 20,
    effectsSource: props.npc.effects,
    characterName: props.npc.name,
  };
};

const shouldShowGroup = (source: NpcSpellSource, level: number, spellsInLevel: NpcSpell[]) => {
  if (props.editMode) return true;
  if (level === 0) return spellsInLevel.length > 0;
  if (source.isInnate) return spellsInLevel.length > 0;
  return (source.spellSlots as Record<string, number>)[level] > 0 || spellsInLevel.length > 0;
};
</script>

<style lang="scss" scoped>
.npc-statblock__details {
  p {
    margin: 0.5rem 0;
  }
}

.npc-statblock__abilities {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 0.5rem;
  text-align: center;
  margin: 1rem 0;
}

.npc-statblock__ability {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  &__label {
    font-weight: bold;
  }
  &__view {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
  }
  &__score {
    font-size: 1.25rem;
  }
}

.npc-statblock__edit-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  input {
    flex-grow: 1;
  }
}

.npc-statblock__full-width-input {
  width: 100%;
  box-sizing: border-box;
  padding: 0.25rem;
}

.npc-statblock__list-editor {
  margin: 1rem 0;
  border: 1px dashed var(--color-tertiary-container);
  padding: 0.5rem;
  border-radius: var(--size-border-radius-medium);
}

.npc-statblock__section {
  margin-top: 1rem;
}

.npc-statblock__section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  //margin-bottom: 0.5rem;
  h3 {
    margin: 0;
  }
}

.npc-statblock__add-button {
  border: 1px solid var(--color-tertiary-container);
  background-color: var(--color-background-secondary);
  cursor: pointer;
  border-radius: var(--size-border-radius-small);
}

.npc-statblock__sources-editor,
.npc-statblock__spells-editor {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.npc-statblock__source-block {
}

.npc-statblock__source-details {
  display: flex;
  gap: 1rem;
  background: var(--color-background-secondary);
  border-radius: var(--size-border-radius-medium);
  flex-wrap: wrap;
}

.npc-statblock__level-group {
  margin-top: 0.5rem;
}

.npc-statblock__level-header {
  display: flex;
  align-items: center;
  border-bottom: 1px solid var(--color-tertiary-container);
  padding: 0.25rem 0;
  gap: 5px;
  h4 {
    margin: 0;
  }

  .npc-statblock__slots-tracker {
    display: flex;
    align-items: center;
    gap: 3px;
    input {
      width: 30px;
      border-width: 0 0 1px 0;
      padding: 0;
      text-align: center;
      font-size: 10px;
    }
  }
}
.source-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.tabs {
  margin-top: 2rem;
  display: flex;
  gap: 0.5rem;
  position: relative;
  margin-bottom: -10px;
  button {
    border-width: 1px 1px 0 1px;
    border-style: solid;
    border-radius: 5px 5px 0 0;
    border-color: #690000;
    background: white;
    color: #690000;
    font-weight: bold;
    position: relative;
    z-index: 2;
    padding: 5px 10px;
    &.active {
      background: #690000;
      color: white;
    }
  }
  &:after {
    content: '';
    background: #690000;
    position: absolute;
    height: 1px;
    width: 100%;
    left: 0;
    bottom: 0;
  }
}
</style>
