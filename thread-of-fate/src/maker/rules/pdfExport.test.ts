import { describe, it, expect } from 'vitest';
import { writeFileSync } from 'node:fs';
import { buildCharacterPdfBytes } from './pdfExport';
import { createEmptyDraft } from '@/maker/draftModel';

/**
 * Builds a complete sample character and writes a real filled PDF sheet to the
 * repo root (sample-character-sheet.pdf), doubling as a smoke test for the PDF builder.
 */
function sampleDraft() {
  const d = createEmptyDraft('sample');
  d.identity = { name: 'Tiberius Vael', age: '34', height: `6'2"` };
  d.stats.method = 'array';
  d.stats.chosenRollSetId = 'spiked';
  d.stats.assigned = {
    might: 16,
    instinct: 14,
    focus: 12,
    conviction: 14,
    resonance: 8,
    presence: 11,
  };
  d.background.selectedTraits = [
    { uid: '1', traitId: 'skill-training', cost: 2, detail: 'Athletics, Intimidation' },
    { uid: '2', traitId: 'weapon-training', cost: 2, detail: 'Greatsword, Longsword' },
    { uid: '3', traitId: 'title', cost: 4, detail: 'Knight of the Fallen Vigil' },
    { uid: '4', traitId: 'mentor', cost: 4, detail: 'Old Sergeant Garrick' },
  ];
  d.equipment = {
    setting: 'Medieval',
    selectedPackId: 'survival-pack',
    packChoices: {
      'Portable Shelter': 'Bedroll',
      'Fire / Heat Source': 'Flint & Steel',
      'Water & Purification': 'Waterskin',
      'Multi-Tool': 'Knife',
    },
    selectedArmorId: 'breastplate',
    selectedShieldId: 'kite',
    selectedWeaponIds: ['longsword', 'greatsword', 'handaxe'],
    customItems: ['Rope (50 ft.)', 'Torch x5', "Healer's Kit"],
    startingWealth: 120,
    otherAcBonus: 0,
  };
  d.philosophy = { selectedPhilosophyId: 'idealism', custom: null };
  d.race = {
    selectedRaceId: 'orcs',
    selectedSubraceId: 'wartorn',
    selectedSkills: ['Athletics', 'Intimidation'],
  };
  d.classBuild = {
    startingLevel: 5,
    classes: [{ classId: 'reclaimer', level: 5 }],
    aspects: [{ aspectId: 'tank-bulwark' }],
    useAverageHp: true,
    classSkills: ['Athletics', 'Intimidation', 'Perception'],
    growth: {},
  };
  d.bio = {
    avatarImage: null,
    fullReferenceImage: null,
    description:
      'A broad-shouldered orc in dented plate, jaw set, eyes patient. Carries a tower of a greatsword across his back.',
    lore: 'Once a frontline soldier of a fallen order, Tiberius now wanders, standing between the helpless and whatever comes for them.',
    allies: 'Old Sergeant Garrick (mentor); the village of Hollowmere that he saved.',
    enemies: 'The Ashen Banner mercenary company.',
    howYouDie: 'Defiant',
  };
  d.identity.name = 'Tiberius Vael';
  return d;
}

describe('PDF character sheet', () => {
  it('builds a non-trivial multi-page PDF for a complete character', async () => {
    const bytes = await buildCharacterPdfBytes(sampleDraft());
    expect(bytes.byteLength).toBeGreaterThan(2000);
    // %PDF- header
    expect(String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3])).toBe('%PDF');
    writeFileSync('sample-character-sheet.pdf', bytes);
  });
});
