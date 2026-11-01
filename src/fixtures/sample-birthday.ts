/**
 * Sample Birthday Event Fixture
 * A complete pre-filled birthday plan for "Try Sample" functionality.
 * Dad's 60th Birthday, 50 guests, ₹1,00,000 budget.
 */

import type { Plan, VendorCategory, Vendor, Idea, RunSheetItem } from '@/domain/schema';

/** Sample vendor categories with pre-filled questions marked as asked */
export const sampleVendorCategories: VendorCategory[] = [
  {
    id: 'venue',
    label: 'Venue',
    requirements: [
      { id: 'v-cap', label: 'Capacity fits 50 guests', weight: 3, must: true },
      { id: 'v-date', label: 'Available on 20 Dec 2026', weight: 3, must: true },
      { id: 'v-park', label: 'Parking available', weight: 2, must: false },
      { id: 'v-ac', label: 'Air conditioning', weight: 2, must: false },
      { id: 'v-access', label: 'Step-free / elder-friendly', weight: 2, must: true },
    ],
    questions: [
      { id: 'vq1', text: 'What is the maximum seating capacity?', requirementId: 'v-cap', asked: true, answer: 'Up to 80 seated', origin: 'bank' },
      { id: 'vq2', text: 'Is 20 Dec 2026 available?', requirementId: 'v-date', asked: true, answer: 'Yes, confirmed', origin: 'bank' },
      { id: 'vq3', text: 'What is the rental charge?', asked: true, answer: '₹12,000 for full day', origin: 'bank' },
      { id: 'vq4', text: 'Is there parking?', requirementId: 'v-park', asked: false, answer: '', origin: 'bank' },
    ],
    fitWeights: [0.6, 0.3, 0.1],
  },
  {
    id: 'caterer',
    label: 'Caterer',
    requirements: [
      { id: 'c-veg', label: 'Vegetarian menu available', weight: 3, must: true },
      { id: 'c-serve', label: 'Service staff included', weight: 2, must: true },
      { id: 'c-taste', label: 'Tasting session offered', weight: 2, must: false },
      { id: 'c-setup', label: 'Setup & cleanup included', weight: 2, must: false },
    ],
    questions: [
      { id: 'cq1', text: 'What is the per-plate rate for veg?', requirementId: 'c-veg', asked: true, answer: '₹650-800 per plate', origin: 'bank' },
      { id: 'cq2', text: 'How many service staff?', requirementId: 'c-serve', asked: false, answer: '', origin: 'bank' },
    ],
    fitWeights: [0.6, 0.3, 0.1],
  },
  {
    id: 'decorator',
    label: 'Decorator',
    requirements: [
      { id: 'd-theme', label: 'Can execute warm/family theme', weight: 3, must: true },
      { id: 'd-setup', label: 'Setup and teardown included', weight: 2, must: true },
    ],
    questions: [
      { id: 'dq1', text: 'Can you work with a warm family theme?', requirementId: 'd-theme', asked: false, answer: '', origin: 'bank' },
    ],
    fitWeights: [0.5, 0.35, 0.15],
  },
  {
    id: 'photographer',
    label: 'Photographer',
    requirements: [
      { id: 'p-dur', label: 'Full-day coverage', weight: 3, must: true },
      { id: 'p-edit', label: 'Edited photos delivered', weight: 3, must: true },
      { id: 'p-candid', label: 'Candid photography', weight: 2, must: false },
    ],
    questions: [
      { id: 'pq1', text: 'How many hours of coverage?', requirementId: 'p-dur', asked: false, answer: '', origin: 'bank' },
    ],
    fitWeights: [0.5, 0.3, 0.2],
  },
];

