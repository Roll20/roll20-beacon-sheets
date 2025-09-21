import { defineStore } from 'pinia';
import { ref } from 'vue';

export type SettingsHydrate = {
  settings: {
    gameSystem: 'fage1e' | 'fage2e' | 'blue rose' | 'cthulu' | 'mage' | undefined;
    campaignMode?: 'cinematic' | 'pulpy' | 'gritty' | undefined;
    color: string;
    nameInRoll:boolean;
    encumbrancePenalty: number;
    whisperRollsGM: string;
    whisperRollsGMToggle: boolean;
    aimToggle: string;
    aimValue:number;
    aim:boolean;
    guardToggle: string;
    guardValue: number;
    guard: boolean;
    rerollStunt: string;
    reroll: boolean;
    initiativeTiebreaker: boolean;
    armorPenalty: boolean
    sheetView: boolean;
    showXP: boolean;
    cthulhuMythos:boolean;
    peril:boolean;
    daring:boolean;
    showArcana:boolean;
    cyberpunk:boolean;
    technofantasy:boolean;
    showFear:boolean;
    showAlienation:boolean;
    showCybernetics:boolean;
    useFortune?: boolean;
    userPowerFatigue?: boolean;
  };
};

export const useSettingsStore = defineStore('settings', () => {
  const encumbrancePenalty = ref(0);
  const gameSystem = ref();
  const campaignMode = ref('');
  const color = ref('#1e4e7a');
  const nameInRoll = ref(true);
  const whisperRollsGM = ref('never');
  const whisperRollsGMToggle = ref(false);
  const aimToggle = ref('never');
  const aimValue = ref(1);
  const aim = ref(false);
  const guardToggle = ref('never');
  const guardValue = ref(1);
  const guard = ref(false);
  const rerollStunt = ref('never');
  const reroll = ref(false);
  const initiativeTiebreaker = ref(false);
  const armorPenalty = ref(false);
  const sheetView = ref(true);
  const showXP = ref(false);
  const cthulhuMythos = ref(false);
  const peril = ref(false);
  const daring = ref(false);
  const showArcana = ref(false);
  const cyberpunk = ref(false);
  const technofantasy = ref(false);
  const showFear = ref(false);
  const showAlienation = ref(false);
  const showCybernetics = ref(false);
  const useFortune = ref(false);
  const userPowerFatigue = ref(false);

  const dehydrate = () => {
    return {
      settings: {
        encumbrancePenalty: encumbrancePenalty.value,
        gameSystem: gameSystem.value,
        campaignMode: campaignMode.value,
        color: color.value,
        nameInRoll: nameInRoll.value,
        whisperRollsGM: whisperRollsGM.value,
        whisperRollsGMToggle: whisperRollsGMToggle.value,
        aimToggle: aimToggle.value,
        aimValue: aimValue.value,
        aim: aim.value,
        guardT: guard.value,
        guardToggle: guardToggle.value,
        guardValue: guardValue.value,
        rerollStunt: rerollStunt.value,
        reroll: reroll.value,
        initiativeTiebreaker: initiativeTiebreaker.value,
        armorPenalty: armorPenalty.value,
        sheetView: sheetView.value,
        showXP: showXP.value,
        cthulhuMythos: cthulhuMythos.value,
        peril:peril.value,
        daring:daring.value,
        showArcana:showArcana.value,
        cyberpunk:cyberpunk.value,
        technofantasy: technofantasy.value,
        showFear: showFear.value,
        showAlienation: showAlienation.value,
        showCybernetics: showCybernetics.value,
        useFortune: useFortune.value,
        userPowerFatigue: userPowerFatigue.value,   
      },
    };
  };

  const hydrate = (hydrateStore: SettingsHydrate) => {
    encumbrancePenalty.value = hydrateStore.settings.encumbrancePenalty || encumbrancePenalty.value;
    gameSystem.value = hydrateStore.settings.gameSystem || gameSystem.value;
    campaignMode.value = hydrateStore.settings.campaignMode || campaignMode.value;
    color.value = hydrateStore.settings.color || color.value;
    nameInRoll.value = hydrateStore.settings.nameInRoll || nameInRoll.value;
    whisperRollsGM.value = hydrateStore.settings.whisperRollsGM || whisperRollsGM.value;
    whisperRollsGMToggle.value = hydrateStore.settings.whisperRollsGMToggle || whisperRollsGMToggle.value;
    aimToggle.value = hydrateStore.settings.aimToggle || aimToggle.value;
    aimValue.value = hydrateStore.settings.aimValue || aimValue.value;
    aim.value = hydrateStore.settings.aim || aim.value;
    guard.value = hydrateStore.settings.guard || guard.value;
    guardToggle.value = hydrateStore.settings.guardToggle || guardToggle.value;
    guardValue.value = hydrateStore.settings.guardValue || guardValue.value;
    rerollStunt.value = hydrateStore.settings.rerollStunt || rerollStunt.value;
    reroll.value = hydrateStore.settings.reroll || reroll.value;
    initiativeTiebreaker.value = hydrateStore.settings.initiativeTiebreaker || initiativeTiebreaker.value;
    armorPenalty.value = hydrateStore.settings.armorPenalty || armorPenalty.value;
    sheetView.value = hydrateStore.settings.sheetView ?? sheetView.value
    showXP.value = hydrateStore.settings.showXP ?? showXP.value
    cthulhuMythos.value = hydrateStore.settings.cthulhuMythos ?? cthulhuMythos.value
    peril.value = hydrateStore.settings.peril ?? peril.value
    daring.value = hydrateStore.settings.daring ?? daring.value
    showArcana.value = hydrateStore.settings.showArcana ?? showArcana.value
    cyberpunk.value = hydrateStore.settings.cyberpunk ?? cyberpunk.value
    technofantasy.value = hydrateStore.settings.technofantasy ?? technofantasy.value
    showFear.value = hydrateStore.settings.showFear ?? showFear.value
    showAlienation.value = hydrateStore.settings.showAlienation ?? showAlienation.value
    showCybernetics.value = hydrateStore.settings.showCybernetics ?? showCybernetics.value
    useFortune.value = hydrateStore.settings.useFortune ?? useFortune.value,
    userPowerFatigue.value = hydrateStore.settings.userPowerFatigue ?? userPowerFatigue.value
  };

  return {
    encumbrancePenalty,
    gameSystem,
    campaignMode,
    color,
    nameInRoll,
    whisperRollsGM,
    whisperRollsGMToggle,
    aimToggle,
    aimValue,
    aim,
    guardToggle,
    guardValue,
    guard,
    rerollStunt,
    reroll,
    initiativeTiebreaker,
    armorPenalty,
    sheetView,
    showXP,
    cthulhuMythos,
    peril,
    daring,
    showArcana,
    cyberpunk,
    technofantasy,
    showFear,
    showAlienation,
    showCybernetics,
    useFortune,
    userPowerFatigue,
    dehydrate,
    hydrate,
  };
});
