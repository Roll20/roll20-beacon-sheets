import type { SingleEffect } from "@/schemas/common/SingleEffectSchema";
import type { InjuryItem } from "@/schemas/hydrate/injury";
import { v4 as uuidv4 } from 'uuid';
import getRollResult from '@/utility/getRollResult';
import { createRollTemplate } from '@/rolltemplates/rolltemplates';
import { logRoll } from '@/utility/logRoll';
const physicalPenalty:SingleEffect[]  = [
  {
    attribute: 'fighting_roll',
    value: 2,
    operation: 'subtract'
  },
  {
    attribute: 'agility_roll',
    value: 2,
    operation: 'subtract'
  },
  {
    attribute: 'strength_roll',
    value: 2,
    operation: 'subtract'
  }
];

const mentalPenalty:SingleEffect[] = [
  {
    attribute: 'reason_roll',
    value: 2,
    operation: 'subtract'
  },
  {
    attribute: 'intuition_roll',
    value: 2,
    operation: 'subtract'
  },
  {
    attribute: 'presence_roll',
    value: 2,
    operation: 'subtract'
  }
];

export const criticalInjuries: InjuryItem[] = [
  {
    name: "Torn Suit!",
    description: "You're okay, but your suit is torn to shreds. You'll have to get it repaired.",
    roll: 1,
    healingTime: "-",
    effects: {
      value: [],
    }
  },
  {
    name: "Bruised!",
    description: "You're hurt and get -2 dice to all FIGHTING, AGILITY, and STRENGTH rolls until healed.",
    roll: 2,
    healingTime: "A few hours",
    effects: {
      label: "Bruised!",
      value: physicalPenalty,
    }
  },
  {
    name: "Bloodied!",
    description: "Your face is a bloody mess and you're bleeding all over yourself. You get -2 dice to all REASON, INTUITION, and PRESENCE rolls until healed.",
    roll: 3,
    healingTime: "A few hours",
    effects: {
      label: "Bloodied!",
      value: mentalPenalty,
    }
  },
  {
    name: "Beaten up!",
    description: "You're beaten up badly with several broken ribs, and get -2 dice to all FIGHTING, AGILITY, and STRENGTH rolls until healed.",
    roll: 4,
    healingTime: "A few days",
    effects: {
      label: "Beaten up!",
      value: physicalPenalty,
    }
  },
  {
    name: "Concussed!",
    description: "You've suffered a severe blow to the head, giving you -2 dice to all REASON, INTUITION, and PRESENCE rolls until healed.",
    roll: 5,
    healingTime: "A few days",
    effects: {
      label: "Concussed!",
      value: mentalPenalty,
    }
  },
  {
    name: "Battered!",
    description: "Your body is badly mauled with many broken bones. You get -2 dice to all FIGHTING, AGILITY, and STRENGTH rolls until healed.",
    roll: 6,
    healingTime: "A few weeks",
    effects: {
      label: "Battered!",
      value: physicalPenalty,
    }
  },
  {
    name: "Crushed arm!",
    description: "Your arm is broken or completely mangled. You can't use the arm and you get -2 dice to all FIGHTING, AGILITY, and STRENGTH rolls until healed.",
    roll: 7,
    healingTime: "A few weeks",
    effects: {
      label: "Crushed arm!",
      value: physicalPenalty,
    }
  },
  {
    name: "Crushed leg!",
    description: "Your leg is broken or completely mangled. Until healed, ground movement becomes a full action and you get -1 die to FIGHTING, AGILITY, and STRENGTH rolls.",
    roll: 8,
    healingTime: "A few weeks",
    effects: {
      label: "Crushed leg!",
      value: physicalPenalty,
    }
  },
  {
    name: "Cracked skull!",
    description: "You're knocked out and remain unconscious for a few days. After that, you get -2 dice to REASON, INTUITION, and PRESENCE rolls until healed.",
    roll: 9,
    healingTime: "A few weeks",
    effects: {
      label: "Cracked skull!",
      value: mentalPenalty,
    }
  },
  {
    name: "Crushed!",
    description: "Your body is beaten to a bloody pulp, every bone in your body broken. You will die unless someone stabilizes you within a few hours. If you survive, you're immobilized for a few weeks and get -2 dice to FIGHTING, AGILITY, and STRENGTH rolls until healed.",
    roll: 10,
    healingTime: "A few months",
    effects: {
      label: "Crushed!",
      value: physicalPenalty,
    }
  },
  {
    name: "Skewered!",
    description: "The damage impales your body. You will die unless someone stabilizes you within a few minutes. If you survive, you remain in a coma for a few weeks and then get -2 dice to all attribute rolls until healed.",
    roll: 11,
    healingTime: "A few months",
    effects: {
      label: "Skewered!",
      value: [...physicalPenalty, ...mentalPenalty],
    }
  },
  {
    name: "Head crushed!",
    description: "Your head bursts like a ripe melon, blood and brains gushing out. You're dead.",
    roll: 12,
    healingTime: "-",
    effects: {
      value: [],
    }
  },
  {
    name: "Torn apart!",
    description: "Your body is completely ripped apart, guts and gore flying everywhere. This is the end for you.",
    healingTime: "-",
    roll: 13,
    effects: {
      value: [],
    }
  },
];

