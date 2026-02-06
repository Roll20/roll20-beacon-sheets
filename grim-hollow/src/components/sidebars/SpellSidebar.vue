<template>
  <div class="view-container" v-if="hasSources">
    <form ref="form" @submit.prevent="save">
      <div class="columns columns-12">
        <label class="span-6">
          {{ $t('titles.name') }} *
          <input v-model="name" required />
        </label>
        <label class="span-3">
          {{ $t('titles.level') }} *
          <select v-model.number="level" required>
            <option v-for="lvl in spellLevels" :key="lvl" :value="lvl">
              {{ $t(`titles.spell-levels.${lvl}`) }}
            </option>
          </select>
        </label>
        <label class="span-3">
          {{ $t('titles.school') }} *
          <select v-model="school" required>
            <option v-for="s in spellSchools" :key="s" :value="s">
              {{ $t(`titles.spell-schools.${s}`) }}
            </option>
          </select>
        </label>
        <label class="span-4">
          {{ $t('titles.casting-time') }}
          <input v-model="castingTime" />
          <div class="detail-check" v-tooltip="$t('titles.ritual')">
            <span>R</span>
            <input type="checkbox" v-model="ritual" />
          </div>
        </label>
        <label class="span-4">
          {{ $t('titles.duration') }}
          <input v-model="duration" />
          <div class="detail-check" v-tooltip="$t('titles.concentration')">
            <span>C</span>
            <input type="checkbox" v-model="concentration" />
          </div>
        </label>
        <label class="span-4">
          {{ $t('titles.range') }}
          <input v-model="range" />
        </label>
        <div class="span-12 components">
          <div class="span-1">
            {{ $t('titles.components') }}
            <div class="components__checkboxes">
              <label v-for="c in spellComponents" :key="c" class="span-1">
                <input type="checkbox" :value="c" v-model="components" />
                <span v-tooltip="$t(`titles.spell-components.${c}`)">{{
                  $t(`abbreviations.spell-components.${c}`)
                }}</span>
              </label>
            </div>
          </div>
          <label class="components__optional">
            {{ $t('titles.material-optional') }}
            <input v-model="material" :disabled="!hasOptionalMaterial" />
          </label>
        </div>
        <div class="toggable-group">
          <label class="checkbox-label">
            <input type="checkbox" v-model="isAttack" />
            <strong>{{ $t('titles.is-attack') }}</strong>
          </label>
          <div v-if="isAttack" class="toggable-group__options columns columns-3">
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
                <option value="spellcasting">{{ $t('titles.spellcasting') }}</option>
                <option v-for="ability in config.abilities" :key="ability" :value="ability">
                  {{ $t(`titles.abilities.${ability}`) }}
                </option>
              </select>
            </label>
            <label class="span-1">
              {{ $t('titles.crit-range') }}
              <input type="number" v-model.number="critRange" min="1" max="20" />
            </label>
          </div>
        </div>
        <label class="span-6">
          {{ $t('titles.saving-throw') }}
          <select v-model="saving">
            <option value="none">{{ $t('titles.none') }}</option>
            <option v-for="ability in config.abilities" :key="ability" :value="ability">
              {{ $t(`titles.abilities.${ability}`) }}
            </option>
          </select>
        </label>
        <label class="span-6">
          {{ $t('titles.source') }}
          <select v-model="spellSourceId" required>
            <option v-for="source in spellsStore.sources" :key="source._id" :value="source._id">
              {{ source.name }}
            </option>
          </select>
        </label>
        <DamageType :damage="damage" :showCrit="isAttack" />
        <label>
          {{ $t('titles.description') }}
          <textarea v-model="description" rows="3" />
        </label>
        <label>
          {{ $t('titles.upcast-description') }}
          <textarea v-model="upcastDescription" rows="2" />
        </label>
        <TagsInput :tagId="tagId" @update="updateTags" label="titles.tags" />
        <label class="effects-editor">
          {{ $t('titles.effects') }}
          <textarea v-model="effects" />
        </label>
      </div>
    </form>
  </div>
  <div class="view-container" v-else>
    <p>{{ $t('warnings.no-spell-sources') }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useSidebar } from '../sidebars/useSidebar';
import { useSpellsStore } from '@/sheet/stores/spells/spellsStore';
import { useTagsStore, type Tag } from '@/sheet/stores/tags/tagsStore';
import { useEffectsStore, type Effect } from '@/sheet/stores/modifiers/modifiersStore';
import TagsInput from '../shared/ItemTagsInput.vue';
import { v4 as uuidv4 } from 'uuid';
import { config } from '@/config';
import type { Spell } from '@/sheet/stores/spells/spellsStore';
import DamageType from '../shared/DamageType.vue';
import { jsonClone, stripIds } from '@/utility/jsonTools';
import { watch } from 'vue';
const form = ref<HTMLFormElement | null>(null);

const props = defineProps<{
  spell: (Partial<Spell> & { sourceEffectId?: string }) | null;
}>();

const spellCopy = ref(jsonClone(props.spell || null));

const effectsStore = useEffectsStore();
const spellsStore = useSpellsStore();

const spellId = spellCopy.value?._id ?? uuidv4();
const effectId = spellCopy.value?.effectId ?? uuidv4();
const tagId = spellCopy.value?.tagId ?? uuidv4();

