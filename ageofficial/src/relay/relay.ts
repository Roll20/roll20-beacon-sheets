import {
  initRelay,
  type Character,
  type CompendiumDragDropData,
  type Dispatch,
  type Settings,
  type UpdateArgs,
} from '@roll20-official/beacon-sdk';
import { debounce } from 'lodash';
import type { PiniaPluginContext } from 'pinia';

import {
  onInit,
  onChange,
  onSettingsChange,
  onSharedSettingsChange,
  onTranslationsRequest,
  onDragOver,
  onDropOver,
} from './handlers/handlers';
import { reactive, ref, watch, nextTick, type Ref, type App, shallowRef } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import { addToStunts } from '@/sheet/stores/character/characterStore';

import { getAbilityScores, getBio, getMagicPoints, setMagic, getHealthPoints, setHealth, getStuntPoints, setStunts } from '@/relay/handlers/computed';
// import { DropArgs } from '@roll20-official/beacon-sdk/lib/types/types/dragAndDrop';
// import { initRelay } from '@roll20/beacon-sdk';

const dispatch = initRelay({
    handlers: {
        onInit: ({ character } ) => { 
          console.log('sheet character', character)
    //       const legacyChar = {
    // "name": "Bjordson1",
    // "attributes": {
    //     "public_roll": "Public Roll",
    //     "whisper_roll": "Whisper Roll",
    //     "whisper": "Whisper",
    //     "fighting_label": "Fighting",
    //     "income_label": "Income",
    //     "accuracy_label": "Accuracy",
    //     "communication_label": "Communication",
    //     "constitution_label": "Constitution",
    //     "dexterity_label": "Dexterity",
    //     "perception_label": "Perception",
    //     "strength_label": "Strength",
    //     "willpower_label": "Willpower",
    //     "intelligence_label": "Intelligence",
    //     "cunning_label": "Cunning",
    //     "none": "None",
    //     "plus_one_tn": "+1 TN",
    //     "power_cost_label": "Power Cost",
    //     "kanna_cost_label": "Kanna Cost",
    //     "fatigue_tn_label": "Fatigue TN",
    //     "price_tn_label": "Price TN",
    //     "ability": "Ability",
    //     "ability_value": "Ability Value (field 1 of 4)",
    //     "focus_value": "Focus (field 2 of 4)",
    //     "additional_modifier": "Additional modifier (field 3 of 4)",
    //     "additional_modifier2": "Additional modifier",
    //     "ability_score": "Ability Score",
    //     "roll_description": "Roll description (field 4 of 4, optional)",
    //     "die_roll": "Die Roll",
    //     "focus": "Focus",
    //     "magic_label": "Magic",
    //     "magic_arcana_focus": "Magic Arcana Focus",
    //     "spellcasting_ability": "Spellcasting Ability",
    //     "psychic_ability": "Psychic Ability",
    //     "ability_focus": "Ability Focus",
    //     "arcana_focus": "Arcana Focus",
    //     "psychic_focus": "Psychic Focus",
    //     "fatigue_check_for": "Fatigue Check for",
    //     "price_check_for": "Price Check for",
    //     "each_fatiguing_spell": "Each Fatiguing spell this Encounter",
    //     "fear_label": "Fear",
    //     "armor_penalty": "Armor Penalty",
    //     "initiative_adjustment": "Initiative Adjustment",
    //     "initiative": "Initiative",
    //     "resources_label": "Resources",
    //     "attack_bonus_label": "Attack Bonus",
    //     "spellpower_label": "Spellpower",
    //     "initiative-toggle": 1,
    //     "fear-toggle": 0,
    //     "horror-toggle": 0,
    //     "power-list-toggle": 1,
    //     "talent-list-toggle": 1,
    //     "equipment-toggle": 1,
    //     "game": "fantasy-age-core",
    //     "health-fortune-toggle": 0,
    //     "mana-toggle": 1,
    //     "fatigue-toggle": 0,
    //     "exp-toggle": 1,
    //     "conviction-toggle": 0,
    //     "corruption-toggle": 0,
    //     "ammo-toggle": 1,
    //     "spell-list-toggle": 1,
    //     "money-toggle": 1,
    //     "income-toggle": 0,
    //     "conditions-toggle": 1,
    //     "color": "green",
    //     "defense_value": 13,
    //     "speed_value": 9,
    //     "tab": "1",
    //     "wtype": "@{whisper-toggle}",
    //     "aim-select": "@{aim-toggle}",
    //     "class": "Warrior",
    //     "health": 149,
    //     "Untitled": "",
    //     "mana": "",
    //     "level": "4",
    //     "race": "Orc",
    //     "social-class": "Middle",
    //     "background": "Soldier",
    //     "specialization1": "Berserker",
    //     "whisper-toggle": "0",
    //     "accuracy": "1",
    //     "communication": "0",
    //     "constitution": "4",
    //     "dexterity": "2",
    //     "fighting": "4",
    //     "strength": "2",
    //     "willpower": "2",
    //     "repeating_power_-Nc5GbtAKm6rqAhZ4xbQ_powertype": "Warrior",
    //     "repeating_talent_-Nc5GgUZXcYwNa8cKBWu_talentdescription": "Armor Training",
    //     "repeating_talent_-Nc5Gpm71VXxr2x2sSbb_talentdescription": "Dual Weapon",
    //     "repeating_talent_-Nc5GyQOZPMxbLusQUQd_talentdescription": "Weapon and Shield",
    //     "repeating_strength-focus_-Nc5HZZoW22N-SBt9NkT_focusname": "Intimidation",
    //     "repeating_strength-focus_-Nc5HZZoW22N-SBt9NkT_focusdescription": "+2 to intimidation strength checks",
    //     "repeating_constitution-focus_-Nc5Hnp16bZL8n5zG9Ks_focusname": "Stamina",
    //     "repeating_constitution-focus_-Nc5Hnp16bZL8n5zG9Ks_focusdescription": "+2 to Endure Fatigue, Disease, and Privation",
    //     "languages": "Orc, Common",
    //     "eyes": "Brown",
    //     "skin": "Ruddy Green",
    //     "hair": "Black with small streaks of grey/white ",
    //     "repeating_talent_-Nc5GgUZXcYwNa8cKBWu_powername": "Armor Training",
    //     "repeating_talent_-Nc5Gpm71VXxr2x2sSbb_powername": "Dual Weapon",
    //     "repeating_talent_-Nc5GyQOZPMxbLusQUQd_powername": "Weapon and Shield",
    //     "repeating_attack-list_-Nc5IkCVdDFbVhRJyqry_attack-name": "Battle Axe1",
    //     "armor": "8",
    //     "armor-penalty": "-3",
    //     "shield-bonus": "1",
    //     "primary_strength": "on",
    //     "primary_fighting": "on",
    //     "primary_dexterity": "on",
    //     "primary_constitution": "on",
    //     "repeating_attack-list_-Nc5IkCVdDFbVhRJyqry_attackroll": "+4",
    //     "repeating_attack-list_-Nc5IkCVdDFbVhRJyqry_attack-damage": "2d6+2",
    //     "repeating_attack-list_-Nc5JHiLAclh6o8VtRnC_attack-name": "Battle Axe2",
    //     "repeating_attack-list_-Nc5JHiLAclh6o8VtRnC_attackroll": "+4",
    //     "repeating_attack-list_-Nc5JHiLAclh6o8VtRnC_attack-damage": "2d6+1",
    //     "repeating_attack-list_-Nc5JOylYO7ZhueZK9LZ_attack-name": "2 Handed Sword",
    //     "repeating_attack-list_-Nc5JOylYO7ZhueZK9LZ_attack-damage": "3d6+2",
    //     "repeating_attack-list_-Nc5JOylYO7ZhueZK9LZ_attackroll": "+4",
    //     "repeating_power_-Nc5GbtAKm6rqAhZ4xbQ_powername": "Berserker Rage",
    //     "repeating_power_-Nc5GbtAKm6rqAhZ4xbQ_shortpowerdescription": "+2 Damage, +2 Willpower (Courage, Morale) -2 Defence, -2 Perception",
    //     "weapon-groups": "Brawling, Axes, Heavy Blades, Light Blades",
    //     "repeating_equipment_-Nc5K3HQBCcLtrsxn-yU_equipment-name": "Heavy Shield",
    //     "repeating_equipment_-Nc5K3HQBCcLtrsxn-yU_equipment-description": "+3 Defense",
    //     "gender": "Male",
    //     "height": "6'11\"",
    //     "weight": "285",
    //     "repeating_money_-Nc5KRQEVgBcfoVoQ8Am_moneyamount": "6",
    //     "repeating_money_-Nc5KRQEVgBcfoVoQ8Am_moneyname": "GP",
    //     "repeating_money_-Nc5KXBJEIUctiODNU2O_moneyname": "SP",
    //     "repeating_money_-Nc5KYfTaXZqaa0AyNt2_moneyname": "CP",
    //     "repeating_strength-focus_-Nc5OzuuqLCtaMfriieM_focusname": "Jumping",
    //     "repeating_strength-focus_-Nc5OzuuqLCtaMfriieM_focusdescription": "Springing and Leaping",
    //     "repeating_talent_-Nc5Gpm71VXxr2x2sSbb_talent1description": "+1 on Attack (OR) Defense till end of Encounter after activating as action",
    //     "repeating_talent_-Nc5Gpm71VXxr2x2sSbb_talent2description": "Perform Lightning Attack Stunt at 1SP less than normal. ",
    //     "repeating_talent_-Nc5Gpm71VXxr2x2sSbb_talent3description": "2nd Attack as minor action in round. No Stunt Points made by 2nd attack, only add half of Strength bonus. ",
    //     "repeating_talent_-Nc5Gpm71VXxr2x2sSbb_talentdegree": "3",
    //     "specialization1-degree": "Novice",
    //     "repeating_money_-Nc5KXBJEIUctiODNU2O_moneyamount": "6",
    //     "repeating_equipment_-NcFOii9dQfNB5SFBtKD_equipment-name": "breathing mucus",
    //     "repeating_equipment_-NcFOii9dQfNB5SFBtKD_equipment-description": "+1 Constitution swimming",
    //     "repeating_attack-list_-NdD7NA0sk4p-WcApyQA_attack-name": "Rage Battle Axe 1",
    //     "repeating_attack-list_-NdD7NA0sk4p-WcApyQA_attackroll": "+5",
    //     "repeating_attack-list_-NdD7NA0sk4p-WcApyQA_attack-damage": "3d6+4",
    //     "perception": "1",
    //     "repeating_perception-focus_-NeZkrJ6bFtya9lqIqPK_focusname": "search",
    //     "repeating_perception-focus_-NeZkrJ6bFtya9lqIqPK_focusdescription": "+2 to search checks\n",
    //     "repeating_talent_-NeZlhN-Hk9eBJQiKnoA_powername": "Berserker Rage",
    //     "repeating_talent_-NeZlhN-Hk9eBJQiKnoA_talentdescription": "+2 Damage, +2 Willpower (Courage, Morale) -2 Defense, -2 Perception",
    //     "repeating_talent_-NeZlhN-Hk9eBJQiKnoA_talent1description": "+2 Damage, +2 Willpower (Courage, Morale) -2 Defense, -2 Perception",
    //     "repeating_talent_-NeZlhN-Hk9eBJQiKnoA_talent2description": "add 1d6 to damage\n",
    //     "repeating_talent_-NeZlhN-Hk9eBJQiKnoA_talentdegree": "2",
    //     "character_notes": "When growing up, had a fraternal twin brother. Brother was notably smaller statured than the rest of us, and was usually the brunt of jokes, hazing, and abuse, which I was often viewed as his defender for, yet he developed a bit of a napoleon complex and would mouth off and fight anyone at the drop of a hat. The final time I attempted to protect him was when a small bandit group had stopped us on the edge of our village as they were making their way through the area. he mouthed off, fought back and was killed, and there was nothing I could do against the overwhelming odds. I vowed to not let that happen again, hence I joined the local soldiery. I became disenfranchised when it became obvious that military groups were not just used to protect the populous, but to instead use force on the less powerful. That is when I left and became a merc. I adopted the life and specialization of a berserker to lose myself in battle, and to do my best to protect all of those around me. \n\n(secret: I have also been secretly keeping tabs on the bandit group, especially their leader, in order to exact revenge. since the time of the bandit attack, the group had somewhat disolved, and the leaders of the group weaseled their way into positions of power in a mid sized town, and rule over it as a small corrupt court, taxing the locals to pay for their lifestyles. \n",
    //     "repeating_equipment_-NfDo08slIYWIMpysKGw_equipment-name": "Level 3 Defense Bonus",
    //     "repeating_equipment_-NfDo08slIYWIMpysKGw_equipment-description": "+1 Defense",
    //     "repeating_money_-Nc5KYfTaXZqaa0AyNt2_moneyamount": "50",
    //     "aim-toggle": "0",
    //     "repeating_attack-list_-NqAF8T13W5jQ3Qr7H3B_attack-name": "Rage Battle Axe 2",
    //     "repeating_attack-list_-NqAF8T13W5jQ3Qr7H3B_attackroll": "+5",
    //     "repeating_attack-list_-NqAF8T13W5jQ3Qr7H3B_attack-damage": "3d6+3",
    //     "helpless-select": "0"
    // },
    // "characterType": "",
    // "description": "",
    // "customMeta1": "",
    // "customMeta2": "",
    // "customMeta3": ""
    //       }           
          // character = {...character,...legacyChar}
          // Object.assign(character.attributes, {            
          //     "public_roll": "Public Roll",
          //     "whisper_roll": "Whisper Roll",
          //     "whisper": "Whisper",
          //     "fighting_label": "Fighting",
          //     "income_label": "Income",
          //     "accuracy_label": "Accuracy",
          //     "communication_label": "Communication",
          //     "constitution_label": "Constitution",
          //     "dexterity_label": "Dexterity",
          //     "perception_label": "Perception",
          //     "strength_label": "Strength",
          //     "willpower_label": "Willpower",
          //     "intelligence_label": "Intelligence",
          //     "cunning_label": "Cunning",
          //     "none": "None",
          //     "plus_one_tn": "+1 TN",
          //     "power_cost_label": "Power Cost",
          //     "kanna_cost_label": "Kanna Cost",
          //     "fatigue_tn_label": "Fatigue TN",
          //     "price_tn_label": "Price TN",
          //     "ability": "Ability",
          //     "ability_value": "Ability Value (field 1 of 4)",
          //     "focus_value": "Focus (field 2 of 4)",
          //     "additional_modifier": "Additional modifier (field 3 of 4)",
          //     "additional_modifier2": "Additional modifier",
          //     "ability_score": "Ability Score",
          //     "roll_description": "Roll description (field 4 of 4, optional)",
          //     "die_roll": "Die Roll",
          //     "focus": "Focus",
          //     "magic_label": "Magic",
          //     "magic_arcana_focus": "Magic Arcana Focus",
          //     "spellcasting_ability": "Spellcasting Ability",
          //     "psychic_ability": "Psychic Ability",
          //     "ability_focus": "Ability Focus",
          //     "arcana_focus": "Arcana Focus",
          //     "psychic_focus": "Psychic Focus",
          //     "fatigue_check_for": "Fatigue Check for",
          //     "price_check_for": "Price Check for",
          //     "each_fatiguing_spell": "Each Fatiguing spell this Encounter",
          //     "fear_label": "Fear",
          //     "armor_penalty": "Armor Penalty",
          //     "initiative_adjustment": "Initiative Adjustment",
          //     "initiative": "Initiative",
          //     "resources_label": "Resources",
          //     "attack_bonus_label": "Attack Bonus",
          //     "spellpower_label": "Spellpower",
          //     "initiative-toggle": 1,
          //     "fear-toggle": 0,
          //     "horror-toggle": 0,
          //     "power-list-toggle": 1,
          //     "talent-list-toggle": 1,
          //     "equipment-toggle": 1,
          //     "game": "fantasy-age-core",
          //     "health-fortune-toggle": 0,
          //     "mana-toggle": 1,
          //     "fatigue-toggle": 0,
          //     "exp-toggle": 1,
          //     "conviction-toggle": 0,
          //     "corruption-toggle": 0,
          //     "ammo-toggle": 1,
          //     "spell-list-toggle": 1,
          //     "money-toggle": 1,
          //     "income-toggle": 0,
          //     "conditions-toggle": 1,
          //     "color": "green",
          //     "defense_value": 13,
          //     "speed_value": 9,
          //     "tab": "1",
          //     "wtype": "@{whisper-toggle}",
          //     "aim-select": "@{aim-toggle}",
          //     "class": "Warrior",
          //     "health": 49,
          //     "Untitled": "",
          //     "mana": "",
          //     "level": "4",
          //     "race": "Orc",
          //     "social-class": "Middle",
          //     "background": "Soldier",
          //     "specialization1": "Berserker",
          //     "whisper-toggle": "0",
          //     "accuracy": "1",
          //     "communication": "0",
          //     "constitution": "4",
          //     "dexterity": "2",
          //     "fighting": "4",
          //     "strength": "2",
          //     "willpower": "2",
          //     "repeating_power_-Nc5GbtAKm6rqAhZ4xbQ_powertype": "Warrior",
          //     "repeating_talent_-Nc5GgUZXcYwNa8cKBWu_talentdescription": "Armor Training",
          //     "repeating_talent_-Nc5Gpm71VXxr2x2sSbb_talentdescription": "Dual Weapon",
          //     "repeating_talent_-Nc5GyQOZPMxbLusQUQd_talentdescription": "Weapon and Shield",
          //     "repeating_strength-focus_-Nc5HZZoW22N-SBt9NkT_focusname": "Intimidation",
          //     "repeating_strength-focus_-Nc5HZZoW22N-SBt9NkT_focusdescription": "+2 to intimidation strength checks",
          //     "repeating_constitution-focus_-Nc5Hnp16bZL8n5zG9Ks_focusname": "Stamina",
          //     "repeating_constitution-focus_-Nc5Hnp16bZL8n5zG9Ks_focusdescription": "+2 to Endure Fatigue, Disease, and Privation",
          //     "languages": "Orc, Common",
          //     "eyes": "Brown",
          //     "skin": "Ruddy Green",
          //     "hair": "Black with small streaks of grey/white ",
          //     "repeating_talent_-Nc5GgUZXcYwNa8cKBWu_powername": "Armor Training",
          //     "repeating_talent_-Nc5Gpm71VXxr2x2sSbb_powername": "Dual Weapon",
          //     "repeating_talent_-Nc5GyQOZPMxbLusQUQd_powername": "Weapon and Shield",
          //     "repeating_attack-list_-Nc5IkCVdDFbVhRJyqry_attack-name": "Battle Axe1",
          //     "armor": "8",
          //     "armor-penalty": "-3",
          //     "shield-bonus": "1",
          //     "primary_strength": "on",
          //     "primary_fighting": "on",
          //     "primary_dexterity": "on",
          //     "primary_constitution": "on",
          //     "repeating_attack-list_-Nc5IkCVdDFbVhRJyqry_attackroll": "+4",
          //     "repeating_attack-list_-Nc5IkCVdDFbVhRJyqry_attack-damage": "2d6+2",
          //     "repeating_attack-list_-Nc5JHiLAclh6o8VtRnC_attack-name": "Battle Axe2",
          //     "repeating_attack-list_-Nc5JHiLAclh6o8VtRnC_attackroll": "+4",
          //     "repeating_attack-list_-Nc5JHiLAclh6o8VtRnC_attack-damage": "2d6+1",
          //     "repeating_attack-list_-Nc5JOylYO7ZhueZK9LZ_attack-name": "2 Handed Sword",
          //     "repeating_attack-list_-Nc5JOylYO7ZhueZK9LZ_attack-damage": "3d6+2",
          //     "repeating_attack-list_-Nc5JOylYO7ZhueZK9LZ_attackroll": "+4",
          //     "repeating_power_-Nc5GbtAKm6rqAhZ4xbQ_powername": "Berserker Rage",
          //     "repeating_power_-Nc5GbtAKm6rqAhZ4xbQ_shortpowerdescription": "+2 Damage, +2 Willpower (Courage, Morale) -2 Defence, -2 Perception",
          //     "weapon-groups": "Brawling, Axes, Heavy Blades, Light Blades",
          //     "repeating_equipment_-Nc5K3HQBCcLtrsxn-yU_equipment-name": "Heavy Shield",
          //     "repeating_equipment_-Nc5K3HQBCcLtrsxn-yU_equipment-description": "+3 Defense",
          //     "gender": "Male",
          //     "height": "6'11\"",
          //     "weight": "285",
          //     "repeating_money_-Nc5KRQEVgBcfoVoQ8Am_moneyamount": "6",
          //     "repeating_money_-Nc5KRQEVgBcfoVoQ8Am_moneyname": "GP",
          //     "repeating_money_-Nc5KXBJEIUctiODNU2O_moneyname": "SP",
          //     "repeating_money_-Nc5KYfTaXZqaa0AyNt2_moneyname": "CP",
          //     "repeating_strength-focus_-Nc5OzuuqLCtaMfriieM_focusname": "Jumping",
          //     "repeating_strength-focus_-Nc5OzuuqLCtaMfriieM_focusdescription": "Springing and Leaping",
          //     "repeating_talent_-Nc5Gpm71VXxr2x2sSbb_talent1description": "+1 on Attack (OR) Defense till end of Encounter after activating as action",
          //     "repeating_talent_-Nc5Gpm71VXxr2x2sSbb_talent2description": "Perform Lightning Attack Stunt at 1SP less than normal. ",
          //     "repeating_talent_-Nc5Gpm71VXxr2x2sSbb_talent3description": "2nd Attack as minor action in round. No Stunt Points made by 2nd attack, only add half of Strength bonus. ",
          //     "repeating_talent_-Nc5Gpm71VXxr2x2sSbb_talentdegree": "3",
          //     "specialization1-degree": "Novice",
          //     "repeating_money_-Nc5KXBJEIUctiODNU2O_moneyamount": "6",
          //     "repeating_equipment_-NcFOii9dQfNB5SFBtKD_equipment-name": "breathing mucus",
          //     "repeating_equipment_-NcFOii9dQfNB5SFBtKD_equipment-description": "+1 Constitution swimming",
          //     "repeating_attack-list_-NdD7NA0sk4p-WcApyQA_attack-name": "Rage Battle Axe 1",
          //     "repeating_attack-list_-NdD7NA0sk4p-WcApyQA_attackroll": "+5",
          //     "repeating_attack-list_-NdD7NA0sk4p-WcApyQA_attack-damage": "3d6+4",
          //     "perception": "1",
          //     "repeating_perception-focus_-NeZkrJ6bFtya9lqIqPK_focusname": "search",
          //     "repeating_perception-focus_-NeZkrJ6bFtya9lqIqPK_focusdescription": "+2 to search checks\n",
          //     "repeating_talent_-NeZlhN-Hk9eBJQiKnoA_powername": "Berserker Rage",
          //     "repeating_talent_-NeZlhN-Hk9eBJQiKnoA_talentdescription": "+2 Damage, +2 Willpower (Courage, Morale) -2 Defense, -2 Perception",
          //     "repeating_talent_-NeZlhN-Hk9eBJQiKnoA_talent1description": "+2 Damage, +2 Willpower (Courage, Morale) -2 Defense, -2 Perception",
          //     "repeating_talent_-NeZlhN-Hk9eBJQiKnoA_talent2description": "add 1d6 to damage\n",
          //     "repeating_talent_-NeZlhN-Hk9eBJQiKnoA_talentdegree": "2",
          //     "character_notes": "When growing up, had a fraternal twin brother. Brother was notably smaller statured than the rest of us, and was usually the brunt of jokes, hazing, and abuse, which I was often viewed as his defender for, yet he developed a bit of a napoleon complex and would mouth off and fight anyone at the drop of a hat. The final time I attempted to protect him was when a small bandit group had stopped us on the edge of our village as they were making their way through the area. he mouthed off, fought back and was killed, and there was nothing I could do against the overwhelming odds. I vowed to not let that happen again, hence I joined the local soldiery. I became disenfranchised when it became obvious that military groups were not just used to protect the populous, but to instead use force on the less powerful. That is when I left and became a merc. I adopted the life and specialization of a berserker to lose myself in battle, and to do my best to protect all of those around me. \n\n(secret: I have also been secretly keeping tabs on the bandit group, especially their leader, in order to exact revenge. since the time of the bandit attack, the group had somewhat disolved, and the leaders of the group weaseled their way into positions of power in a mid sized town, and rule over it as a small corrupt court, taxing the locals to pay for their lifestyles. \n",
          //     "repeating_equipment_-NfDo08slIYWIMpysKGw_equipment-name": "Level 3 Defense Bonus",
          //     "repeating_equipment_-NfDo08slIYWIMpysKGw_equipment-description": "+1 Defense",
          //     "repeating_money_-Nc5KYfTaXZqaa0AyNt2_moneyamount": "50",
          //     "aim-toggle": "0",
          //     "repeating_attack-list_-NqAF8T13W5jQ3Qr7H3B_attack-name": "Rage Battle Axe 2",
          //     "repeating_attack-list_-NqAF8T13W5jQ3Qr7H3B_attackroll": "+5",
          //     "repeating_attack-list_-NqAF8T13W5jQ3Qr7H3B_attack-damage": "3d6+3",
          //     "helpless-select": "0"
          
          // })
      //     Object.assign(character.attributes, {
      //       "public_roll": "Public Roll",
      //       "whisper_roll": "Whisper Roll",
      //       "whisper": "Whisper",
      //       "fighting_label": "Fighting",
      //       "income_label": "Income",
      //       "accuracy_label": "Accuracy",
      //       "communication_label": "Communication",
      //       "constitution_label": "Constitution",
      //       "dexterity_label": "Dexterity",
      //       "perception_label": "Perception",
      //       "strength_label": "Strength",
      //       "willpower_label": "Willpower",
      //       "intelligence_label": "Intelligence",
      //       "cunning_label": "Cunning",
      //       "none": "None",
      //       "plus_one_tn": "+1 TN",
      //       "power_cost_label": "Power Cost",
      //       "kanna_cost_label": "Kanna Cost",
      //       "fatigue_tn_label": "Fatigue TN",
      //       "price_tn_label": "Price TN",
      //       "ability": "Ability",
      //       "ability_value": "Ability Value (field 1 of 4)",
      //       "focus_value": "Focus (field 2 of 4)",
      //       "additional_modifier": "Additional modifier (field 3 of 4)",
      //       "additional_modifier2": "Additional modifier",
      //       "ability_score": "Ability Score",
      //       "roll_description": "Roll description (field 4 of 4, optional)",
      //       "die_roll": "Die Roll",
      //       "focus": "Focus",
      //       "magic_label": "Magic",
      //       "magic_arcana_focus": "Magic Arcana Focus",
      //       "spellcasting_ability": "Spellcasting Ability",
      //       "psychic_ability": "Psychic Ability",
      //       "ability_focus": "Ability Focus",
      //       "arcana_focus": "Arcana Focus",
      //       "psychic_focus": "Psychic Focus",
      //       "fatigue_check_for": "Fatigue Check for",
      //       "price_check_for": "Price Check for",
      //       "each_fatiguing_spell": "Each Fatiguing spell this Encounter",
      //       "fear_label": "Fear",
      //       "armor_penalty": "Armor Penalty",
      //       "initiative_adjustment": "Initiative Adjustment",
      //       "initiative": "Initiative",
      //       "resources_label": "Resources",
      //       "attack_bonus_label": "Attack Bonus",
      //       "spellpower_label": "Spellpower",
      //       "initiative-toggle": 1,
      //       "fear-toggle": 0,
      //       "horror-toggle": 0,
      //       "power-list-toggle": 1,
      //       "talent-list-toggle": 1,
      //       "equipment-toggle": 1,
      //       "game": "fantasy-age-core",
      //       "health-fortune-toggle": 0,
      //       "mana-toggle": 1,
      //       "fatigue-toggle": 0,
      //       "exp-toggle": 1,
      //       "conviction-toggle": 0,
      //       "corruption-toggle": 0,
      //       "ammo-toggle": 1,
      //       "spell-list-toggle": 1,
      //       "money-toggle": 1,
      //       "income-toggle": 0,
      //       "conditions-toggle": 1,
      //       "color": "teal1",
      //       "defense_value": 13,
      //       "speed_value": 14,
      //       "tab": "1",
      //       "aim-select": "@{aim-toggle}",
      //       "wtype": "@{whisper-toggle}",
      //       "initiative-tiebreaker": "1",
      //       "class": "Mage",
      //       "level": "4",
      //       "accuracy": "1",
      //       "communication": "3",
      //       "constitution": "1",
      //       "dexterity": "3",
      //       "intelligence": "3",
      //       "perception": "2",
      //       "willpower": "4",
      //       "repeating_spell_-NbCJLrzZSoXHjX-ZMLZ_spell-name": "Draw Upon Death",
      //       "repeating_spell_-NbCJPnvgMUMjOCytYl3_spell-name": "Speak with Dead",
      //       "repeating_spell_-NbCJRn6m16ESJ2t87GS_spell-name": "Balm",
      //       "repeating_spell_-NbCJThmzjDjzgQJZzRE_spell-name": "Revival",
      //       "repeating_spell_-NbCJThmzjDjzgQJZzRE_spell-school": "Healing",
      //       "repeating_spell_-NbCJRn6m16ESJ2t87GS_spell-school": "Healing",
      //       "repeating_spell_-NbCJLrzZSoXHjX-ZMLZ_spell-school": "Death",
      //       "repeating_spell_-NbCJPnvgMUMjOCytYl3_spell-school": "Death",
      //       "race": "Halfling",
      //       "repeating_talent_-NbCJqdtWPWEeRFZ6JLc_powername": "Chirurgy",
      //       "specialization1": "Necromancer",
      //       "specialization1-degree": "Novice",
      //       "social-class": "Upper",
      //       "background": "Scholar",
      //       "health": "32",
      //       "mana": "34",
      //       "USECOLOR": "YES",
      //       "repeating_talent_-NbCJqdtWPWEeRFZ6JLc_talent1description": "Healing is a minor action",
      //       "repeating_spell_-NbCJLrzZSoXHjX-ZMLZ_short-spell-description": "Draw on fading life force and add to yours. For remainder if anyone dies within 6 yd, regain 1d6 health or 1d6 MP",
      //       "repeating_spell_-NbCJPnvgMUMjOCytYl3_short-spell-description": "one casting gets 1 question. 5mp for addition question up to willpower +1",
      //       "repeating_spell_-NbCJRn6m16ESJ2t87GS_short-spell-description": "healing action on target within 20 yards, no need for bandages. Heal stunt die + int",
      //       "repeating_spell_-NbCJThmzjDjzgQJZzRE_short-spell-description": "touch helps wounded 10+their con+my will power. Can be used to counter dying, helpless, or unconcious defeat condition",
      //       "repeating_money_-NbzTg90Tgn1oSAdYlEb_moneyname": "10",
      //       "repeating_money_-NbzTg90Tgn1oSAdYlEb_moneyamount": "G",
      //       "shield-bonus": "0",
      //       "armor": "0",
      //       "base-speed": "11",
      //       "whisper-toggle": "0",
      //       "aim-toggle": "@{aim-value}",
      //       "primary_dexterity": "on",
      //       "primary_willpower": "on",
      //       "repeating_dexterity-focus_-Nc2ltxz7MLElRfLmMzS_focusdescription": "",
      //       "repeating_dexterity-focus_-Nc2ltxz7MLElRfLmMzS_focusname": "Traps",
      //       "USEBLOOD": "DEFAULT",
      //       "repeating_attack-list_-Nc4z2E8RCvIwVVFfF5E_attack-name": "Crossbow",
      //       "repeating_attack-list_-Nc4z2E8RCvIwVVFfF5E_range": "30",
      //       "repeating_attack-list_-Nc4z2E8RCvIwVVFfF5E_reload": "major",
      //       "repeating_attack-list_-Nc4z2E8RCvIwVVFfF5E_attackroll": "-2",
      //       "repeating_equipment_-Nc4zch1ug3Y8SbNdrdb_equipment-name": "bottle of whiskey",
      //       "repeating_attack-list_-Nc51Kh1wQWzBwjk8Gfe_attack-name": "Arcane blast",
      //       "repeating_attack-list_-Nc51Kh1wQWzBwjk8Gfe_range": "16",
      //       "repeating_attack-list_-Nc51Kh1wQWzBwjk8Gfe_attackroll": "+1",
      //       "repeating_attack-list_-Nc51Kh1wQWzBwjk8Gfe_attack-damage": "1d6+4",
      //       "repeating_attack-list_-Nc4z2E8RCvIwVVFfF5E_attack-damage": "2d6+1",
      //       "repeating_talent_-Nc552pYjcw6sBSa6mzj_powername": "Healing Arcana",
      //       "repeating_equipment_-NcF-BkZTiydyedxA6DT_equipment-name": "Silk rope",
      //       "repeating_equipment_-NcF-BkZTiydyedxA6DT_equipment-quantity": "20 yd",
      //       "repeating_spell_-NbCJRn6m16ESJ2t87GS_spell-mp-cost": "2",
      //       "repeating_spell_-NbCJThmzjDjzgQJZzRE_spell-mp-cost": "6",
      //       "repeating_spell_-NbCJLrzZSoXHjX-ZMLZ_spell-mp-cost": "6",
      //       "repeating_spell_-NbCJPnvgMUMjOCytYl3_spell-type": "",
      //       "repeating_equipment_-NcFOhMfjbMIKaByNcP1_equipment-name": "Breathing mucus",
      //       "repeating_equipment_-NcFOhMfjbMIKaByNcP1_equipment-description": "This translucent green slime solidifies over the breathing holes of its user, and allows an air breather to breathe water, or a water breather to breathe air. Its effects last until an air breather returns to air for one minute, or a water breather returns to water for one minute.\n",
      //       "repeating_equipment_-NdD-Xduxu7oHVNNCTV-_equipment-name": "Medicine?",
      //       "repeating_spell_-NbCJPnvgMUMjOCytYl3_spell-mp-cost": "10",
      //       "repeating_money_-NdDLdF3AN93WM3ewuYg_moneyamount": "S",
      //       "repeating_money_-NdDLdF3AN93WM3ewuYg_moneyname": "54",
      //       "repeating_talent_-Nc552pYjcw6sBSa6mzj_talent1description": "",
      //       "repeating_talent_-NbCJqdtWPWEeRFZ6JLc_talent2description": "You have the hands of a healer. When you use the Heal action, your ally gets back an amount of Health equal to\n(Stunt Die × 2) + Intelligence.",
      //       "repeating_talent_-NbCJqdtWPWEeRFZ6JLc_talentdegree": "2",
      //       "repeating_power_-Nf8YvervVxA2M8gIP4X_powertype": "Stunt",
      //       "repeating_power_-Nf8YvervVxA2M8gIP4X_shortpowerdescription": "Battle magic, Can follow up spell with arcane blast for 2 SP",
      //       "repeating_power_-Nf8YvervVxA2M8gIP4X_fullpowerdescription": "You may follow up your spell with an Arcane Blast as an\nimmediate free action, though the blast becomes a simple test\nthat can’t generate or use SP.",
      //       "repeating_talent_-NfDyJcP5wJPz51PBt7Z_powername": "Death Arcana",
      //       "repeating_spell_-NbCJThmzjDjzgQJZzRE_spell-tn": "14",
      //       "repeating_spell_-NbCJRn6m16ESJ2t87GS_spell-tn": "9",
      //       "repeating_power_-NlEQPIjfHur0FeCcOl0_powertype": "Stunt",
      //       "repeating_power_-NlEQPIjfHur0FeCcOl0_powersource": "And another thing",
      //       "repeating_power_-Nf8YvervVxA2M8gIP4X_powersource": "Battle magic",
      //       "repeating_power_-NlEQPIjfHur0FeCcOl0_fullpowerdescription": "Your insight and social acumen allow you to immediately make\na second test related to your successful test. In action time, this occurs as a free action, but it cannot be an attack roll. In an\nadvanced test, you may make the bonus test during the time\nincrement in which you made the initial test.",
      //       "repeating_power_-NlEQPIjfHur0FeCcOl0_shortpowerdescription": "Allow to make a second check right away as a free action for 2 stunt points, social",
      //       "repeating_spell_-NbCJThmzjDjzgQJZzRE_spell-type": "utility",
      //       "repeating_spell_-NbCJThmzjDjzgQJZzRE_spell-cast-time": "major action",
      //       "repeating_spell_-NbCJRn6m16ESJ2t87GS_spell-type": "utility",
      //       "repeating_spell_-NbCJRn6m16ESJ2t87GS_spell-cast-time": "major action",
      //       "repeating_talent_-Nc552pYjcw6sBSa6mzj_talentdegree": "2",
      //       "repeating_spell_-NlES75wSLKtAVKfPKPZ_spell-school": "Healing Aura",
      //       "repeating_spell_-NlES75wSLKtAVKfPKPZ_spell-type": "Utility",
      //       "repeating_spell_-NlES75wSLKtAVKfPKPZ_spell-mp-cost": "2-8",
      //       "repeating_spell_-NlES75wSLKtAVKfPKPZ_spell-cast-time": "major action",
      //       "repeating_spell_-NlES75wSLKtAVKfPKPZ_spell-tn": "15",
      //       "repeating_spell_-NlES75wSLKtAVKfPKPZ_short-spell-description": "targets up to twice your Will-power, all of whom must be within 10 yards\n1d6 2mp, 2d6 4mp, 3d6 8mp",
      //       "repeating_spell_-NlES75wSLKtAVKfPKPZ_full-spell-description": "Waves of healing energy radiate from you and aid your nearby allies. You can pick a number of targets up to twice your Will-\npower, all of whom must be within 10 yards of you. All targets regain 1d6 Health for 2 MP, 2d6 Heath for 4 MP, or 3d6 Health\nfor 8 MP, which is the maximum effect the spell is capable of. You can designate yourself as one of the targets.",
      //       "repeating_talent_-NbCJqdtWPWEeRFZ6JLc_talentdescription": "Heal is TN 11, stunt die + intel, min 1",
      //       "repeating_spell_-NlES75wSLKtAVKfPKPZ_spell-name": "Healing Aura"
      //   }

      // )
    },
        onChange: () => {},
        onSettingsChange: () => {},
        onSharedSettingsChange: () => {},
        onTranslationsRequest: () => {},
    },
    // Refer to our advanced example sheet on how to setup actions and computed properties.
    actions: {},
    computed: {}
})
/* 
This is the configuration for the relay. It defines the handlers and actions that the sheet will use.
The handlers are functions that are called by the relay when certain events occur.
The actions are custom functions that can be called by the sheet to perform specific actions.
the computed properties are exposed by the sheet to be used in macros, inline rolls and tokens.
*/
const relayConfig = {
  handlers: {
    onInit,
    onChange,
    onSettingsChange,
    onSharedSettingsChange,
    onTranslationsRequest,
    onDragOver,
    onDropOver
  },
  actions: {
    /*
     Handlers for custom actions initiated by interacting with roll templates.
     See /src/rolltemplates/partials/heroDie.hbs for an example of how an action is performed.
     This one rolls 1d6, adds the result to a previous roll, and then prints the new result.
     Check out Marvel Multiverse RPG Edges for a more complex example.
     ⭐ An important note is that the actions will not have access to any of the Pinia stores, so they need to be passed the necessary data or have access to it through the passed in character object.
     */
    addToStunts: {
      method: async (
        props: {
          dispatch: Dispatch;
          character: Character;
          messageId?: string;
          stuntPoints?: number;
        },
        ...args: string[]
      ): Promise<void> => {
        const [originalRoll, originalTitle] = args;
        return addToStunts(props, Number(originalRoll));
      },
    }
  },
  computed: {
    // These attributes allow dot notation in macros, and will not show up on token bar attributes
    // EX: @{CHARACTER_NAME|abilityScores.Strength.current}
    abilityScores: { tokenBarValue: false, get: getAbilityScores },
    bio: { tokenBarValue: false, get: getBio },
    // These are defined token bar attributes
    // life: { tokenBarValue: true, get: getLife, set: setLife },
    healthPoints: { tokenBarValue: true, get: getHealthPoints, set: setHealth },
    magicPoints: { tokenBarValue: true, get: getMagicPoints, set: setMagic },
    stuntPoints: { tokenBarValue: true, get: getStuntPoints, set: setStunts },
  },
};

