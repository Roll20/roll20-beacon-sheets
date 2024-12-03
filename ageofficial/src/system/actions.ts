export const actionsList = [
    { label: 'Roll for Initiative', description:`When swords clash and lightning arcs from a spellcaster's fingertips, Fantasy AGE moves into action time.`},
    { label: 'Breather', description:'A breather is a 5-minute rest after an encounter that lets you catch your breath, tend to minor cuts and abrasions, drink some water, and so on. After a breather, you get back 5 + Constitution + Level in Health. If you have the Winded Fatigue condition, a breather removes it. You can only takeone breather after an encounter. If you have a Defeat Condition at the end of an encounter, you can’t take a breather'}, 
    { label: 'Total Rest', description:'Total rest is sleep, or the equivalent for creatures that don’t sleep, consisting of at least six hours of total inactivity. You recover 10 + Constitution + Level in Health. If you have any Fatigue condition except Exhausted or Dying, it vanishes. If you are Dying from Fatigue, use the rules for the Dying condition. If you are Exhausted, total rest drops your Fatigue condition to Tired'}
]

export const movementList = [
    { label: 'Speed', description:'Your Speed determines how many yards you can move in a single move action.'},
    { label: 'Charge', description:'A Charge major action lets you move half your Speed (rounded up) in yards and make an attack'}, 
    { label: 'Run', description:'A Run major action lets you move double your Speed in yards. When several individuals take this and/or the Full Speed vehicle action this triggers a chase, designed by the Game Master, and covered in Chapter 8: Mastering the Rules. You can’t combine this with the Move minor action on your turn.'},
]

export const defenseList = [
    { label: 'Defense', description:'Defense measures how hard it is to hit your character in combat. Defense = 10 + Dexterity + Shield Bonus (if applicable)'},
    { label: 'Toughness', gameSystem:'mage', description:'Each armor type also has a penalty that represents its weight and bulk. If You’re Untrained in the Armor The listed armor penalty applies to your Speed and Dexterity-based tests. If You’re Trained in the ArmorThe listed armor penalty only applies to your Speed'},
    { label: 'Armor Rating', description:'Each armor type has a numeric rating. When you take damage in combat, you subtract the Armor Rating before losing Health. This applies each time you are hit, so over time even poor armor can prevent you from taking a lot of damage.'},
    { label: 'Armor Penalty', description:'Each armor type also has a penalty that represents its weight and bulk. If You’re Untrained in the Armor The listed armor penalty applies to your Speed and Dexterity-based tests. If You’re Trained in the ArmorThe listed armor penalty only applies to your Speed'},
]