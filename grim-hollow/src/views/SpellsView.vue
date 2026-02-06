<template>
  <div>
    <!-- <div>{{ JSON.stringify(spells.sources) }}</div> -->
     <div class="section spells-section">
      <StyledBox mode="gothic">
        <div class="section__header">
          <h3>{{ $t('titles.spellcasting') }}</h3>
          <SidebarLink
            componentName="SpellSidebar"
            :options="{ title: t('actions.add-spell'), hasSave: true }"
            :props="{
              spell: null,
            }"
            display="icon"
            label="add"
          />
          <SidebarLink
            componentName="SpellSlotsSidebar"
            :options="{ 
              title: $t('titles.spell-slots'),
              hasSave: true,
            }"
            display="icon"
            label="config"
          />
        </div>
      </StyledBox>
      <SpellSourceDetails />
      <div class="spells-view">
        <div
          class="spells-view__column"
          v-for="(levels, column) in spellLevels"
          :key="`column-${column}`"
        >
          <div
            :class="`spells-view__level spells-view__level--${level}`"
            v-for="level in levels"
            :key="`level-${level}`"
          >
            <SpellHeader
              :level="level"
              :slotsTotal="0"
              :slotsUsed="0"
            />
            <SpellItem v-for="spell in getSpellsByLevel(level)"  :spell="spell" :key="spell._id" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { config } from '@/config';
import { useSheetStore } from '@/sheet/stores';
import { type Spell, useSpellsStore, type SpellLevel } from '@/sheet/stores/spells/spellsStore';
import { useI18n } from 'vue-i18n';
import SidebarLink from '@/components/shared/SidebarLink.vue';
import SpellItem from '@/components/spells/SpellItem.vue';
import SpellSourceDetails from '@/components/spells/SpellSourceDetails.vue';
import SpellHeader from '@/components/spells/SpellHeader.vue';
import { computed } from 'vue';
import { jsonClone } from '@/utility/jsonTools';
import StyledBox from '@/components/shared/StyledBox.vue';

const { t } = useI18n();
const spells = useSpellsStore();

const spellsWithUpcast = computed(() => {
  const upcastedSpells: Spell[] = [];
  for (const spell of spells.spells) {
    if(spell.level === 0) continue; // Cantrips can't be upcast
    if (spell.upcast) {
      spell.upcast.forEach((upcast, i) => {
        // Merge damage arrays by index, upcast overwrites base
        let mergedDamage = jsonClone(spell.damage);
        if (Array.isArray(spell.damage) && Array.isArray(upcast.damage)) {
          mergedDamage = spell.damage.map((base, idx) =>
            upcast.damage && upcast.damage[idx]
              ? { ...base, ...upcast.damage[idx] }
              : base
          );
        }
        upcastedSpells.push({ 
          ...spell, 
          ...upcast,
          damage: mergedDamage,
          description: spell.description,
          _id: `${spell._id}-upcast-${i}`,
        });
      });
    }
  }
  return [...spells.spells, ...upcastedSpells];
});

function getSpellsByLevel(level: SpellLevel) {
  //return spells.spells.filter((spell) => spell.level === level).sort((a, b) => a.name.localeCompare(b.name));
  return spellsWithUpcast.value.filter((spell) => spell.level === level).sort((a, b) => a.name.localeCompare(b.name));
}

function divideIntoThreeParts<T>(array: T[]): T[][] {
  const total = array.length;
  const baseSize = Math.floor(total / 3);
  return [array.slice(0, baseSize), array.slice(baseSize, baseSize * 2), array.slice(baseSize * 2)];
}

const spellLevels = divideIntoThreeParts(config.spellLevels.slice());

useSheetStore();
</script>

<style lang="scss" scoped>
.spells-section {
  .spells-view {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    &__column {
      display: flex;
      flex-direction: column;
      gap: var(--size-gap-large);
    }
  }
}
</style>