// This is the typescript type for the initial values that the sheet will use when it starts.
export type InitValues = {
  id: string;
  character: Character;
  settings: Settings;
  compendiumDrop: CompendiumDragDropData | null;
};

// Almost everything below here is Boilerplate and you probably want to keep it intact.
export const initValues: InitValues = reactive({
  id: '',
  character: {
    attributes: {},
  } as Character,
  settings: {} as Settings,
  compendiumDrop: null,
});

/*
We use refs to keep track of the state of the sheet.
This is a way to keep track of the state of the sheet in a reactive way.
*/
export const beaconPulse = ref(0);
export const blockUpdate = ref(false);
export const dispatchRef = shallowRef();
export const dropUpdate: Ref<Dispatch> = ref({} as Dispatch);
export const settingsSheet = ref(false);
const sheetId = ref(uuidv4());

/*
This is the function that is called when the character data is updated.
logMode is a flag that can be used to log the updates to the console. This is useful for debugging.
*/
const doUpdate = (dispatch: Dispatch, update: Record<string, any>, logMode = false) => {
  if (logMode) console.info('➡️ ExampleSheet: Updating Firebase');
  if (logMode) console.dir(`Firebase Update: ${initValues.character.id}`, update);
  const character: Record<string, any> = {
    character: {
      id: initValues.character.id,
      ...update,
    },
  };
  character.character.attributes.updateId = sheetId.value;
  dispatch.updateCharacter(character as UpdateArgs);
};

