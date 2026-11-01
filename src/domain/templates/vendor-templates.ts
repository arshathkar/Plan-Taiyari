/**
 * Vendor Templates (Appendix C)
 * Requirement checklists and call-question banks per vendor category.
 * Used when generating a plan to populate vendorCategories.
 */

import type { EventType } from '@/domain/schema';

export interface RequirementTemplate {
  id: string;
  label: string;
  weight: 1 | 2 | 3;
  must: boolean;
}

export interface CallQuestionTemplate {
  id: string;
  text: string;
  requirementId?: string;
}

export interface VendorCategoryTemplate {
  id: string;
  label: string;
  requirements: RequirementTemplate[];
  questions: CallQuestionTemplate[];
  fitWeights: [number, number, number];
}

/* ── Venue ─────────────────────────────────────────────────── */

const venueRequirements: RequirementTemplate[] = [
  { id: 'v-cap', label: 'Capacity fits guest count', weight: 3, must: true },
  { id: 'v-date', label: 'Available on event date', weight: 3, must: true },
  { id: 'v-park', label: 'Parking available', weight: 2, must: false },
  { id: 'v-ac', label: 'Air conditioning / climate control', weight: 2, must: false },
  { id: 'v-gen', label: 'Power backup / generator', weight: 2, must: false },
  { id: 'v-cater', label: 'Allows outside catering', weight: 2, must: false },
  { id: 'v-decor', label: 'Allows outside decoration', weight: 1, must: false },
  { id: 'v-music', label: 'Music / DJ allowed (noise permissions)', weight: 1, must: false },
  { id: 'v-access', label: 'Step-free / wheelchair accessible', weight: 2, must: false },
  { id: 'v-clean', label: 'Cleaning included', weight: 1, must: false },
];

const venueQuestions: CallQuestionTemplate[] = [
  { id: 'vq1', text: 'What is the maximum seating capacity?', requirementId: 'v-cap' },
  { id: 'vq2', text: 'Is the date available? Can we do a provisional hold?', requirementId: 'v-date' },
  { id: 'vq3', text: 'What is the rental charge for the full day? Half day?', },
  { id: 'vq4', text: 'Is there a security deposit? How much and when is it refunded?', },
  { id: 'vq5', text: 'Are tables and chairs included or extra?', },
  { id: 'vq6', text: 'Is there a kitchen or pantry area for caterers to use?', requirementId: 'v-cater' },
  { id: 'vq7', text: 'Is outside decoration allowed? Any restrictions?', requirementId: 'v-decor' },
  { id: 'vq8', text: 'Is there a sound system? Are there noise restrictions or a curfew?', requirementId: 'v-music' },
  { id: 'vq9', text: 'How much parking is available? Is valet possible?', requirementId: 'v-park' },
  { id: 'vq10', text: 'Is there elevator/ramp access for elderly or wheelchair guests?', requirementId: 'v-access' },
  { id: 'vq11', text: 'What is the advance booking amount and cancellation policy?', },
  { id: 'vq12', text: 'Is there a changing room or green room?', },
];

/* ── Caterer ───────────────────────────────────────────────── */

const catererRequirements: RequirementTemplate[] = [
  { id: 'c-veg', label: 'Vegetarian menu available', weight: 3, must: true },
  { id: 'c-nv', label: 'Non-veg menu available', weight: 2, must: false },
  { id: 'c-taste', label: 'Tasting session offered', weight: 2, must: false },
  { id: 'c-serve', label: 'Service staff included', weight: 2, must: true },
  { id: 'c-setup', label: 'Setup & cleanup included', weight: 2, must: false },
  { id: 'c-crockery', label: 'Crockery & cutlery included', weight: 2, must: false },
  { id: 'c-jain', label: 'Jain / no-onion-garlic options', weight: 1, must: false },
  { id: 'c-live', label: 'Live counters (chaat, dosa, etc.)', weight: 1, must: false },
  { id: 'c-dessert', label: 'Dessert / sweet station', weight: 1, must: false },
  { id: 'c-bev', label: 'Beverages / welcome drinks', weight: 1, must: false },
];

const catererQuestions: CallQuestionTemplate[] = [
  { id: 'cq1', text: 'What is the per-plate rate for veg? Non-veg?', requirementId: 'c-veg' },
  { id: 'cq2', text: 'What is included in the per-plate rate (starters, mains, dessert)?', },
  { id: 'cq3', text: 'Can we do a tasting session before booking?', requirementId: 'c-taste' },
  { id: 'cq4', text: 'How many service staff will you provide for our guest count?', requirementId: 'c-serve' },
  { id: 'cq5', text: 'Do you provide crockery, cutlery, and serving dishes?', requirementId: 'c-crockery' },
  { id: 'cq6', text: 'Can you accommodate Jain / vegan / halal dietary needs?', requirementId: 'c-jain' },
  { id: 'cq7', text: 'Do you offer live counters? At what additional cost?', requirementId: 'c-live' },
  { id: 'cq8', text: 'What is the minimum order (minimum guests)?', },
  { id: 'cq9', text: 'Do you handle setup and cleanup?', requirementId: 'c-setup' },
  { id: 'cq10', text: 'What is the advance and cancellation policy?', },
];

