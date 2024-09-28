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
    dexterity:{
      score: dexterity,
      mod: dexterityMod
    },
    constitution:{
      score: constitution,
      mod: constitutionMod
    },
    intelligence:{
      score: intelligence,
      mod: intelligenceMod
    },
    wisdom:{
      score: wisdom,
      mod: wisdomMod
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

  const customProficiency = ref(0);
  const proficiency = ref(calculateProficiency());

  function calculateProficiency() {
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

  const initiative = computed(() => dexterityMod.value);

  const hp = {
    current: ref(10),
    temp: ref(0),
    max: computed(() => 10)
  };
  const mp = {
    current: ref(10),
    max: computed(() => 10)
  };
  const shp = {
    current: ref(10),
    max: computed(() => 10)
  };

  const elemental_affinity = ref('');
  const magic_style = ref('');
  const mam = ref('');

  const spell_attack = computed(()=> proficiency.value + (abilityScores[mam]?.mod.value || 0));
  const spell_dc = computed(() => 8 + spell_attack.value);
  const eclipse = ref([]);
  const eclipse_phase = computed(()=>{
    return Math.max(0,...eclipse.value) >= 3 ?
      'Heartless Knight' :
      'Soul Eclipse Chart'});
  
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

  const student_damage = ref(0);
  const student_armor = ref(0);
  const student_move = ref(0);
  const student_attack = ref(0);
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
    collapsed: ref(false)
  };
  const fate = {
    card: ref(''),
    name: ref('')
  }
  // magi-knight stats
  
  const knight_damage = ref(0);
  const knight_armor = ref(0);
  const knight_move = ref(0);
  const knight_attack = computed(() => {
    const abMod = abilityScores[mam.value]?.mod.value || 0;
    return proficiency.value + abMod;
  });
  const armor_weave = {
    name: ref(''),
    description: ref(''),
    collapsed: ref(false)
  };
  const soul_weapon = {
    name: ref(''),
    range: ref(''),
    damage: ref(''),
    qualities: ref(''),
    collapsed: ref(false)
  }
  // repeating sections
  const sections = {
    techniques: {
      template: {
        name: '',
        description: '',
        type: '',
        collapsed: false
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
        collapsed: false
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
        collapsed: false
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
        collapsed: false
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
        collapsed: false
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
        collapsed: false
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
  })

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

  // store hydration/dehydration
  // dehydrates a nested set of refs/computed
  const dehydrateNested = (obj) =>
    Object.entries(obj).reduce((m,[k,v]) => {
      if(typeof v === 'object'){
        if(v.constructor?.name === 'RefImpl'){
          m[k] = v.value;
        }else if(!v.__v_isReadonly){
          m[k] = dehydrateNested(v);
        }
      }else{
        m[k] = v;
      }
      return m;
    },{});

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
      mam: mam.value,
      skills: dehydrateNested(skills),
      abilityScores: dehydrateNested(abilityScores),
      // eclipse:Math.max(0,...eclipse.value),
      customProficiency: customProficiency.value,
      hp: dehydrateNested(hp),
      mp: dehydrateNested(mp),
      shp: dehydrateNested(shp),
      crystal: dehydrateNested(crystal),
      student_ability: dehydrateNested(student_ability),
      fate:dehydrateNested(fate),
      armor_weave: dehydrateNested(armor_weave),
      soul_weapon: dehydrateNested(soul_weapon),
      student_damage: student_damage.value,
      student_armor: student_armor.value,
      student_move: student_move.value,
      student_attack: student_attack.value,
      knight_damage: knight_damage.value,
      knight_armor: knight_armor.value,
      knight_move: knight_move.value,
      knight_attack: knight_attack.value,

      interests: interests.value,
      virtues: virtues.value,
      strengths: strengths.value,
      weaknesses: weaknesses.value,
      electives: electives.value,
      characteristics: characteristics.value,
      quote: quote.value,
      player_links: player_links.value,
      backstory: backstory.value,

      // faction: faction.value,
      // traits: arrayToObject(traits.value)
    };
    
    Object.entries(sections).forEach(([name,val]) => {
      obj[name] = arrayToObject(val.rows.value);
    });
    return obj;
  }

  const hydrateNested = (orig,hydrateObj = {},name) =>
    Object.entries(hydrateObj).forEach(([k,v]) => {
      if(name){
        console.log(`hydrating ${name}`);
      }
      if(typeof orig[k] === 'object'){
        if(orig[k].constructor?.name === 'RefImpl'){
          orig[k].value = v ?? orig[k].value;
        }else if(
          !orig[k].__v_isReadonly
        ){
          hydrateNested(orig[k],v);
        }
      }else{
        orig[k] = v;
      }
    });

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
    knight_move.value = hydrateStore.knight_move ?? knight_move.value;
    knight_attack.value = hydrateStore.knight_attack ?? knight_attack.value;

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
    mam.value = hydrateStore.mam ?? mam.value;
    // eclipse.value = [...Array(hydrateStore.eclipse).keys()].map(k => k + 1);
    hydrateNested(armor_weave,hydrateStore.armor_weave);
    hydrateNested(soul_weapon,hydrateStore.soul_weapon);
    hydrateNested(fate,hydrateStore.fate);
    hydrateNested(student_ability,hydrateStore.student_ability);
    hydrateNested(abilityScores,hydrateStore.abilityScores);
    hydrateNested(skills,hydrateStore.skills);
    hydrateNested(hp,hydrateStore.hp);
    hydrateNested(mp,hydrateStore.mp);
    hydrateNested(shp,hydrateStore.shp);
    hydrateNested(crystal,hydrateStore.crystal);
    // faction.value = hydrateStore.faction ?? faction.value
    // traits.value = objectToArray(hydrateStore.traits) || traits.value
    Object.entries(sections).forEach(([name,obj]) => {
      obj.rows.value = objectToArray(hydrateStore[name]);
    });
  }

  const metaStore = useMetaStore();
  const rollAbility = (name) => {
    const rollObj = {
      title: name,
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
    const rollObj = {
      title: name.replace(/_/g,' '),
      characterName: metaStore.name,
      components: [
        {label:'1d20',sides:20,alwaysShowInBreakdown: true},
        {label:'Mod', value:abilityScores[abilityName].mod.value,alwaysShowInBreakdown: true}
      ]
    };
    if(skills[name].proficiency){
      rollObj.components.push({label: 'Prof',value: proficiency.value,alwaysShowInBreakdown: true});
    }
    rollToChat({rollObj});
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
    
    eclipse,
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
    knight_move,
    knight_attack,
    elemental_affinity,
    magic_style,
    mam,
    spell_attack,
    spell_dc,
    sections,
    max_spell_tier,
    addRow,
    removeRow,
    removeTrait: (traitId) => removeTrait(traits, traitId),

    rollAbility,
    rollSkill,
    rollWeapon,
    rollSpell,

    dehydrate,
    hydrate
  }
});

// make sure to pass the right store definition, `useAuth` in this case.
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSheetStore, import.meta.hot))
}