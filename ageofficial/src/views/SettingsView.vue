<template>
  <Transition name="modal">
  <div v-if="show" class="modal-mask">
    <div class="modal-container age-modal">
        <div class="age-modal-header">
          <slot name="header">default header</slot>
          <button type="button" class="btn-close" aria-label="Close" @click="$emit('close')"></button>
        </div>
        <div class="container age-modal-container">     
          <div class="row age-modal-row">
            <div class="">
              <span class="age-input-label" id="basic-addon1">Game System</span>      
              <select  id="settings.gameSystem" v-model="settings.gameSystem" class="age-select form-select" @change="updateGameSystem">
                <!-- <option value="fage1e">Fantasy AGE 1e</option> -->
                <option value="fage2e">Fantasy AGE 2e</option>
                <option value="mage">Modern AGE</option>
                <option value="blue rose">Blue Rose</option>
                <!-- <option value="expanse">Expanse</option> -->
                <!-- <option value="cthulhu">Cthulhu Awakens</option> -->
                <!-- <option value="threefold">Threefold</option> -->
              </select>
            </div>              
          </div>
          <!-- // TODO Items unique to genre slices. Technofantasy, Cthulhu Awakens, Cyberpunk, etc. -->
          <!-- <div class="row age-modal-row"  v-if="settings.gameSystem === 'fage1e' || settings.gameSystem === 'fage2e' || settings.gameSystem === 'cthulhu' || settings.gameSystem === 'mage'">
            <h4>Genre Slices</h4>
            <div style="display: grid;grid-template-columns: repeat(2,1fr);">
              <div class=" input-group" v-if="settings.gameSystem === 'mage'">
                <label class="age-checkbox-toggle" style="margin:1rem;">
                    <input type="checkbox"  v-model="settings.cyberpunk" @change="updateGameSystem" />
                    <span class="slider round" ></span>
                </label>
                <span class="age-toggle-label">Use Cyberpunk</span>
              </div>
              <div class=" input-group" v-if="settings.gameSystem === 'fage1e' || settings.gameSystem === 'fage2e' || settings.gameSystem === 'cthulhu'">
              <label class="age-checkbox-toggle" style="margin:1rem;">
                  <input type="checkbox"  v-model="settings.cthulhuMythos" @change="updateGameSystem" />
                  <span class="slider round" ></span>
              </label>
              <span class="age-toggle-label">Use Cthulhu Mythos</span>
              </div>
              <div class=" input-group" v-if="settings.gameSystem === 'fage1e' || settings.gameSystem === 'fage2e'">
              <label class="age-checkbox-toggle" style="margin:1rem;">
                  <input type="checkbox"  v-model="settings.technofantasy" @change="updateGameSystem" />
                  <span class="slider round" ></span>
              </label>
              <span class="age-toggle-label">Use Technofantasy</span>
              </div>
            </div>
          </div> -->
          <div class="row age-modal-row">
            <h4>System Options</h4>
            <div style="display: grid;grid-template-columns: repeat(3,1fr);">
              <div class=" input-group">
                <label class="age-checkbox-toggle" style="margin:1rem;">
                    <input type="checkbox"  v-model="settings.showArcana" />
                    <span class="slider round" ></span>
                </label>
                <span class="age-toggle-label">Display {{ settings.gameSystem === 'fage1e' || settings.gameSystem === 'fage2e' || settings.gameSystem === 'blue rose' ? 'Arcana' : 'Powers' }}</span>
              </div>
              <div class=" input-group" v-if="settings.gameSystem === 'fage1e' || settings.gameSystem === 'fage2e'">
                <label class="age-checkbox-toggle" style="margin:1rem;">
                    <input type="checkbox"  v-model="settings.peril" />
                    <span class="slider round" ></span>
                </label>
                <span class="age-toggle-label">Use Peril</span>
              </div>
              <div class=" input-group" v-if="settings.gameSystem === 'fage1e' || settings.gameSystem === 'fage2e'">
                <label class="age-checkbox-toggle" style="margin:1rem;">
                    <input type="checkbox"  v-model="settings.daring" />
                    <span class="slider round" ></span>
                </label>
                <span class="age-toggle-label">Use Daring</span>
              </div>               
              <div class=" input-group" v-if="settings.cthulhuMythos">
                <label class="age-checkbox-toggle" style="margin:1rem;">
                    <input type="checkbox"  v-model="settings.showFear" />
                    <span class="slider round" ></span>
                </label>
                <span class="age-toggle-label">Show Fear</span>
              </div>        
              <div class=" input-group" v-if="settings.cthulhuMythos">
                <label class="age-checkbox-toggle" style="margin:1rem;">
                    <input type="checkbox"  v-model="settings.showAlienation" />
                    <span class="slider round" ></span>
                </label>
                <span class="age-toggle-label">Show Alienation</span>
              </div>        
              <div class=" input-group" v-if="settings.technofantasy || settings.cyberpunk">
                <label class="age-checkbox-toggle" style="margin:1rem;">
                    <input type="checkbox"  v-model="settings.showCybernetics" />
                    <span class="slider round" ></span>
                </label>
                <span class="age-toggle-label">Display Cybernetics</span>
              </div>        
            </div>
          </div>  
          
          <!-- <div class="row age-modal-row">

            <div class=" input-groupcol">
              <span class="age-input-label" id="basic-addon1">Show Character Name in Roll Results</span>
              <select  id="settings.armorPenalty" v-model="settings.nameInRoll" class="age-select form-select">
                <option :value="true">Show</option>
                <option :value="false">Hide</option>
              </select>
            </div>
          </div>           -->
          <div class="row age-modal-row">
            <div class="col">
              <span class="age-input-label" id="basic-addon1">Whisper Rolls to GM</span>
              <select  id="settings.aimToggle" v-model="settings.whisperRollsGM" class="age-selectt form-select">
                <option value="never">Never Whisper Rolls</option>
                <option value="toggle">Toggle</option>
                <option value="prompt">Query Whisper Rolls</option>
                <option value="always">Always Whisper Rolls</option>
              </select>
            </div>
            <div class="col ">
              <span class="age-input-label" id="basic-addon1">Reroll Stunt Die</span>
              <select  id="settings.rerollStunt" v-model="settings.rerollStunt" class="age-select form-select">
                <option value="never">Never Reroll Stunt Die</option>
                <option value="toggle">Toggle</option>
                <option value="prompt">Prompt for Reroll Stunt Die</option>
                <option value="always">Always use Reroll Stunt Die</option>
              </select>
            </div>
          </div>    
                  
          <div class="row age-modal-row">
            <div class="col">
                <span class="age-input-label" id="basic-addon1">Aim Options</span>
                <select  id="settings.aimToggle" v-model="settings.aimToggle" class="age-select form-select">
                  <option value="never">Never use Aim</option>
                  <option value="toggle">Toggle</option>
                  <!-- <option value="prompt">Prompt for Aim</option> -->
                  <option value="always">Always use Aim</option>
                </select>    
            </div>
              <div class="col-2">
                <span class="age-input-label" id="basic-addon1">Aim Value</span>
                <input type="number" class="form-control" placeholder="0" aria-label="Aim Value" v-model="settings.aimValue"  aria-describedby="basic-addon1">
              </div>
              
            <div class="col">
                <span class="age-input-label" id="basic-addon1">Guard Options</span>
                <select  id="settings.guardToggle" v-model="settings.guardToggle" class="age-select form-select">
                  <option value="never">Never use Guard</option>
                  <option value="toggle">Toggle</option>
                  <option value="always">Always use Guard</option>
                </select>
              </div>
              <div class="col-2">
                <span class="age-input-label" id="basic-addon1">Guard Value</span>
                <input type="number" class="form-control" placeholder="0" aria-label="Guard Value" v-model="settings.guardValue"  aria-describedby="basic-addon1">
              </div>
              
          </div>      
          <div class="row age-modal-row">
            <div class="col">
              <span class="age-input-label" id="basic-addon1">Show XP</span>
              <select  id="settings.showXP" v-model="settings.showXP" class="age-select form-select">
                <option :value="true">Show</option>
                <option :value="false">Hide</option>
              </select>
            </div>
            </div>      
          <!-- <div class="row age-modal-row">
            <div class=" input-groupcol">
              <span class="age-input-label" id="basic-addon1">Add Tiebreaker to Initiative Rolls</span>
              <select  id="settings.initiativeTiebreaker" v-model="settings.initiativeTiebreaker" class="age-select form-select">
                <option :value="true">Yes</option>
                <option :value="false">No</option>
              </select>
            </div> 
          </div>
          <div class="row age-modal-row">
            <div class=" input-groupcol">
              <span class="age-input-label" id="basic-addon1">Apply Armor Penalty to Dexterity Rolls</span>
              <select  id="settings.armorPenalty" v-model="settings.armorPenalty" class="age-select form-select">
                <option :value="true">Yes</option>
                <option :value="false">No</option>
              </select>
            </div>
          </div> -->
          <div style="display: grid;grid-template-columns: 2fr 135px;">
            <div>
              <p>Fantasy AGE RPG is ©2015 Green Ronin Publishing, LLC.</p>
              <p>Beacon SDK AGE System Sheet created by Don White/Web Lynx ©2024</p>
            <a href="https://ko-fi.com/J3J614QOV1" target="_blank" class="myButton"><img style="width: 24px;margin-right: 10px;" src="/src/assets/lynx/kofi_symbol.png" />Support Don on ko-fi</a>

            </div>
            <div>
              <img src="/src/assets/logos/greenronin-circle.jpg" />
            </div>
          </div>
          
        </div>
        <div class="modal-footer-actions">
          <slot name="footer">
            <button
              class="confirm-btn"
              @click="$emit('close')"
            >OK</button>
          </slot>
        </div>
    </div>
  </div>
  </Transition>
