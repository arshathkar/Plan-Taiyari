import { describe, it, expect } from 'vitest';
import {
  rr1_dateChanged,
  rr2_guestCountChanged,
  rr3_budgetChanged,
  rr4_mustHavesChanged,
  rr5_taskCompleted,
  rr6_vendorBooked,
  rr7_accessibilityChanged,
  rr8_dietaryChanged,
  rr9_venueOutdoor,
  rr10_eventTypeChanged,
  computeRippleEffects,
} from '../ripple';
import type { Plan } from '@/domain/schema';

function makeMockPlan(): Plan {
  return {
    schemaVersion: 1,
    id: '12345678-1234-1234-1234-123456789abc',
    createdAt: '2026-10-31T00:00:00Z',
    updatedAt: '2026-10-31T00:00:00Z',
    baselineDate: '2026-10-31',
    isSample: false,
    intake: {
      eventType: 'birthday',
      title: 'Aarav Birthday',
      date: { kind: 'fixed', date: '2026-12-20' },
      guests: { min: 40, expected: 50, max: 60 },
      budget: { basis: 'total', amountInr: 100000 },
      city: 'Bengaluru',
      venueType: 'hall',
      mustHaves: ['Good food'],
      desiredExperience: 'Joyful',
      experienceChips: ['family'],
      cultural: { chips: [], notes: '' },
      dietary: { tags: ['veg'], notes: '' },
      accessibility: { tags: ['wheelchair'], notes: '' },
      alcohol: 'no',
      children: true,
      answered: {
        mustHaves: true,
        dietary: true,
        accessibility: true,
        cultural: true,
      },
    },
    budget: {
      totalInr: 100000,
      categories: [
        { id: 'venue', label: 'Venue', weight: 20, minPct: 5, maxPct: 40, elasticity: 0.3, maxCut: 0.5, amountInr: 20000, locked: false, protected: false, committedInr: 0, paidInr: 0 },
        { id: 'catering', label: 'Catering', weight: 36, minPct: 15, maxPct: 55, elasticity: 1.0, maxCut: 0.35, amountInr: 36000, locked: false, protected: false, committedInr: 0, paidInr: 0 },
      ],
    },
    tasks: [
      { id: 'B01', title: 'Fix budget', categoryId: 'budget', priority: 0, effortDays: 1, dependsOn: [], mustFinishDaysBefore: 45, done: false, completedOn: null, notes: '', origin: 'template' },
      { id: 'B06', title: 'Book the venue', categoryId: 'venue', priority: 0, effortDays: 1, dependsOn: [], mustFinishDaysBefore: 33, done: false, completedOn: null, notes: '', origin: 'template' },
    ],
    vendorCategories: [],
    vendors: [
      {
        id: '12345678-0000-0000-0000-000000000001',
        name: 'Grand Banquet',
        categoryId: 'venue',
        status: 'booked',
        contactNote: '',
        quote: null,
        payments: [{ label: 'Advance', dueOn: '2026-11-15', amountInr: 5000, paid: false }],
      },
    ],
    ideas: [],
    runSheet: [],
    notes: [],
  };
}

