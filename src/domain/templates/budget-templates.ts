/**
 * Budget templates per event type (Appendix B)
 * Shares are planning heuristics, not market prices.
 */
import type { EventType } from '../schema';

export interface BudgetCategoryTemplate {
  id: string;
  label: string;
  weight: number;
  minPct: number;
  maxPct: number;
  elasticity: number;
  maxCut: number;
}

const birthday: BudgetCategoryTemplate[] = [
  { id: 'venue', label: 'Venue', weight: 20, minPct: 5, maxPct: 40, elasticity: 0.3, maxCut: 0.5 },
  { id: 'catering', label: 'Catering', weight: 36, minPct: 15, maxPct: 55, elasticity: 1.0, maxCut: 0.35 },
  { id: 'decoration', label: 'Decoration', weight: 14, minPct: 3, maxPct: 30, elasticity: 0.2, maxCut: 0.7 },
  { id: 'photography', label: 'Photography', weight: 7, minPct: 0, maxPct: 15, elasticity: 0.0, maxCut: 0.8 },
  { id: 'entertainment', label: 'Entertainment & activities', weight: 9, minPct: 0, maxPct: 20, elasticity: 0.0, maxCut: 0.8 },
  { id: 'invitations', label: 'Invitations', weight: 2, minPct: 0.5, maxPct: 5, elasticity: 0.5, maxCut: 0.7 },
  { id: 'cake_favors', label: 'Cake & return favours', weight: 4, minPct: 1, maxPct: 8, elasticity: 0.9, maxCut: 0.4 },
  { id: 'logistics', label: 'Logistics & transport', weight: 2, minPct: 1, maxPct: 6, elasticity: 0.3, maxCut: 0.4 },
  { id: 'contingency', label: 'Contingency', weight: 6, minPct: 3, maxPct: 12, elasticity: 0.0, maxCut: 0.5 },
];

const wedding: BudgetCategoryTemplate[] = [
  { id: 'venue', label: 'Venue', weight: 20, minPct: 8, maxPct: 35, elasticity: 0.4, maxCut: 0.3 },
  { id: 'catering', label: 'Catering', weight: 31, minPct: 15, maxPct: 50, elasticity: 1.0, maxCut: 0.3 },
  { id: 'decoration', label: 'Decoration & florals', weight: 12, minPct: 3, maxPct: 25, elasticity: 0.2, maxCut: 0.6 },
  { id: 'photography', label: 'Photography & video', weight: 9, minPct: 2, maxPct: 18, elasticity: 0.0, maxCut: 0.4 },
  { id: 'attire', label: 'Attire & styling', weight: 8, minPct: 2, maxPct: 20, elasticity: 0.0, maxCut: 0.5 },
  { id: 'music', label: 'Music & entertainment', weight: 5, minPct: 0, maxPct: 12, elasticity: 0.2, maxCut: 0.6 },
  { id: 'invitations', label: 'Invitations', weight: 2, minPct: 0.5, maxPct: 5, elasticity: 0.8, maxCut: 0.5 },
  { id: 'logistics', label: 'Logistics, stay & transport', weight: 4, minPct: 1, maxPct: 12, elasticity: 0.4, maxCut: 0.4 },
  { id: 'gifts', label: 'Gifts & return favours', weight: 2, minPct: 0, maxPct: 6, elasticity: 0.9, maxCut: 0.6 },
  { id: 'rituals', label: 'Rituals & officiant', weight: 2, minPct: 0.5, maxPct: 6, elasticity: 0.0, maxCut: 0.3 },
  { id: 'contingency', label: 'Contingency', weight: 5, minPct: 3, maxPct: 12, elasticity: 0.0, maxCut: 0.5 },
];

const community: BudgetCategoryTemplate[] = [
  { id: 'venue', label: 'Venue & permissions', weight: 14, minPct: 3, maxPct: 35, elasticity: 0.2, maxCut: 0.5 },
  { id: 'catering', label: 'Food & refreshments', weight: 28, minPct: 8, maxPct: 50, elasticity: 1.0, maxCut: 0.35 },
  { id: 'decoration', label: 'Decoration & signage', weight: 13, minPct: 2, maxPct: 25, elasticity: 0.2, maxCut: 0.7 },
  { id: 'av', label: 'Sound, lights & AV', weight: 12, minPct: 2, maxPct: 25, elasticity: 0.1, maxCut: 0.5 },
  { id: 'photography', label: 'Photography / documentation', weight: 5, minPct: 0, maxPct: 12, elasticity: 0.0, maxCut: 0.8 },
  { id: 'activities', label: 'Programme & activities', weight: 10, minPct: 2, maxPct: 25, elasticity: 0.3, maxCut: 0.6 },
  { id: 'logistics', label: 'Logistics & volunteers', weight: 6, minPct: 1, maxPct: 15, elasticity: 0.4, maxCut: 0.4 },
  { id: 'publicity', label: 'Publicity', weight: 4, minPct: 0, maxPct: 10, elasticity: 0.2, maxCut: 0.7 },
  { id: 'safety', label: 'Safety & accessibility', weight: 3, minPct: 2, maxPct: 10, elasticity: 0.3, maxCut: 0.2 },
  { id: 'contingency', label: 'Contingency', weight: 5, minPct: 3, maxPct: 12, elasticity: 0.0, maxCut: 0.5 },
];

const templates: Record<EventType, BudgetCategoryTemplate[]> = { birthday, wedding, community };

/** Get budget category template for an event type */
export function getBudgetTemplate(eventType: EventType): BudgetCategoryTemplate[] {
  return templates[eventType].map(t => ({ ...t }));
}
