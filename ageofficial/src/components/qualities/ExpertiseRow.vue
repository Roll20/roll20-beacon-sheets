<template>
  <div class="accordion-item age-expertise-row">
    <div class="accordion-header attack attack__row age-qualities-accordion-header">
      <div style="display: flex;position: relative;">
        <div class="age-quality-section age-quality-focus-icon"></div>
      </div>
      <div class="label">
        <div>
          {{ focusName }}<span v-if="expertise.field">: {{ expertise.field }}</span><br />
        </div>
        <span v-if="focus.ability">({{ focus.ability }})</span>
        <span class="age-expertise-tag">Expertise</span>
      </div>

      <div class="age-weapon-range-reload">
        <div style="display: grid;align-items: center;height: 100%;">
          <button
            class="age-btn"
            v-tippy="{ content: `${focusName}${expertise.field ? ' : ' + expertise.field : ''} Expertise` }"
            @click="rollExpertise()"
          >
            +{{ total }}
            <font-awesome-icon :icon="['fa', 'dice']" style="margin-left:3px;" />
          </button>
        </div>
      </div>
      <div class="age-weapon-btn-container">
        <button
          v-if="hasReroll"
          class="age-btn age-icon-btn"
          v-tippy="{ content: 'Expert: reroll a failed test (keep the second result)' }"
          @click="rollExpertise()"
        >
          <font-awesome-icon :icon="['fa', 'rotate']" />
        </button>
      </div>

      <button type="button" class="config-btn age-icon-btn" @click="handlePrint" v-tippy="{ content: 'Share Expertise in chat' }">
        <font-awesome-icon :icon="['fa', 'comment']" />
      </button>
      <div style="display: grid;align-items: center;grid-template-columns: 1fr;height: 100%;">
        <button type="button" class="config-btn age-icon-btn" @click="showModal = true" v-tippy="{ content: 'Edit Talent' }">
          <font-awesome-icon :icon="['fa', 'gear']" />
        </button>
      </div>
    </div>
  </div>

  <Teleport to="body">
    <QualitiesModal
      v-if="parentTalent"
      :show="showModal"
      :feature="parentTalent"
      :index="0"
      @close="showModal = false"
      @delete="handleDelete"
    >
      <template #header>
        <h3 class="age-modal-details-header">Talent Details</h3>
      </template>
    </QualitiesModal>
  </Teleport>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useAbilityScoreStore } from '@/sheet/stores/abilityScores/abilityScoresStore';
import { useModifiersStore } from '@/sheet/stores/modifiers/modifiersStore';
import { useItemStore } from '@/sheet/stores/character/characterQualitiesStore';
import QualitiesModal from './QualitiesModal.vue';

const props = defineProps({
  // The Ability-Bonus modifier that defines this expertise.
  expertise: { type: Object, required: true },
  // The parent Ability Focus item this expertise refines.
  focus: { type: Object, required: true },
});

const { rollAbilityCheck } = useAbilityScoreStore();
const showModal = ref(false);

// Custom focuses store name === 'custom' with the real name in customName.
const focusName = computed(() => (props.focus.name === 'custom' ? props.focus.customName : props.focus.name));

// The Talent this expertise modifier belongs to (its edit gear opens this Talent).
const parentTalent = computed(() => useItemStore().getItem(props.expertise.parentId));

// Focus bonus from the underlying focus (+4 double focus, +2 focus, else 0).
const focusBonus = (f) => (f.doubleFocus ? 4 : f.focus ? 2 : 0);
const expertiseBonus = computed(() => Number(props.expertise.bonus) || 0);

const total = computed(() =>
  Number(useAbilityScoreStore().abilityScores[props.focus.ability]?.base || 0)
  + focusBonus(props.focus)
  + expertiseBonus.value,
);

// Expert tier: a sibling Reroll modifier on the same focus enables the reroll affordance.
const hasReroll = computed(() =>
  useModifiersStore().modifiers.some((m) =>
    m.enabled !== false
    && m.modifiedOption === 'Reroll'
    && m.abilityFocus === focusName.value
    && m.modifiedValue === props.focus.ability,
  ),
);

const rollExpertise = () => {
  const label = `${focusName.value}${props.expertise.field ? ': ' + props.expertise.field : ''}`;
  rollAbilityCheck(
    props.focus.ability,
    true,
    focusBonus(props.focus) + expertiseBonus.value,
    { name: label },
  );
};

const handlePrint = () => {
  if (props.expertise.parentId) useItemStore().printQuality(props.expertise.parentId);
};

const handleDelete = () => {
  showModal.value = false;
  if (props.expertise.parentId) useItemStore().removeItem(props.expertise.parentId);
};
</script>

<style scoped>
.age-expertise-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 16px;
  padding: 0 8px;
  margin: 0 0 2px 6px;
  font-size: 10px;
  font-weight: 600;
  line-height: 1;
  letter-spacing: 0.06em;
  /* compensate the trailing letter-spacing so the glyphs read horizontally centered */
  text-indent: 0.06em;
  text-transform: uppercase;
  color: #fff;
  background: var(--theme-primary, #1e4e7a);
  border-radius: 999px;
  vertical-align: middle;
}
.age-expertise-row .label > div {
  font-weight: 600;
}
</style>