/** Sample vendors with quotes */
export const sampleVendors: Vendor[] = [
  {
    id: 'v-sunshine-hall',
    categoryId: 'venue',
    name: 'Sunshine Community Hall',
    status: 'booked',
    contactNote: 'Mr Sharma — confirmed for 20 Dec',
    quote: {
      id: 'q-sunshine',
      totalInr: 15000,
      coverage: { 'v-cap': 'covered', 'v-date': 'covered', 'v-park': 'partial', 'v-ac': 'covered', 'v-access': 'covered' },
      extras: [{ label: 'Generator backup', amountInr: 2000 }],
      advancePct: 30,
      cancellation: 'Full refund if cancelled 15 days before',
      validUntil: '2026-12-15',
      notes: 'Includes tables, chairs, and basic sound system',
    },
    payments: [
      { label: 'Advance (30%)', dueOn: '2026-11-15', amountInr: 4500, paid: true },
      { label: 'Balance', dueOn: '2026-12-18', amountInr: 10500, paid: false },
    ],
  },
  {
    id: 'v-caterer-a',
    categoryId: 'caterer',
    name: 'Annapurna Caterers',
    status: 'quoted',
    contactNote: 'Spoke with Priya on phone',
    quote: {
      id: 'q-caterer-a',
      totalInr: 33500,
      coverage: { 'c-veg': 'covered', 'c-serve': 'partial', 'c-taste': 'notCovered', 'c-setup': 'covered' },
      extras: [{ label: 'Live chaat counter', amountInr: 2400 }, { label: 'Extra waiter', amountInr: null }],
      advancePct: 50,
      cancellation: '50% refund if cancelled 7 days before',
      validUntil: '2026-12-10',
      notes: 'Good reviews, reasonable pricing',
    },
    payments: [],
  },
  {
    id: 'v-caterer-b',
    categoryId: 'caterer',
    name: 'Bhagat Catering Co',
    status: 'quoted',
    contactNote: '',
    quote: {
      id: 'q-caterer-b',
      totalInr: 38000,
      coverage: { 'c-veg': 'covered', 'c-serve': 'covered', 'c-taste': 'covered', 'c-setup': 'covered' },
      extras: [],
      advancePct: 40,
      cancellation: 'Full refund if cancelled 10 days before',
      validUntil: '2026-12-12',
      notes: 'Premium quality, includes tasting',
    },
    payments: [],
  },
];

/** Sample ideas */
export const sampleIdeas: Idea[] = [
  {
    id: 'idea-photo-wall',
    title: 'Memory Photo Wall',
    body: 'Create a photo wall with pictures from each decade of Dad\'s life. Ask family members to contribute their favourite photos. Print them in consistent sizes and arrange chronologically.',
    whyFits: 'Family-first celebration with warm personal touch',
    categoryId: 'decoration',
    relativeCost: 'low',
    effort: 'medium',
    tags: ['personal', 'decoration', 'family'],
    pinned: true,
    dismissed: false,
    origin: 'builtIn',
  },
  {
    id: 'idea-speech-jar',
    title: 'Speech & Wishes Jar',
    body: 'Place cards and pens at each table for guests to write their favourite memory or wish for Dad. Collect them in a decorated jar as a keepsake.',
    whyFits: 'Low-cost personal touch that involves all guests',
    categoryId: 'entertainment',
    relativeCost: 'low',
    effort: 'low',
    tags: ['interactive', 'keepsake', 'personal'],
    pinned: false,
    dismissed: false,
    origin: 'builtIn',
  },
  {
    id: 'idea-retro-playlist',
    title: 'Retro Playlist from Dad\'s Era',
    body: 'Curate a playlist of hit songs from the 1960s-80s. Play them during dinner for nostalgia. Ask family for Dad\'s favourite songs.',
    whyFits: 'Adds a relaxed nostalgic atmosphere without extra cost',
    categoryId: 'entertainment',
    relativeCost: 'low',
    effort: 'low',
    tags: ['music', 'nostalgia', 'relaxed'],
    pinned: false,
    dismissed: false,
    origin: 'builtIn',
  },
  {
    id: 'idea-custom-cake',
    title: 'Custom Theme Cake',
    body: 'Order a cake themed around Dad\'s hobby or interest — cricket, gardening, books, etc. Include "Happy 60th" with a personal message.',
    whyFits: 'Centrepiece moment that ties to Dad\'s personality',
    categoryId: 'cake_favors',
    relativeCost: 'medium',
    effort: 'low',
    tags: ['cake', 'personal', 'centrepiece'],
    pinned: false,
    dismissed: false,
    origin: 'builtIn',
  },
  {
    id: 'idea-return-favour',
    title: 'Personalised Return Favours',
    body: 'Small boxes of mithai or handmade chocolates with a printed "Thank you" card featuring a family photo. Budget-friendly if ordered in bulk.',
    whyFits: 'Thoughtful guest takeaway within budget',
    categoryId: 'cake_favors',
    relativeCost: 'low',
    effort: 'medium',
    tags: ['favours', 'personal', 'guests'],
    pinned: false,
    dismissed: false,
    origin: 'builtIn',
  },
  {
    id: 'idea-video-montage',
    title: 'Family Video Montage',
    body: 'Compile short video clips from family members sharing wishes. Play the montage during the event as a surprise for Dad.',
    whyFits: 'Emotional highlight that makes the celebration memorable',
    categoryId: 'photography',
    relativeCost: 'low',
    effort: 'high',
    tags: ['video', 'surprise', 'emotional'],
    pinned: false,
    dismissed: false,
    origin: 'builtIn',
  },
];

