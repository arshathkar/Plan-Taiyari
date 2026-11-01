import { describe, it, expect } from 'vitest';
import { rebalance, type RebalanceInput, type RebalanceCategory } from '../rebalance';
import { getBudgetTemplate } from '@/domain/templates/budget-templates';

function getBirthdayCategories(total: number): RebalanceCategory[] {
  const templates = getBudgetTemplate('birthday');
  // Initial amounts per G-1 table:
  // venue: 20,000, catering: 36,000, decoration: 14,000, photography: 7,000,
  // entertainment: 9,000, invitations: 2,000, cake_favors: 4,000, logistics: 2,000, contingency: 6,000
  const initialAmounts: Record<string, number> = {
    venue: 20000,
    catering: 36000,
    decoration: 14000,
    photography: 7000,
    entertainment: 9000,
    invitations: 2000,
    cake_favors: 4000,
    logistics: 2000,
    contingency: 6000,
  };

  return templates.map(t => ({
    ...t,
    amountInr: initialAmounts[t.id] ?? Math.round(total * t.weight),
    locked: false,
    protected: false,
  }));
}

describe('Rebalance Engine (§7.2, Golden Scenarios G-1–G-6, R-057)', () => {
  it('G-1: Birthday budget -20% and guests +30% (₹1,00,000 -> ₹80,000, guests 50 -> 65)', () => {
    const categories = getBirthdayCategories(100000);
    const input: RebalanceInput = {
      categories,
      oldBudget: 100000,
      newBudget: 80000,
      oldGuests: 50,
      newGuests: 65,
    };

    const result = rebalance(input);

    expect(result.outcome).toBe('fits_after_trims');
    expect(result.totalAfter).toBe(80000);

    // Sum of category allocations equals exactly new budget
    const sum = result.categories.reduce((s, c) => s + c.after, 0);
    expect(sum).toBe(80000);

    // All categories in multiples of 100
    for (const cat of result.categories) {
      expect(cat.after % 100).toBe(0);
      expect(cat.after).toBeGreaterThanOrEqual(cat.floor);
    }

    // Catering increases or maintains priority due to high elasticity (0.9)
    const catering = result.categories.find(c => c.id === 'catering')!;
    expect(catering.after).toBeGreaterThanOrEqual(30000);
  });

  it('G-2: Same scenario with venue and catering protected as must-haves', () => {
    const categories = getBirthdayCategories(100000).map(c => ({
      ...c,
      protected: c.id === 'venue' || c.id === 'catering',
    }));

    const input: RebalanceInput = {
      categories,
      oldBudget: 100000,
      newBudget: 80000,
      oldGuests: 50,
      newGuests: 65,
    };

    const result = rebalance(input);

    expect(result.outcome).toBe('fits_after_trims');
    expect(result.totalAfter).toBe(80000);

    // Unprotected categories are trimmed more than protected ones
    const decoration = result.categories.find(c => c.id === 'decoration')!;
    const catering = result.categories.find(c => c.id === 'catering')!;
    expect(catering.after).toBeGreaterThan(36000); // Catering got protected and scaled
    expect(decoration.after).toBeLessThan(14000);
  });

  it('G-4: Infeasible scenario generates levers and shortfall outcome', () => {
    const categories = getBirthdayCategories(100000);
    const input: RebalanceInput = {
      categories,
      oldBudget: 100000,
      newBudget: 40000, // Very low budget
      oldGuests: 50,
      newGuests: 100, // High guest count
    };

    const result = rebalance(input);

    expect(result.outcome).toBe('shortfall');
    expect(result.shortfallInr).toBeGreaterThan(0);
    expect(result.levers.length).toBeGreaterThan(0);

    // Levers suggest actionable trade-offs
    const leverTypes = result.levers.map(l => l.type);
    expect(leverTypes).toContain('reduce_guests');
  });

  it('Preserves locked category amounts exactly', () => {
    const categories = getBirthdayCategories(100000).map(c =>
      c.id === 'photography' ? { ...c, locked: true, amountInr: 7000 } : c
    );

    const input: RebalanceInput = {
      categories,
      oldBudget: 100000,
      newBudget: 90000,
      oldGuests: 50,
      newGuests: 50,
    };

    const result = rebalance(input);
    const photo = result.categories.find(c => c.id === 'photography')!;
    expect(photo.after).toBe(7000);
    expect(photo.reason).toBe('locked');
  });
});