describe('Ripple Rules Engine (§7.7, RR1–RR10, R-010, R-057)', () => {
  it('RR1: Date change generates recompute_timeline and re-confirm tasks for booked vendors', () => {
    const prev = makeMockPlan();
    const next = makeMockPlan();
    next.intake.date = { kind: 'fixed', date: '2026-12-25' };

    const effects = rr1_dateChanged(prev, next);
    expect(effects.some(e => e.type === 'recompute_timeline')).toBe(true);
    expect(effects.some(e => e.type === 'add_task' && e.task.title.includes('Re-confirm Grand Banquet'))).toBe(true);
  });

  it('RR2: Guest count change triggers banner with before/after count', () => {
    const prev = makeMockPlan();
    const next = makeMockPlan();
    next.intake.guests = { min: 60, expected: 75, max: 80 };

    const effects = rr2_guestCountChanged(prev, next);
    expect(effects.some(e => e.type === 'banner' && e.message.includes('50') && e.message.includes('75'))).toBe(true);
    expect(effects.some(e => e.type === 'rebalance_needed')).toBe(true);
  });

  it('RR3: Total budget change triggers rebalance_needed effect', () => {
    const prev = makeMockPlan();
    const next = makeMockPlan();
    next.budget.totalInr = 80000;

    const effects = rr3_budgetChanged(prev, next);
    expect(effects.some(e => e.type === 'rebalance_needed')).toBe(true);
  });

  it('RR4: Must-haves change triggers banner notifications', () => {
    const prev = makeMockPlan();
    const next = makeMockPlan();
    next.intake.mustHaves = ['Good food', 'Live orchestra'];

    const effects = rr4_mustHavesChanged(prev, next);
    expect(effects.length).toBeGreaterThan(0);
    expect(effects.some(e => e.type === 'banner')).toBe(true);
  });

  it('RR5: Task completion offers to mark vendor booked', () => {
    const prev = makeMockPlan();
    const next = makeMockPlan();
    next.tasks = next.tasks.map(t => t.id === 'B06' ? { ...t, done: true, completedOn: '2026-11-01' } : t);

    const effects = rr5_taskCompleted(prev, next);
    expect(effects.some(e => e.type === 'suggest_book_vendor')).toBe(true);
  });

  it('RR6: Vendor booked adds to roster and payment items', () => {
    const prev = makeMockPlan();
    prev.vendors[0].status = 'shortlisted';
    const next = makeMockPlan();
    next.vendors[0].status = 'booked';

    const effects = rr6_vendorBooked(prev, next);
    expect(effects.some(e => e.type === 'add_vendor_to_roster')).toBe(true);
    expect(effects.some(e => e.type === 'add_payment_items')).toBe(true);
  });

  it('RR7: Accessibility needs add requirements to vendor checklists', () => {
    const prev = makeMockPlan();
    prev.intake.accessibility = { tags: [], notes: '' };
    const next = makeMockPlan();
    next.intake.accessibility = { tags: ['stepFree', 'wheelchair'], notes: '' };

    const effects = rr7_accessibilityChanged(prev, next);
    expect(effects.some(e => e.type === 'add_requirement')).toBe(true);
  });

  it('RR8: Dietary needs update caterer requirements', () => {
    const prev = makeMockPlan();
    prev.intake.dietary = { tags: ['veg'], notes: '' };
    const next = makeMockPlan();
    next.intake.dietary = { tags: ['veg', 'jain'], notes: '' };

    const effects = rr8_dietaryChanged(prev, next);
    expect(effects.some(e => e.type === 'add_requirement')).toBe(true);
  });

  it('RR9: Outdoor venue adds weather-backup task', () => {
    const prev = makeMockPlan();
    prev.intake.venueType = 'hall';
    const next = makeMockPlan();
    next.intake.venueType = 'outdoor';

    const effects = rr9_venueOutdoor(prev, next);
    expect(effects.some(e => e.type === 'add_task' && e.task.title.toLowerCase().includes('weather'))).toBe(true);
  });

  it('RR10: Event type changed requires confirmation before template regenerate', () => {
    const prev = makeMockPlan();
    const next = makeMockPlan();
    next.intake.eventType = 'wedding';

    const effects = rr10_eventTypeChanged(prev, next);
    expect(effects.some(e => e.type === 'confirm_regenerate')).toBe(true);
  });

  it('computeRippleEffects aggregates all triggered rules', () => {
    const prev = makeMockPlan();
    const next = makeMockPlan();
    next.intake.date = { kind: 'fixed', date: '2026-12-25' };
    next.budget.totalInr = 120000;

    const effects = computeRippleEffects(prev, next);
    expect(effects.length).toBeGreaterThan(1);
  });
});