/** Sample run sheet */
export const sampleRunSheet: RunSheetItem[] = [
  { id: 'rs-1', time: '09:00', activity: 'Venue setup begins — decorator arrives', owner: 'Decorator', notes: '' },
  { id: 'rs-2', time: '11:00', activity: 'Caterer setup — kitchen prep begins', owner: 'Caterer', notes: '' },
  { id: 'rs-3', time: '14:00', activity: 'Photo wall final check', owner: 'Family', notes: '' },
  { id: 'rs-4', time: '15:00', activity: 'Photographer arrives — candid pre-event shots', owner: 'Photographer', notes: '' },
  { id: 'rs-5', time: '16:00', activity: 'Guests start arriving — welcome drinks', owner: 'Host', notes: '' },
  { id: 'rs-6', time: '16:30', activity: 'Family group photos', owner: 'Photographer', notes: '' },
  { id: 'rs-7', time: '17:00', activity: 'Cake cutting ceremony', owner: 'Host', notes: 'Start retro playlist' },
  { id: 'rs-8', time: '17:30', activity: 'Speeches & wishes', owner: 'MC / Family', notes: '' },
  { id: 'rs-9', time: '18:00', activity: 'Video montage screening', owner: 'Host', notes: 'Surprise for Dad' },
  { id: 'rs-10', time: '18:30', activity: 'Dinner service begins', owner: 'Caterer', notes: '' },
  { id: 'rs-11', time: '20:00', activity: 'Return favours distributed', owner: 'Family', notes: '' },
  { id: 'rs-12', time: '20:30', activity: 'Event winds down — thank guests', owner: 'Host', notes: '' },
  { id: 'rs-13', time: '21:00', activity: 'Cleanup and teardown', owner: 'Decorator / Caterer', notes: '' },
];

/**
 * Build a complete sample plan.
 * This is called by the store's loadSampleEvent to populate all sections.
 */
export function buildSamplePlan(basePlan: Plan): Plan {
  return {
    ...basePlan,
    isSample: true,
    vendorCategories: sampleVendorCategories,
    vendors: sampleVendors,
    ideas: sampleIdeas,
    runSheet: sampleRunSheet,
    notes: [
      {
        id: 'note-1',
        text: 'Dad loves old Hindi songs — check with DJ about 60s-80s playlist availability.',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'note-2',
        text: 'Aunt Meera is allergic to nuts — inform caterer separately.',
        createdAt: new Date().toISOString(),
      },
    ],
  };
}