/* ── Decorator ─────────────────────────────────────────────── */

const decoratorRequirements: RequirementTemplate[] = [
  { id: 'd-theme', label: 'Can execute our theme / colour scheme', weight: 3, must: true },
  { id: 'd-stage', label: 'Stage / backdrop setup', weight: 2, must: false },
  { id: 'd-flower', label: 'Fresh flower arrangements', weight: 2, must: false },
  { id: 'd-light', label: 'Lighting / fairy lights included', weight: 2, must: false },
  { id: 'd-entry', label: 'Entry gate / welcome board', weight: 1, must: false },
  { id: 'd-table', label: 'Table centrepieces', weight: 1, must: false },
  { id: 'd-balloon', label: 'Balloon decoration', weight: 1, must: false },
  { id: 'd-setup', label: 'Setup and teardown included', weight: 2, must: true },
  { id: 'd-mandap', label: 'Mandap decoration (wedding)', weight: 3, must: false },
];

const decoratorQuestions: CallQuestionTemplate[] = [
  { id: 'dq1', text: 'Can you work with our theme / colour palette?', requirementId: 'd-theme' },
  { id: 'dq2', text: 'What does your standard package include?', },
  { id: 'dq3', text: 'Do you do fresh flowers? What is the additional cost?', requirementId: 'd-flower' },
  { id: 'dq4', text: 'Is lighting included in the package?', requirementId: 'd-light' },
  { id: 'dq5', text: 'Can you share photos of previous similar events?', },
  { id: 'dq6', text: 'When will you visit the venue for a recce?', },
  { id: 'dq7', text: 'What time will you arrive for setup on event day?', requirementId: 'd-setup' },
  { id: 'dq8', text: 'Is teardown same day or next morning?', requirementId: 'd-setup' },
  { id: 'dq9', text: 'What is the total cost and advance amount?', },
];

/* ── Photographer ──────────────────────────────────────────── */

const photographerRequirements: RequirementTemplate[] = [
  { id: 'p-dur', label: 'Full-day coverage', weight: 3, must: true },
  { id: 'p-edit', label: 'Edited photos delivered', weight: 3, must: true },
  { id: 'p-video', label: 'Video / videography', weight: 2, must: false },
  { id: 'p-candid', label: 'Candid photography', weight: 2, must: false },
  { id: 'p-drone', label: 'Drone photography', weight: 1, must: false },
  { id: 'p-album', label: 'Physical album included', weight: 1, must: false },
  { id: 'p-pre', label: 'Pre-event / pre-wedding shoot', weight: 1, must: false },
  { id: 'p-raw', label: 'Raw files provided', weight: 1, must: false },
  { id: 'p-team', label: 'Backup photographer', weight: 1, must: false },
];

const photographerQuestions: CallQuestionTemplate[] = [
  { id: 'pq1', text: 'How many hours of coverage is included?', requirementId: 'p-dur' },
  { id: 'pq2', text: 'How many edited photos will we receive? In how many days?', requirementId: 'p-edit' },
  { id: 'pq3', text: 'Do you offer both photography and videography?', requirementId: 'p-video' },
  { id: 'pq4', text: 'Is candid photography included or extra?', requirementId: 'p-candid' },
  { id: 'pq5', text: 'Do you offer drone coverage? Permissions handled?', requirementId: 'p-drone' },
  { id: 'pq6', text: 'Is a physical album included? What size / pages?', requirementId: 'p-album' },
  { id: 'pq7', text: 'Will we get the raw unedited files?', requirementId: 'p-raw' },
  { id: 'pq8', text: 'How many photographers will be present?', requirementId: 'p-team' },
  { id: 'pq9', text: 'Can you share a portfolio of similar events?', },
  { id: 'pq10', text: 'What is the total cost, advance, and cancellation policy?', },
];

/* ── Music / DJ ────────────────────────────────────────────── */

const musicRequirements: RequirementTemplate[] = [
  { id: 'm-sys', label: 'Sound system provided', weight: 3, must: true },
  { id: 'm-mic', label: 'Wireless microphones', weight: 2, must: true },
  { id: 'm-dj', label: 'DJ services', weight: 2, must: false },
  { id: 'm-light', label: 'Dance floor lighting', weight: 1, must: false },
  { id: 'm-live', label: 'Live band / singer', weight: 1, must: false },
  { id: 'm-setup', label: 'Setup and teardown included', weight: 2, must: true },
  { id: 'm-backup', label: 'Backup equipment available', weight: 1, must: false },
];

