/**
 * Budget Allocator (§7.1)
 * Weighted water-filling with bounds. Pure function, no side effects.
 * Amounts are integer rupees in multiples of ₹100, summing exactly to total.
 */

export interface CategoryInput {
  id: string;
  weight: number;
  minPct: number;
  maxPct: number;
}

export interface Lock {
  id: string;
  amountInr: number;
}

export interface AllocationItem {
  id: string;
  amountInr: number;
}

export type AllocationResult =
  | { ok: true; allocations: AllocationItem[] }
  | { ok: false; error: 'INFEASIBLE_BOUNDS'; message: string };

/**
 * Allocate a total budget across categories using weighted water-filling.
 * Returns amounts in multiples of ₹100 that sum exactly to total.
 */
export function allocateBudget(
  total: number,
  categories: CategoryInput[],
  locks: Lock[] = []
): AllocationResult {
  const lockMap = new Map(locks.map(l => [l.id, l.amountInr]));

  // Separate locked and free categories
  let lockedTotal = 0;
  for (const lock of locks) {
    lockedTotal += lock.amountInr;
  }

  const remaining = total - lockedTotal;
  const freeCategories = categories.filter(c => !lockMap.has(c.id));

  // Feasibility pre-check
  const minSum = freeCategories.reduce((s, c) => s + (c.minPct / 100) * total, 0);

  if (remaining < minSum - 50) {
    return {
      ok: false,
      error: 'INFEASIBLE_BOUNDS',
      message: `Locked amounts (₹${lockedTotal}) leave only ₹${remaining}, but minimums need ₹${Math.ceil(minSum)}`,
    };
  }
  if (remaining < 0) {
    return {
      ok: false,
      error: 'INFEASIBLE_BOUNDS',
      message: `Locked amounts (₹${lockedTotal}) exceed the total budget (₹${total})`,
    };
  }

  // Water-filling with bounds
  const amounts = waterFill(remaining, total, freeCategories);

  // Build result with locked + free
  const result: AllocationItem[] = categories.map(c => {
    if (lockMap.has(c.id)) {
      return { id: c.id, amountInr: lockMap.get(c.id)! };
    }
    return { id: c.id, amountInr: amounts.get(c.id) ?? 0 };
  });

  return { ok: true, allocations: result };
}

function waterFill(
  remaining: number,
  total: number,
  categories: CategoryInput[]
): Map<string, number> {
  const result = new Map<string, number>();
  let free = [...categories];
  let pool = remaining;

  // Iterative clamping
  for (let iter = 0; iter < 20 && free.length > 0; iter++) {
    const totalWeight = free.reduce((s, c) => s + c.weight, 0);
    if (totalWeight === 0) break;

    let anyViolation = false;

    for (const c of free) {
      const proposed = (pool * c.weight) / totalWeight;
      const min = (c.minPct / 100) * total;
      const max = (c.maxPct / 100) * total;

      if (proposed < min) {
        result.set(c.id, min);
        pool -= min;
        free = free.filter(f => f.id !== c.id);
        anyViolation = true;
        break;
      }
      if (proposed > max) {
        result.set(c.id, max);
        pool -= max;
        free = free.filter(f => f.id !== c.id);
        anyViolation = true;
        break;
      }
    }

    if (!anyViolation) {
      // No violations — assign remaining by weight
      for (const c of free) {
        result.set(c.id, (pool * c.weight) / totalWeight);
      }
      break;
    }
  }

  // Round to ₹100 multiples using largest-remainder method
  return roundToHundreds(result, remaining, categories);
}

function roundToHundreds(
  raw: Map<string, number>,
  target: number,
  categories: CategoryInput[]
): Map<string, number> {
  const entries = categories
    .filter(c => raw.has(c.id))
    .map(c => {
      const val = raw.get(c.id)!;
      const floored = Math.floor(val / 100) * 100;
      return { id: c.id, floored, remainder: val - floored };
    });

  const flooredTotal = entries.reduce((s, e) => s + e.floored, 0);
  let unitsToDistribute = Math.round((target - flooredTotal) / 100);

  // Sort by remainder descending, break ties by id
  entries.sort((a, b) => b.remainder - a.remainder || a.id.localeCompare(b.id));

  const result = new Map<string, number>();
  for (const entry of entries) {
    let amount = entry.floored;
    if (unitsToDistribute > 0) {
      amount += 100;
      unitsToDistribute--;
    }
    result.set(entry.id, amount);
  }

  return result;
}
