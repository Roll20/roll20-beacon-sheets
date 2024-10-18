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

  const character_name = ref('');
  const level = ref(1);
  const reputation = ref(0);
  const player = ref('');
  const inspiration = ref(0);
  const stress = ref(0);
  const exhaustion = ref(0);

  // abilityScores
  const strength = ref(10);
  const dexterity = ref(10);
  const constitution = ref(10);
  const intelligence = ref(10);
  const wisdom = ref(10);
  const charisma = ref(10);
  
  const strengthMod = computed(() => Math.floor((strength.value - 10) / 2));
  const dexterityMod = computed(() => Math.floor((dexterity.value - 10) / 2));
  const constitutionMod = computed(() => Math.floor((constitution.value - 10) / 2));
  const intelligenceMod = computed(() => Math.floor((intelligence.value - 10) / 2));
  const wisdomMod = computed(() => Math.floor((wisdom.value - 10) / 2));
  const charismaMod = computed(() => Math.floor((charisma.value - 10) / 2));
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
    if (reputation.value > 6){
      return '0';
    }
    if (reputation.value < 0){
      return '0';
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

    m[skillName] = {
      name:skillName,
      proficiency: prof,
      ability: defaultAbility,
      abilitiesList: abilitiesList,
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

  const hp = {
    current: ref(10),
    temp: ref(0),
    max: ref(0)
  };
  const mp = {
    current: ref(10),
    max: ref(0)
  };
  const shp = {
    current: ref(10),
    max: ref(0)
  };

  const elemental_affinity = ref('');
  const magic_style = ref('');
  const element_name = ref('');
  const mam = ref('');
  const elemental_enhancement_1 = ref('');
  const elemental_enhancement_2 = ref('');
  const roll_resist_proficiency = ref('');

  const spell_attack_override = ref('');
  const spell_attack = computed({
    get() {
      // If the override is empty, return the calculated value
      if (spell_attack_override.value === '') {
        return proficiency.value + (abilityScores[mam]?.mod.value || 0);
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
        return 8 + proficiency.value + (abilityScores[mam]?.mod.value || 0);
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

  const traits = ref([]);
  const traitsCount = computed(() => traits.value?.length);

  const student_damage = ref('');
  const student_armor = ref(0);
  const student_move = ref(0);
  const student_attack = ref('');
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
    qualities: ref(''),
    collapsed: ref(true)
  }
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
      };
    }
    return dehydratedSkills;
  }
  
  function hydrateSkills(skills, hydrateData = {}) {
    for (const [skillName, skillData] of Object.entries(hydrateData)) {
      if (skills[skillName]) {
        skills[skillName].proficiency.value = skillData.proficiency ?? skills[skillName].proficiency.value;
        skills[skillName].ability.value = skillData.ability ?? skills[skillName].ability.value;
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
      max: hp.max.value,
    };
  }
  
  function hydrateHp(hp, hydrateData = {}) {
    hp.current.value = hydrateData.current ?? hp.current.value;
    hp.temp.value = hydrateData.temp ?? hp.temp.value;
    hp.max.value = hydrateData.max ?? hp.max.value;
  }
  
  // Dehydrate and Hydrate methods for 'mp'
  function dehydrateMp(mp) {
    return {
      current: mp.current.value,
      max: mp.max.value,
    };
  }
  
  function hydrateMp(mp, hydrateData = {}) {
    mp.current.value = hydrateData.current ?? mp.current.value;
    mp.max.value = hydrateData.max ?? mp.max.value;
  }
  
  // Dehydrate and Hydrate methods for 'shp'
  function dehydrateShp(shp) {
    return {
      current: shp.current.value,
      max: shp.max.value,
    };
  }
  
  function hydrateShp(shp, hydrateData = {}) {
    shp.current.value = hydrateData.current ?? shp.current.value;
    shp.max.value = hydrateData.max ?? shp.max.value;
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
      qualities: soulWeapon.qualities.value,
      collapsed: soulWeapon.collapsed.value,
    };
  }
  
  function hydrateSoulWeapon(soulWeapon, hydrateData = {}) {
    soulWeapon.name.value = hydrateData.name ?? soulWeapon.name.value;
    soulWeapon.range.value = hydrateData.range ?? soulWeapon.range.value;
    soulWeapon.damage.value = hydrateData.damage ?? soulWeapon.damage.value;
    soulWeapon.qualities.value = hydrateData.qualities ?? soulWeapon.qualities.value;
    soulWeapon.collapsed.value = hydrateData.collapsed ?? soulWeapon.collapsed.value;
  }
  

  // Handles retrieving these values from the store
  const dehydrate = () => {
    const obj = {
      sheet_mode: sheet_mode.value,
      level: level.value,
      reputation: reputation.value,
      player: player.value,
      inspiration: inspiration.value,
      stress: stress.value,
      exhaustion: exhaustion.value,
      dexterityMod: dexterityMod.value,
      rested: rested.value,
      studied: studied.value,
      gloom_gems: gloom.value,
      unity_points: unity.value,
      elemental_affinity: elemental_affinity.value,
      magic_style: magic_style.value,
      element_name: element_name.value,
      mam: mam.value,
      eclipse: [...eclipse.value],
      eclipse_blips: [...eclipse_blips.value],
      customProficiency: customProficiency.value,
      elemental_enhancement_1: elemental_enhancement_1.value,
      elemental_enhancement_2: elemental_enhancement_2.value,
      roll_resist_proficiency: roll_resist_proficiency.value,
      skills: dehydrateSkills(skills),
      abilityScores: dehydrateAbilityScores(abilityScores),
      hp: dehydrateHp(hp),
      mp: dehydrateMp(mp),
      shp: dehydrateShp(shp),
      crystal: dehydrateCrystal(crystal),
      student_ability: dehydrateStudentAbility(student_ability),
      fate: dehydrateFate(fate),
      armor_weave: dehydrateArmorWeave(armor_weave),
      soul_weapon: dehydrateSoulWeapon(soul_weapon),
      student_damage: student_damage.value,
      student_armor: student_armor.value,
      student_move: student_move.value,
      student_attack: student_attack.value,
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
    level.value = hydrateStore.level ?? level.value;
    reputation.value = hydrateStore.reputation ?? reputation.value;
    customProficiency.value = hydrateStore.customProficiency ?? customProficiency.value;
    proficiency.value = calculateProficiency();
    player.value = hydrateStore.player ?? player.value;
    inspiration.value = hydrateStore.inspiration ?? inspiration.value;
    stress.value = hydrateStore.stress ?? stress.value;
    exhaustion.value = hydrateStore.exhaustion ?? exhaustion.value;
    rested.value = hydrateStore.rested ?? rested.value;
    studied.value = hydrateStore.studied ?? studied.value;
    gloom.value = hydrateStore.gloom_gems ?? gloom.value;
    unity.value = hydrateStore.unity_points ?? unity.value;

    student_damage.value = hydrateStore.student_damage ?? student_damage.value;
    student_armor.value = hydrateStore.student_armor ?? student_armor.value;
    student_move.value = hydrateStore.student_move ?? student_move.value;
    student_attack.value = hydrateStore.student_attack ?? student_attack.value;
    knight_damage.value = hydrateStore.knight_damage ?? knight_damage.value;
    knight_armor.value = hydrateStore.knight_armor ?? knight_armor.value;
    knight_hasShield.value = hydrateStore.knight_hasShield ?? knight_hasShield.value;
    knight_move.value = hydrateStore.knight_move ?? knight_move.value;
    knight_attack.value = hydrateStore.knight_attack ?? knight_attack.value;
    knight_attack_override.value = hydrateStore.knight_attack_override ?? knight_attack_override.value;
    spell_attack_override.value = hydrateStore.spell_attack_override ?? spell_attack_override.value;
    spell_dc_override.value = hydrateStore.spell_dc_override ?? spell_dc_override.value;
    initiative_override.value = hydrateStore.initiative_override ?? initiative_override.value;

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
    
    Object.entries(sections).forEach(([name,obj]) => {
      obj.rows.value = objectToArray(hydrateStore[name]);
    });
  }

  const metaStore = useMetaStore();
  const rollAbility = (name) => {
    const rollObj = {
      title: toTitleCase(name),
      subtitle: 'Ability Check',
      characterName: metaStore.name,
      components: [
        {label:'1d20',sides:20,alwaysShowInBreakdown: true},
        {label:'Mod', value:abilityScores[name].mod.value,alwaysShowInBreakdown: true},
        {label: 'Prof',value: proficiency.value,alwaysShowInBreakdown: true}
      ]
    };
    rollToChat({rollObj});
  };

  const rollSkill = (name) => {
    const abilityName = skills[name].ability.value;
    const formattedTitle = toTitleCase(name.replace(/_/g, ' '));
    if (skills[name].overrideValue !== '' && skills[name].overrideValue !== undefined){
      const rollObj = {
        title: formattedTitle,
        characterName: metaStore.name,
        components: [
          {label:'1d20',sides:20,alwaysShowInBreakdown: true},
          {label:'Skill Value Override', value:Number(skills[name].overrideValue),alwaysShowInBreakdown: true}
        ]
      };
      rollToChat({rollObj});
    }else{
      const rollObj = {
        title: formattedTitle,
        characterName: metaStore.name,
        components: [
          {label:'1d20',sides:20,alwaysShowInBreakdown: true},
          {label:'Mod', value:abilityScores[abilityName].mod.value,alwaysShowInBreakdown: true}
        ]
      };
      if(skills[name].proficiency.value){
        rollObj.components.push({label: 'Prof',value: proficiency.value,alwaysShowInBreakdown: true});
      }
      rollToChat({rollObj});
    }
  };

  const rollWeapon = async (item,tier) => {
    let abMod, abModName;

    if ((abilityScores.strength.mod.value || 0) > (abilityScores.dexterity.mod.value || 0)) {
        abMod = abilityScores.strength.mod.value || 0;
        abModName = abilityScores.strength.mod.value != 0 ? "Strength" : '';
    } else {
        abMod = abilityScores.dexterity.mod.value || 0;
        abModName = abilityScores.dexterity.mod.value != 0 ? "Dexterity" : '';
    }
    const attackPromise = getRollResults(
      [
        {label:'1d20',sides:20,alwaysShowInBreakdown: true},
        {label:'Mod', value:abMod,alwaysShowInBreakdown: true},
        {label:'Prof',value: proficiency.value,alwaysShowInBreakdown: true}
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
      const modifier = abMod || 0;
      const totalDamage = damageComp[0].results.result + abMod || 0;

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
      rollObj.keyValues.Range = soul_weapon.range.value;
    }
    if(soul_weapon.qualities.value){
      rollObj.textContent = soul_weapon.qualities.value;
    }
    if(soul_weapon.damage.value){
      rollObj.keyValues[soul_weapon.damage.value] = damageResult

    if(item[`tier_${tier}_name`]){
      rollObj.subtitle = item.name;
    }
    if(item.range){
      rollObj.keyValues.Range = item.range;
    }

    if (damageFormula){
      rollObj.keyValues[`Damage Roll`] = damageFormula;
    }
    if (damageBreakdownRoll){
      rollObj.keyValues[`Roll`] = damageBreakdownRoll;
    }
    if (damageBreakdownMod){
      rollObj.keyValues[`Proficiency Bonus`] = damageBreakdownMod;
    }
    if (damageBreakdownMam && abModName != '') 
    rollObj.keyValues[`${abModName} Modifier`] = damageBreakdownMam;
    if (damageBreakdownTotal){
      rollObj.keyValues[`Total`] = damageBreakdownTotal;
    }

    }
    rollToChat({rollObj});
  };

  const rollSpell = async (item,tier) => {
    const abMod = abilityScores[mam.value]?.mod.value || 0;
    const attackPromise = getRollResults(
      [
        {label:'1d20',sides:20,alwaysShowInBreakdown: true},
        {label:'MAM', value:abMod,alwaysShowInBreakdown: true},
        {label:'Prof',value: proficiency.value,alwaysShowInBreakdown: true}
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
      rollObj.keyValues.Range = item.range;
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
    const rollObj = {
      title: 'Roll Initiative',
      characterName: metaStore.name,
      components: [
        {label:'1d20',sides:20,alwaysShowInBreakdown: true},
        {label:'Initiative', value:Number(initiative.value),alwaysShowInBreakdown: true},
      ]
    };
    rollToChat({rollObj});
  };

  const rollKnightAttack = (name) => {
    const rollObj = {
      title: 'Attack Roll',
      subtitle: 'Magi-Knight Persona',
      characterName: metaStore.name,
      components: [
        {label:'1d20',sides:20,alwaysShowInBreakdown: true},
        {label:'Value', value:Number(knight_attack.value),alwaysShowInBreakdown: true}
      ]
    };
    rollToChat({rollObj});
  };

  const rollStudentAttack = (name) => {
    const rollObj = {
      title: 'Attack Roll',
      subtitle: 'Student Persona',
      characterName: metaStore.name,
      components: [
        {label:'1d20',sides:20,alwaysShowInBreakdown: true},
        {label:'Value', value:Number(student_attack.value),alwaysShowInBreakdown: true},
      ]
    };
    rollToChat({rollObj});
  };

  const rollStudentDamage = async (notation) => {
    let notationString = String(student_damage.value || notation);
    
    // Parsing the dice notation, e.g., "1d20+2"
    const regex = /(?:(\d*)d(\d+))([+-]?\d+)?/;
    const match = notationString.match(regex);
  
    if (!match) {
      return;
    }
  
    const diceCount = match[1] ? parseInt(match[1], 10) : 1; // default to 1 if not specified
    const diceSides = parseInt(match[2], 10);
    const modifier = match[3] ? parseInt(match[3], 10) : 0; // default to 0 if not specified
  
    // Roll each die individually and calculate the total
    let rollTotal = 0;
    const individualRolls = [];
    for (let i = 0; i < diceCount; i++) {
      const roll = Math.floor(Math.random() * diceSides) + 1;
      individualRolls.push(roll);
      rollTotal += roll;
    }
  
    // Create components for the roll breakdown
    const components = [
      {
        label: `${diceCount}d${diceSides} ` + individualRolls.join(' + '), // Show each roll in the breakdown
        value: rollTotal, // Total of the dice rolls
        alwaysShowInBreakdown: true,
      },
    ];

    // Add modifier to total
    rollTotal += modifier;
  
    // Adding modifier to components if it exists
    if (modifier !== 0) {
      components.push({
        label: "Modifier",
        value: modifier,
        alwaysShowInBreakdown: true,
      });
    }
  
    // Format the roll for chat
    const rollObj = {
      title: 'Damage Roll',
      subtitle: 'Student Persona',
      characterName: metaStore.name,
      components: components,
      total: Number(rollTotal),
    };
  
    rollToChat({ rollObj });
  
    return rollTotal;
  }; 

  const rollKnightDamage = async (notation) => {
    let notationString = String(knight_damage.value || notation);
    
    // Parsing the dice notation, e.g., "1d20+2"
    const regex = /(?:(\d*)d(\d+))([+-]?\d+)?/;
    const match = notationString.match(regex);
  
    if (!match) {
      return;
    }
  
    const diceCount = match[1] ? parseInt(match[1], 10) : 1; // default to 1 if not specified
    const diceSides = parseInt(match[2], 10);
    const modifier = match[3] ? parseInt(match[3], 10) : 0; // default to 0 if not specified
  
    // Roll each die individually and calculate the total
    let rollTotal = 0;
    const individualRolls = [];
    for (let i = 0; i < diceCount; i++) {
      const roll = Math.floor(Math.random() * diceSides) + 1;
      individualRolls.push(roll);
      rollTotal += roll;
    }
  
    // Create components for the roll breakdown
    const components = [
      {
        label: `${diceCount}d${diceSides} ` + individualRolls.join(' + '), // Show each roll in the breakdown
        value: rollTotal, // Total of the dice rolls
        alwaysShowInBreakdown: true,
      },
    ];
  
        // Add modifier to total
        rollTotal += modifier;

    // Adding modifier to components if it exists
    if (modifier !== 0) {
      components.push({
        label: "Modifier",
        value: modifier,
        alwaysShowInBreakdown: true,
      });
    }
  
    // Format the roll for chat
    const rollObj = {
      title: 'Damage Roll',
      subtitle: 'Magi-Knight Persona',
      characterName: metaStore.name,
      components: components,
      total: Number(rollTotal),
    };
  
    rollToChat({ rollObj });
  
    return rollTotal;
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

  return {
    sheet_mode,
    level,
    reputation,
    player,
    inspiration,
    stress,
    exhaustion,
    proficiency,
    customProficiency,

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
    armor_weave,
    soul_weapon,
    gloom_gems:gloom,
    unity_points:unity,
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
    student_armor,
    student_move,
    student_attack,
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


    dehydrate,
    hydrate
  }
});

// make sure to pass the right store definition, `useAuth` in this case.
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSheetStore, import.meta.hot))
}