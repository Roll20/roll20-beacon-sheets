<template>
    <div class="age-splash-screen">
        <h1>Select your game's ruleset</h1>
        <div class="age-splash-rulesets">
            <button class="age-ruleset-btn" aria-label="Fantasy AGE Ruleset" @click="selectSystem('fage2e')">
                <img src="/src//assets/logos/fantasyage.png" alt="Fantasy AGE" role="presentation">
            </button>
            <button class="age-ruleset-btn" aria-label="Modern AGE Ruleset" @click="selectSystem('mage')">
                <img src="/src/assets/logos/modernage.png"  alt="Modern AGE" role="presentation">
            </button>
            <button class="age-ruleset-btn" aria-label="Blue Rose AGE Ruleset" @click="selectSystem('blue rose')">
                <img src="/src/assets/logos/bluerose.png" alt="Blue Rose AGE" role="presentation">
            </button>
        </div>
        <h6>*This can be changed later in your sheet settings</h6>  
    </div>
</template>
<script setup>
import { useSettingsStore } from '@/sheet/stores/settings/settingsStore';
const settings = useSettingsStore();

const selectSystem = (system) => {
    settings.gameSystem = system;
    switch(settings.gameSystem){
        case 'fage1e':
        case 'fage2e':
            document.getElementsByTagName('body')[0].classList += ' fantasyAge';
        break;
        case 'mage':
            document.getElementsByTagName('body')[0].classList +=(' modernAge');
        break;
        case 'blue rose':
            document.getElementsByTagName('body')[0].classList +=(' bluerose');
        break;
        case 'threefold':
            document.getElementsByTagName('body')[0].classList +=(' threefold');
        break;
        case 'cthulhu':
            document.getElementsByTagName('body')[0].classList +=(' cthulhu');
        break;
    };
}
</script>
<style scoped lang="scss">
.age-splash-screen {
    background-image: linear-gradient(
        45deg,
        hsl(0deg 0% 0%) 0%,
        hsl(344deg 0% 3%) 18%,
        hsl(344deg 0% 6%) 26%,
        hsl(344deg 0% 8%) 33%,
        hsl(344deg 0% 9%) 39%,
        hsl(344deg 0% 11%) 44%,
        hsl(344deg 0% 13%) 50%,
        hsl(344deg 0% 14%) 56%,
        hsl(344deg 0% 16%) 61%,
        hsl(344deg 0% 18%) 67%,
        hsl(344deg 0% 19%) 74%,
        hsl(344deg 0% 21%) 82%,
        hsl(0deg 0% 23%) 100%
        );
    font-family:'Graphik', Helvetica, Arial, serif;
    text-align:center;
    height:100vh;
    width:100vw;
    display: grid;
    align-items: center;
    color:#FFF;
    justify-content: center;
    & h1 {
        text-transform: uppercase;
        margin:0;
    }
    & .age-splash-rulesets {
        display: grid;
        max-width: 850px;
        gap: 25px;
        & .age-ruleset-btn {
            background: none;
            border:none;
            & img {
                width: 100%;
                filter: grayscale(80%);
                transition: filter 0.5s ease;
            }
        }
        & .age-ruleset-btn:hover {            
            & img {                
                filter: grayscale(0%);
            }
        }
    }
}
@media (min-width:601px){
    .age-splash-rulesets {
        grid-template-columns: repeat(3,1fr);
        padding:10px 25px;

    }
}
@media (max-width:600px){
    .age-splash-rulesets {
        grid-template-columns: 1fr;
        padding:10px 50px;
    }
}
</style>