const name = ref(spellCopy.value?.name ?? '');
const level = ref(spellCopy.value?.level ?? 0);
const school = ref(spellCopy.value?.school ?? config.spellSchools[0]);
const castingTime = ref(spellCopy.value?.castingTime ?? '');
const range = ref(spellCopy.value?.range ?? '');
const target = ref(spellCopy.value?.target ?? '');
const components = ref(spellCopy.value?.components ?? []);
const material = ref(spellCopy.value?.material ?? '');
const duration = ref(spellCopy.value?.duration ?? '');
const concentration = ref(spellCopy.value?.concentration ?? false);
const ritual = ref(spellCopy.value?.ritual ?? false);
const isAttack = ref(spellCopy.value?.isAttack ?? false);
const attackType = ref(spellCopy.value?.attackType ?? 'ranged');
const attackAbility = ref(spellCopy.value?.attackAbility ?? 'none');
const critRange = ref(spellCopy.value?.critRange ?? 20);
const saving = ref(spellCopy.value?.saving ?? 'none');
const damage = ref(spellCopy.value?.damage ?? []);
const description = ref(spellCopy.value?.description?.default ?? '');
const upcastDescription = ref(spellCopy.value?.description?.upcast ?? '');
const upcast = ref(spellCopy.value?.upcast ?? []);
const spellSourceId = ref(spellCopy.value?.spellSourceId ?? spellsStore.sources[0]?._id ?? '');

const spellLevels = config.spellLevels;
const spellSchools = config.spellSchools;
const spellComponents = config.spellComponents;

const tagsStore = useTagsStore();
const currentTags = ref<Tag[]>(
  JSON.parse(JSON.stringify(tagsStore.getExistingOrCreate(tagId).tags)),
);

const hasOptionalMaterial = ref(false);
watch(
  () => components.value,
  (newComponents) => {
    hasOptionalMaterial.value = components.value.includes('material');
    if (!hasOptionalMaterial.value) {
      material.value = '';
    }
  },
);

const updateTags = (tags: Tag[]) => {
  currentTags.value = tags;
};

const hasSources = computed(() => spellsStore.sources.length > 0);

const effect = computed(() => useEffectsStore().getExistingOrCreate({ _id: effectId }));
let initialEffects = JSON.stringify(
  stripIds(useEffectsStore().getEmptyEffect({ _id: effectId })),
  null,
  2,
);
if (spellCopy.value?.effectId) {
  const existing = effectsStore.effects.find(
    (e) => spellCopy.value && e._id === spellCopy.value.effectId,
  );
  if (existing) {
    try {
      initialEffects = JSON.stringify(stripIds(existing), null, 2);
    } catch {
      initialEffects = JSON.stringify(
        stripIds(useEffectsStore().getEmptyEffect({ _id: effectId })),
        null,
        2,
      );
    }
  }
}
const effects = ref(initialEffects);

const isNew = computed(() => !spellCopy.value?._id);

const save = () => {
  if (form.value && !form.value.reportValidity()) return;

  const spellPatch: Partial<Spell> & { sourceEffectId?: string } = {
    _id: spellId,
    name: name.value.trim(),
    level: level.value,
    school: school.value,
    castingTime: castingTime.value,
    range: range.value,
    target: target.value,
    components: components.value,
    material: material.value || undefined,
    duration: duration.value,
    concentration: concentration.value,
    ritual: ritual.value,
    isAttack: isAttack.value,
    attackType: attackType.value,
    attackAbility: attackAbility.value,
    critRange: critRange.value,
    saving: saving.value,
    damage: damage.value,
    description: {
      default: description.value.trim(),
      upcast: upcastDescription.value?.trim() || undefined,
    },
    upcast: upcast.value,
    spellSourceId: spellSourceId.value,
    effectId,
    tagId,
  };

  if (props.spell?.sourceEffectId) {
    spellPatch.sourceEffectId = props.spell.sourceEffectId;
  }

  spellsStore.updateSpell(spellPatch);

  try {
    const parsedEffects: Partial<Effect> = JSON.parse(effects.value);
    parsedEffects._id = effectId;
    effectsStore.update(parsedEffects);
  } catch {
    effectsStore.update({ _id: effectId });
  }

  tagsStore.update({ _id: tagId, tags: currentTags.value });

  useSidebar().close();
};

const remove = () => {
  if (props.spell) {
    spellsStore.removeSpell(props.spell as Spell);
  }
  useSidebar().close();
};

defineExpose({
  save,
  remove,
});
</script>

<style lang="scss" scoped>
.components {
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: var(--size-gap-medium);
  &__checkboxes {
    display: flex;
    gap: var(--size-gap-medium);
    height: calc(calc(var(--size-font-medium) * 1.3) + 1rem);
    align-items: center;
    margin-top: var(--size-gap-xsmall);
    input {
      margin-right: 3px;
    }
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
label:has(.detail-check) {
  position: relative;
  display: block !important;
  > input {
    margin-top: var(--size-gap-xsmall) !important;
  }
}
.detail-check {
  position: absolute;
  bottom: 5px;
  right: 5px;
  width: 1.5rem;
  height: 1.5rem;
  font-size: var(--size-font-small);
  font-weight: var(--weight-bold);
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgb(226, 226, 226);
  color: rgb(50,50,50);
  border: 1px solid rgb(226, 226, 226);
  border-radius: 3px;
  font-family: var(--font-family-title);
  text-transform: uppercase;
  font-weight: normal;
  input {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    opacity: 0;
    cursor: pointer;
  }
  &:has(input:checked) {
    color: var(--color-ability-box);
    border: 1px solid red;
  }
}
</style>
