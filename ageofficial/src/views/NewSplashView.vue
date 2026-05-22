<template>
    <div class="age-splash-screen">
        <h1>Select your game's ruleset</h1>
        <div class="age-splash-rulesets" v-if="!selectedSystem">
            <button class="age-ruleset-btn" aria-label="Fantasy AGE Ruleset" @click="selectSystem('fage2e');$emit('close')">
                <img src="/src/assets/logos/fantasyage.png" alt="Fantasy AGE" role="presentation">
            </button>
            <button class="age-ruleset-btn" aria-label="Modern AGE Ruleset" @click="selectSystem('mage');$emit('close')">
                <img src="/src/assets/logos/modernage.png"  alt="Modern AGE" role="presentation">
            </button>
            <button class="age-ruleset-btn" aria-label="Blue Rose AGE Ruleset" @click="selectSystem('blue rose');$emit('close')">
                <img src="/src/assets/logos/bluerose.png" alt="Blue Rose AGE" role="presentation">
            </button>
            <button class="age-ruleset-btn" aria-label="Expanse AGE Ruleset" @click="selectSystem('expanse')">
                <img src="/src/assets/logos/expansewhite.png" alt="Expanse AGE" role="presentation">
            </button>
        </div>
        <div v-else class="age-character-type-select">
            <button class="age-character-type-btn"  aria-label="Character" @click="selectExpanseCharType('Character');$emit('close')">
                <span class="age-char-type-icon age-char-type-character-icon"></span>
                <span>Character</span>
            </button>
            <button class="age-character-type-btn" aria-label="Ship" @click="selectExpanseCharType('Ship');$emit('close')">
                <span class="age-char-type-icon age-char-type-ship-icon"></span>
                <span>Ship</span>
            </button>
        </div>
        <h6>*This can be changed later in your sheet settings</h6>  
    </div>
</template>
<script setup>
import { useBioStore } from '@/sheet/stores/bio/bioStore';
import { useSettingsStore } from '@/sheet/stores/settings/settingsStore';
import { productLineStyle } from '@/utility/productLineStyle';
import { ref } from 'vue';

const settings = useSettingsStore();
const bio = useBioStore();
const selectedSystem = ref('');

const selectSystem = (system) => {
    if(system !== 'expanse'){
        settings.gameSystem = system;
    }
    if(system === 'expanse'){
        selectedSystem.value = system;
    }
}

const selectExpanseCharType = (type) => {
    settings.useFortune = true;
    settings.gameSystem = 'expanse';
    bio.type = type;
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
.age-character-type-select {
    display: flex;
    gap: 25px;
    justify-content: center;
    & .age-character-type-btn {
        background: none;
        border: 2px solid #FFF;
        color: #FFF;
        padding: 15px;
        font-size: 1.2rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        width: 150px;
        border-radius: 10px;
        font-family: 'Venus Rising', sans-serif;
        cursor: pointer;
        & .age-char-type-icon {
            display: block;
            width: 100px;
            height: 100px;
            background-color: #FFF;
            mask-size: contain;
            mask-repeat: no-repeat;
            mask-position: center;
        }
        & .age-char-type-character-icon {
            mask-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="%23000" d="M250.344 21.885c-1.224.032-2.443.15-3.656.35-9.712 1.62-18.018 8.555-23.653 19.99-5.635 11.434-8.068 27.065-5.308 43.61 2.76 16.542 10.134 30.538 19.175 39.524 9.042 8.986 19.15 12.848 28.862 11.228 9.71-1.62 18.017-8.555 23.652-19.99 5.635-11.435 8.068-27.067 5.31-43.61-2.76-16.544-10.138-30.54-19.18-39.525-7.91-7.863-16.638-11.802-25.202-11.578zm185.64 32.22c-35.615 33.13-82.033 58.62-132.83 76.217-7.837 12.763-19.697 22.255-34.316 24.694-11.368 1.896-22.54-.784-32.383-6.547-55.808 11.324-113.423 13.896-165.514 7.39 42.767 37.097 106.85 54.638 169.626 50.964-9.982 93.127-47.653 188.14-81.968 282.924 53.913-39.23 109.785-113.508 127.08-175.496 27.11 53.623 33.926 92.79 49.646 176.547h.002c34.354-84.91 33.247-202.718-13.023-301.91 56.437-22.846 101.64-67.225 113.68-134.785z"/></svg>');
        }
        & .age-char-type-ship-icon {
            mask-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="%23000" d="M176.627 28.995C148.28 58.81 115.299 96.145 87.199 133.61 54.425 177.31 29.385 221.68 25.59 249.331l105.706 26.426c2.423-83.416 27.743-164.682 45.332-246.762zm158.746 0c19.444 82.462 39.362 163.183 45.332 246.762L486.41 249.33c-3.795-27.652-28.835-72.022-61.61-115.72-28.099-37.466-61.08-74.8-89.427-104.616zM55 80.21v67.19a858.533 858.533 0 0 1 17.8-24.59l.2-.262V80.21zm384 0v42.338l.2.262A858.535 858.535 0 0 1 457 147.4V80.21zm-192 32v52.648c5.93-4.323 12.122-3.717 18 0V112.21zm9 68.65c-9.092 6.936-16.603 16.958-22.553 25.674-4.776 7.036-9.08 14.404-12.068 20.695-2.887 6.078-4.215 11.405-4.307 12.674l14.553 87.307h48.75l14.553-87.307c-.092-1.27-1.42-6.596-4.307-12.674-2.989-6.291-7.292-13.66-12.068-20.695-7.091-9.554-13.257-18.898-22.553-25.674zm-10 31.35h20l14 36h-48zm-94.043 26.912l-13.855 193.973L180.09 412.1l-14.213-63.96 45.889-30.591-8.15-48.91zm208.086 0l-51.656 29.518-8.153 48.91 45.89 30.592-14.214 63.959 41.988 20.994zM39.057 271.251c19.713 24.978 40.743 50.236 58.359 75.86 9.945 14.464 18.821 29.098 25.643 43.954l6.935-97.08zm433.886 0l-90.937 22.734 6.935 97.08c6.822-14.856 15.698-29.49 25.643-43.955 17.616-25.623 38.646-50.88 58.36-75.859zm-257.933 65.77l-28.887 19.257 18.43 82.932H231v-48h16v-46h-30.625zm81.98 0l-1.365 8.189H265v46h16v48h26.447l18.43-82.932zM208.553 457.21l5.732 25.795L231 474.647V457.21zm72.447 0v17.437l16.715 8.358 5.732-25.795z"/></svg>');
        }
        &:hover {
            background-color: rgba(255,255,255,0.1);
        }
    }
}
@media (min-width:601px){
    .age-splash-rulesets {
        grid-template-columns: repeat(2,1fr);
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