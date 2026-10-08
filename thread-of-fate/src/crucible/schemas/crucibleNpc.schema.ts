/** NPC-specific data: the social, informational, and narrative half of an entity. */

export type NpcDepth = 'quick' | 'standard' | 'fullCharacter';

export interface NpcRelationship {
  id: string;
  /** Who: another Crucible entity id, or a free-form name. */
  targetEntityId: string | null;
  targetName: string;
  /** e.g. "rival", "patron", "sibling", "debtor". */
  kind: string;
  /** -5 (hatred) ... +5 (devotion). */
  strength: number;
  description: string;
  gmOnly: boolean;
}

export interface KnowledgeEntry {
  id: string;
  topic: string;
  /** What they actually know. */
  content: string;
  /** How hard it is to get out of them. */
  difficulty: 'freely' | 'ifAsked' | 'ifTrusted' | 'ifPressured' | 'ifBribed' | 'never';
  /** Talent check DC to extract it, when a check is appropriate. */
  dc: number | null;
  /** They believe this but it is false. */
  isMisinformation: boolean;
  gmOnly: boolean;
}

export interface QuestHook {
  id: string;
  title: string;
  summary: string;
  /** What the NPC wants done. */
  ask: string;
  reward: string;
  /** Only offered once these conditions hold. */
  requires: string;
  gmOnly: boolean;
}

export interface NpcSocialState {
  trust: number;
  fear: number;
  respect: number;
  suspicion: number;
  loyalty: number;
  obligation: number;
}

export interface CrucibleNpcBlock {
  npcDepth: NpcDepth;
  archetypeId?: string;
  occupation?: string;
  publicRole?: string;
  privateRole?: string;
  factionIds: string[];
  rank?: string;
  reputation?: string;
  motivation: string;
  fear?: string;
  need?: string;
  flaw?: string;
  secret?: string;
  contradiction?: string;
  breakingPoint?: string;
  /** -5 (hostile) ... +5 (devoted). */
  dispositionTowardParty: number;
  socialState: NpcSocialState;
  relationships: NpcRelationship[];
  knowledge: KnowledgeEntry[];
  questHooks: QuestHook[];
  voice: string;
  mannerisms: string[];
  topicsLiked: string[];
  topicsAvoided: string[];
  negotiationLevers: string[];
  /** Appearance notes for the GM to describe at the table. */
  appearance: string;
  /** Species / ancestry label, or a maker race id when fullCharacter. */
  ancestry: string;
  /** For npcDepth 'fullCharacter': the id of a CharacterDraft in the maker. */
  linkedCharacterDraftId?: string | null;
}

export function createSocialState(partial: Partial<NpcSocialState> = {}): NpcSocialState {
  return {
    trust: partial.trust ?? 0,
    fear: partial.fear ?? 0,
    respect: partial.respect ?? 0,
    suspicion: partial.suspicion ?? 0,
    loyalty: partial.loyalty ?? 0,
    obligation: partial.obligation ?? 0,
  };
}

export function createNpcBlock(partial: Partial<CrucibleNpcBlock> = {}): CrucibleNpcBlock {
  return {
    npcDepth: partial.npcDepth ?? 'quick',
    archetypeId: partial.archetypeId,
    occupation: partial.occupation ?? '',
    publicRole: partial.publicRole ?? '',
    privateRole: partial.privateRole ?? '',
    factionIds: partial.factionIds ?? [],
    rank: partial.rank ?? '',
    reputation: partial.reputation ?? '',
    motivation: partial.motivation ?? '',
    fear: partial.fear ?? '',
    need: partial.need ?? '',
    flaw: partial.flaw ?? '',
    secret: partial.secret ?? '',
    contradiction: partial.contradiction ?? '',
    breakingPoint: partial.breakingPoint ?? '',
    dispositionTowardParty: partial.dispositionTowardParty ?? 0,
    socialState: createSocialState(partial.socialState),
    relationships: partial.relationships ?? [],
    knowledge: partial.knowledge ?? [],
    questHooks: partial.questHooks ?? [],
    voice: partial.voice ?? '',
    mannerisms: partial.mannerisms ?? [],
    topicsLiked: partial.topicsLiked ?? [],
    topicsAvoided: partial.topicsAvoided ?? [],
    negotiationLevers: partial.negotiationLevers ?? [],
    appearance: partial.appearance ?? '',
    ancestry: partial.ancestry ?? '',
    linkedCharacterDraftId: partial.linkedCharacterDraftId ?? null,
  };
}
