<template>
    <div class="d-grid" :class="{ fortune: settings.useFortune}">
        <div>
            <div>
                <div class="d-flex flex-column justify-content-evenly" style="height: 50px;">
                    <div class="hpmp-container">
                        <div class="hpmp-current">
                            <input class="age-input"
                                type="number"
                                v-model="char.health"
                                :max="char.healthMax"
                                :min="0"
                                autocomplete="off" />
                        </div>
                        /
                        <div class="hpmp-max">
                            {{ char.healthMax }}
                        </div>
                    </div>        
                    <div class="progress" role="progressbar" aria-label="Success example"
                    v-bind:aria-valuenow="char.health"
                    aria-valuemin="0"
                    v-bind:aria-valuemax="char.healthMax">
                        <div class="progress-bar" :class="{ 'bg-success':(char.health / char.healthMax)*100 >= 50, 'bg-warning':(char.health / char.healthMax)*100 < 50, 'bg-danger':(char.health / char.healthMax)*100 < 25 }" v-bind:style="{ width: (char.health / char.healthMax)*100 + '%'}"></div>
                    </div>
                </div>
        
            </div>
            
            <h4 class="age-subsection-header">
                <span v-if="!settings.useFortune">Health</span>
                <span v-if="settings.useFortune">Fortune</span>
            </h4>
        </div>
        <div v-if="settings.useFortune" class="d-flex flex-column justify-content-evenly age-fortune-btn-cntr" >
            <button :class="{ 'fortune-active': char.fortuneInjured }" class="age-fortune-btn" @click="char.fortuneInjured = !char.fortuneInjured" v-tippy="{ content: 'Injured' }">
                <div class="age-fortune-injured-btn"></div>
            </button>
            <button :class="{ 'fortune-active': char.fortuneWounded }" class="age-fortune-btn" @click="char.fortuneWounded = !char.fortuneWounded" v-tippy="{ content: 'Wounded' }">
                <div class="age-fortune-wounded-btn"></div>
            </button>
        </div>
    </div>    
