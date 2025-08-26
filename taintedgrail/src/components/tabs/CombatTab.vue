<template>
  <div class="combat-tab">
    <div class="combat-tab-body">
      <div class="body-left">
        <div class="weapons-block">
          <h3>Weapons</h3>
          <div class="weapons-body"></div>
        </div>
        <div class="armor-block">
          <h3>Armor</h3>
        </div>
      </div>
      <div class="body-right">
        <div class="fighting-stance-block">
          <h3>Fighting Stance</h3>
          <div class="select-row">
            <label for="fightingStance">Type:</label>
            <select name="fightingStance" id="fightingStance" v-model="character.fightingStance">
              <option value="standard">Standard</option>
              <option value="offensive">Offensive</option>
              <option value="defensive">Defensive</option>
              <option value="movement">Movement</option>
            </select>
          </div>
          <div class="value-display">
            <label for="potential">Potential:</label>
            <span>{{ character.potential }}</span>
          </div>
          <div class="value-display">
            <label for="defense">Defense:</label>
            <span>{{ character.defense }}</span>
          </div>
          <div class="value-display">
            <label for="speed">Speed:</label>
            <span>{{ character.speed }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useCharacterStore } from '@/sheet/stores/character/characterStore';
const character = useCharacterStore();
</script>

<style scoped lang="scss">
.combat-tab {
  h3 {
    font-weight: 600;
    margin: 0;
    margin-bottom: 0.5rem;
    border-bottom: 1px solid #8b4513;
  }

  label {
    margin-right: 0.5rem;
  }

  .combat-tab-body {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .body-left,
  .body-right {
    width: 50%;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .select-row {
    display: flex;
    align-items: center;
    margin-bottom: 1rem;
  }

  .value-display span {
    width: 50%;
    display: flex;
    padding: 0.25rem;
    background-color: rgba(0, 0, 0, 0.05);
    border: 1px solid #7a7971;
    border-radius: 3px;
    margin-bottom: 0.5rem;
  }
}
</style>
