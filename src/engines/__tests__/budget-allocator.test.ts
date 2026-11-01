import { describe, it, expect } from 'vitest';
import { allocateBudget } from '../budget-allocator';
import { getBudgetTemplate } from '@/domain/templates/budget-templates';

describe('Budget Allocator Engine (§7.1, UT-BUD, R-057)', () => {
  const birthdayTemplate = getBudgetTemplate('birthday');

  it('allocates total budget across categories exactly', () => {
    const total = 100000;
    const result = allocateBudget(total, birthdayTemplate);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    // All categories present
    expect(result.allocations.length).toBe(birthdayTemplate.length);

    // Sum matches total exactly
    const allocatedSum = result.allocations.reduce((sum, a) => sum + a.amountInr, 0);
    expect(allocatedSum).toBe(total);

    // Every amount is in integer multiples of ₹100
    for (const a of result.allocations) {
      expect(a.amountInr % 100).toBe(0);
      expect(a.amountInr).toBeGreaterThanOrEqual(0);
    }
  });

  it('respects category minPct and maxPct constraints', () => {
    const total = 100000;
    const result = allocateBudget(total, birthdayTemplate);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    for (const a of result.allocations) {
      const template = birthdayTemplate.find(c => c.id === a.id)!;
      const minAmount = (template.minPct / 100) * total;
      const maxAmount = (template.maxPct / 100) * total;
      expect(a.amountInr).toBeGreaterThanOrEqual(minAmount - 100);
      expect(a.amountInr).toBeLessThanOrEqual(maxAmount + 100);
    }
  });

  it('respects locked categories and allocates remaining funds among free categories', () => {
    const total = 100000;
    const locks = [{ id: 'venue', amountInr: 25000 }];
    const result = allocateBudget(total, birthdayTemplate, locks);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const venueAlloc = result.allocations.find(a => a.id === 'venue');
    expect(venueAlloc?.amountInr).toBe(25000);

    const allocatedSum = result.allocations.reduce((sum, a) => sum + a.amountInr, 0);
    expect(allocatedSum).toBe(total);
  });

  it('returns INFEASIBLE_BOUNDS when locks exceed the budget', () => {
    const total = 50000;
    const locks = [{ id: 'venue', amountInr: 60000 }];
    const result = allocateBudget(total, birthdayTemplate, locks);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe('INFEASIBLE_BOUNDS');
    }
  });

  it('works across different event types: wedding and community', () => {
    const weddingTemplate = getBudgetTemplate('wedding');
    const weddingResult = allocateBudget(1000000, weddingTemplate);
    expect(weddingResult.ok).toBe(true);
    if (weddingResult.ok) {
      const sum = weddingResult.allocations.reduce((s, a) => s + a.amountInr, 0);
      expect(sum).toBe(1000000);
    }

    const communityTemplate = getBudgetTemplate('community');
    const communityResult = allocateBudget(200000, communityTemplate);
    expect(communityResult.ok).toBe(true);
    if (communityResult.ok) {
      const sum = communityResult.allocations.reduce((s, a) => s + a.amountInr, 0);
      expect(sum).toBe(200000);
    }
  });
});