</template>
<script setup>
import { useBioStore } from '@/sheet/stores/bio/bioStore';
import { useCharacterStore } from '@/sheet/stores/character/characterStore';
import { useSettingsStore } from '@/sheet/stores/settings/settingsStore';
const bio = useBioStore();
const char = useCharacterStore();
const settings = useSettingsStore();
</script>
<style>
.fortune {
    grid-template-columns: 1fr 30px;
    gap:5px;
}
.age-fortune-btn-cntr {
    gap:5px;
    padding-top:2px;
    & .age-fortune-btn {
        background-color: #e5e5e5;
        border: 2px solid #b0b0b0;
        color: #b0b0b0;
        border-radius: 0;
        font-weight: 600;
        align-items: center;
        justify-content: center;
        white-space: nowrap;
    }
    & .age-fortune-injured-btn {        
        mask-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="%23fff" d="M318.7 21c4.9 17.27 12.7 32.67 22.5 45.22 17.4 22.31 40.8 35.48 66.3 35.48s48.9-13.17 66.3-35.48c9.8-12.55 17.6-27.95 22.5-45.22zm174.1 49.71c-1.5 2.26-3.1 4.45-4.8 6.58-20.2 25.81-48.7 42.41-80.5 42.41-31.8 0-60.3-16.6-80.5-42.41-.4-.53-.8-1.07-1.2-1.6-37.7 6.23-78.4 12.65-112.2 26.21-18.3 37.5-34 75.5-47.7 113.6 28.8 8.6 57.9 20.9 80.6 37.9l8.4-27.6 17.6 3.4c-8 88.4-8.4 175.9-5.8 263.2h226.1zM82.54 179.6c-.71 3.1-1.61 6.2-2.82 9.2-1.9 4.7-4.36 9.1-7.52 12.8 9.67 9.4 15.64 19.7 19.01 30.1 1.56 4.8 2.55 9.6 3.23 14.3 6.66-5.8 15.26-9.4 24.16-7.3-6.4-22-17.9-43.8-36.06-59.1zm65.76 49.8c-3.1 6.4-6 13-8.6 19.6 19.5-2.3 38.8-2.5 57.7-2.6-15.7-7-32.5-12.7-49.1-17zm-35.4 26.8c-1.8.1-4.3 1.1-7.4 4 2.7 8.3 7.6 18.5 13.5 27.6.2-.6.3-1.2.5-1.8 2.3-8.3 2.2-16.2.7-21.7-1.5-5.4-3.9-7.5-5.7-8-.4-.1-.8-.1-1.2-.1zm117 7.8c-31.1.9-61.3-.5-90.8 3.2.4 4.5.3 9.1-.3 13.9 42.6 1.2 77 7.3 105.5 16.9 1.3-6.5 2.6-12.9 3.8-19.4-5.3-5.1-11.4-10-18.2-14.6zM94.47 281.5c-1.68 7.4-1.47 14.5-.1 19.4 1.52 5.4 3.83 7.5 5.73 8 1.8.5 4.9-.1 8.9-3.9-5.6-7.3-10.6-15.4-14.53-23.5zM134.1 299c-1.8 4.2-3.8 8-6.2 11.4 29.3 21.8 66.3 37.5 100.2 48.9 4.8-14.3 8.8-28.9 12.3-43.7-28-9.6-62.1-15.8-106.3-16.6zm-55.73 10.7c-14.13 11.1-31.09 21.4-47.75 31.4 28.08 7.4 50.7-.1 67.68-14.2-1-.1-2-.3-3-.6-8.31-2.3-13.85-8.9-16.93-16.6zm38.73 15.2c-1.7 7.1-3.3 14.3-5 21.5 31.8 23.1 67.1 35 104.4 42.8 1.9-4.3 3.7-8.6 5.4-12.9-34.6-11.7-73-27.8-104.8-51.4zm2.2 47.9c-9.8 40.2-18.1 80.2-25.73 119.6h79.93l27-88.3c-28-6.6-55.4-16-81.2-31.3z"/></svg>');
        height: 18px;
        width: 18px;
        background-color: #b0b0b0;
    }
    & .age-fortune-wounded-btn {   
        mask-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="%23fff" d="M320.977 18.703c-.496-.01-.984-.007-1.463.008-1.358.09-2.045.27-3.057.4L220.38 169.796c1.53 6.565 3.088 13.04 4.778 19.226l-18.027 4.926c-9.073-33.212-15.026-70.992-26.538-94.735-5.757-11.872-12.47-19.702-20.625-23.246-6.714-2.92-15.483-3.28-27.63.6 17.258 50.103 24.184 102.383 33.495 143.826 4.933 21.958 10.617 40.805 18.21 54.317 7.59 13.51 16.324 21.482 29.108 24.625l-4.463 18.148c-18.367-4.515-31.723-17.217-40.94-33.62-4.192-7.46-7.682-15.74-10.726-24.673-30.794 33.74-75.13 70.583-137.602 98.473v135.72h140.437c22.443-42.52 44.626-79.104 66.23-105.74 22.48-27.712 44.393-46.065 68.247-46.47l-.19.006 2.985-.112-28.434-81.853 21.164-7.057-33.67-79.035 68.99 92.844-27.9 7.52 31.3 66.41 149.417-5.558c4.266-5.493 7.614-14.578 8.1-23.91.467-8.97-1.767-17.213-5.073-22.166l-119.5 3.42c.137-8.21-.404-16.456-1.55-24.627l130.184-45.302c2.502-6.403 2.67-15.49-.002-24.108-2.58-8.326-7.588-15.26-12.38-18.79l-130.13 43.943c-3.504-8.287-7.594-16.232-12.177-23.694l108.244-77.542c.024-6.105-2.634-14.563-7.788-21.476-5.365-7.196-12.655-12.406-19.1-14.172l-109.396 79.31c-6.44-5.683-13.267-10.506-20.36-14.316L358.24 39.23c-2.26-4.454-6.892-9.397-13.256-13.218-7.39-4.438-16.575-7.177-24.007-7.31zm-8.975 336.23c-3.66 51.045-31.82 66.58-31.82 95.014 0 14.116 15.503 26.684 31.82 26.684 15.958 0 32.457-12.494 32.457-27.357 0-29.613-27.877-43.213-32.458-94.34z"/></svg>');
        height: 18px;
        width: 18px;
        background-color: #b0b0b0;
    }
    & .fortune-active {
        background-color: var(--theme-primary);
        color: #ecf6ff;
        border-color: var(--theme-primary);
        & .age-fortune-injured-btn, .age-fortune-wounded-btn {
            background-color: #ecf6ff;
        }
    }
}


</style>