// This is a debounced version of the update function that will only be called after 800ms of inactivity.
const debounceUpdate = debounce(doUpdate, 800);

/* 
Dev relay is used to run the sheet in a web browser
It will log the updates to the console instead of sending them to the VTT or Roll20/Characters
This is useful for testing the sheet without having to connect to the server.
*/
const devRelay = async () =>
  ({
    update: (...args: any[]) => console.log('devRelay update', args),
    updateCharacter: (...args: any[]) => console.log('devRelay updateCharacter', args),
    characters: {},
    updateTokensByCharacter: () => '',
  } as any as Dispatch);

/*
This function is called to create the relay.
It will return the relayPinia and relayVue objects that can be used to install the relay in the sheet.
  RelayPinia is used to hydrate the store and watch for changes.
  RelayVue is used to provide the dispatch object from the Beacon SDK to the sheet.
We use a watcher of beaconPulse value to trigger a re-render of the sheet when the value changes, see the onChange handler.
This is just one way to trigger a re-render, you can implement your own logic to trigger a re-render.
*/
export const createRelay = async ({
  devMode = false,
  primaryStore = 'examplesheetStore',
  logMode = false,
}) => {
  // @ts-ignore
  const dispatch = await (devMode ? devRelay() : initRelay(relayConfig));
  const relayPinia = (context: PiniaPluginContext) => {
    if (context.store.$id !== primaryStore) return;
    const store = context.store;

    dispatchRef.value = dispatch;

    // Init Store
    const { attributes, ...profile } = initValues.character;
    store.hydrateStore(attributes, profile);

    // Beacon Provides access to settings, like campaign id for example
    store.setCampaignId(initValues.settings.campaignId);
    store.setPermissions(initValues.settings.owned, initValues.settings.gm);

    // Watch for changes
    store.$subscribe(() => {
      if (blockUpdate.value === true) return;
      const update = store.dehydrateStore();
      debounceUpdate(dispatch, update, logMode);
    });

    // Watch for changes from the Beacon SDK, triggered everytime the Beacon Pulse value changes
    watch(beaconPulse, async (newValue, oldValue) => {
      if (logMode) console.log('❤️ Beacon Pulse', { newValue, oldValue });
      const characterId = initValues.character.id;
      blockUpdate.value = true;
      if (logMode) console.log('🔒🔴 locking changes');
      const { attributes, ...profile } = dispatch.characters[characterId];
      if (attributes.updateId === sheetId.value) {
        blockUpdate.value = false;
        return;
      }
      store.hydrateStore(attributes, profile);
      await nextTick();
      if (logMode) console.log('🔓🟢 unlocking changes');
      blockUpdate.value = false;
    });

    return {
      ...dispatch,
    };
  };

  const relayVue = {
    install(app: App) {
      app.provide('dispatch', dispatch);
    },
  };

  return {
    relayPinia,
    relayVue,
  };
};

