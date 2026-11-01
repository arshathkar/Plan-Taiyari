import { describe, it, expect } from 'vitest';
import { compareQuotes, type RequirementInput, type QuoteInput } from '../vendor-compare';

describe('Vendor Comparison Engine (§7.4, Golden Scenario G-8, R-057)', () => {
  const requirements: RequirementInput[] = [
    { id: 'r1', label: 'Buffet setup with warmers', weight: 3, must: true },
    { id: 'r2', label: 'Service staff included', weight: 2, must: true },
    { id: 'r3', label: 'Live chaat counter', weight: 2, must: false },
    { id: 'r4', label: 'Custom birthday cake table', weight: 1, must: false },
    { id: 'r5', label: 'Mineral water dispensers', weight: 2, must: true },
  ];

  const quotes: QuoteInput[] = [
    {
      id: 'q_caterer_b',
      vendorName: 'Sample Caterer B',
      totalInr: 38000,
      coverage: {
        r1: 'covered',
        r2: 'covered',
        r3: 'covered',
        r4: 'covered',
        r5: 'covered',
      },
      extras: [],
      advancePct: 20,
      cancellation: '7 days before for 90% refund',
      validUntil: '2026-12-01',
    },
    {
      id: 'q_caterer_a',
      vendorName: 'Sample Caterer A',
      totalInr: 33500,
      coverage: {
        r1: 'covered',
        r2: 'partial',
        r3: 'notCovered',
        r4: 'covered',
        r5: 'unknown',
      },
      extras: [{ label: 'Transportation surcharge', amountInr: 2400 }],
      advancePct: 30,
      cancellation: null,
      validUntil: null,
    },
    {
      id: 'q_caterer_c',
      vendorName: 'Sample Caterer C',
      totalInr: 29000,
      coverage: {
        r1: 'notCovered',
        r2: 'notCovered',
        r3: 'notCovered',
        r4: 'covered',
        r5: 'unknown',
      },
      extras: [
        { label: 'Cleaning fee', amountInr: 3000 },
        { label: 'Staff overtime', amountInr: null }, // unknown extra
      ],
      advancePct: null,
      cancellation: null,
      validUntil: null,
    },
  ];

  it('G-8: Compares quotes on coverage, cost, and terms correctly', () => {
    const guests = 65;
    const categoryBudget = 36400;

    const result = compareQuotes(requirements, quotes, guests, categoryBudget);

    expect(result.comparisons.length).toBe(3);

    // Sorted by fit score descending
    expect(result.comparisons[0].vendorName).toBe('Sample Caterer B');
    expect(result.comparisons[1].vendorName).toBe('Sample Caterer A');
    expect(result.comparisons[2].vendorName).toBe('Sample Caterer C');

    // All-in cost includes known extras
    const catA = result.comparisons.find(c => c.quoteId === 'q_caterer_a')!;
    expect(catA.knownExtras).toBe(2400);
    expect(catA.allInKnown).toBe(33500 + 2400);
    expect(catA.perGuest).toBe(Math.round(catA.allInKnown / guests));

    // Caterer C has an unknown extra
    const catC = result.comparisons.find(c => c.quoteId === 'q_caterer_c')!;
    expect(catC.unknownExtrasCount).toBe(1);

    // Ranking holds note is present
    expect(result.sensitivityNote).toBeDefined();
  });

  it('Returns empty comparisons when fewer than 2 quotes', () => {
    const result = compareQuotes(requirements, [quotes[0]], 65, 36400);
    expect(result.comparisons.length).toBe(0);
  });
});
