import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import sendToChat from '@/utility/sendToChat';

export type CharacterHydrate = {
  character: {
    player: string;
    age: string;
    origin: string;
    occupation: string;
    experience: string;
    description: string;
    color: string;
    healthCondition: number;
    stamina: number;
    survival: number;
    mentalResistance: string;
    quest: string;
    ascensionPoints: string;
    act1: string;
    act2: string;
    act3: string;
    ascensionGauge: number;
  };
};

export const useCharacterStore = defineStore('character', () => {
  const player = ref('');
  const age = ref('');
  const origin = ref('');
  const occupation = ref('');
  const experience = ref('');
  const description = ref('');
  const color = ref('');
  const healthCondition = ref(1);
  const stamina = ref(0);
  const survival = ref(0);
  const mentalResistance = ref('');

  // Ascension-related properties
  const quest = ref('');
  const ascensionPoints = ref('');
  const act1 = ref('');
  const act2 = ref('');
  const act3 = ref('');
  const ascensionGauge = ref(0);

  // Check whether the health radio button is checked
  const isHealthChecked = computed(() => (value: number) => {
    return healthCondition.value >= value;
  });

  const setHealth = (value: number) => {
    healthCondition.value = value;
  };

  // Check whether the ascension gauge radio button is checked
  const isAscensionChecked = computed(() => (value: number) => {
    return ascensionGauge.value >= value;
  });

  const setAscensionGauge = (value: number) => {
    ascensionGauge.value = value;
  };

  const dehydrate = () => {
    return {
      character: {
        player: player.value,
        age: age.value,
        origin: origin.value,
        occupation: occupation.value,
        experience: experience.value,
        description: description.value,
        color: color.value,
        healthCondition: healthCondition.value,
        stamina: stamina.value,
        survival: survival.value,
        mentalResistance: mentalResistance.value,
        quest: quest.value,
        ascensionPoints: ascensionPoints.value,
        act1: act1.value,
        act2: act2.value,
        act3: act3.value,
        ascensionGauge: ascensionGauge.value,
        // We don't need to save the computed ones on Firebase as long as we have everything needed to calculate them.
      },
    };
  };

  const hydrate = (hydrateStore: CharacterHydrate) => {
    // Should only need to hydrate the same attributes as in "dehydrate".
    player.value = hydrateStore.character.player ?? player.value;
    age.value = hydrateStore.character.age ?? age.value;
    origin.value = hydrateStore.character.origin ?? origin.value;
    occupation.value = hydrateStore.character.occupation ?? occupation.value;
    experience.value = hydrateStore.character.experience ?? experience.value;
    description.value = hydrateStore.character.description ?? description.value;
    color.value = hydrateStore.character.color ?? color.value;
    healthCondition.value = hydrateStore.character.healthCondition ?? healthCondition.value;
    stamina.value = hydrateStore.character.stamina ?? stamina.value;
    survival.value = hydrateStore.character.survival ?? survival.value;
    mentalResistance.value = hydrateStore.character.mentalResistance ?? mentalResistance.value;
    quest.value = hydrateStore.character.quest ?? quest.value;
    ascensionPoints.value = hydrateStore.character.ascensionPoints ?? ascensionPoints.value;
    act1.value = hydrateStore.character.act1 ?? act1.value;
    act2.value = hydrateStore.character.act2 ?? act2.value;
    act3.value = hydrateStore.character.act3 ?? act3.value;
    ascensionGauge.value = hydrateStore.character.ascensionGauge ?? ascensionGauge.value;
  };

  // Posts a message to chat with the "chat" template.
  const heroDiceFailure = async (title: string): Promise<void> => {
    await sendToChat({
      title,
      subtitle: 'Failure!',
      textContent: "Uh Oh! You've run out of Hero Dice!!",
    });
  };

  const rollHealthScore = () => {
    const healthValue = healthCondition.value;
    if (healthValue >= 15) {
      return 3;
    } else if (healthValue >= 11) {
      return 2;
    } else if (healthValue >= 6) {
      return 1;
    } else {
      return 0;
    }
  };

  // const rollHeroDiceLife = async () => {
  //   const title = 'Hero Dice Healing';
  //   if (!heroDiceCurrent.value) return heroDiceFailure(title);
  //   const result = await rollToChat({
  //     title,
  //     subtitle: 'Heal by total',
  //     keyValues: { Actions: 1, Cost: '1 Hero Die' },
  //     traits: ['Heroic'],
  //     components: [{ label: 'Hero Die', sides: 6 }],
  //   });
  //   heroDiceCurrent.value--;
  // };
  // const rollHeroDiceMana = async () => {
  //   const title = 'Hero Dice Healing';
  //   if (!heroDiceCurrent.value) return heroDiceFailure(title);
  //   const result = await rollToChat({
  //     title,
  //     subtitle: 'Recover Mana by total',
  //     keyValues: { Actions: 1, Cost: '1 Hero Die' },
  //     traits: ['Heroic'],
  //     components: [{ label: 'Hero Die', sides: 6 }],
  //   });
  //   manaCurrent.value = Math.min(manaCurrent.value + result);
  //   heroDiceCurrent.value--;
  // };

  // const rollHeroDiceRaw = async () => {
  //   const title = 'Hero Die';
  //   if (!heroDiceCurrent.value) return heroDiceFailure(title);
  //   await rollToChat({
  //     title: 'Rolling 1 Hero Die',
  //     keyValues: { Actions: 1, Cost: '1 Hero Die' },
  //     traits: ['Heroic'],
  //     components: [{ label: 'Hero Die', sides: 6 }],
  //   });
  //   heroDiceCurrent.value--;
  // };

  // const rollAttack = async () => {
  //   const waysScores = useWaysStore().waysScores;
  //   const weapon = useInventoryStore().equippedWeapon;
  //   const weaponName = weapon?.name;
  //   const weaponAbilityScore = weapon?.waysScore || 'Combativeness';
  //   const [diceAmount, diceSides] = (weapon?.damage || '1d3').split('d');
  //   const { total: damage } = await getRollResult([
  //     { count: Number(diceAmount), sides: Number(diceSides) },
  //     { label: 'Prof Bonus', value: profBonus.value },
  //   ]);
  //   await rollToChat({
  //     title: `Attack Using ${weaponAbilityScore} ${weaponName ? 'With ' + weaponName : ''}`,
  //     keyValues: { Actions: 1, Damage: damage.toString() },
  //     traits: ['Attack'],
  //     allowHeroDie: true,
  //     components: [
  //       { label: `Base Roll`, sides: 20 },
  //       { label: `${weaponAbilityScore} Bonus`, value: 0 },
  //       { label: 'Proficiency', value: profBonus.value },
  //     ],
  //   });
  // };

  // const rollSpell = async () => {
  //   const waysScores = useWaysStore().waysScores;
  //   const thought = waysScores.Combativeness;
  //   const [diceAmount, diceSides] = (`${thought}d6` || '1d3').split('d');
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
  //       { label: `Base Roll`, sides: 20 },
  //       { label: 'Stat Mod', value: thought },
  //       { label: 'Proficiency', value: profBonus.value },
  //     ],
  //   });
  // };

  return {
    player,
    age,
    origin,
    occupation,
    experience,
    description,
    color,
    healthCondition,
    stamina,
    survival,
    mentalResistance,
    isHealthChecked,
    setHealth,
    quest,
    ascensionPoints,
    act1,
    act2,
    act3,
    ascensionGauge,
    isAscensionChecked,
    setAscensionGauge,
    rollHealthScore,
    dehydrate,
    hydrate,
  };
});

