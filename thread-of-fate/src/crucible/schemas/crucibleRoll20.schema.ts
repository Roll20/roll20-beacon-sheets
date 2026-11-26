/** Roll20 / Beacon deployment configuration for a Crucible entity. */

export type TokenIdentity = 'unique' | 'generic';

export interface TokenBarConfig {
  /** Which computed value drives this bar. */
  computed:
    | 'crucible_hp'
    | 'crucible_stamina'
    | 'crucible_aether'
    | 'crucible_ap'
    | 'crucible_ac'
    | 'none';
  /**
   * Linked bars share one value across every token of this character. Correct for
   * unique NPCs and bosses; wrong for minions, where damaging one copy would
   * damage them all.
   */
  linked: boolean;
  /** 'all' shows the bar to players; 'gm' keeps it GM-only. */
  visibility: 'all' | 'gm';
}

export interface CrucibleTokenBlock {
  identity: TokenIdentity;
  /** Token art URL; blank uses the portrait. */
  imageUrl: string;
  /** Grid footprint in squares, from the size registry unless overridden. */
  gridWidth: number;
  gridHeight: number;
  showNameplate: boolean;
  nameplateVisibility: 'all' | 'gm';
  bar1: TokenBarConfig;
  bar2: TokenBarConfig;
  bar3: TokenBarConfig;
  auraRadius: number;
  auraColor: string;
  nightVisionRange: number;
  lightRadius: number;
  lightDimRadius: number;
  markers: string[];
  /** Alternate token art per phase id. */
  phaseImages: Record<string, string>;
}

export interface CrucibleMacroSpec {
  /** Macro name shown on the token action bar. */
  name: string;
  /** The sheet action invoked. */
  action: string;
  /** Arguments passed to the action. */
  args: Record<string, string | number | boolean>;
  /** Show as a token action button. */
  tokenAction: boolean;
  gmOnly: boolean;
  /** Grouped under a menu macro rather than shown directly (avoids bar flooding). */
  menu?: string;
}

export interface CrucibleRoll20Block {
  /** Roll20 character id once deployed; null before deployment. */
  characterId: string | null;
  /** Whether players may see the sheet at all. */
  playerVisible: boolean;
  /** Post rolls publicly, or whisper them to the GM. */
  defaultOutput: 'public' | 'gmWhisper';
  /** Hide the creature's name in chat cards until revealed. */
  concealName: boolean;
  concealedAs: string;
  /** Hide save DCs and to-hit math from players. */
  hideMechanics: boolean;
  /** Generate a menu macro instead of one button per action past this count. */
  macroMenuThreshold: number;
  macros: CrucibleMacroSpec[];
  /** Flattened macro-safe attribute payload, regenerated on export. */
  attributePayload: Record<string, string | number>;
}

export function createTokenBar(
  computed: TokenBarConfig['computed'],
  linked: boolean,
  visibility: TokenBarConfig['visibility'] = 'all',
): TokenBarConfig {
  return { computed, linked, visibility };
}
