import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { ComputedRef, Ref } from 'vue';
import { arrayToObject, objectToArray } from '@/utility/objectify';
import { v4 as uuidv4 } from 'uuid';
import sendToChat from '@/utility/sendToChat';
import rollToChat from '@/utility/rollToChat';
import { useSettingsStore } from '@/sheet/stores/settings/settingsStore';
import { useMetaStore } from '@/sheet/stores/meta/metaStore';
import { useAbilityScoreStore } from '../abilityScores/abilityScoresStore';
import { useCharacterStore } from '../character/characterStore';
import { powerFatiguePenalty } from '@/utility/arcanaPower';

interface Spell {
  _id: string;
  name: string;
  arcanaType: string;
  requirements: string;
  shortDescription: string;
  description: string;
  ability: string;
  abilityFocus?: string;
  spellType: string;
  spellTypeBonus: number;
  mpCost: number;
  castingTime: string;
  targetNumber: number;
  spellTest: string;
  testSuccess?: string;
  testFailure?: string;
  extendable: boolean;
  conditions?: string;
  damageHit: string;
  damageMiss: string;
  damageQualities?: string;
  fatigue?: number;
  resistance?: string;
}

export type SpellsHydrate = {
  spells: {
    spells: Record<string, Spell>;
  };
};

export const useSpellStore = defineStore('spells', () => {
  const spells: Ref<Array<Spell>> = ref([]);
  const spellsCount: ComputedRef<number> = computed(() => spells.value.length);
  let selectedSpell = {};

  const addSpell = (spell?: any) => {
    const newSpell = {
      _id: uuidv4(),
      name: spell ? spell?.name : '',
      arcanaType: spell ? spell?.arcanaType : '',
      requirements: spell ? spell?.requirements : '',
      shortDescription: spell ? spell?.shortDescription : '',
      description: spell ? spell?.description : '',
      ability: spell ? spell?.ability : '',
      abilityFocus: spell ? spell?.abilityFocus : '',
      spellType: spell ? spell?.spellType : '',
      spellTypeBonus: spell ? spell?.spellTypeBonus : 0,
      mpCost: spell ? spell?.mpCost : 0,
      castingTime: spell ? spell?.castingTime : '',
      targetNumber: spell ? spell?.targetNumber : 0,
      spellTest: spell ? spell?.spellTest : '',
      testSuccess: spell ? spell?.testSuccess : '',
      testFailure: spell ? spell?.testFailure : '',
      spellResistance: spell ? spell?.spellResistance : '',
      extendable: spell ? spell?.extendable : false,
      conditions: spell ? spell?.conditions : '',
      damageHit: spell ? spell?.damageHit : '',
      damageMiss: spell ? spell?.damageMiss : '',
	  damageQualities: spell ? spell?.damageQualities : '',
    };

    if (spell?.fatigue) {
      Object.assign(newSpell, { fatigue: spell.fatigue });
    }

    spells.value.push(newSpell);
  };

  const removeSpell = (_id: string) => {
    const indexToRemove = spells.value.findIndex((spells) => spells._id === _id);
    if (indexToRemove >= 0) spells.value.splice(indexToRemove, 1);
  };

  const printSpell = async (_id: string, bonus?: number, familiarity: number = 0) => {
    const settings = useSettingsStore();
    const spell = spells.value.find((item) => item._id === _id);
    if (!spell) return;

    const components: any[] = [
      { label: `Base Roll`, sides: 6, count: 3, alwaysShowInBreakdown: true },
      { label: spell.ability, value: Number(bonus) },
    ];

    if (useSettingsStore().aim) {
      components.push(
        { label: 'Aim', value: useSettingsStore().aimValue }
      );
    }

    if (powerFatiguePenalty.value > 0 && settings.userPowerFatigue) {
      components.push({ label: 'Power Fatigue', value: powerFatiguePenalty.value * -1 });
    }

    if (settings.gameSystem !== 'blue rose' && !settings.userPowerFatigue) {
      spendMP(spell.mpCost);
    }

    const ability = useAbilityScoreStore();
    const spellResistance = settings.gameSystem === 'blue rose'
      ? spell.spellTest
      : 'Spellpower (' + (10 + Number(ability.WillpowerBase)) + ')';
    const spellTest = settings.gameSystem === 'blue rose'
      ? spell.ability + ` (${spell.abilityFocus}) <br /> vs. ${spellResistance}`
      : '';

    await rollToChat({
      title: spell.name,
      subtitle: spell.spellType,
      characterName: useMetaStore().name,
      textContent: spellTest,
      keyValues: {
        ...(spell.conditions ? { Conditions: spell.conditions } : {}),
      },
      targetNumber: spell.targetNumber + familiarity,
      components
    });
  };

  const printSpellDamage = async (spell: any) => {
    const diceRegex = /^\s*(?:\[\[)?(\d+)d(\d+)([+-]\d+)?(?:\]\])?(?:\s+(.+))?\s*$/;
    const hit = spell.damageHit?.match(diceRegex);

    if (!hit) return;

    const settings = useSettingsStore();
    const ability = useAbilityScoreStore();
    const resistanceTargetLabel = settings.gameSystem === 'mage' ? 'Force' : 'Spellpower';
    const resistanceTarget = 10 + Number(ability.WillpowerBase);
    const damageNote = hit[4] || '';

    const components = [
      { label: `Base Roll`, sides: parseInt(hit[2]), count: parseInt(hit[1]), alwaysShowInBreakdown: true },
      { label: 'Modifier', value: hit[3] ? parseInt(hit[3]) : 0 },
    ];

    await rollToChat({
      characterName: useMetaStore().name,
      title: spell.name,
      rollType: 'damage',
      keyValues: {
        ...(damageNote ? { 'Damage Type': damageNote } : {}),
		...(spell.damageQualities ? { 'Damage Qualities': spell.damageQualities } : {}),
        ...(spell.damageMiss ? { 'Failure Damage': spell.damageMiss } : {}),
        ...(spell.spellTest ? { 'Resistance Test': `${spell.spellTest} vs. ${resistanceTargetLabel} (${resistanceTarget})` } : {}),
        ...(spell.testSuccess ? { 'Successful Result': spell.testSuccess } : {}),
        ...(spell.testFailure ? { 'Failure Result': spell.testFailure } : {}),
        ...(spell.conditions ? { Conditions: spell.conditions } : {}),
      },
      components
    });
  };

  const printSpellDetails = async (spell: any, arcanaLabel: string) => {
    await sendToChat({
      title: spell.name,
      subtitle: spell.arcanaType,
      traits: [
        arcanaLabel + ' Type: ' + spell.arcanaType,
        spell.conditions ? 'Conditions: ' + spell.conditions : '',
      ].filter(Boolean),
      description: spell.description,
    });
  };

  const setCurrentSpell = (_id: string) => {
    const spell = spells.value.find((item) => item._id === _id);
    if (!spell) return;
    selectedSpell = spell;
  };

  const spendMP = (mp: number) => {
    const char = useCharacterStore();
    char.magic -= mp;
  };

  const dehydrate = () => {
    return {
      spells: {
        spells: arrayToObject(spells.value),
      },
    };
  };

  const hydrate = (hydrateStore: SpellsHydrate) => {
    spells.value = objectToArray(hydrateStore.spells?.spells) || spells.value;
  };

  return {
    spells,
    spellsCount,
    selectedSpell,

    addSpell,
    removeSpell,
    printSpell,
    printSpellDamage,
    printSpellDetails,
    setCurrentSpell,

    dehydrate,
    hydrate,
  };
});