/* After any Ability Roll you can choose to spend 1 hero die to roll 1d6 and add it to the total.
 * Follow-up Rolls need to be defined outside of the Store since it may not be available when clicking on the button
 *  */
// export const addHeroDie = async (props: any, originalResult: number, originalTitle: string) => {
//   // This follow-up roll subtracts 1 hero die then adds the result of 1d6 to the previous roll and re-posts the new total.
//   const heroDiceCurrent = props?.character?.attributes?.character?.character?.heroDiceCurrent || -1;
//   if (heroDiceCurrent < 0) {
//     await sendToChat(
//       {
//         title: `Adding Hero Dice: ${originalTitle}`,
//         subtitle: 'Failure!',
//         textContent: "Uh Oh! You've run out of Hero Dice!!",
//       },
//       props.dispatch,
//     );
//     return;
//   }
//   await rollToChat(
//     {
//       title: `Adding Hero Dice: ${originalTitle}`,
//       subtitle: 'New Total',
//       allowHeroDie: false,
//       components: [
//         { label: `Original Roll`, value: originalResult },
//         { label: 'Hero Die', sides: 6 },
//       ],
//     },
//     props.dispatch,
//   );

//   // Since we can not access the Pinia store to update the store's value, we need to handle updating the values through the relay.
//   props.dispatch.update({
//     character: {
//       id: props.character.id,
//       attributes: {
//         character: {
//           character: {
//             heroDiceCurrent: heroDiceCurrent - 1,
//           },
//         },
//       },
//     },
//   });
// };
