import { useAbilityScoreStore } from '@/sheet/stores/abilityScores/abilityScoresStore';
import { useCharacterStore } from '@/sheet/stores/character/characterStore';
import { useBioStore } from '@/sheet/stores/bio/bioStore';
import { useInventoryStore } from '@/sheet/stores/inventory/inventoryStore';
import { useItemStore } from '@/sheet/stores/character/characterQualitiesStore';
import { ref } from 'vue';
import { useSpellStore } from '@/sheet/stores/magic/magicStore';

export interface MoneyAdapted {
    _id: string;
    moneyname: string;
    moneyamount: number;
}


// export function loadLegacyAbilityScores(attributes: { [key: string]: string }) {
// export function loadLegacyAbilityScores(attributes: { [key: string]: string }){
//     // debugger
//     const abilityMap: { [key: string]: string } = {
//         accuracy: 'AccuracyBase',
//         communications: 'CommunicationsBase',
//         constitution: 'ConstitutionBase',
//         dexterity: 'DexterityBase',
//         fighting: 'FightingBase',
//         intelligence: 'IntelligenceBase',
//         perception: 'PerceptionBase',
//         strength: 'StrengthBase',
//         willpower: 'WillpowerBase',
//     };
//     // debugger
//     Object.keys(attributes).forEach(key => {
        
//         if (abilityMap[key]) {    
//             const value = parseInt(attributes[key], 0);
//             if (!isNaN(value)) {
//                 useAbilityScoreStore().AccuracyBase =  parseInt(attributes[key], 0);
//             }
//         }
//     });
// };

export function loadLegacyAbilityScores(attributes: { [key: string]: string }) {
    const abilityMap: { [key: string]: string } = {
        accuracy: 'AccuracyBase',
        communications: 'CommunicationsBase',
        constitution: 'ConstitutionBase',
        dexterity: 'DexterityBase',
        fighting: 'FightingBase',
        intelligence: 'IntelligenceBase',
        perception: 'PerceptionBase',
        strength: 'StrengthBase',
        willpower: 'WillpowerBase',
    };

    const abilityStore = useAbilityScoreStore(); // Get the store instance once

    Object.keys(attributes).forEach(key => {
        if (abilityMap[key]) {
            const value = parseInt(attributes[key], 0);
            if (!isNaN(value)) {
                const mappedKey = abilityMap[key];
                (abilityStore as any)[mappedKey] = value;
            }
        }
    });
}

export function loadLegacyCharacterDetails(attributes: { [key: string]: string }) {
    // const char = useCharacterStore();
    // const bio = useBioStore();

    //Primary Details
    // char.levelSet(parseInt(attributes.level, 0));
    // char.magic = Number(attributes.magic);
    // char.health = Number(attributes.health);
    // bio.socialClass = attributes['social-class'];
    // bio.background = attributes.background;
    // bio.ancestry = attributes.race

    // //Background
    // bio.sex = attributes.gender;
    // bio.height = attributes.height;
    // bio.weight = attributes.weight;
    // bio.skin = attributes.skin;
    // bio.eyes = attributes.eyes;
    // bio.skin = attributes.skin;
    // bio.hair = attributes.hair;
};



export function loadLegacyGroupings(attributes: { [key: string]: string }) {
    // const data = { /* the example object */ };

    // const grouped = {};
    
    // Object.entries(attributes).forEach(([key, value]) => {
    //   const match = key.match(/repeating_(\w+)_-(\w+)_([\w-]+)/);
    //   if (match) {
    //     const [_, type, id, property] = match;
    //     if (!grouped[type]) grouped[type] = [];
    //     let item = grouped[type].find(obj => obj._id === id);
    //     if (!item) {
    //       item = { _id: id };
    //       grouped[type].push(item);
    //     }
    //     item[property] = value;
    //   }
    // });
    
    // // Talents
    // if(grouped.talent){
    //     legacyTalents(grouped.talent);
    // }  
    // // Ancestry & Class Powers
    // // Arcana Powers
    // if(grouped.spell){
    //     legacyArcana(grouped.spell);
    // }
    // // Ability Focus
    // // Favored Stunts
    // // Inventory
    // if(grouped.equipment){
    //     legacyInventory(grouped.equipment)
    // }
    // // Currency & Resources
    // if(grouped.money){
    //     legacyCurrency(grouped.money)
    // }
    // console.log(grouped);
    
}

export const legacyCurrency = (money:MoneyAdapted[]) => {
    const inventory = useInventoryStore();
    money.forEach(m => {
        switch(m.moneyname){
            case 'CP':
                inventory.cash.copper = m.moneyamount;
            break;
            case 'SP':
                inventory.cash.silver = m.moneyamount;
            break;
            case 'GP':
                inventory.cash.gold = m.moneyamount;
            break
        }
    })
}

export const legacyTalents = (talents:any[]) => {
    const qualities = useItemStore();
    talents.forEach(talent => {
        const talentDegree = ref('novice');
        switch(talent.talentdegree){
            case '2':
                talentDegree.value = 'expert';
            break;
            case '3':
                talentDegree.value = 'master';
            break;
        }
        qualities.addItem({
            type:'Talent',
            name: talent.powername,
            description:talent.talentdescription,
            qualityLevel:talentDegree.value,
            qualityNovice:talent.talent1description,
            qualityExpert:talent.talent2description,
            qualityMaster:talent.talent3description
        });
    });
}

export const legacyInventory = (inventory:any[]) => {
    const inventoryStore = useInventoryStore();
    inventory.forEach(item => {
        console.log(item)
        inventoryStore.addItem({
            name:item['equipment-name'],
            description:item['equipment-description'],
            type:'item'
        });
    });
}
export const legacyArcana = (arcana:any[]) => {
    const magic = useSpellStore();
    arcana.forEach(spell => {
        magic.addSpell({
            name:spell['spell-name'] || '',
            description:spell['full-spell-description'] || '',
            arcanaType: spell['spell-school'] || '',
            requirements:spell['spell-requirements'] || 'Novice',
            mpCost:spell['spell-mp-cost'] || 0,
            shortDescription: spell['short-spell-description'] || '',
            castingTime:spell['spell-cast-time'] || '',
            targetNumber:spell['spell-tn'] || 0,
        });
    });
}