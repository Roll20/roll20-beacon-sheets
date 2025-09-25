import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useAbilityScoreStore } from '@/sheet/stores/abilityScores/abilityScoresStore';
import levelTable from '@/system/levelTable';
import rollToChat from '@/utility/rollToChat';
import sendToChat from '@/utility/sendToChat';
import type { ComputedRef } from 'vue';
import { useInventoryStore } from '@/sheet/stores/inventory/inventoryStore';
import getRollResult from '@/utility/getRollResult';
import { useBioStore } from '../bio/bioStore';
import { useSettingsStore } from '../settings/settingsStore';
import { useMetaStore } from '../meta/metaStore';

export type CharacterHydrate = {
  character: {
    title: string;
    xp: number;
    lifeCurrent: number;
    heroDiceCurrent: number;
    manaCurrent: number;
    defenseMod: number;
    speed:number;
    armor:number;
    stunts:number;
    health: number;
    healthMax: number;
    magic: number;
    magicMax: number;
    weaponGroups:string;
    peril:number;
    daring:number;
    fortuneInjured:boolean;
    fortuneWounded:boolean;
    fatigue?: number;
    toughnessPrimary?: string | null;
    powerFatigue?: number;
  };
};

export type Level = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20;

export const useCharacterStore = defineStore('character', () => {
  const abilityScoresStore = useAbilityScoreStore();
  const inventory = useInventoryStore();
  const settings = useSettingsStore();
  //@ts-ignore
  const level: ComputedRef<Level> = computed(
    () =>
      Object.values(levelTable)
        .reverse()
        .find((level) => level?.xp <= xp.value)?.level || 0,
  );
  const xp = ref(0);
  // Example of auto-calculated field. These don't need to be saved into firebase and should handled internally in the app whenever.
  // Formula for HP is the one indicated by level table + level multiplied by endurance + arbitrary life modifier.
  // const lifeMax = computed(
  //   () =>
  //     levelTable[level.value].life + level.value * abilityScoresStore.EnduranceBase + lifeMod.value,
  // );
  
  // const manaMax = computed(
  //   () =>
  //     levelTable[level.value].mana + level.value * abilityScoresStore.ThoughtBase + manaMod.value,
  // );
  const profBonus: ComputedRef<number> = computed(() => levelTable[level.value].profBonus);
  const defenseMod = ref(0);
  const speed = ref(0);
  const armor = ref(0);
  const stunts = ref(0);

  const health = ref(0);
  const healthMax = ref(0);
  const magic = ref(0);
  const magicMax = ref(0);
  const weaponGroups = ref('');
  // const defense = computed(
  //   () =>
  //     8 +
  //     abilityScoresStore.AgilityCurrent +
  //     defenseMod.value +
  //     profBonus.value +
  //     (inventory.equippedArmor?.defenseMod || 0),
  // );
  const fortuneInjured = ref(false);
  const fortuneWounded = ref(false);
  const fatigue = ref(0);

  const peril = ref(0);
  const daring = ref(0);
  const powerFatigue = ref(0);
  const toughnessPrimary = ref('');
  const toughnessLevelMod = ref(0);
  const defenseLevelMod = ref(0);
  const gameModeBonus = () => {
    if(settings.gameSystem !== 'mage') return;
    switch (useSettingsStore().campaignMode) {  
    case 'cinematic':
      if(level.value < 4){
        toughnessLevelMod.value = 0;
        defenseLevelMod.value = 0;
      }
      if(level.value >= 4){
        toughnessLevelMod.value = 1;
        defenseLevelMod.value = 1;
      } if(level.value >= 8){
        toughnessLevelMod.value = 2;
        defenseLevelMod.value = 2;
      } if(level.value >= 12){
        toughnessLevelMod.value = 3;
        defenseLevelMod.value = 3;
      } if(level.value >= 16){
        toughnessLevelMod.value = 4;
        defenseLevelMod.value = 4;
      } if(level.value >= 20){
        toughnessLevelMod.value = 5;
        defenseLevelMod.value = 5;
      } 
      break;
    case 'pulpy':
      if(level.value < 4){
        toughnessLevelMod.value = 0;
        defenseLevelMod.value = 0;
      }
      if(level.value >= 4){
        toughnessLevelMod.value = toughnessPrimary.value === 'toughness' && !toughnessPrimary.value ? 1 : 0;
        defenseLevelMod.value = toughnessPrimary.value === 'defense' ? 1 : 0;
      } 
      if(level.value >= 8){
        toughnessLevelMod.value = toughnessPrimary.value === 'toughness' && !toughnessPrimary.value ? 2 : 0;
        defenseLevelMod.value = toughnessPrimary.value === 'defense' ? 2 : 0;
      } 
      if(level.value >= 12){
        toughnessLevelMod.value = toughnessPrimary.value === 'toughness' && !toughnessPrimary.value ? 3 : 0;
        defenseLevelMod.value = toughnessPrimary.value === 'defense' ? 3 : 0;
      } 
      if(level.value >= 16){
        toughnessLevelMod.value = toughnessPrimary.value === 'toughness' && !toughnessPrimary.value ? 4 : 0;
        defenseLevelMod.value = toughnessPrimary.value === 'defense' ? 4 : 0;
      } 
      if(level.value >= 20){
        toughnessLevelMod.value = toughnessPrimary.value === 'toughness' && !toughnessPrimary.value ? 5 : 0;
        defenseLevelMod.value = toughnessPrimary.value === 'defense' ? 5 : 0;
      }
      break;
    case 'gritty':
      toughnessLevelMod.value = 0;
      defenseLevelMod.value = 0;
      break;
    default:
      toughnessLevelMod.value = 0;
      defenseLevelMod.value = 0;
      break;
    }
  };
  const levelUp = () => {
    const newLevel:number = Number(level.value+1);
    // @ts-ignore
    xp.value = levelTable[newLevel].xp
    gameModeBonus();
  }
  const levelDown = () => {
    const newLevel:number = Number(level.value-1)
    // @ts-ignore
    xp.value = levelTable[newLevel].xp
    gameModeBonus();
  }
  const levelSet = (newLevel:number)=> {
    // @ts-ignore
    xp.value = levelTable[newLevel].xp
    gameModeBonus();
  }
  
  const resetStunts = () => {
    stunts.value = 0;
  }
  const resetPowerFatigue = () => {
    powerFatigue.value = 0;
  }  

  const dehydrate = () => {
    return {
      character: {
        xp: xp.value,
        defenseMod: defenseMod.value,
        speed: speed.value,
        armor: armor.value,
        stunts: stunts.value,
        health: health.value,
        healthMax: healthMax.value,
        magic: magic.value,
        magicMax: magicMax.value,
        weaponGroups: weaponGroups.value,
        peril:peril.value,
        daring:daring.value,
        fortuneInjured:fortuneInjured.value,
        fortuneWounded:fortuneWounded.value,
        fatigue: fatigue.value,
        toughnessPrimary: toughnessPrimary.value,
        powerFatigue: powerFatigue.value,
        // We don't need to save the computed ones on Firebase as long as we have everything needed to calculate them.
      },
    };
  };

  const hydrate = (hydrateStore: CharacterHydrate) => {
    // Should only need to hydrate the same attributes as in "dehydrate".
    xp.value = hydrateStore.character.xp ?? xp.value;
    defenseMod.value = hydrateStore.character.defenseMod ?? defenseMod.value;
    speed.value = hydrateStore.character.speed ?? speed.value;
    armor.value = hydrateStore.character.armor ?? armor.value;
    stunts.value = hydrateStore.character.stunts ?? stunts.value;
    health.value = hydrateStore.character.health ?? health.value;
    healthMax.value = hydrateStore.character.healthMax ?? healthMax.value;
    magic.value = hydrateStore.character.magic ?? magic.value;
    magicMax.value = hydrateStore.character.magicMax ?? magicMax.value;
    weaponGroups.value = hydrateStore.character.weaponGroups ?? weaponGroups.value;
    peril.value = hydrateStore.character.peril ?? peril.value;
    daring.value = hydrateStore.character.daring ?? daring.value;
    fortuneInjured.value = hydrateStore.character.fortuneInjured ?? fortuneInjured.value;
    fortuneWounded.value = hydrateStore.character.fortuneWounded ?? fortuneWounded.value;
    fatigue.value = hydrateStore.character.fatigue ?? fatigue.value;
    toughnessPrimary.value = hydrateStore.character.toughnessPrimary ?? toughnessPrimary.value;
    powerFatigue.value = hydrateStore.character.powerFatigue ?? powerFatigue.value;
  };

  // Posts a message to chat with the "chat" template.
  const heroDiceFailure = async (title: string): Promise<void> => {
    await sendToChat({
      title,
      subtitle: 'Failure!',
      textContent: "Uh Oh! You've run out of Hero Dice!!",
    });
  };

  const rollAttack = async () => {
    const abilityScoreStore = useAbilityScoreStore();
    const weapon = useInventoryStore().equippedWeapon;
    const weaponName = weapon?.name;
    const weaponAbilityScore = weapon?.abilityScore || 'Strength';
    const attackBonus = abilityScoreStore.abilityScores[`${weaponAbilityScore}`].base;
    const [diceAmount, diceSides] = (weapon?.damage || '1d3').split('d');
    const { total: damage } = await getRollResult([
      { count: Number(diceAmount), sides: Number(diceSides) },
      { label: 'Prof Bonus', value: profBonus.value },
    ]);
    await rollToChat({
      title: `Attack Using ${weaponAbilityScore} ${weaponName ? 'With ' + weaponName : ''}`,
      keyValues: { Actions: 1, Damage: damage.toString() },
      traits: ['Attack'],
      components: [
        { label: `Base Roll`, sides: 20 },
        { label: `${weaponAbilityScore} Bonus`, value: attackBonus },
        { label: 'Proficiency', value: profBonus.value },
      ],
    });
  };

  const rollPowerFatigueTest = async (powerCost:number, focus:number) => {
    const ability = useAbilityScoreStore();
    const halfPower = Math.floor(powerCost/2);
    const components = [
      { label: `Base Roll`, sides: 6, count:3, alwaysShowInBreakdown: true },
      { label: 'Willpower', value: ability.WillpowerBase },
      { label: 'Focus', value: focus ? focus : 0 },
    ];    
    await rollToChat({
      characterName: useMetaStore().name,
      title: '',
      subtitle: 'Power Fatigue Test',
      rollType:'powerFatigue',
      targetNumber: 9 + halfPower,
      components
    });
  };
  // const rollSpell = async () => {
  //   const abilityScoreStore = useAbilityScoreStore();
  //   // const thought = abilityScoreStore.ThoughtCurrent;
  //   const [diceAmount, diceSides] = (`3d6` || '1d3').split('d');
  //   const { total: damage } = await getRollResult([
  //     { count: Number(diceAmount), sides: Number(diceSides) },
  //     { label: 'Prof Bonus', value: profBonus.value },
  //   ]);
  //   await rollToChat({
  //     title: `Casting Spell`,
  //     keyValues: { Actions: 1, Damage: damage.toString() },
  //     traits: ['Spell'],
  //     allowHeroDie: true,
  //     components: [
  //       { label: `Base Roll`, sides: 6 },
  //       // { label: 'Stat Mod', value: thought },
  //       { label: 'Proficiency', value: profBonus.value },
  //     ],
  //   });
  // };

  return {
    level,
    xp,
    defenseMod,
    speed,
    armor,
    profBonus,
    stunts,
    // defense,
    rollAttack,
    // rollSpell,
    levelUp,
    levelDown,
    levelSet,
    health,
    healthMax,
    magic,
    magicMax,
    weaponGroups,
    peril,
    daring,
    resetStunts,
    fatigue,
    fortuneInjured,
    fortuneWounded,
    powerFatigue,
    resetPowerFatigue,
    dehydrate,
    hydrate,
    toughnessPrimary,
    toughnessLevelMod,
    defenseLevelMod,
    gameModeBonus,
    rollPowerFatigueTest
  };
});

/* After any Ability Roll you can choose to spend 1 hero die to roll 1d6 and add it to the total.
 * Follow-up Rolls need to be defined outside of the Store since it may not be available when clicking on the button
 *  */
export const addToStunts = (props: any,stunts:number) => {
  if(stunts){
    const stuntPoints = useCharacterStore().stunts;
  const currentStuntPoints = props?.character?.attributes?.character?.character?.stunts || 0;
  props.dispatch.update({
    character: {
      id: props.character.id,
      attributes: {
        character: {
          character: {
            stunts: stuntPoints + stunts,
          },
        },
      },
    },
  });
  }
  
  
}