export const performCriticalInjuryRoll = async ({
  dispatch,
  characterName,
  characterId,
  currentInjuries,
  modifier,
}: {
  dispatch: any;
  characterName: string;
  characterId: string;
  currentInjuries: InjuryItem[];
  modifier: number;
}): Promise<InjuryItem[]> => {
  const injuriesList = [...currentInjuries].filter(inj => !inj.isPlaceholder);
  
  const isAlreadyDead = injuriesList.some(inj => inj.roll !== undefined && inj.roll >= 12);
  if (isAlreadyDead) {
    return injuriesList;
  }
  
  const prevCritsCount = injuriesList.length;
  let rollVal = 0;
  let resolvedComponents: any[] = [];

  if (dispatch && typeof dispatch.roll === 'function' && typeof dispatch.post === 'function') {
    const components: any[] = [
      {
        sides: 6,
        count: 1,
        label: 'Base D6'
      }
    ];

    if (modifier > 0) {
      components.push({
        value: modifier,
        label: 'Excess Damage Modifier',
        alwaysShowInBreakdown: true
      });
    }

    if (prevCritsCount > 0) {
      components.push({
        value: prevCritsCount,
        label: 'Previous Critical Injuries Modifier',
        alwaysShowInBreakdown: true
      });
    }

    try {
      const result = await getRollResult(components, dispatch);
      rollVal = result.total;
      resolvedComponents = result.components;
    } catch (err) {
      console.error('[criticalInjuries] SDK roll failed, falling back to local roll:', err);
      const d6 = Math.floor(Math.random() * 6) + 1;
      rollVal = d6 + modifier + prevCritsCount;
      resolvedComponents = [
        { sides: 6, count: 1, value: d6, label: 'Base D6' }
      ];
      if (modifier > 0) resolvedComponents.push({ value: modifier, label: 'Excess Damage Modifier', alwaysShowInBreakdown: true });
      if (prevCritsCount > 0) resolvedComponents.push({ value: prevCritsCount, label: 'Previous Critical Injuries Modifier', alwaysShowInBreakdown: true });
    }
  } else {
    const d6 = Math.floor(Math.random() * 6) + 1;
    rollVal = d6 + modifier + prevCritsCount;
    resolvedComponents = [
      { sides: 6, count: 1, value: d6, label: 'Base D6' }
    ];
    if (modifier > 0) resolvedComponents.push({ value: modifier, label: 'Excess Damage Modifier', alwaysShowInBreakdown: true });
    if (prevCritsCount > 0) resolvedComponents.push({ value: prevCritsCount, label: 'Previous Critical Injuries Modifier', alwaysShowInBreakdown: true });
  }

  const originalRollVal = rollVal;
  let maxRoll = 0;
  injuriesList.forEach(injury => {
    if (injury.roll && injury.roll > maxRoll) {
      maxRoll = injury.roll;
    }
  });

  if (maxRoll > 0 && rollVal <= maxRoll) {
    rollVal = maxRoll + 1;
  }

  const finalRoll = Math.max(1, rollVal);
  const tableIndex = Math.min(finalRoll - 1, criticalInjuries.length - 1);
  const selectedInjury = criticalInjuries[tableIndex];

  if (finalRoll > originalRollVal && resolvedComponents.length > 0) {
    resolvedComponents.push({
      value: finalRoll - originalRollVal,
      label: 'Shift-Up Adjustment',
      alwaysShowInBreakdown: true
    });
  }

  const newInjury: InjuryItem = {
    _id: uuidv4(),
    roll: finalRoll,
    name: selectedInjury.name,
    description: selectedInjury.description,
    healingTime: selectedInjury.healingTime,
    effects: {
      label: selectedInjury.effects?.label,
      disabled: selectedInjury.effects?.disabled ?? false,
      value: (selectedInjury.effects?.value ?? []).map(eff => ({
        ...eff,
        _id: uuidv4()
      }))
    }
  };

  injuriesList.push(newInjury);

  
  injuriesList.sort((a, b) => (a.roll || 0) - (b.roll || 0));

  
  const allEffects: Array<{ effect: any; parentInjury: any }> = [];
  injuriesList.forEach(injury => {
    if (injury.effects && Array.isArray(injury.effects.value)) {
      injury.effects.value.forEach(eff => {
        eff.disabled = false;
        allEffects.push({ effect: eff, parentInjury: injury });
      });
    }
  });

  
  const groups: Record<string, typeof allEffects> = {};
  allEffects.forEach(item => {
    const attr = item.effect.attribute;
    if (!groups[attr]) {
      groups[attr] = [];
    }
    groups[attr].push(item);
  });

  
  Object.keys(groups).forEach(attr => {
    const group = groups[attr];
    if (group.length <= 1) return;

    let worstItem = group[0];
    group.forEach(item => {
      const currentVal = Number(item.effect.value);
      const worstVal = Number(worstItem.effect.value);
      if (currentVal >= worstVal) {
        worstItem = item;
      }
    });

    group.forEach(item => {
      if (item !== worstItem) {
        item.effect.disabled = true;
      }
    });
  });

  if (dispatch && typeof dispatch.post === 'function') {
    const rollTemplate = createRollTemplate({
      type: 'roll',
      parameters: {
        title: `Critical Injury: ${selectedInjury.name}`,
        characterName,
        components: resolvedComponents,
        description: selectedInjury.description || '',
      },
    });

    try {
      const messageId = await dispatch.post({
        characterId,
        content: rollTemplate,
      });
      if (messageId) {
        await logRoll(characterId, {
          title: `Critical Injury: ${selectedInjury.name}`,
          characterName,
          components: resolvedComponents,
          description: selectedInjury.description || '',
        }, messageId);
      }
    } catch (err) {
      console.error('[criticalInjuries] failed to post critical injury template:', err);
    }
  }

  return injuriesList;
};