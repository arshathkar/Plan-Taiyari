/**
 * Task templates per event type (Appendix A)
 * Effort is a planning default in days, not a vendor lead-time claim.
 */
import type { EventType } from '../schema';

export interface TaskTemplate {
  id: string;
  title: string;
  categoryId: string;
  priority: 0 | 1 | 2 | 3;
  effortDays: number;
  dependsOn: string[];
  mustFinishDaysBefore: number;
}

/* ── Birthday (A.1) — 20 tasks ─────────────────────────────── */

const birthday: TaskTemplate[] = [
  { id: 'B01', title: 'Fix the total budget and who pays', categoryId: 'budget', priority: 0, effortDays: 1, dependsOn: [], mustFinishDaysBefore: 47 },
  { id: 'B02', title: 'Draft the guest list (headcount range)', categoryId: 'guests', priority: 0, effortDays: 2, dependsOn: ['B01'], mustFinishDaysBefore: 45 },
  { id: 'B03', title: 'Pick 2-3 candidate dates and check clashes', categoryId: 'date', priority: 0, effortDays: 2, dependsOn: ['B01'], mustFinishDaysBefore: 44 },
  { id: 'B04', title: 'Shortlist venues within the per-head budget', categoryId: 'venue', priority: 0, effortDays: 4, dependsOn: ['B02', 'B03'], mustFinishDaysBefore: 40 },
  { id: 'B05', title: 'Visit or call venues; ask the venue checklist', categoryId: 'venue', priority: 0, effortDays: 3, dependsOn: ['B04'], mustFinishDaysBefore: 36 },
  { id: 'B06', title: 'Book the venue and get it in writing', categoryId: 'venue', priority: 0, effortDays: 1, dependsOn: ['B05'], mustFinishDaysBefore: 33 },
  { id: 'B07', title: 'Decide menu style and dietary needs', categoryId: 'catering', priority: 1, effortDays: 2, dependsOn: ['B02'], mustFinishDaysBefore: 33 },
  { id: 'B08', title: 'Request itemised caterer quotes', categoryId: 'catering', priority: 0, effortDays: 4, dependsOn: ['B06', 'B07'], mustFinishDaysBefore: 28 },
  { id: 'B09', title: 'Compare quotes, taste if possible, book caterer', categoryId: 'catering', priority: 0, effortDays: 3, dependsOn: ['B08'], mustFinishDaysBefore: 22 },
  { id: 'B10', title: 'Choose a theme and decor plan', categoryId: 'decoration', priority: 2, effortDays: 3, dependsOn: ['B06'], mustFinishDaysBefore: 26 },
  { id: 'B11', title: 'Book decorator or order supplies', categoryId: 'decoration', priority: 2, effortDays: 4, dependsOn: ['B10'], mustFinishDaysBefore: 16 },
  { id: 'B12', title: 'Book photographer (if in plan)', categoryId: 'photography', priority: 2, effortDays: 2, dependsOn: ['B03', 'B06'], mustFinishDaysBefore: 19 },
  { id: 'B13', title: 'Plan entertainment and activities', categoryId: 'entertainment', priority: 2, effortDays: 3, dependsOn: ['B06'], mustFinishDaysBefore: 19 },
  { id: 'B14', title: 'Order cake and return favours', categoryId: 'cake_favors', priority: 1, effortDays: 2, dependsOn: ['B02', 'B06'], mustFinishDaysBefore: 7 },
  { id: 'B15', title: 'Design and send invitations', categoryId: 'invitations', priority: 1, effortDays: 3, dependsOn: ['B06'], mustFinishDaysBefore: 26 },
  { id: 'B16', title: 'Track RSVPs; update the headcount for the caterer', categoryId: 'guests', priority: 1, effortDays: 7, dependsOn: ['B15'], mustFinishDaysBefore: 6 },
  { id: 'B17', title: 'Arrange transport, parking and accessibility', categoryId: 'logistics', priority: 1, effortDays: 2, dependsOn: ['B06'], mustFinishDaysBefore: 9 },
  { id: 'B18', title: 'Confirm every vendor (confirmation round)', categoryId: 'logistics', priority: 0, effortDays: 2, dependsOn: ['B09', 'B11', 'B12', 'B13', 'B14'], mustFinishDaysBefore: 3 },
  { id: 'B19', title: 'Prepare the day-of schedule and contacts sheet', categoryId: 'eventday', priority: 1, effortDays: 1, dependsOn: ['B18'], mustFinishDaysBefore: 2 },
  { id: 'B20', title: 'Plan final payments and balances', categoryId: 'budget', priority: 1, effortDays: 1, dependsOn: ['B18'], mustFinishDaysBefore: 2 },
];

/* ── Wedding (A.2) — 24 tasks ──────────────────────────────── */

