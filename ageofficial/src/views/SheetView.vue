<template>
  <div class="examplesheet-sheet">
    <!-- <div class="examplesheet__header"></div> -->
    <div class="examplesheet__main">
      <div class="examplesheet__column">
        <div class="examplesheet__ability-scores">
          <!-- <AbilityScoresSection /> -->
        </div>
        <!-- <div class="examplesheet__character">
          <BioSection />
        </div> -->
        
      </div>
      <div>
        <div class="age-label">
            <div class="age-label-content">
              <div class="age-label-heading">
                Speed
              </div>
              <div class="age-content">
                <div class="ability-scores__base incrementer">
                  <!-- <label for="bio.explorationStunts">
                    <input type="number" id="bio.explorationStunts" v-model="bio.explorationStunts" class="age-bio-input" />
                  </label> -->
                </div>
              </div>
            </div>
          </div>
          <div class="age-label">
            <div class="age-label-content">
              <div class="age-label-heading">
                Defense
              </div>
              <div class="age-content">
                <div class="ability-scores__base incrementer">
                  <!-- <label for="bio.explorationStunts">
                    <input type="number" id="bio.explorationStunts" v-model="bio.explorationStunts" class="age-bio-input" />
                  </label> -->
                </div>
              </div>
            </div>
          </div>
          <div class="age-label">
            <div class="age-label-content">
              <div class="age-label-heading">
                Armor
              </div>
              <div class="age-content">
                <div class="ability-scores__base incrementer">
                  <!-- <label for="bio.explorationStunts">
                    <input type="number" id="bio.explorationStunts" v-model="bio.explorationStunts" class="age-bio-input" />
                  </label> -->
                </div>
              </div>
            </div>
          </div>
      </div>
      <div>
        <div class="examplesheet__combat">
          <AttackSection />
        </div>
        <!-- <div class="examplesheet__traits">
          <TraitsSection />
        </div> -->
      </div>
      <!-- <div class="examplesheet__column">
        <div class="examplesheet__xp">
          <XPSection />
        </div>
      </div> -->
    </div>
    <div class="examplesheet__inventory">
      <InventorySection />
    </div>
  </div>
</template>

<script setup>
import { useAgeSheetStore } from '@/sheet/stores';
// import AbilityScoresSection from '@/components/ability/AbilityScoresSection.vue';
import BioSection from '@/components/character/BioSection.vue';
import XPSection from '@/components/XPSection.vue';
import InventorySection from '@/components/inventory/InventorySection.vue';
import AttackSection from '@/components/attack/AttackSection.vue';

useAgeSheetStore();
</script>

<style lang="scss">
@use '../common/scss/vars.scss' as vars;

.examplesheet {
  * .bio__form .bio-primary .age-label-content{
    display: grid;
    grid-template-columns: 150px 1fr;
  }
  &__header {
    // todo avatar, name
    & .age-label-content {
    color: #000;
    /* text-align: center; */
    background: #fff;
    width: calc(100% - 4px);
    margin-left: 2px;
    clip-path: polygon(15px 0px, calc(100% - 15px) 0px, 100% 15px, 100% calc(100% - 15px), calc(100% - 15px) 100%, 15px 100%, 0px calc(100% - 15px), 0px 15px);
    display: grid;
    grid-template-columns: 175px 1fr;
    }
  }

  &__main {
    display: grid;
    gap: 1rem;
    margin-bottom: 1rem;
    grid-template-columns: 1fr 2fr;
  }

  &__column {
    display: grid;
    gap: 1rem;
  }

  &__inventory {
    width: 88rem;
  }
}
</style>
