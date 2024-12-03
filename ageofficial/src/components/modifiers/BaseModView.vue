<template>
    <div>
    <select
      class="age-atk-select form-select"
        data-testid="test-spell-weaponType-input"
        v-model="mod.option"
    >
    <option v-for="op in modOptions" :key="op" :value="op">{{ op }}</option>
    </select>
  </div>
  <DamageModView v-if="mod.option === 'Damage'" :mod="mod" />
  <DefenseModView v-if="mod.option === 'Defense'" :mod="mod" />
  <AbilityModView v-if="mod.option === 'Ability Reroll' || mod.option === 'Ability'" :mod="mod" />
  <SpellModView v-if="mod.option === 'Spell'" :mod="mod" />
  <SpeedModView v-if="mod.option === 'Speed'" :mod="mod" />
  <ArmorModView v-if="mod.option === 'Armor Rating' || mod.option === 'Armor Penalty'" :mod="mod" />
  <CustomAttackModView v-if="mod.option === 'Custom Attack'" :mod="mod" />
  <button class="link-btn" @click="removeModifier" 
                  style="background: none; font-weight: bold;border:none;" v-tippy="{ content: 'Remove Modifier' }">
                  <font-awesome-icon :icon="['fa', 'minus']" />
                </button>
</template>
<script setup>
import DamageModView from './DamageModView.vue';
import SpellModView from '@/components/modifiers/SpellModView.vue';
import AbilityModView from '@/components/modifiers/AbilityModView.vue';
import DefenseModView from '@/components/modifiers/DefenseModView.vue';
import CustomAttackModView from '../modifiers/CustomAttackModView.vue';
import { useModifiersStore } from '@/sheet/stores/modifiers/modifiersStore';
import SpeedModView from './SpeedModView.vue';
import ArmorModView from './ArmorModView.vue';
const props = defineProps({
    mod:{ type: Object},
    modOptions:{type:Array}
})
const removeModifier = () => {
  const modStore = useModifiersStore();
  modStore.removeModifier(props.mod._id)
}
</script>