const wedding: TaskTemplate[] = [
  { id: 'W01', title: 'Fix the budget and name the decision-makers', categoryId: 'budget', priority: 0, effortDays: 2, dependsOn: [], mustFinishDaysBefore: 118 },
  { id: 'W02', title: 'Estimate guests by family side', categoryId: 'guests', priority: 0, effortDays: 4, dependsOn: ['W01'], mustFinishDaysBefore: 112 },
  { id: 'W03', title: 'Shortlist dates per family and cultural calendar', categoryId: 'date', priority: 0, effortDays: 5, dependsOn: ['W01'], mustFinishDaysBefore: 108 },
  { id: 'W04', title: 'Shortlist venues (capacity, rooms, power backup, parking)', categoryId: 'venue', priority: 0, effortDays: 7, dependsOn: ['W02', 'W03'], mustFinishDaysBefore: 98 },
  { id: 'W05', title: 'Visit venues with the venue checklist', categoryId: 'venue', priority: 0, effortDays: 5, dependsOn: ['W04'], mustFinishDaysBefore: 90 },
  { id: 'W06', title: 'Book the venue and get it in writing', categoryId: 'venue', priority: 0, effortDays: 2, dependsOn: ['W05'], mustFinishDaysBefore: 87 },
  { id: 'W07', title: 'Plan catering (menu style, dietary needs, counters)', categoryId: 'catering', priority: 1, effortDays: 3, dependsOn: ['W02'], mustFinishDaysBefore: 85 },
  { id: 'W08', title: 'Collect itemised caterer quotes', categoryId: 'catering', priority: 0, effortDays: 7, dependsOn: ['W06', 'W07'], mustFinishDaysBefore: 75 },
  { id: 'W09', title: 'Compare, taste and book the caterer', categoryId: 'catering', priority: 0, effortDays: 5, dependsOn: ['W08'], mustFinishDaysBefore: 66 },
  { id: 'W10', title: 'Photographer and videographer: quotes and booking', categoryId: 'photography', priority: 1, effortDays: 10, dependsOn: ['W03', 'W06'], mustFinishDaysBefore: 70 },
  { id: 'W11', title: 'Decor theme and decorator quotes', categoryId: 'decoration', priority: 1, effortDays: 10, dependsOn: ['W06'], mustFinishDaysBefore: 60 },
  { id: 'W12', title: 'Book the decorator', categoryId: 'decoration', priority: 1, effortDays: 3, dependsOn: ['W11'], mustFinishDaysBefore: 50 },
  { id: 'W13', title: 'Outfits, tailoring and fittings', categoryId: 'attire', priority: 1, effortDays: 21, dependsOn: ['W03'], mustFinishDaysBefore: 25 },
  { id: 'W14', title: 'Music, DJ or live artists', categoryId: 'music', priority: 2, effortDays: 5, dependsOn: ['W06'], mustFinishDaysBefore: 45 },
  { id: 'W15', title: 'Invitation design and printing or digital cards', categoryId: 'invitations', priority: 1, effortDays: 7, dependsOn: ['W03', 'W06'], mustFinishDaysBefore: 50 },
  { id: 'W16', title: 'Send invitations', categoryId: 'invitations', priority: 0, effortDays: 3, dependsOn: ['W15', 'W02'], mustFinishDaysBefore: 40 },
  { id: 'W17', title: 'Rituals, officiant and materials checklist', categoryId: 'rituals', priority: 1, effortDays: 4, dependsOn: ['W03'], mustFinishDaysBefore: 30 },
  { id: 'W18', title: 'Stay and transport for out-of-town guests', categoryId: 'logistics', priority: 1, effortDays: 7, dependsOn: ['W16'], mustFinishDaysBefore: 25 },
  { id: 'W19', title: 'Gifts and return favours', categoryId: 'gifts', priority: 2, effortDays: 5, dependsOn: ['W02'], mustFinishDaysBefore: 20 },
  { id: 'W20', title: 'Track RSVPs and lock the headcount', categoryId: 'guests', priority: 0, effortDays: 10, dependsOn: ['W16'], mustFinishDaysBefore: 10 },
  { id: 'W21', title: 'Send the final headcount to caterer and venue', categoryId: 'catering', priority: 0, effortDays: 1, dependsOn: ['W20', 'W09'], mustFinishDaysBefore: 7 },
  { id: 'W22', title: 'Vendor confirmation round', categoryId: 'logistics', priority: 0, effortDays: 3, dependsOn: ['W09', 'W10', 'W12', 'W14', 'W19'], mustFinishDaysBefore: 4 },
  { id: 'W23', title: 'Day-of run sheet and helper roles', categoryId: 'eventday', priority: 1, effortDays: 2, dependsOn: ['W22'], mustFinishDaysBefore: 3 },
  { id: 'W24', title: 'Plan final payments and balances', categoryId: 'budget', priority: 1, effortDays: 1, dependsOn: ['W22'], mustFinishDaysBefore: 2 },
];

