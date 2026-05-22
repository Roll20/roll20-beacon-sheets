<template>
  <div class="npc-spell-source">
    <div class="npc-spell-source__header">
      <input v-model="source.name" class="npc-spell-source__name-input" required />
      <button @click="$emit('remove')" class="npc-spell-source__remove-button">×</button>
    </div>
    <div class="npc-spell-source__grid">
      <div class="npc-spell-source__labeled-input">
        <strong>{{ t('titles.spellcasting-ability') }}</strong>
        <select v-model="source.ability">
          <option v-for="ability in config.abilities" :key="ability" :value="ability">
            {{ t(`titles.abilities.${ability}`) }}
          </option>
        </select>
      </div>
      <div class="npc-spell-source__labeled-input">
        <strong>{{ t('titles.spell-attack-bonus') }}</strong>
        <input type="number" v-model.number="source.spellAttackBonus" />
      </div>
      <div class="npc-spell-source__labeled-input">
        <strong>{{ t('titles.spell-save-dc') }}</strong>
        <input type="number" v-model.number="source.spellSaveDC" />
      </div>
      <div class="npc-spell-source__labeled-input">
        <strong>{{ t('titles.level') }}</strong>
        <input
          type="number"
          v-model.number="source.casterLevel"
          min="0"
          :placeholder="t('titles.level')"
        />
      </div>
      <label class="npc-spell-source__checkbox-label">
        <input type="checkbox" v-model="source.isInnate" />
        {{ t('titles.innate') }}
      </label>
    </div>
    <div v-if="!source.isInnate" class="npc-spell-source__slots-editor">
      <h4>{{ t('titles.spell-slots') }}</h4>
      <div class="npc-spell-source__slots-grid">
        <div v-for="level in 9" :key="level" class="npc-spell-source__labeled-input">
          <strong>Lvl {{ level }}</strong>
          <input type="number" v-model.number="source.spellSlots[level]" min="0" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { config } from '@/config';
import { type NpcSpellSource } from '@/sheet/stores/npc/npcStore';
defineProps<{ source: NpcSpellSource }>();
defineEmits(['remove']);
const { t } = useI18n();
</script>

<style lang="scss" scoped>
.npc-spell-source {
  border: 1px dashed #1e90ff;
  padding: 0.5rem;
  border-radius: 4px;
  margin-bottom: 1rem;
}
.npc-spell-source__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}
.npc-spell-source__name-input {
  font-weight: bold;
  width: 100%;
}
.npc-spell-source__remove-button {
  background-color: #ff4d4f;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  flex-shrink: 0;
}
.npc-spell-source__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 0.5rem;
  align-items: end;
}
.npc-spell-source__slots-editor {
  margin-top: 0.5rem;
}
.npc-spell-source__slots-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}
.npc-spell-source__labeled-input {
  display: flex;
  flex-direction: column;
}
.npc-spell-source__labeled-input > strong {
  font-size: 0.8em;
  margin-bottom: 0.25rem;
  color: #555;
}
.npc-spell-source__checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
</style>
