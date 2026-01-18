import { defineStore, acceptHMRUpdate } from 'pinia';
import { ref, computed } from 'vue';
import { v4 as uuidv4 } from 'uuid';

import { arrayToObject, getRollResults, objectToArray, rollToChat } from '@/utility';
import { useMetaStore } from './metaStore';
// import { ability, skill, spell, weapon } from '@/rollFuncs';

export default {
  setup() {
    const sheet = useSheetStore();
    const { customProficiency, reputation, proficiency } = storeToRefs(sheet);

    return { customProficiency, reputation, proficiency };
  }
};

/*
This is a custom data store, that will house everything you need for data specific to your sheet.
Here you can define all attributes, as well as sheet functions.

In the example we have provided, there is a custom faction text field, as well as a list of
trait objects, that feature a name and description.

This is a great starting place to customize what data you need for your sheet.
 */
export const useSheetStore = defineStore('sheet',() => {
  const sheet_mode = ref('pc');

  // Transformation state - tracks if character is in Magi-Knight form
  const isTransformed = ref(false);
  // Token image URLs for form switching
  const studentTokenImage = ref('');
  const knightTokenImage = ref('');

  const character_name = ref('');
  const level = ref(1);
  const reputation = ref(0);
  const player = ref('');
  const inspiration = ref(0);
  const stress = ref(0);
  const exhaustion = ref(0);
  const student_type = ref('');

  // Roll mode: 'normal', 'advantage', or 'disadvantage'
  const rollMode = ref('normal');

  // Computed: Check if forced disadvantage due to stress/exhaustion at 6
  const forcedDisadvantage = computed(() => stress.value >= 6 || exhaustion.value >= 6);

  // Computed: Get effective roll mode (forced disadvantage overrides manual selection)
  const effectiveRollMode = computed(() => {
    if (forcedDisadvantage.value) return 'disadvantage';
    return rollMode.value;
  });

  // Get the dice expression based on roll mode
  const getRollDice = () => {
    switch (effectiveRollMode.value) {
      case 'advantage':
        return { formula: '2d20kh1', display: '2d20kh' };
      case 'disadvantage':
        return { formula: '2d20kl1', display: '2d20kl' };
      default:
        return { formula: '1d20', display: '1d20' };
    }
  };

  // Conditions tracking
  const conditions = ref({
    // Mental conditions
    distressed: false,
    horrified: false,
    berserk: false,
    // Physical conditions
    bleeding: false,
    burning: false,
    exposed: false,
    paralyzed: false,
    prone: false,
    restrained: false,
    // Depletion conditions
    depleted: false,
    drained: false,
    silenced: false,
    soulSiphoned1: false,
    soulSiphoned2: false,
    soulSiphoned3: false,
    soulTainted: false,
    // Other conditions
    blinded: false,
    charmed: false,
    frightened: false,
    incapacitated: false,
    invisible: false,
    poisoned: false,
    stunned: false
  });

  // Get list of active conditions
  const activeConditions = computed(() => {
    return Object.entries(conditions.value)
      .filter(([_, active]) => active)
      .map(([name, _]) => name);
  });

  // Check if any condition grants disadvantage on attacks
  const conditionDisadvantageOnAttacks = computed(() => {
    return conditions.value.prone ||
           conditions.value.restrained ||
           conditions.value.blinded ||
           conditions.value.frightened ||
           conditions.value.poisoned;
  });

  // Check if distressed (applies -1 to checks)
  const distressedPenalty = computed(() => conditions.value.distressed ? -1 : 0);

  // abilityScores
  const strength = ref(10);
  const dexterity = ref(10);
  const constitution = ref(10);
  const intelligence = ref(10);
  const wisdom = ref(10);
  const charisma = ref(10);

  // Per rules: Modifier is capped at +5 until "Exceed a Mortal's Limits" at Reputation Level IV
  // Reputation Level IV corresponds to reputation value of 4 or higher
  const exceededMortalLimits = computed(() => reputation.value >= 4);

  const strengthMod = computed(() => {
    const raw = Math.floor((strength.value - 10) / 2);
    return exceededMortalLimits.value ? raw : Math.min(raw, 5);
  });
  const dexterityMod = computed(() => {
    const raw = Math.floor((dexterity.value - 10) / 2);
    return exceededMortalLimits.value ? raw : Math.min(raw, 5);
  });
  const constitutionMod = computed(() => {
    const raw = Math.floor((constitution.value - 10) / 2);
    return exceededMortalLimits.value ? raw : Math.min(raw, 5);
  });
  const intelligenceMod = computed(() => {
    const raw = Math.floor((intelligence.value - 10) / 2);
    return exceededMortalLimits.value ? raw : Math.min(raw, 5);
  });
  const wisdomMod = computed(() => {
    const raw = Math.floor((wisdom.value - 10) / 2);
    return exceededMortalLimits.value ? raw : Math.min(raw, 5);
  });
  const charismaMod = computed(() => {
    const raw = Math.floor((charisma.value - 10) / 2);
    return exceededMortalLimits.value ? raw : Math.min(raw, 5);
  });
  const abilityScores = {
    strength:{
      score: strength,
      mod: strengthMod
    },
    intelligence:{
      score: intelligence,
      mod: intelligenceMod
    },
    dexterity:{
      score: dexterity,
      mod: dexterityMod
    },
    wisdom:{
      score: wisdom,
      mod: wisdomMod
    },
    constitution:{
      score: constitution,
      mod: constitutionMod
    },
    charisma:{
      score: charisma,
      mod: charismaMod
    }
  };
  const levelSpellDict = [,1,1,2,2,3,3,3,4,4,4,5,5,5,6,6]
  const max_spell_tier = computed(() => levelSpellDict[level]);

  const proficiencyMap = {
    0: 2,  // or use a more detailed lookup based on the table
    1: 3,
    2: 3,
    3: 4,
    4: 5,
    5: 6
  };

  const customProficiency = ref('');
  const proficiency = ref(calculateProficiency());

  function calculateProficiency() {
    if (reputation.value > 5){
      return 6;
    }
    if (reputation.value < 0){
      return 0;
    }
    if (customProficiency.value != undefined && customProficiency.value != '') {
      return customProficiency.value;
    } else {
      return proficiencyMap[reputation.value];
    }
  }

  // skills
  const skillDetails = {
    academic_arts: ['intelligence','wisdom'],
    athletics: ['dexterity','strength'],
    coordination: ['dexterity'],
    creativity: ['intelligence','wisdom'],
    deception: ['intelligence','charisma'],
    influence: ['strength','charisma'],
    insight: ['wisdom'],
    investigation: ['intelligence','wisdom'],
    leadership: ['charisma'],
    medicine: ['intelligence','wisdom'],
    mysticism: ['intelligence'],
    perception: ['wisdom'],
    performance: ['strength','dexterity','constitution','intelligence','wisdom','charisma'],
    persuasion: ['intelligence','wisdom','charisma'],
    purity: ['wisdom','charisma'],
    stealth: ['dexterity'],
    stem: ['intelligence']
  };

  // construct the skill object
  const skills = Object.keys(skillDetails).reduce((m,n) =>{
    const skillName = n.replace(/\s+/g,'_')
    const prof = ref(false);
    const defaultAbility = ref(skillDetails[skillName][0]);
    const abilitiesList = skillDetails[skillName];
    const overrideValue = ref('');

    m[skillName] = {
      name:skillName,
      proficiency: prof,
      ability: defaultAbility,
      abilitiesList: abilitiesList,
      overrideValue: overrideValue,
      value: computed(() => 
        abilityScores[defaultAbility.value].mod.value + (prof.value ? proficiency.value : 0))
    };
    return m;
  },{});

  const initiative_override = ref('');
  const initiative = computed({
    get() {
      // If the override is empty, return the calculated value
      if (initiative_override.value === '') {
        return dexterityMod.value;
      }
      // If override is set, return the override value
      return initiative_override.value;
    },
    set(value) {
      // If the value is set to '', clear the override (will use the calculated value)
      if (value === '') {
        initiative_override.value = ''; // Reset override
      } else {
        // Set the override value to the custom value
        initiative_override.value = value;
      }
    }
  });

  const elemental_affinity = ref('');
  const magic_style = ref('');
  const element_name = ref('');
  const mam = ref('');

  // Auto-calculated HP: 10 + CON Mod + (Level - 1) × (6 + CON Mod)
  const hp_max_override = ref('');
  const hp_max = computed({
    get() {
      if (hp_max_override.value !== '' && !isNaN(Number(hp_max_override.value))) {
        return Number(hp_max_override.value);
      }
      // Formula: 10 + CON Mod + (Level - 1) × (6 + CON Mod)
      const conMod = constitutionMod.value;
      return 10 + conMod + (level.value - 1) * (6 + conMod);
    },
    set(value) {
      hp_max_override.value = value === '' ? '' : value;
    }
  });
  const hp = {
    current: ref(10),
    temp: ref(0),
    max: hp_max
  };

  // Auto-calculated MP: MCO × 2 (or MCO × 3 with Mana Attunement from Magical Implement)
  // MCO = Level + MAM Modifier + Reputation
  const mp_max_override = ref('');
  const mp_max = computed({
    get() {
      if (mp_max_override.value !== '' && !isNaN(Number(mp_max_override.value))) {
        return Number(mp_max_override.value);
      }
      // MCO = Magi-Knight Level + Magic Ability Modifier + Reputation Level
      const mamMod = abilityScores[mam.value]?.mod.value || 0;
      const mco = level.value + mamMod + reputation.value;
      // Mana Attunement (from Magical Implement): MCO × 3, Standard: MCO × 2
      const hasManaAttunement = magical_implement?.qualities?.value?.manaAttunement ?? false;
      const multiplier = hasManaAttunement ? 3 : 2;
      return mco * multiplier;
    },
    set(value) {
      mp_max_override.value = value === '' ? '' : value;
    }
  });
  const mp = {
    current: ref(10),
    max: mp_max
  };

  // Auto-calculated SHP: 10 + CON Modifier + Reputation Level
  const shp_max_override = ref('');
  const shp_max = computed({
    get() {
      if (shp_max_override.value !== '' && !isNaN(Number(shp_max_override.value))) {
        return Number(shp_max_override.value);
      }
      return 10 + constitutionMod.value + reputation.value;
    },
    set(value) {
      shp_max_override.value = value === '' ? '' : value;
    }
  });
  const shp = {
    current: ref(10),
    max: shp_max
  };
  const elemental_enhancement_1 = ref('');
  const elemental_enhancement_2 = ref('');
  const roll_resist_proficiency = ref('');

  const spell_attack_override = ref('');
  const spell_attack = computed({
    get() {
      // If the override is empty, return the calculated value
      if (spell_attack_override.value === '') {
        return proficiency.value + (abilityScores[mam.value]?.mod.value || 0);
      }
      // If override is set, return the override value
      return spell_attack_override.value;
    },
    set(value) {
      // If the value is set to '', clear the override (will use the calculated value)
      spell_attack_override.value = value || ''; // Reset override if empty
    }
  });

  const spell_dc_override = ref('');
  const spell_dc = computed({
    get() {
      // If the override is empty or not a number, return the calculated value
      if (spell_dc_override.value === '' || isNaN(Number(spell_dc_override.value))) {
        return 8 + proficiency.value + (abilityScores[mam.value]?.mod.value || 0);
      }
      // If override is set, return the override value
      return Number(spell_dc_override.value);
    },
    set(value) {
      // If the value is set to '', clear the override (will use the calculated value)
      spell_dc_override.value = value || ''; // Reset override if empty
    }
  });

  const eclipse = ref([0,0,0,0,0,0,0,0]);
  const eclipse_blips = ref([0,0,0,0,0,0,0,0]);

  // Trauma is computed from eclipse blips in filled/solid dot state (1) only
  // State 0 = empty, State 1 = Trauma (solid dot), State 2 = Corruption (X), State 3 = Burnout (scratched)
  const trauma = computed(() => eclipse_blips.value.filter(blip => blip === 1).length);

  const eclipse_phase = computed(() => {
    const text = Math.max(0,...eclipse.value) >= 3 
      ? 'Heartless Knight' 
      : 'Soul Eclipse\nChart';
    
    return text.replace(/\n/g, '<br>');
  });
  
  
  const crystal = {
    facet1: ref(false),
    facet2: ref(false),
    facet3: ref(false),
    facet4: ref(false),
    facet5: ref(false),
    facet6: ref(false),
    facet7: ref(false)
  };

  const rested = ref(false);
  const studied = ref(false);
  const gloom = ref(0);
  const unity = ref(0);

  // Unity Points: Unlocked at Reputation Level II (rep >= 2), max = rep - 1
  // Per compendium/rules.json: Unity is used for Combination Maneuvers
  const unityMax = computed(() => {
    if (reputation.value < 2) return 0;
    return reputation.value - 1;
  });

  // Check if Unity Points are available (Rep II+ required)
  const unityAvailable = computed(() => reputation.value >= 2);

  // Herald Bond Level system (I-V, stored as 1-5)
  // Per compendium: Herald bond affects spell tier access (Bond IV+ = Tier VI access)
  const herald = {
    name: ref(''),
    bondLevel: ref(1),
    notes: ref('')
  };

  // Check if Tier VI spells are unlocked (requires Herald Bond Level IV+)
  const tierVIUnlocked = computed(() => herald.bondLevel.value >= 4);

  // ==================== SQUADRON FORMATIONS ====================
  // Per compendium/lists.json: Tactical Formations
  // Unlocked at Rep Level I, requires 3+ Magi-Knights within 60ft

  const formationData = {
    arrow: {
      name: 'Arrow Formation',
      type: 'Attack',
      cost: 2,
      description: 'All in Formation Range: +2× Rep Level damage. After Oversee + Call for Assistance: +2× Rep Level additional damage.',
      shortEffect: (rep) => `+${2 * rep} damage`
    },
    victory: {
      name: 'Victory Formation',
      type: 'Defense',
      cost: 2,
      description: 'All in Formation Range: Reduce Physical/Magical damage by 2× Rep Level. Reaction: Any member can intercept damage for another.',
      shortEffect: (rep) => `-${2 * rep} damage taken`
    },
    barrage: {
      name: 'Barrage Formation',
      type: 'Destruction',
      cost: 3,
      description: '1/Round: Cast Rushed Spell without ½ damage reduction. 1/Round: Overcharge costs only 1 Exhaustion.',
      shortEffect: () => 'Full damage on Rushed spells'
    },
    diamond: {
      name: 'Diamond Formation',
      type: 'Restoration',
      cost: 3,
      description: 'At Squadron Leader turn start: All heal 3× Rep Level HP. Advantage on Condition removal vs Nemesis or weaker. Immune to Distressed.',
      shortEffect: (rep) => `Heal ${3 * rep} HP/turn`
    }
  };

  // Track currently active formation (null if none)
  const activeFormation = ref(null);

  // Track formations section collapsed state
  const formationsCollapsed = ref(true);

  // Computed effect values based on reputation
  const formationEffects = computed(() => ({
    arrow: {
      damage: 2 * reputation.value,
      additionalDamage: 2 * reputation.value
    },
    victory: {
      damageReduction: 2 * reputation.value
    },
    barrage: {
      // No numeric effect, special ability
    },
    diamond: {
      healing: 3 * reputation.value
    }
  }));

  const traits = ref([]);
  const traitsCount = computed(() => traits.value?.length);

  // Auto-calculated Student Damage: "1d4+" + (STR Modifier + Reputation Level)
  const student_damage_override = ref('');
  const student_damage = computed({
    get() {
      if (student_damage_override.value !== '') {
        return student_damage_override.value;
      }
      const bonus = strengthMod.value + reputation.value;
      return bonus >= 0 ? `1d4+${bonus}` : `1d4${bonus}`;
    },
    set(value) {
      student_damage_override.value = value === '' ? '' : value;
    }
  });

  // Auto-calculated Student Armor: 10 + CON Modifier + DEX Modifier
  const student_armor_override = ref('');
  const student_armor = computed({
    get() {
      if (student_armor_override.value !== '' && !isNaN(Number(student_armor_override.value))) {
        return Number(student_armor_override.value);
      }
      return 10 + constitutionMod.value + dexterityMod.value;
    },
    set(value) {
      student_armor_override.value = value === '' ? '' : value;
    }
  });

  const student_move = ref(0);

  // Auto-calculated Student Attack: Proficiency Bonus + max(STR, DEX) Modifier
  const student_attack_override = ref('');
  const student_attack = computed({
    get() {
      if (student_attack_override.value !== '' && !isNaN(Number(student_attack_override.value))) {
        return Number(student_attack_override.value);
      }
      const bestMod = Math.max(strengthMod.value, dexterityMod.value);
      return proficiency.value + bestMod;
    },
    set(value) {
      student_attack_override.value = value === '' ? '' : value;
    }
  });
  const interests = ref('');
  const virtues = ref('');
  const strengths = ref('');
  const weaknesses = ref('');
  const electives = ref('');
  const characteristics = ref('');
  const quote = ref('');
  const player_links = ref('');
  const backstory = ref('');

  const student_ability = {
    name: ref(''),
    description: ref(''),
    collapsed: ref(true)
  };
  const fate = {
    card: ref(''),
    name: ref('')
  }
  // magi-knight stats
  
  const knight_damage = ref('');
  const knight_armor = ref(0);
  const knight_hasShield = ref(false);
  const knight_move = ref('');

  const knight_attack_override = ref('');
  const knight_attack = computed({
    get() {
      // If the override is empty, return the calculated value
      // if (knight_attack_override.value === '') {
      //   const abMod = abilityScores[mam.value]?.mod.value || 0;
      //   return proficiency.value + abMod;
      // }
      // If override is set, return the override value
      return knight_attack_override.value;
    },
    set(value) {
      // If the value is set to '', clear the override (will use the calculated value)
      if (value === '') {
        knight_attack_override.value = ''; // Reset override
      } else {
        // Set the override value to the custom value
        knight_attack_override.value = value;
      }
    }
  });

  const armor_weave = {
    name: ref(''),
    description: ref(''),
    collapsed: ref(true)
  };
  const soul_weapon = {
    name: ref(''),
    range: ref(''),
    damage: ref(''),
    damageType: ref('physical'), // 'physical', 'magical', or 'true'
    qualities: ref({
      accurate: false,      // +1 to attack rolls
      coupled: false,       // Can be used with another weapon (informational)
      ensnaring: false,     // Grapple on hit (informational)
      finesse: false,       // Can use DEX instead of STR for attack/damage
      forceful: false,      // +1 to damage rolls
      massive: false,       // -2 to attack, +4 to damage
      staggeringBlow: false, // Knockback effect (informational)
      twoHanded: false,     // Requires both hands (informational)
      veilPiercing: false,  // Critical hit on 16+ (instead of only 20)
      vicious: false        // On crit, maximize duplicated damage dice
    }),
    collapsed: ref(true)
  };

  // Weapon quality definitions for UI
  const weaponQualityDefs = {
    accurate: { name: 'Accurate', effect: '+1 to attack rolls', category: 'attack' },
    coupled: { name: 'Coupled', effect: 'Can be used with another weapon', category: 'special' },
    ensnaring: { name: 'Ensnaring', effect: 'Grapple on hit', category: 'special' },
    finesse: { name: 'Finesse', effect: 'Use DEX instead of STR for attack/damage', category: 'attack' },
    forceful: { name: 'Forceful', effect: '+1 to damage rolls', category: 'damage' },
    massive: { name: 'Massive', effect: '-2 to attack, +4 to damage', category: 'both' },
    staggeringBlow: { name: 'Staggering Blow', effect: 'Knockback effect on hit', category: 'special' },
    twoHanded: { name: 'Two-Handed', effect: 'Requires both hands', category: 'special' },
    veilPiercing: { name: 'Veil-Piercing', effect: 'Critical hit on 16+', category: 'attack' },
    vicious: { name: 'Vicious', effect: 'On crit, maximize duplicated dice', category: 'damage' }
  };

  // Computed: weapon quality attack bonus
  const weaponQualityAttackBonus = computed(() => {
    let bonus = 0;
    if (soul_weapon.qualities.value.accurate) bonus += 1;
    if (soul_weapon.qualities.value.massive) bonus -= 2;
    return bonus;
  });

  // Computed: weapon quality damage bonus
  const weaponQualityDamageBonus = computed(() => {
    let bonus = 0;
    if (soul_weapon.qualities.value.forceful) bonus += 1;
    if (soul_weapon.qualities.value.massive) bonus += 4;
    return bonus;
  });

  // Computed: critical hit range (default 20, veil-piercing makes it 16)
  const weaponCritRange = computed(() => {
    return soul_weapon.qualities.value.veilPiercing ? 16 : 20;
  });

  // Computed: active qualities list for display
  const activeWeaponQualities = computed(() => {
    return Object.entries(soul_weapon.qualities.value)
      .filter(([key, val]) => val)
      .map(([key]) => weaponQualityDefs[key]?.name || key);
  });

  // ==================== SOUL GUN DATA ====================
  const soul_gun = {
    name: ref(''),
    range: ref(''),
    damage: ref(''),
    damageType: ref('physical'), // 'physical', 'magical', or 'true'
    qualities: ref({
      accurate: false,      // +1 to attack rolls
      longRange: false,     // Double effective range
      rapidFire: false,     // Can attack twice with -2 penalty
      scatter: false,       // +2 damage at close range (5ft)
      silenced: false,      // Does not reveal position (informational)
      veilPiercing: false,  // Critical hit on 16+ (instead of only 20)
      vicious: false        // On crit, maximize duplicated damage dice
    }),
    collapsed: ref(true)
  };

  // Gun quality definitions for UI
  const gunQualityDefs = {
    accurate: { name: 'Accurate', effect: '+1 to attack rolls', category: 'attack' },
    longRange: { name: 'Long Range', effect: 'Double effective range', category: 'special' },
    rapidFire: { name: 'Rapid Fire', effect: 'Can attack twice with -2 penalty', category: 'attack' },
    scatter: { name: 'Scatter', effect: '+2 damage at close range (5ft)', category: 'damage' },
    silenced: { name: 'Silenced', effect: 'Does not reveal position', category: 'special' },
    veilPiercing: { name: 'Veil-Piercing', effect: 'Critical hit on 16+', category: 'attack' },
    vicious: { name: 'Vicious', effect: 'On crit, maximize duplicated dice', category: 'damage' }
  };

  // Computed: gun quality attack bonus
  const gunQualityAttackBonus = computed(() => {
    let bonus = 0;
    if (soul_gun.qualities.value.accurate) bonus += 1;
    return bonus;
  });

  // Computed: gun quality damage bonus
  const gunQualityDamageBonus = computed(() => {
    let bonus = 0;
    // Scatter bonus is situational (close range), handled separately
    return bonus;
  });

  // Computed: gun critical hit range (default 20, veil-piercing makes it 16)
  const gunCritRange = computed(() => {
    return soul_gun.qualities.value.veilPiercing ? 16 : 20;
  });

  // Computed: active gun qualities list for display
  const activeGunQualities = computed(() => {
    return Object.entries(soul_gun.qualities.value)
      .filter(([key, val]) => val)
      .map(([key]) => gunQualityDefs[key]?.name || key);
  });

  // ==================== MAGICAL IMPLEMENT DATA ====================
  const magical_implement = {
    name: ref(''),
    description: ref(''),
    qualities: ref({
      manaAttunement: false,    // MP = MCO * 3 instead of MCO * 2
      spellFocus: false,        // +1 to spell attack rolls
      channeling: false,        // +1 to spell DC
      quickCast: false,         // Can cast one Tier I spell as bonus action per rest
      wardingFocus: false       // +1 to magical damage resistance
    }),
    collapsed: ref(true)
  };

  // Implement quality definitions for UI
  const implementQualityDefs = {
    manaAttunement: { name: 'Mana Attunement', effect: 'MP = MCO × 3 (instead of × 2)', category: 'mana' },
    spellFocus: { name: 'Spell Focus', effect: '+1 to spell attack rolls', category: 'attack' },
    channeling: { name: 'Channeling', effect: '+1 to Spell DC', category: 'dc' },
    quickCast: { name: 'Quick Cast', effect: 'Cast one Tier I spell as bonus action per rest', category: 'special' },
    wardingFocus: { name: 'Warding Focus', effect: '+1 to magical damage resistance', category: 'defense' }
  };

  // Computed: check if Mana Attunement is active (for MP calculation)
  const hasManaAttunement = computed(() => {
    return magical_implement.qualities.value.manaAttunement;
  });

  // Computed: implement quality spell attack bonus
  const implementSpellAttackBonus = computed(() => {
    return magical_implement.qualities.value.spellFocus ? 1 : 0;
  });

  // Computed: implement quality spell DC bonus
  const implementSpellDCBonus = computed(() => {
    return magical_implement.qualities.value.channeling ? 1 : 0;
  });

  // Computed: active implement qualities list for display
  const activeImplementQualities = computed(() => {
    return Object.entries(magical_implement.qualities.value)
      .filter(([key, val]) => val)
      .map(([key]) => implementQualityDefs[key]?.name || key);
  });

  // Damage type labels for display
  const damageTypeLabels = {
    physical: 'Physical',
    magical: 'Magical',
    true: 'True Damage'
  };

  // ==================== NPC/MONSTER DATA ====================
  // NPC Type determines HP structure and attack scaling
  const npcTypes = {
    horde: { name: 'Horde', hasMultipleHP: true, units: 4 },
    vassal: { name: 'Vassal', hasMultipleHP: false },
    adversary: { name: 'Adversary', hasMultipleHP: false },
    nemesis: { name: 'Nemesis', hasMultipleHP: false },
    harbinger: { name: 'Harbinger', hasMultipleHP: false }
  };

  // NPC basic info
  const npc_name = ref('');
  const npc_type = ref('vassal');
  const npc_size = ref('Medium');
  const npc_creature_type = ref('Outsider');
  const npc_armor = ref(10);
  const npc_move = ref(30);
  const npc_invasion_level = ref(0);
  const npc_horrific_rating = ref('');
  const npc_physical_check = ref(0);
  const npc_magical_check = ref(0);
  const npc_inert_spectral_energy = ref('1d4');
  const npc_whisper_rolls = ref(false);

  // NPC HP - single pool for non-horde, 4 pools for horde
  const npc_hp = ref({ current: 10, max: 10 });
  const npc_horde_hp = ref([
    { current: 12, max: 12, defeated: false },
    { current: 12, max: 12, defeated: false },
    { current: 12, max: 12, defeated: false },
    { current: 12, max: 12, defeated: false }
  ]);

  // Computed: count of active horde units
  const npc_active_units = computed(() => {
    if (npc_type.value !== 'horde') return 1;
    return npc_horde_hp.value.filter(unit => !unit.defeated && unit.current > 0).length;
  });

  // NPC Primary Attack
  const npc_primary_attack = ref({
    name: 'Primary Attack',
    attackBonus: 0,
    // For hordes, DC scales: [4 units, 3 units, 2 units, 1 unit]
    attackDC: [12, 9, 6, 3],
    range: '5ft',
    damage: '1d6',
    // For hordes, damage scales: [4 units, 3 units, 2 units, 1 unit]
    hordeDamage: ['7', '5', '3', '1'],
    damageType: 'physical',
    special: ''
  });

  // NPC Secondary Attack
  const npc_secondary_attack = ref({
    name: 'Secondary Attack',
    attackBonus: 0,
    attackDC: [12, 9, 6, 3],
    range: '30ft',
    damage: '1d8',
    hordeDamage: ['7', '5', '3', '1'],
    damageType: 'magical',
    special: ''
  });

  // Computed: get current attack values based on active units
  const npc_primary_current = computed(() => {
    if (npc_type.value !== 'horde') {
      return {
        attackBonus: npc_primary_attack.value.attackBonus,
        damage: npc_primary_attack.value.damage
      };
    }
    const unitIndex = 4 - npc_active_units.value;
    return {
      attackDC: npc_primary_attack.value.attackDC[Math.min(unitIndex, 3)],
      damage: npc_primary_attack.value.hordeDamage[Math.min(unitIndex, 3)]
    };
  });

  const npc_secondary_current = computed(() => {
    if (npc_type.value !== 'horde') {
      return {
        attackBonus: npc_secondary_attack.value.attackBonus,
        damage: npc_secondary_attack.value.damage
      };
    }
    const unitIndex = 4 - npc_active_units.value;
    return {
      attackDC: npc_secondary_attack.value.attackDC[Math.min(unitIndex, 3)],
      damage: npc_secondary_attack.value.hordeDamage[Math.min(unitIndex, 3)]
    };
  });

  // NPC Traits (simple array, not repeating section for simplicity)
  const npc_traits = ref([]);

  // NPC Notes
  const npc_notes = ref('');

  // ==================== END NPC DATA ====================

  // repeating sections
  const sections = {
    techniques: {
      template: {
        name: '',
        description: '',
        type: '',
        collapsed: true
      },
      addItem(item){
        const newItem = {...this.template,...item};
        this.rows.value.push(newItem);
      },
      rows: ref([])
    },
    shards: {
      template: {
        name: '',
        description: '',
        rarity:1,
        cost: '',
        collapsed: true
      },
      addItem(item){
        const newItem = {...this.template,...item};
        this.rows.value.push(item);
      },
      rows: ref([])
    },
    gear: {
      template: {
        name: '',
        description: '',
        collapsed: true
      },
      addItem(item){
        const newItem = {...this.template,...item};
        this.rows.value.push(item);
      },
      rows: ref([])
    },
    relics: {
      template: {
        name: '',
        description: '',
        collapsed: true
      },
      addItem(item){
        const newItem = {...this.template,...item};
        this.rows.value.push(item);
      },
      rows: ref([])
    },
    forms: {
      template: {
        name: '',
        description: '',
        collapsed: true
      },
      addItem(item){
        const newItem = {...this.template,...item};
        this.rows.value.push(item);
      },
      rows: ref([])
    },
    runes: {
      template: {
        name: '',
        description: '',
        collapsed: true
      },
      addItem(item){
        const newItem = {...this.template,...item};
        this.rows.value.push(item);
      },
      rows: ref([])
    },
    spells: {
      template: {
        name: '',
        range: '',
        
        tier_I_name: '',
        tier_I_description: '',
        tier_I_special: '',
        tier_I_action: '',
        tier_I_dice: '',
        
        tier_II_name: '',
        tier_II_description: '',
        tier_II_special: '',
        tier_II_action: '',
        tier_II_dice: '',
        
        tier_III_name: '',
        tier_III_description: '',
        tier_III_special: '',
        tier_III_action: '',
        tier_III_dice: '',
        
        tier_IV_name: '',
        tier_IV_description: '',
        tier_IV_special: '',
        tier_IV_action: '',
        tier_IV_dice: '',
        
        tier_V_name: '',
        tier_V_description: '',
        tier_V_special: '',
        tier_V_action: '',
        tier_V_dice: '',
        
        tier_VI_name: '',
        tier_VI_description: '',
        tier_VI_special: '',
        tier_VI_action: '',
        tier_VI_dice: ''
      },
      addItem(item){
        const newItem = {...this.template,...item};
        this.rows.value.push(item);
      },
      rows: ref([])
    }
  };

  ['npc','squadron'].forEach(n => {
    sections[`${n}-social`] = {
      template: {
        name: '',
        points: 0,
        bond_ability: '',
        collapsed: false
      },
      addItem(item){
        const newItem = {...this.template,...item};
        this.rows.value.push(item);
      },
      rows: ref([])
    };
  });

  ['club'].forEach(n => {
    sections[`${n}-goalTallies`] = {
      template: {
        name: '',
        description: '',
        collapsed: false
      },
      addItem(item){
        const newItem = {...this.template,...item};
        this.rows.value.push(item);
      },
      rows: ref([])
    };
  });

  // /*
  // Adds a trait to the list of traits
  //  */
  // const addTrait = (traits) => {
  //   const trait = {
  //     _id: uuidv4(),
  //     name: `Trait ${traits.value?.length + 1}`,
  //     description: ''
  //   }
  //   traits.value.push(trait)
  // }
  const addRow = (section) => {
    const item = {
      _id: uuidv4()
    };

    sections[section].addItem(item);
    return item._id;
  };

  const removeRow = (section,id) => {
    sections[section].rows.value = sections[section].rows.value.filter(row => row._id !== id);
  };

  function dehydrateSkills(skills) {
    const dehydratedSkills = {};
    for (const [skillName, skillData] of Object.entries(skills)) {
      dehydratedSkills[skillName] = {
        proficiency: skillData.proficiency.value,
        ability: skillData.ability.value,
        overrideValue: skillData.overrideValue.value,
      };
    }
    return dehydratedSkills;
  }
  
  function hydrateSkills(skills, hydrateData = {}) {
    for (const [skillName, skillData] of Object.entries(hydrateData)) {
      if (skills[skillName]) {
        skills[skillName].proficiency.value = skillData.proficiency ?? skills[skillName].proficiency.value;
        skills[skillName].ability.value = skillData.ability ?? skills[skillName].ability.value;
        skills[skillName].overrideValue.value = skillData.overrideValue ?? skills[skillName].overrideValue.value;
      }
    }
  }
  
  // Dehydrate and Hydrate methods for 'abilityScores'
  function dehydrateAbilityScores(abilityScores) {
    const dehydrated = {};
    for (const [abilityName, abilityData] of Object.entries(abilityScores)) {
      dehydrated[abilityName] = {
        score: abilityData.score.value,
      };
    }
    return dehydrated;
  }
  
  function hydrateAbilityScores(abilityScores, hydrateData = {}) {
    for (const [abilityName, abilityData] of Object.entries(hydrateData)) {
      if (abilityScores[abilityName]) {
        abilityScores[abilityName].score.value = abilityData.score ?? abilityScores[abilityName].score.value;
      }
    }
  }
  
  // Dehydrate and Hydrate methods for 'hp'
  function dehydrateHp(hp) {
    return {
      current: hp.current.value,
      temp: hp.temp.value,
      max_override: hp_max_override.value,
    };
  }

  function hydrateHp(hp, hydrateData = {}) {
    hp.current.value = hydrateData.current ?? hp.current.value;
    hp.temp.value = hydrateData.temp ?? hp.temp.value;
    hp_max_override.value = hydrateData.max_override ?? hp_max_override.value;
  }

  // Dehydrate and Hydrate methods for 'mp'
  function dehydrateMp(mp) {
    return {
      current: mp.current.value,
      max_override: mp_max_override.value,
    };
  }

  function hydrateMp(mp, hydrateData = {}) {
    mp.current.value = hydrateData.current ?? mp.current.value;
    mp_max_override.value = hydrateData.max_override ?? mp_max_override.value;
  }

  // Dehydrate and Hydrate methods for 'shp'
  function dehydrateShp(shp) {
    return {
      current: shp.current.value,
      max_override: shp_max_override.value,
    };
  }

  function hydrateShp(shp, hydrateData = {}) {
    shp.current.value = hydrateData.current ?? shp.current.value;
    shp_max_override.value = hydrateData.max_override ?? shp_max_override.value;
  }
  
  // Dehydrate and Hydrate methods for 'crystal'
  function dehydrateCrystal(crystal) {
    const dehydrated = {};
    for (const [facet, refValue] of Object.entries(crystal)) {
      dehydrated[facet] = refValue.value;
    }
    return dehydrated;
  }
  
  function hydrateCrystal(crystal, hydrateData = {}) {
    for (const [facet, value] of Object.entries(hydrateData)) {
      if (crystal[facet]) {
        crystal[facet].value = value ?? crystal[facet].value;
      }
    }
  }
  
  // Dehydrate and Hydrate methods for 'student_ability'
  function dehydrateStudentAbility(studentAbility) {
    return {
      name: studentAbility.name.value,
      description: studentAbility.description.value,
      collapsed: studentAbility.collapsed.value,
    };
  }
  
  function hydrateStudentAbility(studentAbility, hydrateData = {}) {
    studentAbility.name.value = hydrateData.name ?? studentAbility.name.value;
    studentAbility.description.value = hydrateData.description ?? studentAbility.description.value;
    studentAbility.collapsed.value = hydrateData.collapsed ?? studentAbility.collapsed.value;
  }
  
  // Dehydrate and Hydrate methods for 'fate'
  function dehydrateFate(fate) {
    return {
      card: fate.card.value,
      name: fate.name.value,
    };
  }
  
  function hydrateFate(fate, hydrateData = {}) {
    fate.card.value = hydrateData.card ?? fate.card.value;
    fate.name.value = hydrateData.name ?? fate.name.value;
  }
  
  // Dehydrate and Hydrate methods for 'armor_weave'
  function dehydrateArmorWeave(armorWeave) {
    return {
      name: armorWeave.name.value,
      description: armorWeave.description.value,
      collapsed: armorWeave.collapsed.value,
    };
  }
  
  function hydrateArmorWeave(armorWeave, hydrateData = {}) {
    armorWeave.name.value = hydrateData.name ?? armorWeave.name.value;
    armorWeave.description.value = hydrateData.description ?? armorWeave.description.value;
    armorWeave.collapsed.value = hydrateData.collapsed ?? armorWeave.collapsed.value;
  }
  
  // Dehydrate and Hydrate methods for 'soul_weapon'
  function dehydrateSoulWeapon(soulWeapon) {
    return {
      name: soulWeapon.name.value,
      range: soulWeapon.range.value,
      damage: soulWeapon.damage.value,
      damageType: soulWeapon.damageType.value,
      qualities: { ...soulWeapon.qualities.value },
      collapsed: soulWeapon.collapsed.value,
    };
  }

  function hydrateSoulWeapon(soulWeapon, hydrateData = {}) {
    soulWeapon.name.value = hydrateData.name ?? soulWeapon.name.value;
    soulWeapon.range.value = hydrateData.range ?? soulWeapon.range.value;
    soulWeapon.damage.value = hydrateData.damage ?? soulWeapon.damage.value;
    soulWeapon.damageType.value = hydrateData.damageType ?? soulWeapon.damageType.value;
    // Handle qualities - merge with defaults if it's an object, ignore if it's a string (old format)
    if (hydrateData.qualities && typeof hydrateData.qualities === 'object') {
      Object.keys(soulWeapon.qualities.value).forEach(key => {
        soulWeapon.qualities.value[key] = hydrateData.qualities[key] ?? soulWeapon.qualities.value[key];
      });
    }
    soulWeapon.collapsed.value = hydrateData.collapsed ?? soulWeapon.collapsed.value;
  }

  // Dehydrate and Hydrate methods for 'soul_gun'
  function dehydrateSoulGun(soulGun) {
    return {
      name: soulGun.name.value,
      range: soulGun.range.value,
      damage: soulGun.damage.value,
      damageType: soulGun.damageType.value,
      qualities: { ...soulGun.qualities.value },
      collapsed: soulGun.collapsed.value,
    };
  }

  function hydrateSoulGun(soulGun, hydrateData = {}) {
    soulGun.name.value = hydrateData.name ?? soulGun.name.value;
    soulGun.range.value = hydrateData.range ?? soulGun.range.value;
    soulGun.damage.value = hydrateData.damage ?? soulGun.damage.value;
    soulGun.damageType.value = hydrateData.damageType ?? soulGun.damageType.value;
    // Handle qualities - merge with defaults if it's an object, ignore if it's a string (old format)
    if (hydrateData.qualities && typeof hydrateData.qualities === 'object') {
      Object.keys(soulGun.qualities.value).forEach(key => {
        soulGun.qualities.value[key] = hydrateData.qualities[key] ?? soulGun.qualities.value[key];
      });
    }
    soulGun.collapsed.value = hydrateData.collapsed ?? soulGun.collapsed.value;
  }

  // Dehydrate and Hydrate methods for 'magical_implement'
  function dehydrateMagicalImplement(implement) {
    return {
      name: implement.name.value,
      description: implement.description.value,
      qualities: { ...implement.qualities.value },
      collapsed: implement.collapsed.value,
    };
  }

  function hydrateMagicalImplement(implement, hydrateData = {}) {
    implement.name.value = hydrateData.name ?? implement.name.value;
    implement.description.value = hydrateData.description ?? implement.description.value;
    // Handle qualities - merge with defaults if it's an object
    if (hydrateData.qualities && typeof hydrateData.qualities === 'object') {
      Object.keys(implement.qualities.value).forEach(key => {
        implement.qualities.value[key] = hydrateData.qualities[key] ?? implement.qualities.value[key];
      });
    }
    implement.collapsed.value = hydrateData.collapsed ?? implement.collapsed.value;
  }

  // Dehydrate and Hydrate methods for 'herald'
  function dehydrateHerald(herald) {
    return {
      name: herald.name.value,
      bondLevel: herald.bondLevel.value,
      notes: herald.notes.value
    };
  }

  function hydrateHerald(herald, hydrateData = {}) {
    herald.name.value = hydrateData.name ?? herald.name.value;
    herald.bondLevel.value = hydrateData.bondLevel ?? herald.bondLevel.value;
    herald.notes.value = hydrateData.notes ?? herald.notes.value;
  }

  // Handles retrieving these values from the store
  const dehydrate = () => {
    const obj = {
      sheet_mode: sheet_mode.value,
      isTransformed: isTransformed.value,
      studentTokenImage: studentTokenImage.value,
      knightTokenImage: knightTokenImage.value,
      level: level.value,
      reputation: reputation.value,
      player: player.value,
      inspiration: inspiration.value,
      stress: stress.value,
      exhaustion: exhaustion.value,
      rollMode: rollMode.value,
      conditions: { ...conditions.value },
      exceededMortalLimits: exceededMortalLimits.value,
      dexterityMod: dexterityMod.value,
      rested: rested.value,
      studied: studied.value,
      gloom_gems: gloom.value,
      unity_points: unity.value,
      active_formation: activeFormation.value,
      formations_collapsed: formationsCollapsed.value,
      elemental_affinity: elemental_affinity.value,
      magic_style: magic_style.value,
      element_name: element_name.value,
      mam: mam.value,
      student_type: student_type.value,
      eclipse: [...eclipse.value],
      eclipse_blips: [...eclipse_blips.value],
      customProficiency: customProficiency.value,
      elemental_enhancement_1: elemental_enhancement_1.value,
      elemental_enhancement_2: elemental_enhancement_2.value,
      roll_resist_proficiency: roll_resist_proficiency.value,
      skills: dehydrateSkills(skills),
      abilityScores: dehydrateAbilityScores(abilityScores),
      hp: dehydrateHp(hp),
      hp_max: hp_max.value,
      mp: dehydrateMp(mp),
      mp_max: mp_max.value,
      shp: dehydrateShp(shp),
      shp_max: shp_max.value,
      crystal: dehydrateCrystal(crystal),
      student_ability: dehydrateStudentAbility(student_ability),
      fate: dehydrateFate(fate),
      armor_weave: dehydrateArmorWeave(armor_weave),
      soul_weapon: dehydrateSoulWeapon(soul_weapon),
      soul_gun: dehydrateSoulGun(soul_gun),
      magical_implement: dehydrateMagicalImplement(magical_implement),
      herald: dehydrateHerald(herald),
      student_damage_override: student_damage_override.value,
      student_armor_override: student_armor_override.value,
      student_move: student_move.value,
      student_attack_override: student_attack_override.value,
      knight_damage: knight_damage.value,
      knight_armor: knight_armor.value,
      knight_hasShield: knight_hasShield.value,
      knight_move: knight_move.value,
      knight_attack: knight_attack.value,
      knight_attack_override: knight_attack_override.value,
      spell_attack_override: spell_attack_override.value,
      spell_dc_override: spell_dc_override.value,
      initiative_override: initiative_override.value,

      interests: interests.value,
      virtues: virtues.value,
      strengths: strengths.value,
      weaknesses: weaknesses.value,
      electives: electives.value,
      characteristics: characteristics.value,
      quote: quote.value,
      player_links: player_links.value,
      backstory: backstory.value,

      // NPC data
      npc_name: npc_name.value,
      npc_type: npc_type.value,
      npc_size: npc_size.value,
      npc_creature_type: npc_creature_type.value,
      npc_armor: npc_armor.value,
      npc_move: npc_move.value,
      npc_invasion_level: npc_invasion_level.value,
      npc_horrific_rating: npc_horrific_rating.value,
      npc_physical_check: npc_physical_check.value,
      npc_magical_check: npc_magical_check.value,
      npc_inert_spectral_energy: npc_inert_spectral_energy.value,
      npc_whisper_rolls: npc_whisper_rolls.value,
      npc_hp: { ...npc_hp.value },
      npc_horde_hp: npc_horde_hp.value.map(unit => ({ ...unit })),
      npc_primary_attack: { ...npc_primary_attack.value },
      npc_secondary_attack: { ...npc_secondary_attack.value },
      npc_traits: [...npc_traits.value],
      npc_notes: npc_notes.value,
    };

    Object.entries(sections).forEach(([name,val]) => {
      obj[name] = arrayToObject(val.rows.value);
    });
    return obj;
  }

    // Utility function to handle parsing and hydrating blip arrays
    const hydrateEclipseBlipsArray = (targetArray, sourceArray) => {
      if (typeof sourceArray === 'string' && sourceArray.startsWith('$__$')) {
        // Extract the content inside the square brackets and parse it as an array
        const parsedArray = JSON.parse(sourceArray.match(/\[(.*?)\]/)[0]);
        targetArray.splice(0, targetArray.length, ...parsedArray);
      } else if (Array.isArray(sourceArray)) {
        // If it's already an array, hydrate directly
        targetArray.splice(0, targetArray.length, ...sourceArray);
      } else {
        console.warn('Source array is neither an array nor a valid string');
      }
    };

  // Handles updating these values in the store.
  const hydrate = (hydrateStore) => {
    sheet_mode.value = hydrateStore.sheet_mode ?? sheet_mode.value;
    isTransformed.value = hydrateStore.isTransformed ?? isTransformed.value;
    studentTokenImage.value = hydrateStore.studentTokenImage ?? studentTokenImage.value;
    knightTokenImage.value = hydrateStore.knightTokenImage ?? knightTokenImage.value;
    level.value = hydrateStore.level ?? level.value;
    reputation.value = hydrateStore.reputation ?? reputation.value;
    customProficiency.value = hydrateStore.customProficiency ?? customProficiency.value;
    proficiency.value = calculateProficiency();
    player.value = hydrateStore.player ?? player.value;
    inspiration.value = hydrateStore.inspiration ?? inspiration.value;
    stress.value = hydrateStore.stress ?? stress.value;
    exhaustion.value = hydrateStore.exhaustion ?? exhaustion.value;
    rollMode.value = hydrateStore.rollMode ?? rollMode.value;
    // Hydrate conditions
    if (hydrateStore.conditions) {
      Object.keys(conditions.value).forEach(key => {
        conditions.value[key] = hydrateStore.conditions[key] ?? conditions.value[key];
      });
    }
    // exceededMortalLimits is now computed based on reputation >= 4
    rested.value = hydrateStore.rested ?? rested.value;
    studied.value = hydrateStore.studied ?? studied.value;
    gloom.value = hydrateStore.gloom_gems ?? gloom.value;
    unity.value = hydrateStore.unity_points ?? unity.value;
    activeFormation.value = hydrateStore.active_formation ?? activeFormation.value;
    formationsCollapsed.value = hydrateStore.formations_collapsed ?? formationsCollapsed.value;

    student_damage_override.value = hydrateStore.student_damage_override ?? student_damage_override.value;
    student_armor_override.value = hydrateStore.student_armor_override ?? student_armor_override.value;
    student_move.value = hydrateStore.student_move ?? student_move.value;
    student_attack_override.value = hydrateStore.student_attack_override ?? student_attack_override.value;
    knight_damage.value = hydrateStore.knight_damage ?? knight_damage.value;
    knight_armor.value = hydrateStore.knight_armor ?? knight_armor.value;
    knight_hasShield.value = hydrateStore.knight_hasShield ?? knight_hasShield.value;
    knight_move.value = hydrateStore.knight_move ?? knight_move.value;
    knight_attack.value = hydrateStore.knight_attack ?? knight_attack.value;
    knight_attack_override.value = hydrateStore.knight_attack_override ?? knight_attack_override.value;
    spell_attack_override.value = hydrateStore.spell_attack_override ?? spell_attack_override.value;
    spell_dc_override.value = hydrateStore.spell_dc_override ?? spell_dc_override.value;
    initiative_override.value = hydrateStore.initiative_override ?? initiative_override.value;
    student_type.value = hydrateStore.student_type ?? student_type.value;

    interests.value = hydrateStore.interests ?? interests.value;
    virtues.value = hydrateStore.virtues ?? virtues.value;
    strengths.value = hydrateStore.strengths ?? strengths.value;
    weaknesses.value = hydrateStore.weaknesses ?? weaknesses.value;
    electives.value = hydrateStore.electives ?? electives.value;
    characteristics.value = hydrateStore.characteristics ?? characteristics.value;
    quote.value = hydrateStore.quote ?? quote.value;
    player_links.value = hydrateStore.player_links ?? player_links.value;
    backstory.value = hydrateStore.backstory ?? backstory.value;

    elemental_affinity.value = hydrateStore.elemental_affinity ?? elemental_affinity.value;
    magic_style.value = hydrateStore.magic_style ?? magic_style.value;
    element_name.value = hydrateStore.element_name ?? element_name.value;
    mam.value = hydrateStore.mam ?? mam.value;
    elemental_enhancement_1.value = hydrateStore.elemental_enhancement_1 ?? elemental_enhancement_1.value;
    elemental_enhancement_2.value = hydrateStore.elemental_enhancement_2 ?? elemental_enhancement_2.value;
    roll_resist_proficiency.value = hydrateStore.roll_resist_proficiency ?? roll_resist_proficiency.value;

    hydrateEclipseBlipsArray(eclipse_blips.value, hydrateStore.eclipse_blips);
    hydrateEclipseBlipsArray(eclipse.value, hydrateStore.eclipse);

    hydrateSkills(skills, hydrateStore.skills);
    hydrateAbilityScores(abilityScores, hydrateStore.abilityScores);
    hydrateHp(hp, hydrateStore.hp);
    hydrateMp(mp, hydrateStore.mp);
    hydrateShp(shp, hydrateStore.shp);
    hydrateCrystal(crystal, hydrateStore.crystal);
    hydrateStudentAbility(student_ability, hydrateStore.student_ability);
    hydrateFate(fate, hydrateStore.fate);
    hydrateArmorWeave(armor_weave, hydrateStore.armor_weave);
    hydrateSoulWeapon(soul_weapon, hydrateStore.soul_weapon);
    hydrateSoulGun(soul_gun, hydrateStore.soul_gun);
    hydrateMagicalImplement(magical_implement, hydrateStore.magical_implement);
    hydrateHerald(herald, hydrateStore.herald);

    // NPC hydration
    npc_name.value = hydrateStore.npc_name ?? npc_name.value;
    npc_type.value = hydrateStore.npc_type ?? npc_type.value;
    npc_size.value = hydrateStore.npc_size ?? npc_size.value;
    npc_creature_type.value = hydrateStore.npc_creature_type ?? npc_creature_type.value;
    npc_armor.value = hydrateStore.npc_armor ?? npc_armor.value;
    npc_move.value = hydrateStore.npc_move ?? npc_move.value;
    npc_invasion_level.value = hydrateStore.npc_invasion_level ?? npc_invasion_level.value;
    npc_horrific_rating.value = hydrateStore.npc_horrific_rating ?? npc_horrific_rating.value;
    npc_physical_check.value = hydrateStore.npc_physical_check ?? npc_physical_check.value;
    npc_magical_check.value = hydrateStore.npc_magical_check ?? npc_magical_check.value;
    npc_inert_spectral_energy.value = hydrateStore.npc_inert_spectral_energy ?? npc_inert_spectral_energy.value;
    npc_whisper_rolls.value = hydrateStore.npc_whisper_rolls ?? npc_whisper_rolls.value;
    if (hydrateStore.npc_hp) {
      npc_hp.value = { ...npc_hp.value, ...hydrateStore.npc_hp };
    }
    if (hydrateStore.npc_horde_hp) {
      npc_horde_hp.value = hydrateStore.npc_horde_hp.map((unit, i) => ({
        ...npc_horde_hp.value[i],
        ...unit
      }));
    }
    if (hydrateStore.npc_primary_attack) {
      npc_primary_attack.value = { ...npc_primary_attack.value, ...hydrateStore.npc_primary_attack };
    }
    if (hydrateStore.npc_secondary_attack) {
      npc_secondary_attack.value = { ...npc_secondary_attack.value, ...hydrateStore.npc_secondary_attack };
    }
    npc_traits.value = hydrateStore.npc_traits ?? npc_traits.value;
    npc_notes.value = hydrateStore.npc_notes ?? npc_notes.value;

    Object.entries(sections).forEach(([name,obj]) => {
      obj.rows.value = objectToArray(hydrateStore[name]);
    });
  }

  const metaStore = useMetaStore();
  const rollAbility = (name) => {
    let rollToResist = 0;
    let elementToCheck = name;
    let elementToUse = roll_resist_proficiency.value.toLowerCase();

    if (elementToUse === 'using your magic ability modifier'){
      elementToUse = mam.value.toLowerCase();
    }

    if (elementToCheck === elementToUse) {
      rollToResist = proficiency.value;
    }

    const dice = getRollDice();
    const rollModeLabel = effectiveRollMode.value !== 'normal'
      ? ` (${effectiveRollMode.value === 'advantage' ? 'Adv' : 'Disadv'})`
      : '';

    const rollObj = {
      title: toTitleCase(name),
      subtitle: `Ability Check${rollModeLabel}`,
      characterName: metaStore.name,
      components: [
        {label: dice.display, formula: dice.formula, alwaysShowInBreakdown: true},
        {label:'Mod', value:abilityScores[name].mod.value,alwaysShowInBreakdown: true},
        {label: 'Roll to Resist',value: rollToResist,alwaysShowInBreakdown: true},
        {label: 'Distressed', value: distressedPenalty.value, alwaysShowInBreakdown: distressedPenalty.value !== 0}
      ]
    };
    rollToChat({rollObj});
  };

  const rollSkill = (name) => {
    const abilityName = skills[name].ability.value;
    const formattedTitle = toTitleCase(name.replace(/_/g, ' '));
    const skillOverrideValue = skills[name].overrideValue.value;

    const dice = getRollDice();
    const rollModeLabel = effectiveRollMode.value !== 'normal'
      ? ` (${effectiveRollMode.value === 'advantage' ? 'Adv' : 'Disadv'})`
      : '';

    if (skillOverrideValue !== '' && skillOverrideValue !== undefined){
      const rollObj = {
        title: formattedTitle,
        subtitle: rollModeLabel ? `Skill Check${rollModeLabel}` : undefined,
        characterName: metaStore.name,
        components: [
          {label: dice.display, formula: dice.formula, alwaysShowInBreakdown: true},
          {label:'Skill Value Override', value:Number(skillOverrideValue) || 0,alwaysShowInBreakdown: true},
          {label: 'Distressed', value: distressedPenalty.value, alwaysShowInBreakdown: distressedPenalty.value !== 0}
        ]
      };
      rollToChat({rollObj});
    }else{
      const rollObj = {
        title: formattedTitle,
        subtitle: rollModeLabel ? `Skill Check${rollModeLabel}` : undefined,
        characterName: metaStore.name,
        components: [
          {label: dice.display, formula: dice.formula, alwaysShowInBreakdown: true},
          {label:'Mod', value:abilityScores[abilityName].mod.value,alwaysShowInBreakdown: true},
          {label: 'Distressed', value: distressedPenalty.value, alwaysShowInBreakdown: distressedPenalty.value !== 0}
        ]
      };
      if(skills[name].proficiency.value){
        rollObj.components.push({label: 'Prof',value:Number(proficiency.value),alwaysShowInBreakdown: true});
      }
      rollToChat({rollObj});
    }
  };

  const rollWeapon = async (item,tier) => {
    let abMod = Number(knight_attack.value) || 0;

    const dice = getRollDice();
    const rollModeLabel = effectiveRollMode.value !== 'normal'
      ? ` (${effectiveRollMode.value === 'advantage' ? 'Adv' : 'Disadv'})`
      : '';

    const attackPromise = getRollResults(
      [
        {label:`Attack Roll: ${dice.display}`, formula: dice.formula, alwaysShowInBreakdown: true},
        {label:'Mod', value:abMod,alwaysShowInBreakdown: true},
        //{label:'Prof',value: proficiency.value,alwaysShowInBreakdown: true}
      ]
    );
    const promArr = [attackPromise];
    if(soul_weapon.damage.value){
      const damagePromise = getRollResults([{label:'damage',formula:soul_weapon.damage.value}]);
      promArr.push(damagePromise);
    }
    const [
      {total:attackResult,components:attackComp},
      {total:damageResult,components:damageComp}
    ] = await Promise.all(promArr);

    if (damageResult && damageComp)
    {
      // Format the breakdown of dice rolls for output
      const diceRolls = damageComp[0].results.dice || []; // Safely get individual dice roll results
      const modifier = damageResult.mod || 0;
      const totalDamage = Number(damageComp[0].results.result) + Number(modifier) || 0;

      var modifierUsed = damageResult - diceRolls.reduce((acc, curr) => acc + curr, 0);
      var damageBreakdownRoll = `(${diceRolls.join(' + ')})`;
      var damageBreakdownMod = `(${modifierUsed})`;
      var damageBreakdownMam = `(${modifier})`;
      var damageBreakdownTotal = `${totalDamage}`;
      var damageFormula = `${damageComp[0].formula}`;
    }

    const rollObj = {
      title: soul_weapon.name.value,
      characterName: metaStore.name,
      components:attackComp,
      keyValues:{}
    }

    if(soul_weapon.range.value){
      rollObj.subtitle = `Range: ${soul_weapon.range.value}`;
    }

    if(soul_weapon.qualities.value){
      rollObj.textContent = soul_weapon.qualities.value;
    }
    if(soul_weapon.damage.value) {
      const dmgType = damageTypeLabels[soul_weapon.damageType.value] || 'Physical';
      rollObj.keyValues[`Damage Type`] = dmgType;
      rollObj.keyValues[`Soul Weapon Damage Roll`] = soul_weapon.damage.value;

    if(item.range){
      rollObj.keyValues.Range = item.range;
    }

    if (damageBreakdownRoll){
      rollObj.keyValues[`Roll`] = damageBreakdownRoll;
    }
    if (damageBreakdownMod) {
      rollObj.keyValues[`Modifier`] = damageBreakdownMod;
    }
    if (damageBreakdownTotal){
      rollObj.keyValues[`Total ${dmgType}`] = damageBreakdownTotal;
    }

    }
    rollToChat({rollObj});
  };

 const studentAbilityToChat = () => {
  return;
 }

  const rollSpell = async (item,tier) => {
    const abMod = abilityScores[mam.value]?.mod.value || 0;

    const dice = getRollDice();
    const rollModeLabel = effectiveRollMode.value !== 'normal'
      ? ` (${effectiveRollMode.value === 'advantage' ? 'Adv' : 'Disadv'})`
      : '';

    const attackPromise = getRollResults(
      [
        {label: dice.display, formula: dice.formula, alwaysShowInBreakdown: true},
        {label:'MAM', value:abMod,alwaysShowInBreakdown: true},
        {label:'Prof',value: Number(proficiency.value),alwaysShowInBreakdown: true}
      ]
    );
    const promArr = [attackPromise];
    if(item[`tier_${tier}_dice`]){
      const damagePromise = getRollResults(
        [
          {label:'damage',formula:item[`tier_${tier}_dice`]}
        ]);
      promArr.push(damagePromise);
    }
    const [
      {total:attackResult,components:attackComp},
      {total:damageResult,components:damageComp}
    ] = await Promise.all(promArr);

    if (damageResult && damageComp) 
    {
      // Format the breakdown of dice rolls for output
      const diceRolls = damageComp[0].results.dice || []; // Safely get individual dice roll results
      const modifier = abMod || 0;
      const totalDamage = damageComp[0].results.result + abMod || 0;

      var modifierUsed = damageResult - diceRolls.reduce((acc, curr) => acc + curr, 0);
      var damageBreakdownRoll = `(${diceRolls.join(' + ')})`;
      var damageBreakdownMod = `(${modifierUsed})`;
      var damageBreakdownMam = `(${modifier})`;
      var damageBreakdownTotal = `${totalDamage}`;
    }

    const rollObj = {
      title: item[`tier_${tier}_name`] || `${item.name} ${tier}`,
      characterName: metaStore.name,
      components: attackComp,
      keyValues: {}
    }
    if(item[`tier_${tier}_name`]){
      rollObj.subtitle = item.name;
    }
    if(item.range){
      //rollObj.keyValues.Range = item.range;
      rollObj.subtitle = `Range: ${item.range}`;
    }
    if(item[`tier_${tier}_dice`]){
      rollObj.keyValues[`Spell Effect Roll`] = item[`tier_${tier}_dice`];
      rollObj.keyValues[`Roll`] = damageBreakdownRoll;
      rollObj.keyValues[`Mod`] = damageBreakdownMod;
      rollObj.keyValues[`MAM`] = damageBreakdownMam;
      rollObj.keyValues[`Total`] = damageBreakdownTotal;
    }
    if(item[`tier_${tier}_special`]){
      rollObj.keyValues.Special = item[`tier_${tier}_special`];
    }
    if(item[`tier_${tier}_description`]){
      rollObj.textContent = item[`tier_${tier}_description`];
    }
    rollToChat({rollObj});
  };

  const rollInitiative = (name) => {
    const dice = getRollDice();
    const rollModeLabel = effectiveRollMode.value !== 'normal'
      ? ` (${effectiveRollMode.value === 'advantage' ? 'Adv' : 'Disadv'})`
      : '';

    const rollObj = {
      title: 'Roll Initiative',
      subtitle: rollModeLabel || undefined,
      characterName: metaStore.name,
      components: [
        {label: dice.display, formula: dice.formula, alwaysShowInBreakdown: true},
        {label:'Initiative', value:Number(initiative.value),alwaysShowInBreakdown: true},
      ]
    };
    rollToChat({rollObj});
  };

  const rollKnightAttack = (name) => {
    const dice = getRollDice();
    const rollModeLabel = effectiveRollMode.value !== 'normal'
      ? ` (${effectiveRollMode.value === 'advantage' ? 'Adv' : 'Disadv'})`
      : '';

    const components = [
      {label: dice.display, formula: dice.formula, alwaysShowInBreakdown: true},
      {label:'Attack', value:Number(knight_attack.value),alwaysShowInBreakdown: true}
    ];

    // Add weapon quality bonus if any
    const qualityBonus = weaponQualityAttackBonus.value;
    if (qualityBonus !== 0) {
      components.push({label: 'Qualities', value: qualityBonus, alwaysShowInBreakdown: true});
    }

    const rollObj = {
      title: 'Attack Roll',
      subtitle: `Magi-Knight Persona${rollModeLabel}`,
      characterName: metaStore.name,
      components: components,
      keyValues: {}
    };

    // Show crit range if modified
    if (weaponCritRange.value !== 20) {
      rollObj.keyValues['Crit Range'] = `${weaponCritRange.value}-20`;
    }

    rollToChat({rollObj});
  };

  const rollStudentAttack = (name) => {
    const dice = getRollDice();
    const rollModeLabel = effectiveRollMode.value !== 'normal'
      ? ` (${effectiveRollMode.value === 'advantage' ? 'Adv' : 'Disadv'})`
      : '';

    const rollObj = {
      title: 'Attack Roll',
      subtitle: `Student Persona${rollModeLabel}`,
      characterName: metaStore.name,
      components: [
        {label: dice.display, formula: dice.formula, alwaysShowInBreakdown: true},
        {label:'Value', value:Number(student_attack.value),alwaysShowInBreakdown: true},
      ]
    };
    rollToChat({rollObj});
  };

  const rollStudentDamage = async (notation) => {
    let notationString = String(student_damage.value || notation);

    // Validate that there's a dice expression to roll
    if (!notationString || !notationString.match(/\d*[dD]\d+/)) {
      return;
    }

    // Use getRollResults with formula property to support complex dice expressions
    // like "1d12+2d6+3+4+5" - the Roll20 Beacon API handles all parsing
    const { total, components } = await getRollResults([
      { label: 'Damage', formula: notationString, rollFormula: true, alwaysShowInBreakdown: true }
    ]);

    // Mark all components to show in breakdown
    components.forEach(comp => {
      comp.alwaysShowInBreakdown = true;
    });

    // Format the roll for chat - Student attacks are always Physical
    const rollObj = {
      title: 'Damage Roll',
      subtitle: 'Student Persona - Physical',
      characterName: metaStore.name,
      components: components,
      total: Number(total),
      keyValues: {
        'Damage Type': 'Physical'
      }
    };

    rollToChat({ rollObj });

    return total;
  }; 

  const rollKnightDamage = async (notation) => {
    let notationString = String(knight_damage.value || notation);

    // Validate that there's a dice expression to roll
    if (!notationString || !notationString.match(/\d*[dD]\d+/)) {
      return;
    }

    // Build components array for the roll
    const rollComponents = [
      { label: 'Damage', formula: notationString, rollFormula: true, alwaysShowInBreakdown: true }
    ];

    // Add weapon quality damage bonus if any
    const qualityDmgBonus = weaponQualityDamageBonus.value;
    if (qualityDmgBonus !== 0) {
      rollComponents.push({ label: 'Qualities', value: qualityDmgBonus, alwaysShowInBreakdown: true });
    }

    // Use getRollResults with formula property to support complex dice expressions
    const { total, components } = await getRollResults(rollComponents);

    // Mark all components to show in breakdown
    components.forEach(comp => {
      comp.alwaysShowInBreakdown = true;
    });

    // Get damage type from soul weapon
    const dmgType = damageTypeLabels[soul_weapon.damageType.value] || 'Physical';

    // Format the roll for chat
    const rollObj = {
      title: 'Damage Roll',
      subtitle: `Magi-Knight Persona - ${dmgType}`,
      characterName: metaStore.name,
      components: components,
      total: Number(total),
      keyValues: {
        'Damage Type': dmgType
      }
    };

    rollToChat({ rollObj });

    return total;
  };

  // ==================== SOUL GUN ROLL FUNCTIONS ====================

  const rollGunAttack = () => {
    const dice = getRollDice();
    const rollModeLabel = effectiveRollMode.value !== 'normal'
      ? ` (${effectiveRollMode.value === 'advantage' ? 'Adv' : 'Disadv'})`
      : '';

    const components = [
      {label: dice.display, formula: dice.formula, alwaysShowInBreakdown: true},
      {label:'Attack', value:Number(knight_attack.value),alwaysShowInBreakdown: true}
    ];

    // Add gun quality bonus if any
    const qualityBonus = gunQualityAttackBonus.value;
    if (qualityBonus !== 0) {
      components.push({label: 'Qualities', value: qualityBonus, alwaysShowInBreakdown: true});
    }

    const rollObj = {
      title: 'Soul Gun Attack',
      subtitle: `Magi-Knight Persona${rollModeLabel}`,
      characterName: metaStore.name,
      components: components,
      keyValues: {}
    };

    // Show crit range if modified
    if (gunCritRange.value !== 20) {
      rollObj.keyValues['Crit Range'] = `${gunCritRange.value}-20`;
    }

    // Show range
    if (soul_gun.range.value) {
      rollObj.keyValues['Range'] = soul_gun.range.value;
    }

    rollToChat({rollObj});
  };

  const rollGunDamage = async () => {
    let notationString = String(soul_gun.damage.value);

    // Validate that there's a dice expression to roll
    if (!notationString || !notationString.match(/\d*[dD]\d+/)) {
      return;
    }

    // Build components array for the roll
    const rollComponents = [
      { label: 'Damage', formula: notationString, rollFormula: true, alwaysShowInBreakdown: true }
    ];

    // Add gun quality damage bonus if any
    const qualityDmgBonus = gunQualityDamageBonus.value;
    if (qualityDmgBonus !== 0) {
      rollComponents.push({ label: 'Qualities', value: qualityDmgBonus, alwaysShowInBreakdown: true });
    }

    // Use getRollResults with formula property to support complex dice expressions
    const { total, components } = await getRollResults(rollComponents);

    // Mark all components to show in breakdown
    components.forEach(comp => {
      comp.alwaysShowInBreakdown = true;
    });

    // Get damage type from soul gun
    const dmgType = damageTypeLabels[soul_gun.damageType.value] || 'Physical';

    // Format the roll for chat
    const rollObj = {
      title: 'Soul Gun Damage',
      subtitle: `Magi-Knight Persona - ${dmgType}`,
      characterName: metaStore.name,
      components: components,
      total: Number(total),
      keyValues: {
        'Damage Type': dmgType
      }
    };

    // Show scatter bonus reminder if active
    if (soul_gun.qualities.value.scatter) {
      rollObj.keyValues['Scatter'] = '+2 damage at 5ft';
    }

    rollToChat({ rollObj });

    return total;
  };

  const toTitleCase = (str) => {
    const minorWords = ['a', 'an', 'the', 'and', 'but', 'or', 'for', 'nor', 'on', 'at', 'to', 'by', 'with', 'in', 'of'];

    return str.split(' ').map((word, index, arr) => {
      // Capitalize first and last words, or if word is not a minor word
      if (index === 0 || index === arr.length - 1 || !minorWords.includes(word.toLowerCase())) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }
      // Lowercase the minor words
      return word.toLowerCase();
    }).join(' ');
  };

  // ==================== SQUADRON FORMATION FUNCTIONS ====================

  const activateFormation = (formationKey) => {
    const formation = formationData[formationKey];
    if (!formation) return;

    const rep = reputation.value;
    const effects = formationEffects.value[formationKey];

    // Set active formation
    activeFormation.value = formationKey;

    // Build key values based on formation type
    const keyValues = {
      'Type': formation.type,
      'Cost': `${formation.cost} Inspiration`,
      'Formation Range': '60ft'
    };

    // Add specific effect values
    if (formationKey === 'arrow') {
      keyValues['Damage Bonus'] = `+${effects.damage}`;
      keyValues['After Oversee'] = `+${effects.additionalDamage} additional`;
    } else if (formationKey === 'victory') {
      keyValues['Damage Reduction'] = `${effects.damageReduction}`;
      keyValues['Special'] = 'Can intercept damage for allies';
    } else if (formationKey === 'barrage') {
      keyValues['Rushed Spells'] = 'Full damage (no ½ reduction)';
      keyValues['Overcharge'] = 'Costs only 1 Exhaustion';
    } else if (formationKey === 'diamond') {
      keyValues['Healing'] = `${effects.healing} HP/turn`;
      keyValues['Condition Removal'] = 'Advantage vs Nemesis or weaker';
      keyValues['Special'] = 'Immune to Distressed';
    }

    const rollObj = {
      title: formation.name,
      subtitle: `Squadron Formation Activated`,
      characterName: metaStore.name,
      components: [],
      keyValues: keyValues,
      textContent: formation.description
    };

    rollToChat({ rollObj });
  };

  const deactivateFormation = () => {
    if (activeFormation.value) {
      const formation = formationData[activeFormation.value];
      const rollObj = {
        title: formation.name,
        subtitle: 'Formation Ended',
        characterName: metaStore.name,
        components: [],
        keyValues: {}
      };
      rollToChat({ rollObj });
      activeFormation.value = null;
    }
  };

  // ==================== NPC ROLL FUNCTIONS ====================

  const rollNPCAttack = async (attackType = 'primary') => {
    const attack = attackType === 'primary' ? npc_primary_attack.value : npc_secondary_attack.value;
    const current = attackType === 'primary' ? npc_primary_current.value : npc_secondary_current.value;
    const isHorde = npc_type.value === 'horde';

    let subtitle = '';
    if (isHorde) {
      subtitle = `O-Attack DC ${current.attackDC} (${npc_active_units.value}/4 units)`;
    } else {
      subtitle = `Attack Roll`;
    }

    const components = isHorde
      ? [] // Hordes use DC, not attack roll
      : [
          { label: 'd20', formula: '1d20', alwaysShowInBreakdown: true },
          { label: 'Attack', value: attack.attackBonus, alwaysShowInBreakdown: true }
        ];

    if (isHorde) {
      // For hordes, just display the DC info
      const rollObj = {
        title: attack.name,
        subtitle: subtitle,
        characterName: npc_name.value || 'NPC',
        components: [],
        total: current.attackDC,
        keyValues: {
          'Range': attack.range,
          'O-Attack DC': current.attackDC
        }
      };
      rollToChat({ rollObj, whisper: npc_whisper_rolls.value });
    } else {
      // For non-hordes, roll attack
      const { total, components: resultComponents } = await getRollResults(components);
      resultComponents.forEach(comp => { comp.alwaysShowInBreakdown = true; });

      const rollObj = {
        title: attack.name,
        subtitle: subtitle,
        characterName: npc_name.value || 'NPC',
        components: resultComponents,
        total: Number(total),
        keyValues: {
          'Range': attack.range
        }
      };
      rollToChat({ rollObj, whisper: npc_whisper_rolls.value });
    }
  };

  const rollNPCDamage = async (attackType = 'primary') => {
    const attack = attackType === 'primary' ? npc_primary_attack.value : npc_secondary_attack.value;
    const current = attackType === 'primary' ? npc_primary_current.value : npc_secondary_current.value;
    const isHorde = npc_type.value === 'horde';

    const damageValue = isHorde ? current.damage : attack.damage;
    const dmgType = damageTypeLabels[attack.damageType] || 'Physical';

    // Check if damage is a dice expression or flat number
    const isDiceExpression = String(damageValue).match(/\d*[dD]\d+/);

    let total, resultComponents;
    if (isDiceExpression) {
      const result = await getRollResults([
        { label: 'Damage', formula: damageValue, rollFormula: true, alwaysShowInBreakdown: true }
      ]);
      total = result.total;
      resultComponents = result.components;
      resultComponents.forEach(comp => { comp.alwaysShowInBreakdown = true; });
    } else {
      // Flat damage (common for hordes)
      total = parseInt(damageValue) || 0;
      resultComponents = [{ label: 'Damage', value: total, alwaysShowInBreakdown: true }];
    }

    const rollObj = {
      title: `${attack.name} Damage`,
      subtitle: isHorde ? `${npc_active_units.value}/4 units - ${dmgType}` : dmgType,
      characterName: npc_name.value || 'NPC',
      components: resultComponents,
      total: Number(total),
      keyValues: {
        'Damage Type': dmgType
      }
    };

    rollToChat({ rollObj, whisper: npc_whisper_rolls.value });
    return total;
  };

  const rollNPCCheck = async (checkType = 'physical') => {
    const modifier = checkType === 'physical' ? npc_physical_check.value : npc_magical_check.value;
    const checkName = checkType === 'physical' ? 'Physical Check' : 'Magical Check';

    const { total, components } = await getRollResults([
      { label: 'd20', formula: '1d20', alwaysShowInBreakdown: true },
      { label: 'Mod', value: modifier, alwaysShowInBreakdown: true }
    ]);

    components.forEach(comp => { comp.alwaysShowInBreakdown = true; });

    const rollObj = {
      title: checkName,
      subtitle: npcTypes[npc_type.value]?.name || 'NPC',
      characterName: npc_name.value || 'NPC',
      components: components,
      total: Number(total)
    };

    rollToChat({ rollObj, whisper: npc_whisper_rolls.value });
    return total;
  };

  const rollNPCGloomGems = async () => {
    const diceExpr = npc_inert_spectral_energy.value || '1d4';

    const { total, components } = await getRollResults([
      { label: 'Gloom Gems', formula: diceExpr, rollFormula: true, alwaysShowInBreakdown: true }
    ]);

    components.forEach(comp => { comp.alwaysShowInBreakdown = true; });

    const rollObj = {
      title: 'Inert Spectral Energy',
      subtitle: 'Gloom Gems Yield',
      characterName: npc_name.value || 'NPC',
      components: components,
      total: Number(total)
    };

    rollToChat({ rollObj, whisper: npc_whisper_rolls.value });
    return total;
  };

  // Add a trait to NPC
  const addNPCTrait = () => {
    npc_traits.value.push({
      _id: uuidv4(),
      name: `Trait ${npc_traits.value.length + 1}`,
      description: ''
    });
  };

  // Remove a trait from NPC
  const removeNPCTrait = (traitId) => {
    npc_traits.value = npc_traits.value.filter(t => t._id !== traitId);
  };

  // ==================== END NPC ROLL FUNCTIONS ====================

  return {
    sheet_mode,
    isTransformed,
    studentTokenImage,
    knightTokenImage,
    level,
    reputation,
    player,
    inspiration,
    stress,
    exhaustion,
    trauma,
    exceededMortalLimits,
    proficiency,
    customProficiency,

    // Roll mode (advantage/disadvantage)
    rollMode,
    effectiveRollMode,
    forcedDisadvantage,

    // Conditions
    conditions,
    activeConditions,
    conditionDisadvantageOnAttacks,
    distressedPenalty,

    hp,
    mp,
    shp,

    crystal,

    abilityScores,
    skills,

    initiative,
    initiative_override,
    
    eclipse,
    eclipse_blips,
    eclipse_phase,
    studied,
    rested,
    fate,
    student_ability,
    student_type,
    armor_weave,
    soul_weapon,
    weaponQualityDefs,
    weaponQualityAttackBonus,
    weaponQualityDamageBonus,
    weaponCritRange,
    activeWeaponQualities,
    soul_gun,
    gunQualityDefs,
    gunQualityAttackBonus,
    gunQualityDamageBonus,
    gunCritRange,
    activeGunQualities,
    rollGunAttack,
    rollGunDamage,
    magical_implement,
    implementQualityDefs,
    hasManaAttunement,
    implementSpellAttackBonus,
    implementSpellDCBonus,
    activeImplementQualities,
    damageTypeLabels,
    gloom_gems:gloom,
    unity_points:unity,
    unity_max: unityMax,
    unity_available: unityAvailable,
    herald,
    tierVIUnlocked,

    // Squadron Formations
    formationData,
    activeFormation,
    formationEffects,
    formationsCollapsed,
    activateFormation,
    deactivateFormation,

    traitsCount,

    interests,
    virtues,
    strengths,
    weaknesses,
    electives,
    characteristics,
    quote,
    player_links,
    backstory,

    student_damage,
    student_damage_override,
    student_armor,
    student_armor_override,
    student_move,
    student_attack,
    student_attack_override,
    hp_max_override,
    mp_max_override,
    shp_max_override,
    knight_damage,
    knight_armor,
    knight_hasShield,
    knight_move,
    knight_attack,
    knight_attack_override,
    spell_attack_override,
    spell_dc_override,
    elemental_affinity,
    magic_style,
    element_name,
    mam,
    elemental_enhancement_1,
    elemental_enhancement_2,
    roll_resist_proficiency,
    spell_attack,
    spell_dc,
    sections,
    max_spell_tier,
    addRow,
    removeRow,
    removeTrait: (traitId) => removeTrait(traits, traitId),

    rollInitiative,
    rollAbility,
    rollSkill,
    rollWeapon,
    rollSpell,
    rollKnightAttack,
    rollStudentAttack,
    rollStudentDamage,
    rollKnightDamage,

    // Toggle transformation state and return info for token update
    toggleTransform: () => {
      isTransformed.value = !isTransformed.value;
      return {
        isTransformed: isTransformed.value,
        tokenImage: isTransformed.value ? knightTokenImage.value : studentTokenImage.value,
        formName: isTransformed.value ? 'Magi-Knight' : 'Student'
      };
    },

    // NPC exports
    npcTypes,
    npc_name,
    npc_type,
    npc_size,
    npc_creature_type,
    npc_armor,
    npc_move,
    npc_invasion_level,
    npc_horrific_rating,
    npc_physical_check,
    npc_magical_check,
    npc_inert_spectral_energy,
    npc_whisper_rolls,
    npc_hp,
    npc_horde_hp,
    npc_active_units,
    npc_primary_attack,
    npc_secondary_attack,
    npc_primary_current,
    npc_secondary_current,
    npc_traits,
    npc_notes,
    rollNPCAttack,
    rollNPCDamage,
    rollNPCCheck,
    rollNPCGloomGems,
    addNPCTrait,
    removeNPCTrait,

    dehydrate,
    hydrate
  }
});

// make sure to pass the right store definition, `useAuth` in this case.
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSheetStore, import.meta.hot))
}