/* ── Community (A.3) — 21 tasks ────────────────────────────── */

const community: TaskTemplate[] = [
  { id: 'C01', title: 'Define purpose, audience and a success measure', categoryId: 'scope', priority: 0, effortDays: 2, dependsOn: [], mustFinishDaysBefore: 58 },
  { id: 'C02', title: 'Confirm budget sources (contributions, sponsors)', categoryId: 'budget', priority: 0, effortDays: 3, dependsOn: ['C01'], mustFinishDaysBefore: 55 },
  { id: 'C03', title: 'Form the core team and name leads', categoryId: 'team', priority: 0, effortDays: 3, dependsOn: ['C01'], mustFinishDaysBefore: 53 },
  { id: 'C04', title: 'Pick the date and check local clashes', categoryId: 'date', priority: 0, effortDays: 2, dependsOn: ['C01'], mustFinishDaysBefore: 50 },
  { id: 'C05', title: 'Shortlist venues or open spaces', categoryId: 'venue', priority: 0, effortDays: 4, dependsOn: ['C01', 'C04'], mustFinishDaysBefore: 46 },
  { id: 'C06', title: 'Confirm the venue in writing', categoryId: 'venue', priority: 0, effortDays: 2, dependsOn: ['C05'], mustFinishDaysBefore: 42 },
  { id: 'C07', title: 'Find out which permissions apply locally and apply', categoryId: 'permissions', priority: 0, effortDays: 10, dependsOn: ['C06'], mustFinishDaysBefore: 30 },
  { id: 'C08', title: 'Outline the programme and line up activities', categoryId: 'program', priority: 1, effortDays: 7, dependsOn: ['C01', 'C04'], mustFinishDaysBefore: 35 },
  { id: 'C09', title: 'Plan food (type, dietary needs, caterer or volunteers)', categoryId: 'catering', priority: 1, effortDays: 3, dependsOn: ['C02'], mustFinishDaysBefore: 35 },
  { id: 'C10', title: 'Get food quotes or sourcing options', categoryId: 'catering', priority: 1, effortDays: 5, dependsOn: ['C09', 'C06'], mustFinishDaysBefore: 25 },
  { id: 'C11', title: 'Book food', categoryId: 'catering', priority: 1, effortDays: 2, dependsOn: ['C10'], mustFinishDaysBefore: 22 },
  { id: 'C12', title: 'Sound, lights and AV: needs, quotes, booking', categoryId: 'av', priority: 1, effortDays: 7, dependsOn: ['C06', 'C08'], mustFinishDaysBefore: 18 },
  { id: 'C13', title: 'Decor and signage', categoryId: 'decoration', priority: 2, effortDays: 7, dependsOn: ['C06'], mustFinishDaysBefore: 14 },
  { id: 'C14', title: 'Publicity (posters, groups, notices)', categoryId: 'publicity', priority: 1, effortDays: 10, dependsOn: ['C04', 'C06'], mustFinishDaysBefore: 15 },
  { id: 'C15', title: 'Volunteer roster and briefing', categoryId: 'logistics', priority: 0, effortDays: 7, dependsOn: ['C03', 'C08'], mustFinishDaysBefore: 7 },
  { id: 'C16', title: 'Accessibility and safety plan', categoryId: 'safety', priority: 0, effortDays: 4, dependsOn: ['C06', 'C08'], mustFinishDaysBefore: 10 },
  { id: 'C17', title: 'Collect contributions and issue receipts', categoryId: 'budget', priority: 1, effortDays: 10, dependsOn: ['C02'], mustFinishDaysBefore: 14 },
  { id: 'C18', title: 'Photography or documentation', categoryId: 'photography', priority: 3, effortDays: 2, dependsOn: ['C06'], mustFinishDaysBefore: 10 },
  { id: 'C19', title: 'Vendor and volunteer confirmation round', categoryId: 'logistics', priority: 0, effortDays: 2, dependsOn: ['C11', 'C12', 'C13', 'C15', 'C16'], mustFinishDaysBefore: 3 },
  { id: 'C20', title: 'Run sheet and contact tree', categoryId: 'eventday', priority: 1, effortDays: 1, dependsOn: ['C19'], mustFinishDaysBefore: 2 },
  { id: 'C21', title: 'Cash handling and expense log plan', categoryId: 'budget', priority: 2, effortDays: 1, dependsOn: ['C17'], mustFinishDaysBefore: 3 },
];

const templates: Record<string, TaskTemplate[]> = { birthday, wedding, community };

/** Get task template for an event type */
export function getTaskTemplate(eventType: string): TaskTemplate[] {
  return (templates[eventType] ?? []).map(t => ({ ...t, dependsOn: [...t.dependsOn] }));
}
