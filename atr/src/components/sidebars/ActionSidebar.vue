<template>
  <div class="view-container">
    <form ref="form" @submit.prevent="save">
      <div class="columns columns-4">
        <label class="span-2">
          {{ $t('titles.name') }} *
          <input type="text" v-model="name" required />
        </label>

        <label class="span-2">
          {{ $t('titles.group') }}
          <select v-model="group" required>
            <option value="actions">{{ $t('titles.action-groups.actions') }}</option>
            <option value="bonus-actions">{{ $t('titles.action-groups.bonus-actions') }}</option>
            <option value="reactions">{{ $t('titles.action-groups.reactions') }}</option>
            <option value="free-actions">{{ $t('titles.action-groups.free-actions') }}</option>
          </select>
        </label>

        <div class="toggable-group">
          <label class="checkbox-label">
            <input type="checkbox" v-model="isAttack" />
            <strong>{{ $t('titles.is-attack') }}</strong>
          </label>

          <div v-if="isAttack" class="toggable-group__options columns columns-3">
            <label class="span-1">
              {{ $t('titles.source-type') }}
              <select v-model="sourceType">
                <option value="weapon">{{ $t('titles.source-types.weapon') }}</option>
                <option value="spell">{{ $t('titles.source-types.spell') }}</option>
              </select>
            </label>

            <label class="span-1">
              {{ $t('titles.attack-type') }}
              <select v-model="attackType">
                <option value="melee">{{ $t('titles.attack-types.melee') }}</option>
                <option value="ranged">{{ $t('titles.attack-types.ranged') }}</option>
              </select>
            </label>

            <label class="span-1">
              {{ $t('titles.attack-ability') }}
              <select v-model="attackAbility">
                <option value="none">{{ $t('titles.none') }}</option>
                <option v-for="ability in config.abilities" :key="ability" :value="ability">
                  {{ $t(`titles.abilities.${ability}`) }}
                </option>
              </select>
            </label>

            <label class="span-1">
              {{ $t('titles.attack-bonus') }}
              <input type="text" v-model="attackBonus" />
            </label>

            <label class="span-1">
              {{ $t('titles.proficiency') }}
              <select v-model.number="attackProficiency">
                <option
                  v-for="(value, levelKey) in proficiencyLevels"
                  :key="levelKey"
                  :value="proficiencyLevels[levelKey]"
                >
                  {{ $t(`titles.proficiency-levels.${levelKey}`) }}
                </option>
              </select>
            </label>

            <label class="span-1">
              {{ $t('titles.crit-range') }}
              <input type="number" v-model.number="critRange" min="1" max="20" />
            </label>
          </div>
        </div>

        <DamageType :damage="damage" :showCrit="isAttack" />

        <label class="span-2">
          {{ $t('titles.saving-throw') }}
          <select v-model="saving">
            <option value="none">{{ $t('titles.none') }}</option>
            <option v-for="ability in config.abilities" :key="ability" :value="ability">
              {{ $t(`titles.abilities.${ability}`) }}
            </option>
          </select>
        </label>

        <label class="span-2">
          {{ $t('titles.save-dc') }}
          <input type="text" v-model="savingDc" :disabled="saving === 'none'" />
        </label>

        <label class="span-2">
          {{ $t('titles.range') }}
          <input type="text" v-model="range" />
        </label>

        <label class="span-2">
          {{ $t('titles.target') }}
          <input type="text" v-model="target" />
        </label>

        <label>
          {{ $t('titles.description') }}
          <textarea v-model="description" rows="4" />
        </label>

        <TagsInput
          :tagId="tagId"
          @update="updateTags"
          label="titles.props-mods"
          tagSource="action"
        />
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useSidebar } from '../sidebars/useSidebar';
import { useActionsStore, type Action } from '@/sheet/stores/actions/actionsStore';
import { v4 as uuidv4 } from 'uuid';
import { config } from '@/config';
import { proficiencyLevels } from '@/sheet/stores/proficiencies/proficienciesStore';
import { useTagsStore, type Tag } from '@/sheet/stores/tags/tagsStore';
import TagsInput from '../shared/ItemTagsInput.vue';
import { jsonClone } from '@/utility/jsonTools';
import DamageType from '../shared/DamageType.vue';
const form = ref<HTMLFormElement | null>(null);

const props = defineProps<{
  action: (Partial<Action> & { sourceEffectId?: string }) | null;
}>();

const actionCopy = ref(jsonClone(props.action || null));

const store = useActionsStore();
const _id = actionCopy.value?._id ?? uuidv4();

const name = ref(actionCopy.value?.name ?? '');
const group = ref<Action['group']>(actionCopy.value?.group ?? 'actions');

const isAttack = ref(actionCopy.value?.isAttack ?? false);
const attackType = ref<Action['attackType']>(actionCopy.value?.attackType ?? 'melee');
const sourceType = ref<Action['sourceType']>(actionCopy.value?.sourceType ?? 'weapon');
const critRange = ref(actionCopy.value?.critRange ?? 20);
const attackAbility = ref(actionCopy.value?.attackAbility ?? 'none');
const attackBonus = ref(actionCopy.value?.attackBonus ?? '0');
const attackProficiency = ref<Action['attackProficiency']>(
  actionCopy.value?.attackProficiency ?? 1,
);
const damage = ref(actionCopy.value?.damage ?? []);
const saving = ref(actionCopy.value?.saving ?? 'none');
const savingDc = ref(actionCopy.value?.savingDc ?? '0');
const range = ref(actionCopy.value?.range ?? '');
const target = ref(actionCopy.value?.target ?? '');
const ammo = ref(actionCopy.value?.ammo ?? 0);
const description = ref(actionCopy?.value?.description ?? '');

const tagsStore = useTagsStore();
const tagId = actionCopy.value?.tagId ?? uuidv4();
const initialTagGroup = tagsStore.getExistingOrCreate(tagId, 'action');
const currentTags = ref<Tag[]>(JSON.parse(JSON.stringify(initialTagGroup.tags)));

const updateTags = (tags: Tag[]) => {
  currentTags.value = tags;
};

const save = () => {
  if (form.value && !form.value.reportValidity()) return;

  const actionPatch: Partial<Action> = {
    _id,
    name: name.value.trim(),
    group: group.value,
    attackAbility: attackAbility.value,
    attackBonus: attackBonus.value,
    attackProficiency: attackProficiency.value,
    isAttack: isAttack.value,
    attackType: attackType.value,
    sourceType: sourceType.value,
    critRange: critRange.value,
    damage: damage.value,
    saving: saving.value,
    savingDc: savingDc.value,
    range: range.value,
    target: target.value,
    ammo: ammo.value,
    description: description.value,
    tagId: tagId,
  };

  if (props.action?.sourceEffectId) {
    (actionPatch as any).sourceEffectId = props.action.sourceEffectId;
  }

  store.update(actionPatch);
  tagsStore.update({ _id: tagId, tags: currentTags.value });

  useSidebar().close();
};

watch(saving, (newValue) => {
  if (newValue === 'none') {
    savingDc.value = '0';
  }
});

const remove = () => {
  if (actionCopy.value?._id) {
    store.remove(props.action as Action);
    if (actionCopy.value.tagId) {
      tagsStore.remove(actionCopy.value.tagId);
    }
  }
  useSidebar().close();
};
defineExpose({
  save,
  remove,
});
</script>

<style lang="scss" scoped>
.view-container {
}
form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  input {
    width: auto;
  }
}
</style>
