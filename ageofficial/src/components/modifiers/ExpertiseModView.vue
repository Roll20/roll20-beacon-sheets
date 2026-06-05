<template>
  <div class="expertise-mod-row">
    <!-- existing focus (prerequisite) | sub-focus label | Bonus(auto +1)/Reroll -->
    <select
      class="age-atk-select form-select expertise-mod-flex"
      data-testid="test-expertise-focus"
      v-model="selectedFocusId"
    >
      <option value="">Select a focus…</option>
      <option v-for="f in focusOptions" :key="f._id" :value="f._id">
        {{ f.label }}
      </option>
    </select>
    <input
      type="text"
      class="form-control expertise-mod-flex"
      placeholder="Sub-focus (e.g. Ghosts)"
      v-model="mod.field"
    />
    <select
      class="age-atk-select form-select expertise-mod-flex"
      data-testid="test-expertise-effect"
      v-model="mod.modifiedOption"
    >
      <option value="Bonus">Bonus</option>
      <option value="Reroll">Reroll</option>
    </select>
  </div>
</template>

<script setup>
import { computed, onMounted, watch } from "vue";
import { useItemStore } from "@/sheet/stores/character/characterQualitiesStore";

const props = defineProps({
  mod: { type: Object },
});
const itemStore = useItemStore();

// Expertise requires an existing focus, so the user only picks from focuses they have.
const focusOptions = computed(() =>
  itemStore.items
    .filter((i) => i.type === "Ability Focus")
    .map((f) => {
      const name = f.name === "custom" ? f.customName : f.name;
      return {
        _id: f._id,
        name,
        ability: f.ability,
        label: `${name} (${f.ability})`,
      };
    })
);

// The dropdown is keyed by the focus item's id, but the modifier stores the focus name
// (abilityFocus) + ability (modifiedValue) so it matches the focus row.
const selectedFocusId = computed({
  get() {
    const match = focusOptions.value.find(
      (f) =>
        f.name === props.mod.abilityFocus &&
        f.ability === props.mod.modifiedValue
    );
    return match ? match._id : "";
  },
  set(id) {
    const f = focusOptions.value.find((x) => x._id === id);
    props.mod.abilityFocus = f ? f.name : "";
    props.mod.modifiedValue = f ? f.ability : "";
  },
});

// Expertise defaults to a fixed +1 Bonus (no value input).
onMounted(() => {
  if (!props.mod.modifiedOption) props.mod.modifiedOption = "Bonus";
});
watch(
  () => props.mod.modifiedOption,
  (opt) => {
    if (opt === "Bonus") props.mod.bonus = 1;
  },
  { immediate: true }
);
</script>
<style scoped>
.expertise-mod-row {
  display: flex;
  gap: 10px;
  width: 100%;
  align-items: center;
}
.expertise-mod-flex {
  flex: 1;
}
</style>
