import type { SelectedBackgroundTrait } from '@/maker/types';
import { BACKGROUND_CONFIG } from '@/maker/data/constants';
import { backgroundTraitById } from '@/maker/data';

export function bpSpent(selected: SelectedBackgroundTrait[]): number {
  return selected.reduce((sum, t) => sum + (t.cost || 0), 0);
}

export function bpRemaining(selected: SelectedBackgroundTrait[]): number {
  return BACKGROUND_CONFIG.startingBP - bpSpent(selected);
}

export function isOverspent(selected: SelectedBackgroundTrait[]): boolean {
  return bpRemaining(selected) < 0;
}

/** How many times a given trait has been purchased. */
export function purchaseCount(selected: SelectedBackgroundTrait[], traitId: string): number {
  return selected.filter((t) => t.traitId === traitId).length;
}

/** Whether a trait can be purchased again (respecting maxPurchases / single-take). */
export function canPurchase(selected: SelectedBackgroundTrait[], traitId: string): boolean {
  const def = backgroundTraitById[traitId];
  if (!def) return false;
  const max = def.maxPurchases ?? (def.perPoint ? Infinity : 1);
  return purchaseCount(selected, traitId) < max;
}

/** A selected trait requiring extra input but missing its detail is incomplete. */
export function missingDetails(selected: SelectedBackgroundTrait[]): SelectedBackgroundTrait[] {
  return selected.filter((t) => {
    const def = backgroundTraitById[t.traitId];
    if (!def || !def.requires || def.requires === 'none') return false;
    return !t.detail || !t.detail.trim();
  });
}
