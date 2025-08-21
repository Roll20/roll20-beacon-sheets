export const domainToFriendlyName = (domain: string) => {
  switch (domain) {
    case 'closeCombat':
      return 'Close Combat';
    case 'communication':
      return 'Communication';
    case 'compassion':
      return 'Compassion';
    case 'craft':
      return 'Craft';
    case 'erudition':
      return 'Erudition';
    case 'feats':
      return 'Feats';
    case 'healing':
      return 'Healing';
    case 'inspiration':
      return 'Inspiration';
    case 'leadership':
      return 'Leadership';
    case 'magic':
      return 'Magic';
    case 'monsters':
      return 'Monsters';
    case 'mountedCombat':
      return 'Mounted Combat';
    case 'naturalEnvironment':
      return 'Natural Environment';
    case 'perception':
      return 'Perception';
    case 'performance':
      return 'Performance';
    case 'religion':
      return 'Religion';
    case 'shootingAndThrowing':
      return 'Shooting and Throwing';
    case 'stealth':
      return 'Stealth';
    case 'travel':
      return 'Travel';
    case 'wyrdnessMysteries':
      return 'Wyrdness Mysteries';
    default:
      return domain;
  }
};
