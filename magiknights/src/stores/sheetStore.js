import { defineStore, acceptHMRUpdate } from 'pinia';
import { ref, computed } from 'vue';
import { v4 as uuidv4 } from 'uuid';

import { arrayToObject, getRollResults, objectToArray, rollToChat } from '@/utility';
import { useMetaStore } from './metaStore';
import { SPELL_PATH_DATA, CANONICAL_SPELL_PATHS } from '@/data/spellPathData';
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

  // Budget Tallies: the game's currency for purchasing gear and services
  const budgetTallies = ref(0);
  // Training Tallies: XP counter, 0-8 that resets on level-up
  const trainingTallies = ref(0);
  const trainingTalliesMax = 8;

  // Club System
  const clubTallies = ref(0);
  const clubTalliesMax = 8;
  const resoundingGrowths = ref(0);
  const clubPosition = ref('member');
  const clubPositionData = {
    member: { name: 'Member', bonus: '' },
    vicePresident: { name: 'Vice-President', bonus: '+5 Influence with Faculty, 1/Sleep: Auto-pass Student Body Influence' },
    president: { name: 'President', bonus: '+4 Persuasion with club members, Grant VP benefits to others' }
  };

  const detentionTickets = ref(0);

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

  // Endurance Die system: roll 1d6 alongside d20 when affected by Stress (mental) or Exhaustion (physical).
  // If d6 >= current level, negate the penalty. Level 6 Disadvantage cannot be negated.
  const enduranceDieEnabled = ref(true);
  const freakingOutToday = ref(false);

  // Mental abilities affected by Stress, Physical abilities affected by Exhaustion
  const mentalAbilities = ['intelligence', 'wisdom', 'charisma'];
  const physicalAbilities = ['strength', 'dexterity', 'constitution'];

  // Returns Endurance Die info for a given ability name (used by roll functions)
  const getEnduranceDieInfo = (abilityName) => {
    if (!enduranceDieEnabled.value) return null;
    const lower = abilityName.toLowerCase();
    if (mentalAbilities.includes(lower) && stress.value > 0 && stress.value < 6) {
      return { type: 'stress', level: stress.value };
    }
    if (physicalAbilities.includes(lower) && exhaustion.value > 0 && exhaustion.value < 6) {
      return { type: 'exhaustion', level: exhaustion.value };
    }
    return null;
  };

  // Sleep Phase effect tracking
  const sleepEffect = ref('average');
  const sleepEffectData = {
    average: { name: 'Average Sleep', stressRecovery: 1, exhaustionRecovery: 1, hpRecovery: 'none', fractureRecovery: 0 },
    feverish: { name: 'Feverish Dreams', stressRecovery: 0, exhaustionRecovery: 0, hpRecovery: 'none', fractureRecovery: 0, note: 'Nightmares, no recovery' },
    refreshing: { name: 'Refreshing Sleep', stressRecovery: 2, exhaustionRecovery: 2, hpRecovery: 'full', fractureRecovery: 1, note: 'Full HP, -1 Fracture' }
  };

  // Heart Stage progression for NPC social bonds
  const heartStageData = [
    { value: 'threatening', label: 'Threatening', min: -999, max: -16 },
    { value: 'hostile', label: 'Hostile', min: -15, max: -6 },
    { value: 'cold', label: 'Cold', min: -5, max: -1 },
    { value: 'neutral', label: 'Neutral', min: 0, max: 5 },
    { value: 'warm', label: 'Warm', min: 6, max: 11 },
    { value: 'friendly', label: 'Friendly', min: 12, max: 19 },
    { value: 'sympathetic', label: 'Sympathetic', min: 20, max: 999 }
  ];
  const getHeartStageForSP = (sp) => {
    const stage = heartStageData.find(s => sp >= s.min && sp <= s.max);
    return stage ? stage.value : 'neutral';
  };

  // Daily/per-session limit tracking
  const sealImplantGiven = ref(false);
  const sealImplantReceived = ref(false);
  const soulSacrificeCount = ref(0);
  const soulSacrificeMax = computed(() => reputation.value);

  // Relic capacity: max relics = Reputation Level (0-5)
  const relicCapacity = computed(() => reputation.value);
  // NOTE: relicsOverCapacity is defined after sections object (requires sections.relics.rows)

  // Get the dice expression based on roll mode
  const getRollDice = (forceDisadvantage = false, forceAdvantage = false) => {
    let mode;
    if (forceDisadvantage && forceAdvantage) {
      mode = 'normal'; // cancel out
    } else if (forceDisadvantage) {
      mode = 'disadvantage';
    } else if (forceAdvantage) {
      mode = 'advantage';
    } else {
      mode = effectiveRollMode.value;
    }
    switch (mode) {
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
    disoriented: false,
    exposed: false,
    paralyzed: false,
    prone: false,
    restrained: false,
    unconscious: false,
    // Depletion conditions
    depleted: false,
    drained: false,
    poisoned: false,
    silenced: false,
    soulSiphoned1: false,
    soulSiphoned2: false,
    soulSiphoned3: false,
    soulSiphoned4: false,
    soulTainted: false
  });

  // Get list of active conditions
  const activeConditions = computed(() => {
    return Object.entries(conditions.value)
      .filter(([_, active]) => active)
      .map(([name, _]) => name);
  });

  // Check if any condition grants disadvantage on attacks
  // Per compendium: Depleted, Drained, Distressed, Disoriented cause Disadvantage on YOUR attacks
  const conditionDisadvantageOnAttacks = computed(() => {
    return conditions.value.depleted ||
           conditions.value.drained ||
           conditions.value.distressed ||
           conditions.value.disoriented;
  });

  // Check if any condition grants disadvantage on skill checks
  // Per compendium: Distressed gives "Disadvantage on Skill Checks and Attack Actions"
  // Disoriented gives "Disadvantage on Attacks, Physical Resists, Skill Checks"
  const conditionDisadvantageOnSkillChecks = computed(() => {
    return conditions.value.distressed || conditions.value.disoriented;
  });

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
  // Statistic Increase tracking - +2 to one stat or +1 to two at levels 3, 6, 9, 12, 15
  const statIncreases = ref([]);
  const statIncreaseLevels = [3, 6, 9, 12, 15];
  const statIncreasesApplied = computed(() => statIncreases.value.length);
  const statIncreasesAvailable = computed(() => statIncreaseLevels.filter(l => l <= level.value).length);
  const statIncreasesMissing = computed(() => statIncreasesAvailable.value - statIncreasesApplied.value);

  // Per compendium: Tier I=Lv1, II=Lv3, III=Lv5, IV=Lv7, V=Lv11, VI=Lv14+(Herald Bond IV+)
  const levelSpellDict = [,1,1,2,2,3,3,4,4,4,4,5,5,5,6,6];
  const max_spell_tier = computed(() => {
    const tierByLevel = levelSpellDict[level.value] || 1;
    // Tier VI requires Herald Bond Level IV+
    if (tierByLevel >= 6 && herald.bondLevel.value < 4) return 5;
    return tierByLevel;
  });
  const tierRomanToNum = { I: 1, II: 2, III: 3, IV: 4, V: 5, VI: 6 };
  const isTierUnlocked = (tier) => tierRomanToNum[tier] <= max_spell_tier.value;

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

  // Skill Mastery: one skill gets +Reputation Level (min 1) bonus
  const masteredSkill = ref('');

  const initiative_override = ref('');
  const initiative = computed({
    get() {
      // If the override is empty, return the calculated value
      if (initiative_override.value === '') {
        let init = dexterityMod.value;

        // Add Magical Foresight bonus if tactic is active
        if (hasTacticActive('Magical Foresight')) {
          const mamMod = abilityScores[mam.value]?.mod.value || 0;
          init += mamMod;
        }

        return init;
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

  // Branching Element - sub-element choice based on primary affinity
  const branchingElement = ref('');
  const branchingElementOptions = {
    earth: ['Wood', 'Metal'],
    fire: ['Lightning', 'Toxins'],
    air: ['Force', 'Sonance'],
    water: ['Ice', 'Blood'],
    void: ['Light', 'Dark']
  };
  const availableBranches = computed(() => {
    return branchingElementOptions[elemental_affinity.value] || [];
  });

  // Spell Paths Known - derived from spell section rows
  const availableSpellPaths = CANONICAL_SPELL_PATHS;
  const maxSpellPaths = computed(() => {
    if (level.value < 4) return 2;
    if (level.value < 8) return 3;
    return 4;
  });

  // Auto-calculated HP: 10 + CON Mod + (Level - 1) × (6 + CON Mod)
  // Tough as Nails Tactic adds: +2 Student HP + 2 HP/Level while transformed
  const hp_max_override = ref('');
  const hp_max = computed({
    get() {
      if (hp_max_override.value !== '' && !isNaN(Number(hp_max_override.value))) {
        return Number(hp_max_override.value);
      }
      // Formula: 10 + CON Mod + (Level - 1) × (6 + CON Mod)
      const conMod = constitutionMod.value;
      let hp = 10 + conMod + (level.value - 1) * (6 + conMod);

      // Add Tough as Nails bonus if tactic is active
      if (hasTacticActive('Tough as Nails')) {
        hp += 2 + (level.value * 2); // +2 Student HP + 2 HP/Level
      }

      return hp;
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
  // Adept of Magic Tactic adds +1 to Reputation Level for MCO calculation
  const mp_max_override = ref('');
  const mp_max = computed({
    get() {
      if (mp_max_override.value !== '' && !isNaN(Number(mp_max_override.value))) {
        return Number(mp_max_override.value);
      }
      // MCO = Magi-Knight Level + Magic Ability Modifier + Reputation Level
      const mamMod = abilityScores[mam.value]?.mod.value || 0;
      let repBonus = reputation.value;

      // Add Adept of Magic bonus if tactic is active
      if (hasTacticActive('Adept of Magic')) {
        repBonus += 1;
      }

      const mco = level.value + mamMod + repBonus;
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

  // Rolls to Resist advantage/disadvantage tracking per type
  // Per compendium: Physical (STR/DEX/CON), Magic (INT/WIS/CHA), Horror (WIS/CHA), Purity (WIS/CHA)
  const resistModifiers = ref({
    physical: { advantage: false, disadvantage: false },
    magic: { advantage: false, disadvantage: false },
    horror: { advantage: false, disadvantage: false },
    purity: { advantage: false, disadvantage: false }
  });

  // Map ability names to resist types for determining which resist type a roll belongs to
  const abilityToResistType = {
    strength: 'physical',
    dexterity: 'physical',
    constitution: 'physical',
    intelligence: 'magic',
    wisdom: 'magic',
    charisma: 'magic'
  };

  // Condition-based resist disadvantage
  // Disoriented: Disadvantage on Physical Resists
  // Restrained: Disadvantage on DEX (DEX → Physical resist)
  // Horrified: Disadvantage on Rolls to Resist (all EXCEPT Horror, which is explicitly exempt)
  const conditionResistDisadvantage = computed(() => ({
    physical: conditions.value.disoriented || conditions.value.restrained || conditions.value.horrified,
    magic: conditions.value.horrified,
    horror: false,
    purity: conditions.value.horrified
  }));

  // Active resist modifiers combining manual toggles and condition effects
  const activeResistModifiers = computed(() => {
    const result = {};
    for (const type of ['physical', 'magic', 'horror', 'purity']) {
      const hasAdvantage = resistModifiers.value[type].advantage;
      const hasDisadvantage = resistModifiers.value[type].disadvantage || conditionResistDisadvantage.value[type];
      // If both, they cancel out
      if (hasAdvantage && hasDisadvantage) {
        result[type] = 'normal';
      } else if (hasAdvantage) {
        result[type] = 'advantage';
      } else if (hasDisadvantage) {
        result[type] = 'disadvantage';
      } else {
        result[type] = 'normal';
      }
    }
    return result;
  });

  // Get the resist roll mode for a given ability name (used when rolling an ability as a Roll to Resist)
  const getResistRollMode = (abilityName) => {
    const resistType = abilityToResistType[abilityName.toLowerCase()];
    if (!resistType) return 'normal';
    return activeResistModifiers.value[resistType];
  };

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

  // Corruption count: eclipse_blips with state === 2 (X marks)
  const corruptionCount = computed(() => eclipse_blips.value.filter(blip => blip === 2).length);

  // Burnout lines: eclipse_blips with state === 3 (scratched)
  const burnoutLines = computed(() => eclipse_blips.value.filter(blip => blip === 3).length);

  // Heartless Knight: 3+ corruption points
  // Per compendium: -1 SP gained, no Catharsis, lose Comforting Comrade
  const heartlessKnight = computed(() => corruptionCount.value >= 3);

  // Fallen Knight: 5+ corruption points
  // Per compendium: 1/2 Trauma received, Refreshing->Average Sleep, Horrified->Distressed immediately, Risk of Relapse
  const fallenKnight = computed(() => corruptionCount.value >= 5);

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
  const studiedCombat = ref(false);
  const studiedSchool = ref(false);
  const wellFed = ref(false);
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

  // Fortune Pool: Gained from Fortune Box enchanted crystal
  // Pool size = proficiency bonus (level-based: 1-4=2, 5-8=3, 9-12=4, 13-16=5, 17+=6)
  // Spend 1 Fortune to add 1d6 to a non-combat Skill Check. Replenishes on Refreshing Sleep.
  const fortunePool = ref(0);
  const fortunePoolEnabled = ref(false);
  const fortunePoolMax = computed(() => {
    if (!fortunePoolEnabled.value) return 0;
    const lvl = level.value;
    if (lvl >= 17) return 6;
    if (lvl >= 13) return 5;
    if (lvl >= 9) return 4;
    if (lvl >= 5) return 3;
    return 2;
  });

  // Herald Bond Level system (I-V, stored as 1-5)
  // Per compendium: Herald bond affects spell tier access (Bond IV+ = Tier VI access)
  const herald = {
    name: ref(''),
    bondLevel: ref(1),
    notes: ref('')
  };

  // Check if Tier VI spells are unlocked (requires Herald Bond Level IV+)
  const tierVIUnlocked = computed(() => herald.bondLevel.value >= 4);

  // ==================== MAGI-SQUIRE COMPANION ====================
  // Per compendium: NPC companions with 6 Health Blips, 3 Mana Blips, scaling damage.
  // Squires have 2 spell paths (from Beam, Explosion, Curing, Restoration).
  // Armor: 13 (Student) / 15 (Knight, +2 vs melee). Level syncs with mentor.
  const squire = {
    name: ref(''),
    level: ref(1),
    healthBlips: ref([true, true, true, true, true, true]),
    manaBlips: ref([true, true, true]),
    studentArmor: ref(13),
    knightArmor: ref(15),
    spellPath1: ref(''),
    spellPath2: ref(''),
    skills: ref(''),
    notes: ref(''),
    collapsed: ref(true)
  };

  // Squire damage scaling based on mentor level
  const squireDamage = computed(() => {
    const lvl = level.value;
    if (lvl >= 13) return '4d6';
    if (lvl >= 10) return '3d6+4';
    if (lvl >= 7) return '2d6+4';
    if (lvl >= 4) return '2d6+3';
    return '1d6+3';
  });

  // Available spell paths for squires (limited selection)
  const squireSpellPaths = ['Beam', 'Explosion', 'Curing', 'Restoration'];

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

  // ==================== COMBINATION MANEUVERS ====================
  // Per compendium/lists.json: Combination Maneuvers
  // Unlocked at Rep Level II, requires Unity Points

  const combinationManeuverData = {
    avengingFlare: {
      name: 'Avenging Flare',
      participants: 2,
      unityCost: 1,
      actionType: 'Immediate',
      isQuick: true,
      description: 'When squadron member becomes Exposed/Unconscious within 60ft: Other participants may Spell Attack OR Move 30ft + Weapon Attack with Advantage. All damage = True Damage.',
      shortEffect: () => 'True Damage counter-attack on ally exposure'
    },
    planetaryAegis: {
      name: 'Planetary Aegis of Nullification',
      participants: 2,
      unityCost: 1,
      actionType: 'Bonus',
      isQuick: false,
      isLingering: true,
      description: 'All within 15ft of Initiator or Finisher: Gain 6× Rep Level Temp HP + Physical/Magical Resistance while Temp HP remains.',
      shortEffect: (rep) => `${6 * rep} Temp HP + Resistance`
    },
    starstormRestoration: {
      name: 'Starstorm Restoration',
      participants: 2,
      unityCost: 1,
      actionType: 'Standard',
      isQuick: false,
      description: 'At Finisher\'s turn end: 5× Rep Level True Damage to enemies within 30ft, pushed 10ft, Prone. All participants heal 10× Rep Level HP and remove 1 Condition.',
      shortEffect: (rep) => `${5 * rep} damage, heal ${10 * rep} HP`
    },
    blueshiftCollision: {
      name: 'Blueshift Collision',
      participants: 3,
      unityCost: 2,
      actionType: 'Full-Round',
      isQuick: false,
      description: 'All participants within 10ft immediately take extra turn: 2 Move, 2 Standard, 2 Bonus Actions. First Attack = Advantage + True Damage. All gain 1 Exhaustion + Mysticism DC 14 or Drained.',
      shortEffect: () => 'Extra turn with doubled actions'
    },
    envoysOfHope: {
      name: 'Envoys of Hope (Aura)',
      participants: 3,
      unityCost: 2,
      actionType: 'Bonus',
      isQuick: false,
      isLingering: true,
      description: 'At turn start: Gain pool of 2× Rep Level d4s. Add to one Damage/Healing/Roll to Resist during turn. OR Immediate: Reduce incoming damage by pool roll.',
      shortEffect: (rep) => `${2 * rep}d4 pool for rolls`
    },
    ultimateRadiantReflection: {
      name: 'Ultimate Radiant Reflection',
      participants: 4,
      unityCost: 2,
      actionType: 'Reaction',
      isQuick: true,
      description: 'When damaging spell targets participants within 30ft radius: ½ squadron = Damage → 0. Full squadron = Reflect as True Damage + 4× Rep Level True Damage to caster. All gain 1 Exhaustion + Mysticism DC 14 or Drained.',
      shortEffect: (rep) => `Negate/reflect spell + ${4 * rep} damage`
    },
    ringshineFulminationNova: {
      name: 'Ringshine Fulmination (Nova)',
      participants: 4,
      unityCost: 3,
      actionType: 'Full-Round',
      isQuick: false,
      isLegendary: true,
      description: 'Each participant rolls 1d20. Dice pool based on roll: 20=8d12, 18+=6d12, 12+=4d12, 1+=2d12 (all +MAM+Rep). Divide evenly, roll. True Damage to all enemies within 100ft. All gain 2 Exhaustion + Mysticism DC 16 or Depleted.',
      shortEffect: () => 'Massive AoE True Damage'
    },
    ringshineFulminationZenith: {
      name: 'Ringshine Fulmination (Zenith)',
      participants: 4,
      unityCost: 3,
      actionType: 'Full-Round',
      isQuick: false,
      isLegendary: true,
      description: 'Participants within 10ft roll 1d20. Dice pool: 20=10d10+8d8, 18+=8d10+6d8, 12+=6d10+4d8, 1+=4d10+2d8 (all +MAM+Rep). Divide evenly, roll. True Damage to ONE target within 100ft. All gain 2 Exhaustion + Mysticism DC 16 or Depleted.',
      shortEffect: () => 'Devastating single-target True Damage'
    }
  };

  // Track selected participant count for combos (default 2)
  const comboParticipants = ref(2);

  // Track combination maneuvers section collapsed state
  const combosCollapsed = ref(true);

  // Computed maneuver effects based on reputation and MAM
  const comboEffects = computed(() => {
    const rep = reputation.value;
    const mamMod = abilityScores[mam.value]?.mod.value || 0;
    return {
      planetaryAegis: {
        tempHp: 6 * rep
      },
      starstormRestoration: {
        damage: 5 * rep,
        healing: 10 * rep
      },
      envoysOfHope: {
        dicePool: 2 * rep
      },
      ultimateRadiantReflection: {
        bonusDamage: 4 * rep
      },
      ringshineFulmination: {
        mamMod: mamMod,
        repLevel: rep
      }
    };
  });

  // Check if a maneuver can be executed (enough participants and unity)
  const canExecuteManeuver = (maneuverKey) => {
    const maneuver = combinationManeuverData[maneuverKey];
    if (!maneuver) return false;
    return comboParticipants.value >= maneuver.participants && unity.value >= maneuver.unityCost;
  };

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

  // Soul Armament Progression - auto-calculated bonuses based on Reputation Level
  const soulArmamentData = {
    0: { weapon: 0, armor: 0 },
    1: { weapon: 1, armor: 0 },
    2: { weapon: 1, armor: 1 },
    3: { weapon: 2, armor: 1 },
    4: { weapon: 2, armor: 2 },
    5: { weapon: 3, armor: 3 }
  };
  const soulArmamentWeaponBonus = computed(() => (soulArmamentData[reputation.value] || soulArmamentData[0]).weapon);
  const soulArmamentArmorBonus = computed(() => (soulArmamentData[reputation.value] || soulArmamentData[0]).armor);
  const knightArmorTotal = computed(() => Number(knight_armor.value) + soulArmamentArmorBonus.value);

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

  const armorWeaveData = {
    lustrous: { name: 'Lustrous Gemstone Weave', rep: 'I', description: '+1d6 to Leadership and Persuasion. 1/Sleep Phase: Auto-pass Leadership Check during Formation/Combo' },
    reflecting: { name: 'Reflecting Stardust Weave', rep: 'I', description: '1/Sleep Phase: Stealth result = 15 auto. OR Free Action: Move without Provoking, next Attack with Advantage' },
    lightning: { name: 'Lightning Dust Weave', rep: 'II', description: 'Attackers within 15ft take 1 + Rep Level Magical Damage' },
    shimmering: { name: 'Shimmering Moon Weave', rep: 'II', description: '1/Sleep Phase: If would become Exposed/Unconscious from damage, heal 1/2 HP and teleport 60ft' },
    singing: { name: 'Singing Steel Weave', rep: 'III', description: '1/Sleep Phase Immediate: Gain Magical Resistance until end of next turn' },
    starLithium: { name: 'Star Lithium Weave', rep: 'III', description: '1/Sleep Phase: -2 Exhaustion, -1 Stress' },
    phoenix: { name: 'Phoenix Imbued Weave', rep: 'IV', description: '1/Episode Immediate: If would become Unconscious, cast Explosion Tier III at location, regain 1/2 HP, fly 60ft up. Adjacent enemies take 20 Magical Damage' },
    starCrystal: { name: 'Star Crystal Weave', rep: 'IV', description: 'Gain Warding. With Warding Implement: Add Level to reduction. With Ultra Warding: Reduce by Level + 2x Rep Level' },
    soulCrystal: { name: 'Soul Crystal Weave', rep: 'V', description: '1/Sleep Phase Immediate: Resistance to Physical and Magical until next turn, reduce triggering damage by 25. 1/Character: At 0 HP with 5+ Fractures, gain Shard of the Magi-Knight effects' },
  };

  const armor_weave = {
    selected: ref(''),
    name: ref(''),
    description: ref(''),
    collapsed: ref(true)
  };
  const soulArmamentMode = ref('weapon'); // 'weapon' or 'gun'

  const soul_weapon = {
    name: ref(''),
    range: ref(''),
    damage: ref(''),
    damageType: ref('physical'), // 'physical', 'magical', or 'true'
    qualities: ref({
      accurate: false,      // Trade-off: -2 dmg for +1 atk, OR -4 dmg for +2 atk
      coupled: false,       // Free Action: Split into Primary + Secondary. Bonus Action secondary attack
      ensnaring: false,     // On Attack Roll 16+: Target Restrained. Cannot affect Large+ or Adversary+
      forceful: false,      // On Attack Roll 16+: Add extra 1d6 damage
      massive: false,       // Trade-off: -1 atk for +2 dmg, OR -2 atk for +4 dmg
      staggeringBlow: false, // On Attack Roll 16+: Knock target 10ft. Cannot affect Large+ or Adversary+
      twoHanded: false,     // Requires both hands
      veilPiercing: false   // 1/Combat Encounter: Instead of rolling, automatically hit
    }),
    collapsed: ref(true)
  };

  // Weapon quality definitions for UI
  const weaponQualityDefs = {
    accurate: { name: 'Accurate', effect: 'Before rolling: -2 damage for +1 Attack, OR -4 damage for +2 Attack', category: 'trade' },
    coupled: { name: 'Coupled', effect: 'Free Action: Split into Primary + Secondary. Bonus Action secondary attack', category: 'special' },
    ensnaring: { name: 'Ensnaring', effect: 'On Attack Roll 16+: Target Restrained. Cannot affect Large+ or Adversary+', category: 'trigger' },
    forceful: { name: 'Forceful', effect: 'On Attack Roll 16+: Add extra 1d6 damage', category: 'trigger' },
    massive: { name: 'Massive', effect: 'Before rolling: -1 Attack for +2 damage, OR -2 Attack for +4 damage', category: 'trade' },
    staggeringBlow: { name: 'Staggering Blow', effect: 'On Attack Roll 16+: Knock target 10ft. Cannot affect Large+ or Adversary+', category: 'trigger' },
    twoHanded: { name: 'Two-Handed', effect: 'Requires both hands', category: 'special' },
    veilPiercing: { name: 'Veil-Piercing', effect: '1/Combat Encounter: Instead of rolling, automatically hit', category: 'special' }
  };

  // Computed: weapon quality attack bonus
  // Accurate/Massive are per-roll trade-off choices, not persistent bonuses
  const weaponQualityAttackBonus = computed(() => {
    return 0;
  });

  // Computed: weapon quality damage bonus
  // Forceful triggers on 16+ (not persistent), Massive is a per-roll trade-off choice
  const weaponQualityDamageBonus = computed(() => {
    return 0;
  });

  // Veil-Piercing: 1/Combat Encounter auto-hit tracking
  const veilPiercingUsed = ref(false);

  // Computed: active qualities list for display
  const activeWeaponQualities = computed(() => {
    return Object.entries(soul_weapon.qualities.value)
      .filter(([key, val]) => val)
      .map(([key]) => weaponQualityDefs[key]?.name || key);
  });

  // ==================== SOUL GUN DATA ====================
  // Gun type stats from compendium
  const gunTypeData = {
    hdg: { name: 'Handgun', abbr: 'HDG', eRange: 20, damage: '1d6', rf: 2, md: 3, special: 'Gun Style choice' },
    smg: { name: 'Submachine Gun', abbr: 'SMG', eRange: 30, damage: '1d6', rf: 2, md: 4, special: 'Gun Style choice' },
    asr: { name: 'Assault Rifle', abbr: 'ASR', eRange: 40, damage: '1d8', rf: 2, md: 4, special: 'Covering Fire: After MD hit, target first attack Disadvantage (not Swarms/Nemesis+)' },
    dmr: { name: 'Designated Marksman Rifle', abbr: 'DMR', eRange: 80, damage: '1d10', rf: 2, md: 3, special: 'Sighted Rifle: RF at 40ft+, reroll one die. Prone Stability' },
    stg: { name: 'Shotgun', abbr: 'STG', eRange: 15, damage: '1d12', rf: 2, md: 3, special: 'Firing Spread: Horde/Swarm damage hits second Part or adjacent target' },
    lmg: { name: 'Light Machine Gun', abbr: 'LMG', eRange: 50, damage: '1d10', rf: 2, md: 5, special: 'Collateral Damage: Excess damage hits another within 10ft. Bulky: Not Prone = remove highest die. May use STR. Prone Stability' },
    sda: { name: 'Sidearm', abbr: 'SDA', eRange: 20, damage: '1d4', rf: 2, md: 0, special: 'Reactionary Shot: Reaction when enemy within 20ft' }
  };

  // Gun style options (HDG and SMG only)
  const gunStyleData = {
    akimbo: { name: 'Akimbo', applies: 'hdg', effect: 'MD ROF +1. Handgun becomes Two-Handed' },
    aegis: { name: 'Aegis/Musketeer', applies: 'hdg', effect: 'Shield or Light Weapon + Bonus Action attack' },
    fastReload: { name: 'Fast Reload', applies: 'hdg', effect: 'Reload as Bonus Action (other hand empty or Light)' },
    mobile: { name: 'Mobile', applies: 'smg', effect: 'Move 10ft before/after attack. After MD, no Provoke from attacked enemy' },
    hailOfBullets: { name: 'Hail of Bullets', applies: 'smg', effect: 'MD at 15ft or closer, reroll one die (keep result)' }
  };

  const soul_gun = {
    name: ref(''),
    gunType: ref('hdg'),
    gunStyle: ref(''),
    aimed: ref(false),       // Bonus Action: +1 to one die in Firing Pool
    hasReloaded: ref(true),  // Must reload (Standard Action) after Mag Dump
    firingPoolBonus: ref(0), // Additional Firing Pool modifiers
    attachments: ref([]),    // Array of {name, type, effect}
    collapsed: ref(true)
  };

  // Computed: current gun type stats
  const gunTypeStats = computed(() => {
    return gunTypeData[soul_gun.gunType.value] || gunTypeData.hdg;
  });

  // Computed: available styles for current gun type
  const availableGunStyles = computed(() => {
    const type = soul_gun.gunType.value;
    return Object.entries(gunStyleData)
      .filter(([key, style]) => style.applies === type)
      .map(([key, style]) => ({ key, ...style }));
  });

  // Computed: effective MD (considering Akimbo style)
  const effectiveMD = computed(() => {
    const base = gunTypeStats.value.md;
    if (soul_gun.gunType.value === 'hdg' && soul_gun.gunStyle.value === 'akimbo') {
      return base + 1;
    }
    return base;
  });

  // ==================== MAGICAL IMPLEMENT DATA ====================
  const magical_implement = {
    name: ref(''),
    description: ref(''),
    qualities: ref({
      cardConductor: false,     // Required for Divination Spell Path or Release Magic Style
      embolden: false,          // Spell damage +MK Level
      light: false,             // One hand, does not count toward weapon limit
      manaAttunement: false,    // MP = MCO × 3 (instead of × 2)
      manaConduit: false,       // 1/Sleep Phase, Bonus Action: Next spell costs -1 Tier MP
      radiance: false,          // Healing spells: +1+Level HP
      twoHanded: false,         // Requires two hands
      warding: false            // Reduce spell damage taken by 1/2 Level (min 1)
    }),
    collapsed: ref(true)
  };

  // Track 1/Sleep Phase usage of Mana Conduit
  const manaConduitUsed = ref(false);

  // Implement quality definitions for UI
  const implementQualityDefs = {
    cardConductor: { name: 'Card Conductor', effect: 'Required for Divination Spell Path or Release Magic Style', category: 'special' },
    embolden: { name: 'Embolden', effect: 'Spell damage +MK Level. Multi-target: choose one target for bonus', category: 'damage' },
    light: { name: 'Light', effect: 'One hand, does not count toward weapon limit', category: 'handling' },
    manaAttunement: { name: 'Mana Attunement', effect: 'MP = Mana Coefficient × 3 (instead of × 2)', category: 'mana' },
    manaConduit: { name: 'Mana Conduit', effect: '1/Sleep Phase, Bonus Action: Next spell costs -1 Tier MP', category: 'mana' },
    radiance: { name: 'Radiance', effect: 'Healing spells: +1+Level HP. AoE: halved (min 1)', category: 'healing' },
    twoHanded: { name: 'Two-Handed', effect: 'Requires two hands. Cannot use Shield or Light items', category: 'handling' },
    warding: { name: 'Warding', effect: 'Reduce spell damage taken by 1/2 Level (min 1)', category: 'defense' }
  };

  // Computed: check if Mana Attunement is active (for MP calculation)
  const hasManaAttunement = computed(() => {
    return magical_implement.qualities.value.manaAttunement;
  });

  // Computed: check if Embolden is active
  const hasEmbolden = computed(() => {
    return magical_implement.qualities.value.embolden;
  });

  // Computed: Embolden damage bonus (+MK Level to spell damage)
  const emboldenDamageBonus = computed(() => {
    return hasEmbolden.value ? level.value : 0;
  });

  // Computed: Radiance healing bonus (+1+Level to healing spells)
  const radianceHealBonus = computed(() => {
    return magical_implement.qualities.value.radiance ? 1 + level.value : 0;
  });

  // Computed: Warding damage reduction (1/2 Level, min 1)
  const wardingReduction = computed(() => {
    return magical_implement.qualities.value.warding ? Math.max(1, Math.floor(level.value / 2)) : 0;
  });

  // Computed: active implement qualities list for display
  const activeImplementQualities = computed(() => {
    return Object.entries(magical_implement.qualities.value)
      .filter(([key, val]) => val)
      .map(([key]) => implementQualityDefs[key]?.name || key);
  });

  // ==================== ELEMENTAL SUMMON ====================
  const elementalSummon = ref({
    name: '',
    hp: 0,
    hpMax: 0,
    armor: 10,
    attack: 0,
    damage: '',
    move: 30,
    description: '',
    active: false,
    collapsed: true
  });

  // ==================== VISOR ====================
  const visor = ref({ type: 'none' });
  const visorData = {
    none: { name: 'None', effect: '' },
    etherIdentification: { name: 'Ether Identification Visor', effect: 'Bonus Action: +1d6 to Investigation/Perception to identify magical signatures' },
    medicalDiagnostic: { name: 'Medical Diagnostic Visor', effect: 'Advantage on Medicine checks, see HP values of willing allies' },
    virtualHUD: { name: 'Virtual HUD Visor', effect: 'Darksight 60ft, Bonus Action: Mark target for +1d4 to next attack against it' }
  };
  const activeVisorEffect = computed(() => visorData[visor.value.type]?.effect || '');

  // ==================== COMBAT FORMS ====================
  // The 10 Combat Forms from the compendium
  const combatFormData = {
    formI: { name: 'Form I - Adaptation', description: 'Choose One: +1 Weapon Attack OR +1 Attack for Summons', mastery: '+2 Attack (instead of +1)' },
    formII: { name: 'Form II - Deflection', description: 'Choose One: +1 Armor OR +1 Armor for Summons', mastery: '+2 Armor (instead of +1)' },
    formIII: { name: 'Form III - Vindication', description: 'Req: One-handed weapon only. +2 damage per Rep Level (min 1)', mastery: '+4 damage + Vicious Quality (or +1 die step, or +3 if d12)' },
    formIV: { name: 'Form IV - Purgation', description: 'Req: Two-Handed Melee. Bonus Action: STR/DEX Mod × Rep Level damage to Horde/Swarm parts', mastery: 'Additionally add Proficiency Modifier to damage' },
    formV: { name: 'Form V - Refraction', description: 'Reaction: Reduce ally damage by Xd6 (X=Rep Level, min 1), take damage instead', mastery: 'Xd8 instead of Xd6' },
    formVI: { name: 'Form VI - Reflection', description: 'Req: Shield. 1/Round Reaction: Impose Disadvantage on attack vs adjacent ally; become target if hit', mastery: 'Range increased to 10 feet' },
    formVII: { name: 'Form VII - Vibration', description: 'Req: Coupled weapon. 1/Round: If both weapons hit same target, free Primary attack', mastery: '+2 damage to Primary/Secondary + Vicious (or +5 on crit)' },
    formVIII: { name: 'Form VIII - Constellation', description: 'Bonus Action: +1 Spell DC, +1 Spell Attack, +2×Rep healing, OR +Rep damage (until end of turn)', mastery: 'Full-Round: +3 Resist(Magic)/Spell Attack, OR +3×Rep Curing/Damage' },
    formIX: { name: 'Form IX - Cessation', description: 'Req: 15ft+ range, enemy adjacent to ally. Bonus Action: +1 Attack, +2 damage, OR ally moves 10ft', mastery: 'Full-Round: +3 Attack, +6 Damage, OR ally moves 30ft' },
    formX: { name: 'Form X - Regulation', description: 'Grants the ability to wield Soul Guns', mastery: 'Each successful Open Fire deals +Rep Level damage' }
  };

  // Currently active combat form
  const activeCombatForm = ref('');

  // Mastery tracking for each form
  const combatFormMastery = ref({
    formI: false, formII: false, formIII: false, formIV: false, formV: false,
    formVI: false, formVII: false, formVIII: false, formIX: false, formX: false
  });

  // Whether Form X (Regulation) is mastered - needed for Soul Gun access
  const hasFormX = computed(() => combatFormMastery.value.formX);

  // ==================== LEVEL-LOCKED ABILITIES ====================
  // Special abilities that all Magi-Knights gain at specific levels
  const levelAbilityData = {
    energySurge: { name: 'Energy Surge', level: 4, description: '1/Sleep Phase, Bonus Action: Recover HP (Rep d10s+CON), MP (Rep d4s+Spell Mod), remove 1 Exhaustion, or remove 3 Stress' },
    counterBlast: { name: 'Counter Blast', level: 5, description: 'Reaction: When hit by spell, spend MP to counter' },
    swiftAttack1: { name: 'Swift Attack', level: 5, description: 'Weapon Attack as Bonus Action 1/round' },
    perfectParry: { name: 'Perfect Parry', level: 6, description: 'Immediate: Negate weapon damage received' },
    extricateAether: { name: 'Extricate Aether', level: 6, description: 'Recover MP from defeated Outsiders' },
    heroicResolve: { name: 'Heroic Resolve', level: 9, description: 'Resist conditions with enhanced willpower' },
    knightsInsight: { name: "Knight's Insight", level: 9, description: 'Gain tactical information about enemies' },
    knightsResolution: { name: "Knight's Resolution", level: 9, description: 'Enhanced resistance to attrition effects' },
    swiftAttack2: { name: 'Swift Attack II', level: 10, description: 'Additional Weapon Attack as Bonus Action 1/round' },
    flight: { name: 'Flight', level: 10, description: 'Standard Action: Gain Fly speed equal to Move speed' }
  };

  // Tracking refs for level-locked ability usage
  const energySurgeUsed = ref(false);
  const isFlying = ref(false);
  const combatFormsCollapsed = ref(true);
  const levelAbilitiesCollapsed = ref(false);

  // Computed: which level abilities are unlocked based on current level
  const levelAbilities = computed(() => ({
    energySurge: level.value >= 4,
    counterBlast: level.value >= 5,
    swiftAttack1: level.value >= 5,
    perfectParry: level.value >= 6,
    extricateAether: level.value >= 6,
    heroicResolve: level.value >= 9,
    knightsInsight: level.value >= 9,
    knightsResolution: level.value >= 9,
    swiftAttack2: level.value >= 10,
    flight: level.value >= 10
  }));

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

  // NPC sheet type (monster/npc/squire)
  const npc_sheet_type = ref('monster');

  // NPC social view fields
  const npc_social_name = ref('');
  const npc_social_role = ref('');
  const npc_social_heart_stage = ref('neutral');
  const npc_social_sp = ref(0);
  const npc_social_personality = ref('');
  const npc_social_abilities = ref('');
  const npc_social_notes = ref('');

  // NPC basic info
  const npc_name = ref('');
  const npc_type = ref('vassal');
  const npc_size = ref('Medium');
  const npc_creature_type = ref('Outsider');
  const npc_role = ref('none');
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

  // NPC Role modifiers (AC, HP%, Attack Bonus, DPR%)
  const roleModifiers = {
    none: { ac: 0, hpPct: 0, atkBonus: 0, dprPct: 0 },
    assassin: { ac: 0, hpPct: -25, atkBonus: 3, dprPct: 0 },
    brute: { ac: 0, hpPct: 33, atkBonus: -3, dprPct: 0 },
    defender: { ac: 0, hpPct: 33, atkBonus: 0, dprPct: -25 },
    heavy: { ac: -4, hpPct: 33, atkBonus: 0, dprPct: 0 },
    lithe: { ac: 3, hpPct: -25, atkBonus: 0, dprPct: 0 },
    merciless: { ac: 0, hpPct: 0, atkBonus: -3, dprPct: 33 },
    savage: { ac: -4, hpPct: 0, atkBonus: 0, dprPct: 33 },
    skirmisher: { ac: 0, hpPct: -25, atkBonus: 0, dprPct: 33 },
    striker: { ac: -4, hpPct: 0, atkBonus: 3, dprPct: 0 },
    tank: { ac: 3, hpPct: 0, atkBonus: -3, dprPct: 0 },
    vanguard: { ac: 3, hpPct: 0, atkBonus: 0, dprPct: -25 },
    watcher: { ac: 0, hpPct: 0, atkBonus: 3, dprPct: -25 }
  };

  // NPC Size modifiers (AC, HP%, Attack Bonus, DPR%)
  const sizeModifiers = {
    Small: { ac: 1, hpPct: -10, atkBonus: 1, dprPct: -10 },
    Medium: { ac: 0, hpPct: 0, atkBonus: 0, dprPct: 0 },
    Large: { ac: -1, hpPct: 5, atkBonus: 0, dprPct: 5 },
    Huge: { ac: -1, hpPct: 10, atkBonus: -1, dprPct: 10 },
    Massive: { ac: -2, hpPct: 15, atkBonus: -2, dprPct: 15 },
    Colossal: { ac: -2, hpPct: 20, atkBonus: -2, dprPct: 20 }
  };

  // NPC Rank damage percentages
  const rankDamagePct = {
    vassal: 50,
    adversary: 55,
    nemesis: 60,
    harbinger: 70
  };

  // Computed: get modifiers for current NPC role
  const npc_role_modifiers = computed(() => {
    return roleModifiers[npc_role.value] || roleModifiers.none;
  });

  // Computed: get modifiers for current NPC size
  const npc_size_modifiers = computed(() => {
    return sizeModifiers[npc_size.value] || sizeModifiers.Medium;
  });

  // ==================== END NPC DATA ====================

  // repeating sections
  const sections = {
    techniques: {
      template: {
        name: '',
        description: '',
        type: '', // Battle, Combat, Social
        category: '', // Physical Attacks, Defensive, Magical, Squad Support
        levelRequired: 0, // Minimum level to use
        frequency: 'At-Will', // At-Will, 1/Round, 1/Encounter, 1/Rest, X/Encounter
        maxUses: 1, // Max uses per frequency period (for limited techniques)
        usesRemaining: 1, // Current uses left
        actionType: '', // Standard, Bonus, Free, Immediate, Reaction, Full-Round
        associatedRoll: '', // Optional dice expression for technique
        collapsed: true
      },
      addItem(item){
        const newItem = {...this.template,...item};
        this.rows.value.push(newItem);
      },
      rows: ref([])
    },
    tactics: {
      template: {
        name: '',
        description: '',
        prerequisites: '', // e.g., "Level 9+, Combat Form Drills"
        effectType: 'Passive', // Passive, Active, Reaction
        automaticBonus: '', // e.g., "+1 to Initiative" or "+2 HP/Level"
        active: true, // Whether this tactic is currently equipped/active
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
        slotCost: 1,
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
        tier_VI_dice: '',
        pathSelection: 'Custom'
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
        heartStage: 'neutral',
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

  // Spell path count enforcement (computed after sections defined)
  const spellPathsCount = computed(() => sections.spells.rows.value.length);
  const spellPathsOverMax = computed(() => spellPathsCount.value > maxSpellPaths.value);

  const populateSpellPath = (item, pathKey) => {
    item.pathSelection = pathKey;
    if (pathKey === 'Custom') {
      item.name = '';
      item.range = '';
      for (const tier of ['I', 'II', 'III', 'IV', 'V', 'VI']) {
        item[`tier_${tier}_name`] = '';
        item[`tier_${tier}_dice`] = '';
        item[`tier_${tier}_special`] = '';
        item[`tier_${tier}_description`] = '';
        item[`tier_${tier}_action`] = '';
      }
    } else {
      const data = SPELL_PATH_DATA[pathKey];
      if (data) {
        item.name = data.name || '';
        item.range = data.range || '';
        for (const tier of ['I', 'II', 'III', 'IV', 'V', 'VI']) {
          item[`tier_${tier}_name`] = data[`tier_${tier}_name`] || '';
          item[`tier_${tier}_dice`] = data[`tier_${tier}_dice`] || '';
          item[`tier_${tier}_special`] = data[`tier_${tier}_special`] || '';
          item[`tier_${tier}_description`] = data[`tier_${tier}_description`] || '';
          item[`tier_${tier}_action`] = data[`tier_${tier}_action`] || '';
        }
      }
    }
  };

  // Relic capacity enforcement (computed after sections defined)
  const relicsOverCapacity = computed(() => sections.relics.rows.value.length > relicCapacity.value);
  const relicCount = computed(() => sections.relics.rows.value.length);

  // Rune slot capacity enforcement (computed after sections defined)
  const runeSlotCapacity = computed(() => Math.max(1, reputation.value));
  const runeSlotsUsed = computed(() => sections.runes.rows.value.reduce((sum, rune) => sum + (Number(rune.slotCost) || 1), 0));
  const runesOverCapacity = computed(() => runeSlotsUsed.value > runeSlotCapacity.value);

  // Helper methods for Battle Techniques
  const resetTechniqueUses = (frequency = 'all') => {
    sections.techniques.rows.value.forEach(technique => {
      if (frequency === 'all' || technique.frequency === frequency) {
        technique.usesRemaining = technique.maxUses;
      }
    });
  };

  const useTechnique = (techniqueId) => {
    const technique = sections.techniques.rows.value.find(t => t._id === techniqueId);
    if (technique && technique.usesRemaining > 0) {
      technique.usesRemaining--;
      return true;
    }
    return false;
  };

  const isTechniqueAvailable = (technique) => {
    // Check level requirement
    if (technique.levelRequired > level.value) {
      return false;
    }
    // Check uses remaining
    if (technique.frequency !== 'At-Will' && technique.usesRemaining <= 0) {
      return false;
    }
    return true;
  };

  // Helper methods for Combat Tactics
  const checkTacticPrerequisites = (tactic) => {
    // Basic prerequisite checking - can be enhanced based on specific requirements
    const prereqs = tactic.prerequisites.toLowerCase();

    // Check level requirements (e.g., "9th+", "Level 9+")
    const levelMatch = prereqs.match(/(\d+)(th|st|nd|rd)?\+/);
    if (levelMatch) {
      const requiredLevel = parseInt(levelMatch[1]);
      if (level.value < requiredLevel) {
        return false;
      }
    }

    // Additional prerequisite checks can be added here
    // (e.g., checking for specific Combat Forms, Spell Paths, etc.)

    return true;
  };

  // Computed values for active tactics
  const hasTacticActive = (tacticName) => {
    return sections.tactics.rows.value.some(
      tactic => tactic.name === tacticName && tactic.active
    );
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
      selected: armorWeave.selected.value,
      name: armorWeave.name.value,
      description: armorWeave.description.value,
      collapsed: armorWeave.collapsed.value,
    };
  }

  function hydrateArmorWeave(armorWeave, hydrateData = {}) {
    armorWeave.name.value = hydrateData.name ?? armorWeave.name.value;
    armorWeave.description.value = hydrateData.description ?? armorWeave.description.value;
    armorWeave.collapsed.value = hydrateData.collapsed ?? armorWeave.collapsed.value;

    if (hydrateData.selected !== undefined) {
      armorWeave.selected.value = hydrateData.selected;
    } else {
      // Migration: match existing name to a compendium weave
      const name = armorWeave.name.value;
      if (name) {
        const matchKey = Object.keys(armorWeaveData).find(k => armorWeaveData[k].name === name);
        armorWeave.selected.value = matchKey || 'custom';
      }
    }
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
      gunType: soulGun.gunType.value,
      gunStyle: soulGun.gunStyle.value,
      aimed: soulGun.aimed.value,
      hasReloaded: soulGun.hasReloaded.value,
      firingPoolBonus: soulGun.firingPoolBonus.value,
      attachments: [...soulGun.attachments.value],
      collapsed: soulGun.collapsed.value,
    };
  }

  function hydrateSoulGun(soulGun, hydrateData = {}) {
    soulGun.name.value = hydrateData.name ?? soulGun.name.value;
    soulGun.gunType.value = hydrateData.gunType ?? soulGun.gunType.value;
    soulGun.gunStyle.value = hydrateData.gunStyle ?? soulGun.gunStyle.value;
    soulGun.aimed.value = hydrateData.aimed ?? soulGun.aimed.value;
    soulGun.hasReloaded.value = hydrateData.hasReloaded ?? soulGun.hasReloaded.value;
    soulGun.firingPoolBonus.value = hydrateData.firingPoolBonus ?? soulGun.firingPoolBonus.value;
    if (Array.isArray(hydrateData.attachments)) {
      soulGun.attachments.value = [...hydrateData.attachments];
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

  function dehydrateSquire(squire) {
    return {
      name: squire.name.value,
      level: squire.level.value,
      healthBlips: [...squire.healthBlips.value],
      manaBlips: [...squire.manaBlips.value],
      studentArmor: squire.studentArmor.value,
      knightArmor: squire.knightArmor.value,
      spellPath1: squire.spellPath1.value,
      spellPath2: squire.spellPath2.value,
      skills: squire.skills.value,
      notes: squire.notes.value,
      collapsed: squire.collapsed.value
    };
  }

  function hydrateSquire(squire, hydrateData = {}) {
    squire.name.value = hydrateData.name ?? squire.name.value;
    squire.level.value = hydrateData.level ?? squire.level.value;
    if (hydrateData.healthBlips) squire.healthBlips.value = [...hydrateData.healthBlips];
    if (hydrateData.manaBlips) squire.manaBlips.value = [...hydrateData.manaBlips];
    squire.studentArmor.value = hydrateData.studentArmor ?? squire.studentArmor.value;
    squire.knightArmor.value = hydrateData.knightArmor ?? squire.knightArmor.value;
    squire.spellPath1.value = hydrateData.spellPath1 ?? squire.spellPath1.value;
    squire.spellPath2.value = hydrateData.spellPath2 ?? squire.spellPath2.value;
    squire.skills.value = hydrateData.skills ?? squire.skills.value;
    squire.notes.value = hydrateData.notes ?? squire.notes.value;
    squire.collapsed.value = hydrateData.collapsed ?? squire.collapsed.value;
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
      budgetTallies: budgetTallies.value,
      trainingTallies: trainingTallies.value,
      clubTallies: clubTallies.value,
      resoundingGrowths: resoundingGrowths.value,
      clubPosition: clubPosition.value,
      player: player.value,
      inspiration: inspiration.value,
      stress: stress.value,
      exhaustion: exhaustion.value,
      detentionTickets: detentionTickets.value,
      enduranceDieEnabled: enduranceDieEnabled.value,
      freakingOutToday: freakingOutToday.value,
      sleepEffect: sleepEffect.value,
      sealImplantGiven: sealImplantGiven.value,
      sealImplantReceived: sealImplantReceived.value,
      energySurgeUsed: energySurgeUsed.value,
      isFlying: isFlying.value,
      soulSacrificeCount: soulSacrificeCount.value,
      rollMode: rollMode.value,
      conditions: { ...conditions.value },
      exceededMortalLimits: exceededMortalLimits.value,
      dexterityMod: dexterityMod.value,
      rested: rested.value,
      studiedCombat: studiedCombat.value,
      studiedSchool: studiedSchool.value,
      wellFed: wellFed.value,
      gloom_gems: gloom.value,
      unity_points: unity.value,
      fortunePool: fortunePool.value,
      fortunePoolEnabled: fortunePoolEnabled.value,
      active_formation: activeFormation.value,
      formations_collapsed: formationsCollapsed.value,
      combat_forms_collapsed: combatFormsCollapsed.value,
      combo_participants: comboParticipants.value,
      combos_collapsed: combosCollapsed.value,
      elemental_affinity: elemental_affinity.value,
      branchingElement: branchingElement.value,
      magic_style: magic_style.value,
      release_magic_deck: releaseMagicDeck.value,
      release_magic_collapsed: releaseMagicCollapsed.value,
      signature_card_1: signatureCard1.value,
      signature_card_2: signatureCard2.value,
      element_name: element_name.value,
      mam: mam.value,
      student_type: student_type.value,
      eclipse: [...eclipse.value],
      eclipse_blips: [...eclipse_blips.value],
      customProficiency: customProficiency.value,
      elemental_enhancement_1: elemental_enhancement_1.value,
      elemental_enhancement_2: elemental_enhancement_2.value,
      roll_resist_proficiency: roll_resist_proficiency.value,
      resistModifiers: JSON.parse(JSON.stringify(resistModifiers.value)),
      skills: dehydrateSkills(skills),
      masteredSkill: masteredSkill.value,
      abilityScores: dehydrateAbilityScores(abilityScores),
      statIncreases: [...statIncreases.value],
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
      activeCombatForm: activeCombatForm.value,
      combatFormMastery: { ...combatFormMastery.value },
      veilPiercingUsed: veilPiercingUsed.value,
      manaConduitUsed: manaConduitUsed.value,
      soulArmamentMode: soulArmamentMode.value,
      soul_weapon: dehydrateSoulWeapon(soul_weapon),
      soul_gun: dehydrateSoulGun(soul_gun),
      magical_implement: dehydrateMagicalImplement(magical_implement),
      visor: { type: visor.value.type },
      elementalSummon: { ...elementalSummon.value },
      herald: dehydrateHerald(herald),
      squire: dehydrateSquire(squire),
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
      npc_sheet_type: npc_sheet_type.value,
      npc_social_name: npc_social_name.value,
      npc_social_role: npc_social_role.value,
      npc_social_heart_stage: npc_social_heart_stage.value,
      npc_social_sp: npc_social_sp.value,
      npc_social_personality: npc_social_personality.value,
      npc_social_abilities: npc_social_abilities.value,
      npc_social_notes: npc_social_notes.value,
      npc_name: npc_name.value,
      npc_type: npc_type.value,
      npc_size: npc_size.value,
      npc_creature_type: npc_creature_type.value,
      npc_role: npc_role.value,
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
        const match = sourceArray.match(/\[(.*?)\]/);
        if (match) {
          const parsedArray = JSON.parse(match[0]);
          targetArray.splice(0, targetArray.length, ...parsedArray);
        } else {
          console.warn('hydrateEclipseBlipsArray: String had $__$ prefix but no brackets:', sourceArray);
        }
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
    budgetTallies.value = hydrateStore.budgetTallies ?? budgetTallies.value;
    trainingTallies.value = hydrateStore.trainingTallies ?? trainingTallies.value;
    clubTallies.value = hydrateStore.clubTallies ?? clubTallies.value;
    resoundingGrowths.value = hydrateStore.resoundingGrowths ?? resoundingGrowths.value;
    clubPosition.value = hydrateStore.clubPosition ?? clubPosition.value;
    customProficiency.value = hydrateStore.customProficiency ?? customProficiency.value;
    proficiency.value = calculateProficiency();
    player.value = hydrateStore.player ?? player.value;
    inspiration.value = hydrateStore.inspiration ?? inspiration.value;
    stress.value = hydrateStore.stress ?? stress.value;
    exhaustion.value = hydrateStore.exhaustion ?? exhaustion.value;
    detentionTickets.value = hydrateStore.detentionTickets ?? detentionTickets.value;
    enduranceDieEnabled.value = hydrateStore.enduranceDieEnabled ?? enduranceDieEnabled.value;
    freakingOutToday.value = hydrateStore.freakingOutToday ?? freakingOutToday.value;
    sleepEffect.value = hydrateStore.sleepEffect ?? sleepEffect.value;
    sealImplantGiven.value = hydrateStore.sealImplantGiven ?? sealImplantGiven.value;
    sealImplantReceived.value = hydrateStore.sealImplantReceived ?? sealImplantReceived.value;
    energySurgeUsed.value = hydrateStore.energySurgeUsed ?? energySurgeUsed.value;
    isFlying.value = hydrateStore.isFlying ?? isFlying.value;
    soulSacrificeCount.value = hydrateStore.soulSacrificeCount ?? soulSacrificeCount.value;
    rollMode.value = hydrateStore.rollMode ?? rollMode.value;
    // Hydrate conditions
    if (hydrateStore.conditions) {
      Object.keys(conditions.value).forEach(key => {
        conditions.value[key] = hydrateStore.conditions[key] ?? conditions.value[key];
      });
    }
    // exceededMortalLimits is now computed based on reputation >= 4
    rested.value = hydrateStore.rested ?? rested.value;
    studiedCombat.value = hydrateStore.studiedCombat ?? hydrateStore.studied ?? studiedCombat.value;
    studiedSchool.value = hydrateStore.studiedSchool ?? studiedSchool.value;
    wellFed.value = hydrateStore.wellFed ?? wellFed.value;
    gloom.value = hydrateStore.gloom_gems ?? gloom.value;
    unity.value = hydrateStore.unity_points ?? unity.value;
    fortunePool.value = hydrateStore.fortunePool ?? fortunePool.value;
    fortunePoolEnabled.value = hydrateStore.fortunePoolEnabled ?? fortunePoolEnabled.value;
    activeFormation.value = hydrateStore.active_formation ?? activeFormation.value;
    formationsCollapsed.value = hydrateStore.formations_collapsed ?? formationsCollapsed.value;
    combatFormsCollapsed.value = hydrateStore.combat_forms_collapsed ?? combatFormsCollapsed.value;
    comboParticipants.value = hydrateStore.combo_participants ?? comboParticipants.value;
    combosCollapsed.value = hydrateStore.combos_collapsed ?? combosCollapsed.value;

    // Hydrate Release Magic state
    if (hydrateStore.release_magic_deck && Array.isArray(hydrateStore.release_magic_deck)) {
      releaseMagicDeck.value = hydrateStore.release_magic_deck;
    }
    releaseMagicCollapsed.value = hydrateStore.release_magic_collapsed ?? releaseMagicCollapsed.value;
    signatureCard1.value = hydrateStore.signature_card_1 ?? signatureCard1.value;
    signatureCard2.value = hydrateStore.signature_card_2 ?? signatureCard2.value;

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
    branchingElement.value = hydrateStore.branchingElement ?? branchingElement.value;
    magic_style.value = hydrateStore.magic_style ?? magic_style.value;
    element_name.value = hydrateStore.element_name ?? element_name.value;
    mam.value = hydrateStore.mam ?? mam.value;
    elemental_enhancement_1.value = hydrateStore.elemental_enhancement_1 ?? elemental_enhancement_1.value;
    elemental_enhancement_2.value = hydrateStore.elemental_enhancement_2 ?? elemental_enhancement_2.value;
    roll_resist_proficiency.value = hydrateStore.roll_resist_proficiency ?? roll_resist_proficiency.value;
    if (hydrateStore.resistModifiers) {
      for (const type of ['physical', 'magic', 'horror', 'purity']) {
        if (hydrateStore.resistModifiers[type]) {
          resistModifiers.value[type].advantage = hydrateStore.resistModifiers[type].advantage ?? false;
          resistModifiers.value[type].disadvantage = hydrateStore.resistModifiers[type].disadvantage ?? false;
        }
      }
    }

    hydrateEclipseBlipsArray(eclipse_blips.value, hydrateStore.eclipse_blips);
    hydrateEclipseBlipsArray(eclipse.value, hydrateStore.eclipse);

    hydrateSkills(skills, hydrateStore.skills);
    masteredSkill.value = hydrateStore.masteredSkill ?? masteredSkill.value;
    hydrateAbilityScores(abilityScores, hydrateStore.abilityScores);
    statIncreases.value = hydrateStore.statIncreases ?? statIncreases.value;
    hydrateHp(hp, hydrateStore.hp);
    hydrateMp(mp, hydrateStore.mp);
    hydrateShp(shp, hydrateStore.shp);
    hydrateCrystal(crystal, hydrateStore.crystal);
    hydrateStudentAbility(student_ability, hydrateStore.student_ability);
    hydrateFate(fate, hydrateStore.fate);
    hydrateArmorWeave(armor_weave, hydrateStore.armor_weave);
    activeCombatForm.value = hydrateStore.activeCombatForm ?? activeCombatForm.value;
    if (hydrateStore.combatFormMastery) {
      Object.keys(combatFormMastery.value).forEach(key => {
        combatFormMastery.value[key] = hydrateStore.combatFormMastery[key] ?? combatFormMastery.value[key];
      });
    }
    veilPiercingUsed.value = hydrateStore.veilPiercingUsed ?? veilPiercingUsed.value;
    manaConduitUsed.value = hydrateStore.manaConduitUsed ?? manaConduitUsed.value;
    soulArmamentMode.value = hydrateStore.soulArmamentMode ?? soulArmamentMode.value;
    hydrateSoulWeapon(soul_weapon, hydrateStore.soul_weapon);
    hydrateSoulGun(soul_gun, hydrateStore.soul_gun);
    hydrateMagicalImplement(magical_implement, hydrateStore.magical_implement);
    if (hydrateStore.visor) {
      visor.value.type = hydrateStore.visor.type ?? visor.value.type;
    }
    if (hydrateStore.elementalSummon) {
      Object.assign(elementalSummon.value, hydrateStore.elementalSummon);
    }
    hydrateHerald(herald, hydrateStore.herald);
    if (hydrateStore.squire) hydrateSquire(squire, hydrateStore.squire);

    // NPC hydration
    npc_sheet_type.value = hydrateStore.npc_sheet_type ?? npc_sheet_type.value;
    npc_social_name.value = hydrateStore.npc_social_name ?? npc_social_name.value;
    npc_social_role.value = hydrateStore.npc_social_role ?? npc_social_role.value;
    npc_social_heart_stage.value = hydrateStore.npc_social_heart_stage ?? npc_social_heart_stage.value;
    npc_social_sp.value = hydrateStore.npc_social_sp ?? npc_social_sp.value;
    npc_social_personality.value = hydrateStore.npc_social_personality ?? npc_social_personality.value;
    npc_social_abilities.value = hydrateStore.npc_social_abilities ?? npc_social_abilities.value;
    npc_social_notes.value = hydrateStore.npc_social_notes ?? npc_social_notes.value;
    npc_name.value = hydrateStore.npc_name ?? npc_name.value;
    npc_type.value = hydrateStore.npc_type ?? npc_type.value;
    npc_size.value = hydrateStore.npc_size ?? npc_size.value;
    npc_creature_type.value = hydrateStore.npc_creature_type ?? npc_creature_type.value;
    npc_role.value = hydrateStore.npc_role ?? npc_role.value;
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
      const hordeArr = Array.isArray(hydrateStore.npc_horde_hp)
        ? hydrateStore.npc_horde_hp
        : Object.values(hydrateStore.npc_horde_hp);
      npc_horde_hp.value = hordeArr.map((unit, i) => ({
        ...npc_horde_hp.value[i],
        ...unit
      }));
    }
    if (hydrateStore.npc_primary_attack) {
      const incoming = hydrateStore.npc_primary_attack;
      npc_primary_attack.value = {
        ...npc_primary_attack.value,
        ...incoming,
        // Ensure nested arrays stay as arrays (Firebase may store them as objects)
        attackDC: Array.isArray(incoming.attackDC) ? incoming.attackDC :
          (incoming.attackDC ? Object.values(incoming.attackDC) : npc_primary_attack.value.attackDC),
        hordeDamage: Array.isArray(incoming.hordeDamage) ? incoming.hordeDamage :
          (incoming.hordeDamage ? Object.values(incoming.hordeDamage) : npc_primary_attack.value.hordeDamage)
      };
    }
    if (hydrateStore.npc_secondary_attack) {
      const incoming = hydrateStore.npc_secondary_attack;
      npc_secondary_attack.value = {
        ...npc_secondary_attack.value,
        ...incoming,
        // Ensure nested arrays stay as arrays (Firebase may store them as objects)
        attackDC: Array.isArray(incoming.attackDC) ? incoming.attackDC :
          (incoming.attackDC ? Object.values(incoming.attackDC) : npc_secondary_attack.value.attackDC),
        hordeDamage: Array.isArray(incoming.hordeDamage) ? incoming.hordeDamage :
          (incoming.hordeDamage ? Object.values(incoming.hordeDamage) : npc_secondary_attack.value.hordeDamage)
      };
    }
    // npc_traits: Firebase may store arrays as objects with numeric keys
    if (hydrateStore.npc_traits !== undefined) {
      npc_traits.value = Array.isArray(hydrateStore.npc_traits)
        ? hydrateStore.npc_traits
        : (hydrateStore.npc_traits ? Object.values(hydrateStore.npc_traits) : []);
    }
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

    // Determine if this is a Roll to Resist (has resist proficiency bonus)
    const isResistRoll = rollToResist > 0;
    const resistRollMode = isResistRoll ? getResistRollMode(name) : 'normal';
    const hasResistAdv = resistRollMode === 'advantage';
    const hasResistDisadv = resistRollMode === 'disadvantage';

    const hasConditionDisadv = conditionDisadvantageOnSkillChecks.value;
    // Combine: condition disadvantage, resist advantage/disadvantage
    const forceDisadv = hasConditionDisadv || hasResistDisadv;
    const forceAdv = hasResistAdv;
    const dice = getRollDice(forceDisadv, forceAdv);

    // Build roll mode label
    let rollModeLabel = '';
    if (forceDisadv && forceAdv) {
      rollModeLabel = ''; // cancel out
    } else if (forceDisadv) {
      const reason = hasConditionDisadv ? 'Condition' : 'Resist';
      rollModeLabel = ` (Disadv - ${reason})`;
    } else if (forceAdv) {
      rollModeLabel = ' (Adv - Resist)';
    } else if (effectiveRollMode.value !== 'normal') {
      rollModeLabel = ` (${effectiveRollMode.value === 'advantage' ? 'Adv' : 'Disadv'})`;
    }

    const enduranceInfo = getEnduranceDieInfo(name);
    const components = [
      {label: dice.display, formula: dice.formula, alwaysShowInBreakdown: true},
      {label:'Mod', value:abilityScores[name].mod.value,alwaysShowInBreakdown: true},
      {label: 'Roll to Resist',value: rollToResist,alwaysShowInBreakdown: true}
    ];
    if (enduranceInfo) {
      components.push({label: 'Endurance Die (1d6)', formula: '1d6', alwaysShowInBreakdown: true});
    }

    const enduranceNote = enduranceInfo
      ? ` | Endurance: negate if d6 >= ${enduranceInfo.level} (${enduranceInfo.type})`
      : '';

    const resistTypeNote = isResistRoll
      ? ` | Resist: ${toTitleCase(abilityToResistType[name.toLowerCase()] || 'unknown')}`
      : '';

    const rollObj = {
      title: toTitleCase(name),
      subtitle: `Ability Check${rollModeLabel}${resistTypeNote}${enduranceNote}`,
      characterName: metaStore.name,
      components
    };
    rollToChat({rollObj});
  };

  const rollSkill = (name) => {
    const abilityName = skills[name].ability.value;
    const formattedTitle = toTitleCase(name.replace(/_/g, ' '));
    const skillOverrideValue = skills[name].overrideValue.value;

    const hasConditionDisadv = conditionDisadvantageOnSkillChecks.value;
    const dice = getRollDice(hasConditionDisadv);
    const rollModeLabel = (hasConditionDisadv || effectiveRollMode.value !== 'normal')
      ? ` (${hasConditionDisadv ? 'Disadv - Condition' : (effectiveRollMode.value === 'advantage' ? 'Adv' : 'Disadv')})`
      : '';

    const enduranceInfo = getEnduranceDieInfo(abilityName);
    const enduranceNote = enduranceInfo
      ? ` | Endurance: negate if d6 >= ${enduranceInfo.level} (${enduranceInfo.type})`
      : '';

    // Skill Mastery: +Reputation Level (min 1) when this skill is mastered
    const hasMastery = masteredSkill.value === name;
    const masteryBonus = hasMastery ? Math.max(1, reputation.value) : 0;

    if (skillOverrideValue !== '' && skillOverrideValue !== undefined){
      const components = [
        {label: dice.display, formula: dice.formula, alwaysShowInBreakdown: true},
        {label:'Skill Value Override', value:Number(skillOverrideValue) || 0,alwaysShowInBreakdown: true}
      ];
      if (masteryBonus > 0) {
        components.push({label: 'Mastery', value: masteryBonus, alwaysShowInBreakdown: true});
      }
      if (enduranceInfo) {
        components.push({label: 'Endurance Die (1d6)', formula: '1d6', alwaysShowInBreakdown: true});
      }
      const rollObj = {
        title: formattedTitle,
        subtitle: `Skill Check${rollModeLabel}${enduranceNote}` || undefined,
        characterName: metaStore.name,
        components
      };
      rollToChat({rollObj});
    }else{
      const components = [
        {label: dice.display, formula: dice.formula, alwaysShowInBreakdown: true},
        {label:'Mod', value:abilityScores[abilityName].mod.value,alwaysShowInBreakdown: true}
      ];
      if(skills[name].proficiency.value){
        components.push({label: 'Prof',value:Number(proficiency.value),alwaysShowInBreakdown: true});
      }
      if (masteryBonus > 0) {
        components.push({label: 'Mastery', value: masteryBonus, alwaysShowInBreakdown: true});
      }
      if (enduranceInfo) {
        components.push({label: 'Endurance Die (1d6)', formula: '1d6', alwaysShowInBreakdown: true});
      }
      const rollObj = {
        title: formattedTitle,
        subtitle: `Skill Check${rollModeLabel}${enduranceNote}` || undefined,
        characterName: metaStore.name,
        components
      };
      rollToChat({rollObj});
    }
  };

  const rollWeapon = async (item,tier) => {
    let abMod = Number(knight_attack.value) || 0;

    const hasAttackDisadv = conditionDisadvantageOnAttacks.value;
    const dice = getRollDice(hasAttackDisadv);
    const rollModeLabel = (hasAttackDisadv || effectiveRollMode.value !== 'normal')
      ? ` (${hasAttackDisadv ? 'Disadv - Condition' : (effectiveRollMode.value === 'advantage' ? 'Adv' : 'Disadv')})`
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

    if(activeWeaponQualities.value.length > 0){
      rollObj.textContent = activeWeaponQualities.value.join(', ');
    }
    if(soul_weapon.damage.value) {
      const dmgType = damageTypeLabels[soul_weapon.damageType.value] || 'Physical';
      rollObj.keyValues[`Damage Type`] = dmgType;
      rollObj.keyValues[`Soul Weapon Damage Roll`] = soul_weapon.damage.value;

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

    const hasAttackDisadv = conditionDisadvantageOnAttacks.value;
    const dice = getRollDice(hasAttackDisadv);
    const rollModeLabel = (hasAttackDisadv || effectiveRollMode.value !== 'normal')
      ? ` (${hasAttackDisadv ? 'Disadv - Condition' : (effectiveRollMode.value === 'advantage' ? 'Adv' : 'Disadv')})`
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
    const hasAttackDisadv = conditionDisadvantageOnAttacks.value;
    const dice = getRollDice(hasAttackDisadv);
    const rollModeLabel = (hasAttackDisadv || effectiveRollMode.value !== 'normal')
      ? ` (${hasAttackDisadv ? 'Disadv - Condition' : (effectiveRollMode.value === 'advantage' ? 'Adv' : 'Disadv')})`
      : '';

    const components = [
      {label: dice.display, formula: dice.formula, alwaysShowInBreakdown: true},
      {label:'Attack', value:Number(knight_attack.value),alwaysShowInBreakdown: true}
    ];

    // Add Soul Armament weapon bonus if any
    const armamentBonus = soulArmamentWeaponBonus.value;
    if (armamentBonus !== 0) {
      components.push({label: 'Armament', value: armamentBonus, alwaysShowInBreakdown: true});
    }

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

    // Show Veil-Piercing status if weapon has it
    if (soul_weapon.qualities.value.veilPiercing && !veilPiercingUsed.value) {
      rollObj.keyValues['Veil-Piercing'] = 'Available (1/encounter auto-hit)';
    }

    rollToChat({rollObj});
  };

  const rollStudentAttack = (name) => {
    const hasAttackDisadv = conditionDisadvantageOnAttacks.value;
    const dice = getRollDice(hasAttackDisadv);
    const rollModeLabel = (hasAttackDisadv || effectiveRollMode.value !== 'normal')
      ? ` (${hasAttackDisadv ? 'Disadv - Condition' : (effectiveRollMode.value === 'advantage' ? 'Adv' : 'Disadv')})`
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
  // Firing Pool: Roll Nd8 + DEX + Proficiency vs Armor
  // RF = Rapid Fire (standard), MD = Mag Dump (requires Reload afterward)

  const rollGunRapidFire = () => {
    const stats = gunTypeStats.value;
    const poolSize = stats.rf + soul_gun.firingPoolBonus.value;
    const dexMod = abilityScores.dex?.mod.value || 0;
    const prof = proficiency.value;

    const components = [
      { label: `Firing Pool (RF)`, formula: `${poolSize}d8`, alwaysShowInBreakdown: true },
      { label: 'DEX', value: dexMod, alwaysShowInBreakdown: true },
      { label: 'Proficiency', value: prof, alwaysShowInBreakdown: true }
    ];

    if (soul_gun.firingPoolBonus.value !== 0) {
      components[0].label += ` (${stats.rf}+${soul_gun.firingPoolBonus.value})`;
    }

    const rollObj = {
      title: `Soul Gun: Rapid Fire`,
      subtitle: `${stats.name} - ${poolSize}d8 + ${dexMod} + ${prof} vs Armor`,
      characterName: metaStore.name,
      components: components,
      keyValues: {
        'E-Range': `${stats.eRange} ft`,
        'Damage': stats.damage,
        'Direct Hit': '8 = +Prof damage',
        'Mode': 'Rapid Fire'
      }
    };

    if (soul_gun.aimed.value) {
      rollObj.keyValues['Aimed'] = '+1 to one die';
      soul_gun.aimed.value = false;
    }

    rollToChat({ rollObj });
  };

  const rollGunMagDump = () => {
    if (!soul_gun.hasReloaded.value) return; // Can't MD without reloading first

    const stats = gunTypeStats.value;
    const md = effectiveMD.value;
    if (md <= 0) return; // Sidearm has no MD

    const poolSize = md + soul_gun.firingPoolBonus.value;
    const dexMod = abilityScores.dex?.mod.value || 0;
    const prof = proficiency.value;

    const components = [
      { label: `Firing Pool (MD)`, formula: `${poolSize}d8`, alwaysShowInBreakdown: true },
      { label: 'DEX', value: dexMod, alwaysShowInBreakdown: true },
      { label: 'Proficiency', value: prof, alwaysShowInBreakdown: true }
    ];

    const rollObj = {
      title: `Soul Gun: Mag Dump`,
      subtitle: `${stats.name} - ${poolSize}d8 + ${dexMod} + ${prof} vs Armor`,
      characterName: metaStore.name,
      components: components,
      keyValues: {
        'E-Range': `${stats.eRange} ft`,
        'Damage': stats.damage,
        'Direct Hit': '8 = +Prof damage',
        'Mode': 'Mag Dump',
        'Reload': 'Required next Standard Action'
      }
    };

    if (soul_gun.aimed.value) {
      rollObj.keyValues['Aimed'] = '+1 to one die';
      soul_gun.aimed.value = false;
    }

    // Mark as needing reload
    soul_gun.hasReloaded.value = false;

    rollToChat({ rollObj });
  };

  const rollGunDamage = async () => {
    const stats = gunTypeStats.value;
    const damageFormula = stats.damage;

    const rollComponents = [
      { label: 'Damage', formula: damageFormula, rollFormula: true, alwaysShowInBreakdown: true }
    ];

    const { total, components } = await getRollResults(rollComponents);

    components.forEach(comp => {
      comp.alwaysShowInBreakdown = true;
    });

    const rollObj = {
      title: 'Soul Gun Damage',
      subtitle: `${stats.name} - Physical`,
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

  // ==================== COMBINATION MANEUVER FUNCTIONS ====================

  const executeManeuver = async (maneuverKey) => {
    const maneuver = combinationManeuverData[maneuverKey];
    if (!maneuver) return;

    const rep = reputation.value;
    const mamMod = abilityScores[mam.value]?.mod.value || 0;
    const participants = comboParticipants.value;

    // Build key values for the roll output
    const keyValues = {
      'Participants': `${participants} Magi-Knights`,
      'Unity Cost': `${maneuver.unityCost} per participant`,
      'Action': maneuver.actionType
    };

    // Add tags for special maneuver types
    const tags = [];
    if (maneuver.isQuick) tags.push('Quick Combo');
    if (maneuver.isLingering) tags.push('Lingering');
    if (maneuver.isLegendary) tags.push('Legendary');
    if (tags.length > 0) {
      keyValues['Type'] = tags.join(', ');
    }

    // Build components array for dice rolls
    const components = [];

    // Handle different maneuver types with their specific rolls
    if (maneuverKey === 'starstormRestoration') {
      keyValues['Damage'] = `${5 * rep} True Damage`;
      keyValues['Healing'] = `${10 * rep} HP`;
      keyValues['Effect'] = 'Enemies pushed 10ft, Prone';
    } else if (maneuverKey === 'planetaryAegis') {
      keyValues['Temp HP'] = `${6 * rep}`;
      keyValues['Resistance'] = 'Physical & Magical';
    } else if (maneuverKey === 'envoysOfHope') {
      const dicePool = 2 * rep;
      keyValues['Dice Pool'] = `${dicePool}d4`;
      keyValues['Use'] = 'Add to Damage/Healing/Resist OR reduce incoming damage';
      // Roll the dice pool
      components.push({ label: `Aura Pool`, formula: `${dicePool}d4`, alwaysShowInBreakdown: true });
    } else if (maneuverKey === 'ultimateRadiantReflection') {
      keyValues['Bonus Damage'] = `${4 * rep} True Damage`;
      keyValues['Effect'] = participants >= 4 ? 'Full reflect + bonus damage' : 'Damage reduced to 0';
    } else if (maneuverKey === 'ringshineFulminationNova') {
      // Roll d20 for each participant to determine dice pool
      keyValues['Range'] = '100ft AoE';
      keyValues['Aftermath'] = '2 Exhaustion + DC 16 or Depleted';
      // Each participant rolls 1d20 - show example for one
      components.push({ label: `Participant Roll`, formula: '1d20', alwaysShowInBreakdown: true });
      // Base damage formula reference
      keyValues['Dice Pool'] = '20=8d12, 18+=6d12, 12+=4d12, 1+=2d12 (+MAM+Rep each)';
      keyValues['Modifiers'] = `+${mamMod} MAM, +${rep} Rep`;
    } else if (maneuverKey === 'ringshineFulminationZenith') {
      // Single target variant
      keyValues['Target'] = 'Single target within 100ft';
      keyValues['Aftermath'] = '2 Exhaustion + DC 16 or Depleted';
      components.push({ label: `Participant Roll`, formula: '1d20', alwaysShowInBreakdown: true });
      keyValues['Dice Pool'] = '20=10d10+8d8, 18+=8d10+6d8, 12+=6d10+4d8, 1+=4d10+2d8 (+MAM+Rep each)';
      keyValues['Modifiers'] = `+${mamMod} MAM, +${rep} Rep`;
    } else if (maneuverKey === 'blueshiftCollision') {
      keyValues['Effect'] = 'Extra turn: 2 Move, 2 Standard, 2 Bonus';
      keyValues['First Attack'] = 'Advantage + True Damage';
      keyValues['Aftermath'] = '1 Exhaustion + DC 14 or Drained';
    } else if (maneuverKey === 'avengingFlare') {
      keyValues['Trigger'] = 'Ally becomes Exposed/Unconscious';
      keyValues['Effect'] = 'Spell Attack OR Move 30ft + Weapon Attack w/ Advantage';
      keyValues['Damage Type'] = 'True Damage';
    }

    // Add Maneuver Tax reminder
    keyValues['Maneuver Tax'] = 'Mysticism (CON) DC 14 - Fail = 1 Exhaustion';

    const rollObj = {
      title: maneuver.name,
      subtitle: `Combination Maneuver Executed`,
      characterName: metaStore.name,
      components: components,
      keyValues: keyValues,
      textContent: maneuver.description
    };

    rollToChat({ rollObj });
  };

  // ==================== RELEASE MAGIC SYSTEM ====================

  // Card definitions for Release Magic Style
  const releaseCardDefinitions = [
    { id: 'king', name: 'King', triumvirate: 'Era of Royalty', effect: '+X Leadership bonus + Xd6 Magical Damage to one target' },
    { id: 'queen', name: 'Queen', triumvirate: 'Era of Royalty', effect: '+X Leadership bonus + next MK Weapon Attack deals +Xd6 Magical' },
    { id: 'knight', name: 'Knight', triumvirate: 'Era of Heroism', effect: '+X Leadership bonus + reduce next MK damage by Xd8' },
    { id: 'dame', name: 'Dame', triumvirate: 'Era of Heroism', effect: '+X Leadership bonus + heal Xd8 HP to one MK' },
    { id: 'squire', name: 'Squire', triumvirate: 'Era of Potential', effect: 'Discard with another card: +Rep Level to Scaling Value' },
    { id: 'damsel', name: 'Damsel', triumvirate: 'Era of Potential', effect: 'Discard with another card: +Rep Level to Scaling Value' },
    { id: 'light', name: 'Light', triumvirate: 'The Chiaroscuro', effect: 'All MKs within 60ft gain Xd4 Temp HP' },
    { id: 'dark', name: 'Dark', triumvirate: 'The Chiaroscuro', effect: 'Full-Round: +X HP, teleport 10+X ft, immune to hostile targeting until next turn' },
    { id: 'twilight', name: 'Twilight', triumvirate: 'The Chiaroscuro', effect: 'Bonus Action, 0 MP: Exchange equal amounts of HP for MP OR MP for HP' },
    { id: 'life', name: 'Life', triumvirate: 'The Collective Cycle', effect: 'One MK within 60ft heals Xd8 HP and -1 Stress' },
    { id: 'death', name: 'Death', triumvirate: 'The Collective Cycle', effect: 'One target or Horde takes Xd12 Magical Damage' },
    { id: 'passage', name: 'Passage', triumvirate: 'The Collective Cycle', effect: 'You and/or one MK within 60ft teleport 10+(10×X) ft' },
    { id: 'angel', name: 'Angel', triumvirate: 'The Endless Battle', effect: 'One Outsider takes Xd10 True Damage' },
    { id: 'demon', name: 'Demon', triumvirate: 'The Endless Battle', effect: 'One Cultist takes Xd10 Magical Damage' },
    { id: 'mortal', name: 'Mortal', triumvirate: 'The Endless Battle', effect: 'Bonus Action, 0 MP: Discard hand, shuffle discard into deck, -1 Stress, draw 2 cards' },
    { id: 'hope', name: 'Hope', triumvirate: 'The Eternal Phase', effect: 'Roll Fate Die (see card details)', isFateDie: true },
    { id: 'despair', name: 'Despair', triumvirate: 'The Eternal Phase', effect: 'Roll Fate Die (see card details)', isFateDie: true },
    { id: 'fortune', name: 'Fortune', triumvirate: 'The Eternal Phase', effect: 'Roll Fate Die (see card details)', isFateDie: true },
    { id: 'justice', name: 'Justice', triumvirate: 'The Arduous Judgment', effect: 'Make Spell Attack vs one target: Xd10 Magical Damage' },
    { id: 'mercy', name: 'Mercy', triumvirate: 'The Arduous Judgment', effect: 'Next Convincing Argument has Advantage' },
    { id: 'reflection', name: 'Reflection', triumvirate: 'The Arduous Judgment', effect: 'One MK gains Xd4 + Rep Level MP (up to max)' },
    { id: 'love', name: 'Love', triumvirate: 'The Dynamic Tale', effect: 'Full-Round, 0 MP. Roll Fate Die (Ephemeral)', isFateDie: true, isEphemeral: true }
  ];

  // Release Magic state
  const releaseMagicDeck = ref([]);
  const releaseMagicCollapsed = ref(true);
  const signatureCard1 = ref('');
  const signatureCard2 = ref('');

  // Computed: Scaling Value = Reputation Level OR MAM modifier (whichever is higher)
  const scalingValue = computed(() => {
    const mamMod = abilityScores[mam.value]?.mod.value || 0;
    return Math.max(reputation.value, mamMod);
  });

  // Computed: Hand limit = 3 + Reputation Level
  const handLimit = computed(() => 3 + Math.max(1, reputation.value));

  // Computed: Cards by location
  const cardsInDeck = computed(() => releaseMagicDeck.value.filter(c => c.location === 'deck'));
  const cardsInHand = computed(() => releaseMagicDeck.value.filter(c => c.location === 'hand'));
  const cardsInDiscard = computed(() => releaseMagicDeck.value.filter(c => c.location === 'discard'));
  const cardsRemoved = computed(() => releaseMagicDeck.value.filter(c => c.location === 'removed'));

  // Initialize deck with all 22 cards
  const initializeReleaseDeck = () => {
    releaseMagicDeck.value = releaseCardDefinitions.map(cardDef => ({
      ...cardDef,
      location: 'deck'
    }));
    // Shuffle the deck
    shuffleReleaseDeck();
  };

  // Shuffle the deck
  const shuffleReleaseDeck = () => {
    const deckCards = releaseMagicDeck.value.filter(c => c.location === 'deck');
    for (let i = deckCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deckCards[i], deckCards[j]] = [deckCards[j], deckCards[i]];
    }
  };

  // Draw cards from deck to hand
  const drawReleaseCards = (count = 1) => {
    const availableCards = cardsInDeck.value;
    const currentHandSize = cardsInHand.value.length;
    const maxToDraw = Math.min(count, availableCards.length, handLimit.value - currentHandSize);

    for (let i = 0; i < maxToDraw; i++) {
      const card = availableCards[i];
      if (card) {
        card.location = 'hand';
      }
    }

    // Output to chat
    const rollObj = {
      title: 'Release Magic',
      subtitle: `Drew ${maxToDraw} card${maxToDraw !== 1 ? 's' : ''}`,
      characterName: metaStore.name,
      keyValues: {
        'Cards in Hand': `${cardsInHand.value.length}/${handLimit.value}`,
        'Cards in Deck': cardsInDeck.value.length
      }
    };
    rollToChat({ rollObj });
  };

  // Draw initial hand at combat start
  const drawInitialHand = () => {
    // Add signature cards if character is level 5+
    if (level.value >= 5 && signatureCard1.value) {
      const sig1 = releaseMagicDeck.value.find(c => c.id === signatureCard1.value);
      if (sig1) sig1.location = 'hand';
    }
    if (level.value >= 10 && signatureCard2.value) {
      const sig2 = releaseMagicDeck.value.find(c => c.id === signatureCard2.value);
      if (sig2) sig2.location = 'hand';
    }

    // Draw remaining cards to reach hand limit
    const currentHandSize = cardsInHand.value.length;
    const toDraw = handLimit.value - currentHandSize;
    if (toDraw > 0) {
      drawReleaseCards(toDraw);
    }
  };

  // Play a card from hand
  const playReleaseCard = async (cardId) => {
    const card = releaseMagicDeck.value.find(c => c.id === cardId && c.location === 'hand');
    if (!card) return;

    // Roll the card effect
    await rollReleaseCard(card);

    // Move card to discard (or removed if ephemeral)
    if (card.isEphemeral) {
      card.location = 'removed';
    } else {
      card.location = 'discard';
    }
  };

  // Roll a Release Magic card
  const rollReleaseCard = async (card) => {
    const sv = scalingValue.value;
    const mamMod = abilityScores[mam.value]?.mod.value || 0;
    const rep = reputation.value;

    const keyValues = {
      'Scaling Value': `X = ${sv}`,
      'Action': 'Standard'
    };

    const components = [];

    // Handle different card types
    switch (card.id) {
      case 'king':
        keyValues['Leadership Bonus'] = `+${sv}`;
        components.push({ label: 'Damage', formula: `${sv}d6`, alwaysShowInBreakdown: true });
        keyValues['Damage Type'] = 'Magical';
        break;

      case 'queen':
        keyValues['Leadership Bonus'] = `+${sv}`;
        keyValues['Next Attack Bonus'] = `+${sv}d6 Magical Damage`;
        break;

      case 'knight':
        keyValues['Leadership Bonus'] = `+${sv}`;
        components.push({ label: 'Damage Reduction', formula: `${sv}d8`, alwaysShowInBreakdown: true });
        break;

      case 'dame':
        keyValues['Leadership Bonus'] = `+${sv}`;
        components.push({ label: 'Healing', formula: `${sv}d8`, alwaysShowInBreakdown: true });
        break;

      case 'squire':
      case 'damsel':
        keyValues['Effect'] = `Discard with another card: +${rep} to Scaling Value`;
        break;

      case 'light':
        components.push({ label: 'Temp HP (All MKs 60ft)', formula: `${sv}d4`, alwaysShowInBreakdown: true });
        break;

      case 'dark':
        keyValues['Action'] = 'Full-Round';
        keyValues['HP Gain'] = `+${sv} HP`;
        keyValues['Teleport'] = `${10 + sv}ft`;
        keyValues['Effect'] = 'Immune to hostile targeting until next turn';
        break;

      case 'twilight':
        keyValues['Action'] = 'Bonus Action';
        keyValues['MP Cost'] = '0 MP';
        keyValues['Effect'] = 'Exchange equal amounts of HP for MP OR MP for HP';
        break;

      case 'life':
        components.push({ label: 'Healing', formula: `${sv}d8`, alwaysShowInBreakdown: true });
        keyValues['Stress Relief'] = '-1 Stress';
        break;

      case 'death':
        components.push({ label: 'Damage', formula: `${sv}d12`, alwaysShowInBreakdown: true });
        keyValues['Damage Type'] = 'Magical';
        break;

      case 'passage':
        keyValues['Teleport Distance'] = `${10 + (10 * sv)}ft`;
        keyValues['Targets'] = 'You and/or one MK within 60ft';
        break;

      case 'angel':
        components.push({ label: 'Damage vs Outsider', formula: `${sv}d10`, alwaysShowInBreakdown: true });
        keyValues['Damage Type'] = 'True Damage';
        break;

      case 'demon':
        components.push({ label: 'Damage vs Cultist', formula: `${sv}d10`, alwaysShowInBreakdown: true });
        keyValues['Damage Type'] = 'Magical';
        break;

      case 'mortal':
        keyValues['Action'] = 'Bonus Action';
        keyValues['MP Cost'] = '0 MP';
        keyValues['Effect'] = 'Discard hand, shuffle discard into deck, -1 Stress, draw 2 cards';
        break;

      case 'hope':
        keyValues['Action'] = 'Fate Die Roll';
        const hopeFate = await getRollResults([{ formula: '1d20', alwaysShowInBreakdown: true }]);
        components.push({ label: 'Fate Die', value: hopeFate.total, alwaysShowInBreakdown: true });

        if (hopeFate.total === 20) {
          keyValues['Result (20)'] = `Repair ${sv} Fractures, split ${sv} Stress/Exhaustion removal, Advantage on next Fate Die`;
        } else if (hopeFate.total >= 6) {
          keyValues['Result (6-19)'] = `Repair ${sv} Fractures`;
        } else if (hopeFate.total >= 2) {
          keyValues['Result (2-5)'] = `Repair ${Math.floor(sv/2)} Fractures`;
        } else {
          keyValues['Result (1)'] = `Take ${sv} Magical damage, search deck for Despair`;
        }
        break;

      case 'despair':
        keyValues['Action'] = 'Fate Die Roll';
        const despairFate = await getRollResults([{ formula: '1d20', alwaysShowInBreakdown: true }]);
        components.push({ label: 'Fate Die', value: despairFate.total, alwaysShowInBreakdown: true });

        if (despairFate.total === 20) {
          keyValues['Result (20)'] = 'Treat as Hope 20 + 1 Inspiration';
        } else if (despairFate.total >= 6) {
          keyValues['Result (6-19)'] = `One non-Outsider gets -${sv} to Attacks/Resists/Damage for 1 turn`;
        } else if (despairFate.total >= 2) {
          keyValues['Result (2-5)'] = 'MP refunded';
        } else {
          keyValues['Result (1)'] = `+${sv} Magical damage + Distressed + 3 Stress (potential +1 Trauma)`;
        }
        break;

      case 'fortune':
        keyValues['Action'] = 'Fate Die Roll';
        const fortuneFate = await getRollResults([{ formula: '1d20', alwaysShowInBreakdown: true }]);
        components.push({ label: 'Fate Die', value: fortuneFate.total, alwaysShowInBreakdown: true });

        if (fortuneFate.total === 20) {
          keyValues['Result (20)'] = `Next ${Math.floor(sv/2)} d20s get MAM×2 bonus + Advantage on next Fate`;
        } else if (fortuneFate.total >= 6) {
          keyValues['Result (6-19)'] = `Next ${Math.floor(sv/2)} d20s get MAM bonus`;
        } else if (fortuneFate.total >= 2) {
          keyValues['Result (2-5)'] = 'Disadvantage on next Fate Die';
        } else {
          keyValues['Result (1)'] = 'Disadvantage on next Fate + 3 Stress (potential +1 Trauma)';
        }
        break;

      case 'justice':
        keyValues['Spell Attack'] = `1d20 + ${mamMod} + ${proficiency.value}`;
        components.push({ label: 'Damage on Hit', formula: `${sv}d10`, alwaysShowInBreakdown: true });
        keyValues['Damage Type'] = 'Magical';
        break;

      case 'mercy':
        keyValues['Effect'] = 'Next Convincing Argument has Advantage and bypasses Argument Resistances/Immunities';
        break;

      case 'reflection':
        components.push({ label: 'MP Restore', formula: `${sv}d4`, alwaysShowInBreakdown: true });
        keyValues['Bonus'] = `+${rep} MP`;
        keyValues['Effect'] = 'One MK (up to max)';
        break;

      case 'love':
        keyValues['Action'] = 'Full-Round';
        keyValues['MP Cost'] = '0 MP';
        keyValues['Ephemeral'] = 'Removed after play';
        const loveFate = await getRollResults([{ formula: '1d20', alwaysShowInBreakdown: true }]);
        components.push({ label: 'Fate Die', value: loveFate.total, alwaysShowInBreakdown: true });

        if (loveFate.total === 20) {
          keyValues['Result (20)'] = 'Play 2 cards free, return 1, draw to Hand Limit';
        } else if (loveFate.total >= 6) {
          keyValues['Result (6-19)'] = 'Play 2 cards free, return 1, draw 1';
        } else if (loveFate.total >= 2) {
          keyValues['Result (2-5)'] = 'Play 1 card free, remove from play';
        } else {
          keyValues['Result (1)'] = 'Discard hand, remove 11 random cards + Love until end of Encounter, +1 Trauma';
        }
        break;
    }

    // Roll dice if components exist
    let resultComponents = components;
    if (components.some(c => c.formula)) {
      const results = await getRollResults(components);
      resultComponents = results.components;
    }

    const rollObj = {
      title: card.name,
      subtitle: `Release Magic Card - ${card.triumvirate}`,
      characterName: metaStore.name,
      components: resultComponents,
      keyValues: keyValues,
      textContent: card.effect
    };

    rollToChat({ rollObj });
  };

  // Reset deck (shuffle discard back into deck)
  const resetReleaseDeck = () => {
    // Move all discard cards back to deck
    releaseMagicDeck.value.forEach(card => {
      if (card.location === 'discard') {
        card.location = 'deck';
      }
    });

    shuffleReleaseDeck();

    const rollObj = {
      title: 'Release Magic',
      subtitle: 'Deck Reset',
      characterName: metaStore.name,
      keyValues: {
        'Cards in Deck': cardsInDeck.value.length,
        'Effect': 'Discard pile shuffled into deck'
      }
    };
    rollToChat({ rollObj });
  };

  // Cycle deck (costs 2 Stress, shuffles discard into deck)
  const cycleReleaseSpellDeck = () => {
    if (cardsInDeck.value.length === 0) {
      // Gain 2 Stress
      stress.value = Math.min(stress.value + 2, 6);

      // Move discard to deck and shuffle
      releaseMagicDeck.value.forEach(card => {
        if (card.location === 'discard') {
          card.location = 'deck';
        }
      });

      shuffleReleaseDeck();

      const rollObj = {
        title: 'Release Magic',
        subtitle: 'Cycling the Spell Deck',
        characterName: metaStore.name,
        keyValues: {
          'Stress Gained': '+2',
          'New Deck Size': cardsInDeck.value.length,
          'Effect': 'Discard pile shuffled into new deck'
        }
      };
      rollToChat({ rollObj });
    }
  };

  // ==================== END RELEASE MAGIC SYSTEM ====================

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
    budgetTallies,
    trainingTallies,
    trainingTalliesMax,
    clubTallies,
    clubTalliesMax,
    resoundingGrowths,
    clubPosition,
    clubPositionData,
    player,
    inspiration,
    stress,
    exhaustion,
    detentionTickets,
    trauma,
    exceededMortalLimits,
    proficiency,
    customProficiency,

    // Endurance Die and attrition
    enduranceDieEnabled,
    freakingOutToday,
    corruptionCount,
    burnoutLines,
    heartlessKnight,
    fallenKnight,

    // Heart Stage progression
    heartStageData,
    getHeartStageForSP,

    // Sleep Phase and daily limits
    sleepEffect,
    sleepEffectData,
    sealImplantGiven,
    sealImplantReceived,
    soulSacrificeCount,
    soulSacrificeMax,

    // Relic capacity
    relicCapacity,
    relicsOverCapacity,
    relicCount,
    runeSlotCapacity,
    runeSlotsUsed,
    runesOverCapacity,

    // Roll mode (advantage/disadvantage)
    rollMode,
    effectiveRollMode,
    forcedDisadvantage,

    // Conditions
    conditions,
    activeConditions,
    conditionDisadvantageOnAttacks,
    conditionDisadvantageOnSkillChecks,

    // Rolls to Resist
    resistModifiers,
    conditionResistDisadvantage,
    activeResistModifiers,
    getResistRollMode,

    hp,
    mp,
    shp,

    crystal,

    abilityScores,
    statIncreases,
    statIncreaseLevels,
    statIncreasesApplied,
    statIncreasesAvailable,
    statIncreasesMissing,
    skills,
    masteredSkill,

    initiative,
    initiative_override,
    
    eclipse,
    eclipse_blips,
    eclipse_phase,
    studiedCombat,
    studiedSchool,
    wellFed,
    rested,
    fate,
    student_ability,
    student_type,
    armor_weave,
    armorWeaveData,
    soulArmamentMode,
    soul_weapon,
    weaponQualityDefs,
    weaponQualityAttackBonus,
    weaponQualityDamageBonus,
    veilPiercingUsed,
    activeWeaponQualities,
    soul_gun,
    gunTypeData,
    gunStyleData,
    gunTypeStats,
    availableGunStyles,
    effectiveMD,
    rollGunRapidFire,
    rollGunMagDump,
    rollGunDamage,
    magical_implement,
    implementQualityDefs,
    hasManaAttunement,
    hasEmbolden,
    emboldenDamageBonus,
    radianceHealBonus,
    wardingReduction,
    manaConduitUsed,
    visor,
    visorData,
    activeVisorEffect,
    elementalSummon,
    activeImplementQualities,

    // Combat Forms
    combatFormData,
    activeCombatForm,
    combatFormMastery,
    combatFormsCollapsed,
    hasFormX,

    // Level-Locked Abilities
    levelAbilityData,
    levelAbilities,
    levelAbilitiesCollapsed,
    energySurgeUsed,
    isFlying,

    damageTypeLabels,
    gloom_gems:gloom,
    unity_points:unity,
    unity_max: unityMax,
    unity_available: unityAvailable,
    fortunePool,
    fortunePoolEnabled,
    fortunePoolMax,
    herald,
    tierVIUnlocked,

    // Magi-Squire
    squire,
    squireDamage,
    squireSpellPaths,

    // Squadron Formations
    formationData,
    activeFormation,
    formationEffects,
    formationsCollapsed,
    activateFormation,
    deactivateFormation,

    // Combination Maneuvers
    combinationManeuverData,
    comboParticipants,
    combosCollapsed,
    comboEffects,
    canExecuteManeuver,
    executeManeuver,

    // Release Magic
    releaseCardDefinitions,
    releaseMagicDeck,
    releaseMagicCollapsed,
    signatureCard1,
    signatureCard2,
    scalingValue,
    handLimit,
    cardsInDeck,
    cardsInHand,
    cardsInDiscard,
    cardsRemoved,
    initializeReleaseDeck,
    drawReleaseCards,
    drawInitialHand,
    playReleaseCard,
    resetReleaseDeck,
    cycleReleaseSpellDeck,

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
    knightArmorTotal,
    soulArmamentData,
    soulArmamentWeaponBonus,
    soulArmamentArmorBonus,
    knight_hasShield,
    knight_move,
    knight_attack,
    knight_attack_override,
    spell_attack_override,
    spell_dc_override,
    elemental_affinity,
    branchingElement,
    branchingElementOptions,
    availableBranches,
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
    isTierUnlocked,
    availableSpellPaths,
    maxSpellPaths,
    spellPathsCount,
    spellPathsOverMax,
    populateSpellPath,
    addRow,
    removeRow,
    removeTrait: (traitId) => removeTrait(traits, traitId),

    // Battle Techniques and Combat Tactics
    resetTechniqueUses,
    useTechnique,
    isTechniqueAvailable,
    checkTacticPrerequisites,
    hasTacticActive,

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
    roleModifiers,
    sizeModifiers,
    rankDamagePct,
    npc_sheet_type,
    npc_social_name,
    npc_social_role,
    npc_social_heart_stage,
    npc_social_sp,
    npc_social_personality,
    npc_social_abilities,
    npc_social_notes,
    npc_name,
    npc_type,
    npc_size,
    npc_creature_type,
    npc_role,
    npc_role_modifiers,
    npc_size_modifiers,
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