const musicQuestions: CallQuestionTemplate[] = [
  { id: 'mq1', text: 'What sound system will you bring? Suitable for our venue size?', requirementId: 'm-sys' },
  { id: 'mq2', text: 'How many wireless mics are included?', requirementId: 'm-mic' },
  { id: 'mq3', text: 'What are the DJ charges? How many hours?', requirementId: 'm-dj' },
  { id: 'mq4', text: 'Do you provide dance floor lighting effects?', requirementId: 'm-light' },
  { id: 'mq5', text: 'Can you handle our song requests / playlist?', },
  { id: 'mq6', text: 'What time will you arrive for setup?', requirementId: 'm-setup' },
  { id: 'mq7', text: 'What is the total cost and advance?', },
];

/* ── Mehendi Artist (Wedding) ──────────────────────────────── */

const mehendiRequirements: RequirementTemplate[] = [
  { id: 'mh-bride', label: 'Bridal mehendi (full hands + feet)', weight: 3, must: true },
  { id: 'mh-family', label: 'Mehendi for family members', weight: 2, must: false },
  { id: 'mh-guest', label: 'Guest mehendi service', weight: 1, must: false },
  { id: 'mh-style', label: 'Preferred style (Arabic / Rajasthani / modern)', weight: 2, must: false },
  { id: 'mh-organic', label: 'Organic / natural henna used', weight: 1, must: false },
];

const mehendiQuestions: CallQuestionTemplate[] = [
  { id: 'mhq1', text: 'What is the charge for bridal mehendi? How long does it take?', requirementId: 'mh-bride' },
  { id: 'mhq2', text: 'What is the per-person rate for family / guests?', requirementId: 'mh-family' },
  { id: 'mhq3', text: 'Do you use organic / natural henna?', requirementId: 'mh-organic' },
  { id: 'mhq4', text: 'Can you share samples of your work in our preferred style?', requirementId: 'mh-style' },
  { id: 'mhq5', text: 'How many mehendi artists will come?', },
  { id: 'mhq6', text: 'What is the advance and cancellation policy?', },
];

/* ── Pandit / Officiant (Wedding) ──────────────────────────── */

const panditRequirements: RequirementTemplate[] = [
  { id: 'pn-lang', label: 'Conducts ceremony in preferred language', weight: 3, must: true },
  { id: 'pn-mat', label: 'Pooja materials / samagri provided', weight: 2, must: false },
  { id: 'pn-exp', label: 'Explains rituals to guests', weight: 2, must: false },
  { id: 'pn-time', label: 'Available at muhurat time', weight: 3, must: true },
  { id: 'pn-brief', label: 'Willing to keep ceremony within time', weight: 1, must: false },
];

const panditQuestions: CallQuestionTemplate[] = [
  { id: 'pnq1', text: 'Can you conduct the ceremony in our preferred language?', requirementId: 'pn-lang' },
  { id: 'pnq2', text: 'Do you provide all pooja samagri or do we need to arrange separately?', requirementId: 'pn-mat' },
  { id: 'pnq3', text: 'Are you available at our muhurat time?', requirementId: 'pn-time' },
  { id: 'pnq4', text: 'Do you explain the significance of each ritual to guests?', requirementId: 'pn-exp' },
  { id: 'pnq5', text: 'What is your dakshina / fee?', },
  { id: 'pnq6', text: 'How long will the ceremony take?', requirementId: 'pn-brief' },
];

/* ── Category Maps by Event Type ───────────────────────────── */

const COMMON_CATEGORIES: VendorCategoryTemplate[] = [
  {
    id: 'venue', label: 'Venue',
    requirements: venueRequirements, questions: venueQuestions,
    fitWeights: [0.6, 0.3, 0.1],
  },
  {
    id: 'caterer', label: 'Caterer',
    requirements: catererRequirements, questions: catererQuestions,
    fitWeights: [0.6, 0.3, 0.1],
  },
  {
    id: 'decorator', label: 'Decorator',
    requirements: decoratorRequirements, questions: decoratorQuestions,
    fitWeights: [0.5, 0.35, 0.15],
  },
  {
    id: 'photographer', label: 'Photographer',
    requirements: photographerRequirements, questions: photographerQuestions,
    fitWeights: [0.5, 0.3, 0.2],
  },
  {
    id: 'music', label: 'Music / DJ',
    requirements: musicRequirements, questions: musicQuestions,
    fitWeights: [0.5, 0.35, 0.15],
  },
];

const WEDDING_EXTRA: VendorCategoryTemplate[] = [
  {
    id: 'mehendi', label: 'Mehendi Artist',
    requirements: mehendiRequirements, questions: mehendiQuestions,
    fitWeights: [0.5, 0.3, 0.2],
  },
  {
    id: 'pandit', label: 'Pandit / Officiant',
    requirements: panditRequirements, questions: panditQuestions,
    fitWeights: [0.6, 0.3, 0.1],
  },
];

const VENDOR_TEMPLATES: Record<EventType, VendorCategoryTemplate[]> = {
  birthday: [...COMMON_CATEGORIES],
  wedding: [...COMMON_CATEGORIES, ...WEDDING_EXTRA],
  community: [...COMMON_CATEGORIES],
};

/**
 * Get vendor category templates for an event type.
 */
export function getVendorTemplate(eventType: EventType): VendorCategoryTemplate[] {
  return VENDOR_TEMPLATES[eventType];
}
