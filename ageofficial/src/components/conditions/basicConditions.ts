// import { useCharacterStore } from '@/sheet/stores/character/characterStore';

export const basicConditions = [
    { name: 'Defenseless', 
      description:`<p>A Defenseless character loses their Dexterity bonus to Defense and suffers an additional –3 penalty to their Defense.</p>
        <p><strong>Recovery:</strong> Based on circumstance. If an ability makes a target Defenseless and does not list a duration, they are Defenseless for 1 round.</p>
    `,
      enabled:false,
      show: false,
      modifiers: [
        {modifiedValue:'Defense', modifiedOption: "Penalty", penalty:-3},
        {modifiedValue:'Defense', penalty:'Dexterity'}
      ]
    },
    { name: 'Dying', 
      description:`<p>Your current Health drops to 0 if it is not at 0 already. If you are conscious, you can talk but can’t take any other actions. You risk death after 4 + Constitution rounds (at the end of the final
round) unless you are healed to above 0 Health. At the end of the final round, make a TN 13 Constitution (Stamina) test. If you fail, you die. If you succeed, you are Unconscious (see Unconscious)
for 1 hour (unless healed) but no longer Dying, at which point you must make another TN 13 Constitution (Stamina) test with the same results, except that if you generate stunt points on the
second or subsequent tests, you stop being Unconscious</p>
        <p><strong>Recovery:</strong> You lose this condition as soon as an ally’s action or other beneficial event raises your current Health to 1 or
greater, or you make a successful Constitution (Stamina) check after an hour</p>
    `,
      enabled:false,
      show: false,
    },
    { name: 'Frightened', 
      description:`<p>You are afraid of a specific person, place, or object. Until this fear subsides, you must use one of your actions to move away from the source of your fear each round or suffer a –3 penalty
                    to all ability tests, with the exception of any tests required to remove obstacles to your retreat. If you are cornered by the source of your fear, you do not suffer any penalty to your
                    actions as long as they’re intended to help defend you or find an escape route.</p>
        <p><strong>Recovery:</strong> Based on circumstance.</p>
    `,
      enabled:false,
      show: false,
      modifiers: [
        {modifiedValue:'Accuracy', penalty:-3, conditional: true, conditionalCheck:'Are you moving away from source?'},
        {modifiedValue:'Communication', penalty:-3, conditional: true, conditionalCheck:'Are you moving away from source?'},
        {modifiedValue:'Constitution', penalty:-3, conditional: true, conditionalCheck:'Are you moving away from source?'},
        {modifiedValue:'Dexterity', penalty:-3, conditional: true, conditionalCheck:'Are you moving away from source?'},
        {modifiedValue:'Fighting', penalty:-3, conditional: true, conditionalCheck:'Are you moving away from source?'},
        {modifiedValue:'Intelligence', penalty:-3, conditional: true, conditionalCheck:'Are you moving away from source?'},
        {modifiedValue:'Perception', penalty:-3, conditional: true, conditionalCheck:'Are you moving away from source?'},
        {modifiedValue:'Strength', penalty:-3, conditional: true, conditionalCheck:'Are you moving away from source?'},
        {modifiedValue:'Willpower', penalty:-3, conditional: true, conditionalCheck:'Are you moving away from source?'},        
      ]
    },
    { name: 'Helpless', 
      description:`<p>You are conscious but can’t take minor or major actions, including
those which require only mental effort, though you can take
reactions (such as tests to avoid hazards) and free actions (such
as speaking). You can stagger or crawl 2 yards per round</p>
        <p><strong>Recovery:</strong> Based on circumstance.</p>
    `,
      enabled:false,
      show: false,
    },
    { name: 'Hindered', 
      description:`<p>You lose one of your minor actions so that you may only take a single major or minor action on your turn.</p>
        <p><strong>Recovery:</strong> Based on circumstance.</p>
    `,
      enabled:false,
      show: false,
    },
    { name: 'Prone', 
      description:`<p>Prone characters can only crawl 1 + Dexterity (minimum 1)
yards as their Move action unless they stand (see Recovery).
Prone characters cannot use the Run major action on any turn
where they are Prone, even if they get up. Characters get a
+1 bonus to melee attacks rolls against Prone characters but
suffer a –1 penalty to ranged attacks against them.</p>
        <p><strong>Recovery:</strong> Unless you’re unable, a Move minor action allows
you to stand, although that uses up half your Speed, limiting
you to half your normal Move for the rest of that turn.</p>
    `,
      enabled:false,
      show: false,
    },
    { name: 'Slowed', 
      description:`<p>Your Speed drops by half and you suffer a –3 to your current initiative rating.</p>
        <p><strong>Recovery:</strong> Based on circumstance.</p>
    `,
      enabled:false,
      show: false,
      modifiers: [
        // {modifiedValue:'Speed', penalty:Math.ceil(useCharacterStore().speed/2)},
      ]
    },
    { name: 'Stunned', 
      description:`<p>You lose your major action. You may only take one minor action each round.</p>
        <p><strong>Recovery:</strong> Based on circumstance.</p>
    `,
      enabled:false,
      show: false,
    },
    { name: 'Unconscious', 
      description:`<p>You are unconscious and cannot take actions of any kind. You
do not perceive any details of the events around you, though
a successful Perception test at –10 allows you to notice particularly loud, sudden, or painful events (such as being slapped).</p>
        <p><strong>Recovery:</strong> If you gained this condition because your current
Health dropped to 0, you lose it as soon as your current Health recovers to 1 or higher. If you are merely sleeping with
no outside influence, succeeding at a Perception test as noted
above wakes you. Otherwise, based on circumstance.</p>
    `,
      enabled:false,
      show: false,
    }
]