</template>

<script setup>
import { initValues } from '@/relay/relay';
import { useSettingsStore } from '@/sheet/stores/settings/settingsStore';
import { productLineStyle } from '@/utility/productLineStyle';

const props = defineProps({
  show: Boolean
})
const settings = useSettingsStore();

const updateGameSystem = () => {
  const colorTheme = initValues.settings.colorTheme;
  productLineStyle(settings.gameSystem,colorTheme,{cthulhuMythos:settings.cthulhuMythos,technofantasy:settings.technofantasy,cyberpunk:settings.cyberpunk});
}
</script>

<style lang="scss" scoped>
@use '../common/scss/vars.scss';
.myButton {
	background-color:#595959;
	border-radius:6px;
	border:1px solid #383838;
	display:inline-block;
	cursor:pointer;
	color:#ffffff;
	font-family:Arial;
	font-size:15px;
	font-weight:bold;
	padding:5px 20px;
	text-decoration:none;
	text-shadow:0px 1px 0px #2c2c2c;
}
.myButton:hover {
	background-color:#6d6d6d;
}
.myButton:active {
	position:relative;
	top:1px;
}
.settings {
  &__main {
    margin: 2rem 0;
  }
  &__item {
    padding: 1rem;
    border: 1px solid black;
    border-radius: 0.5rem;
    display: inline-block;

    &__name {
      display: block;
      font-weight: 600;
    }
    &__desc {
      display: block;
    }
    &__input {
      display: block;
      margin-top: 0.5rem;
      margin-left: auto;
      margin-right: auto;
      text-align: center;
    }
  }
}

.big-button {
  border: none;
 color: var(--examplesheet-contrast-font-color);
  padding: 1rem 2rem;
  background-color: var(--examplesheet-button-background-color);
  font-family: var(--examplesheet-font-family);
  font-weight: 600;
  font-size: 1rem;
  text-transform: uppercase;
  margin-top: 1rem;
  margin-left: 1rem;

  &:hover {
    filter: brightness(1.2);
    cursor: pointer;
  }
}
</style>
