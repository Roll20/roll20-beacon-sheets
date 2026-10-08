/**
 * Equip slots from the official inventory sheet, with paper-doll positions (%).
 * Two columns flank the central figure; the focus slot sits centred below.
 */
export interface EquipSlot {
  name: string;
  icon: string;
  /** Body region that lights up when this slot is filled. */
  part:
    | 'head'
    | 'torso'
    | 'arms'
    | 'hands'
    | 'hips'
    | 'legs'
    | 'feet'
    | 'mainhand'
    | 'offhand'
    | 'none';
  x: number;
  y: number;
  side: 'l' | 'r';
}

export const EQUIP_SLOTS: EquipSlot[] = [
  // Left column
  { name: 'Head', icon: '🪖', part: 'head', x: 1, y: 2, side: 'l' },
  { name: 'Neck', icon: '📿', part: 'torso', x: 1, y: 17, side: 'l' },
  { name: 'Hands', icon: '🧤', part: 'hands', x: 1, y: 32, side: 'l' },
  { name: 'Main Weapon', icon: '⚔️', part: 'mainhand', x: 1, y: 47, side: 'l' },
  { name: 'Feet', icon: '🥾', part: 'feet', x: 1, y: 62, side: 'l' },
  { name: 'Finger (L)', icon: '💍', part: 'hands', x: 1, y: 77, side: 'l' },
  // Right column
  { name: 'Back', icon: '🧥', part: 'torso', x: 61, y: 2, side: 'r' },
  { name: 'Body', icon: '🛡️', part: 'torso', x: 61, y: 17, side: 'r' },
  { name: 'Waist', icon: '🎗️', part: 'hips', x: 61, y: 32, side: 'r' },
  { name: 'Secondary Weapon', icon: '🗡️', part: 'offhand', x: 61, y: 47, side: 'r' },
  { name: 'Shield', icon: '⛨', part: 'offhand', x: 61, y: 62, side: 'r' },
  { name: 'Finger (R)', icon: '💍', part: 'hands', x: 61, y: 77, side: 'r' },
  // Centre-bottom
  { name: 'Focus', icon: '🔮', part: 'none', x: 32, y: 91, side: 'l' },
];

export const EQUIP_SLOT_NAMES = EQUIP_SLOTS.map((s) => s.name);
