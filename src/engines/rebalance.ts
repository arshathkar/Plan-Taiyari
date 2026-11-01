/**
 * What-if Rebalance Engine (§7.2)
 * Trade-off analysis: given a change in budget and/or guest count,
 * recompute category allocations with guest scaling, floor/ceiling
 * clamping, staged trimming, and largest-remainder rounding.
 *
 * Pure function, no side effects.
 */

/* ── Types ──────────────────────────────────────────────────── */

export interface RebalanceCategory {
  id: string;
  label: string;
  /** Current allocated amount */
  amountInr: number;
  weight: number;
  minPct: number;
  maxPct: number;
  elasticity: number;
  maxCut: number;
  locked: boolean;
  protected: boolean;
}

export interface RebalanceInput {
  categories: RebalanceCategory[];
  oldBudget: number;
  newBudget: number;
  oldGuests: number;
  newGuests: number;
}

export type ReasonCode =
  | 'no_change'
  | 'surplus_increase'
  | 'guest_scaled_up'
  | 'guest_scaled_down'
  | 'trimmed_unprotected'
  | 'trimmed_protected'
  | 'at_floor'
  | 'locked';

export interface RebalancedCategory {
  id: string;
  label: string;
  before: number;
  need: number;
  floor: number;
  after: number;
  change: number;
  perHead: number;
  reason: ReasonCode;
}

export type RebalanceOutcome = 'no_change' | 'surplus' | 'fits_after_trims' | 'shortfall';

export interface Lever {
  type: 'reduce_guests' | 'raise_budget' | 'drop_optional';
  closesPercent: number;
  description: string;
}

export interface RebalanceResult {
  outcome: RebalanceOutcome;
  categories: RebalancedCategory[];
  totalBefore: number;
  totalAfter: number;
  shortfallInr: number;
  comfortableGuests: number;
  hardCeiling: number;
  levers: Lever[];
}

/* ── Helpers ─────────────────────────────────────────────────── */

function roundToHundred(n: number): number {
  return Math.round(n / 100) * 100;
}

/**
 * Largest-remainder rounding to ₹100.
 * Ensures amounts sum to exactly `target`.
 */
function largestRemainderRound(
  amounts: Map<string, number>,
  target: number,
  ids: string[]
): Map<string, number> {
  const entries = ids
    .filter(id => amounts.has(id))
    .map(id => {
      const val = amounts.get(id)!;
      const floored = Math.floor(val / 100) * 100;
      return { id, floored, remainder: val - floored };
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

/* ── Core Engine ─────────────────────────────────────────────── */

export function rebalance(input: RebalanceInput): RebalanceResult {
  const { categories, newBudget, oldGuests, newGuests } = input;
  const B1 = newBudget;
  const guestRatio = oldGuests > 0 ? newGuests / oldGuests : 1;

  // Step 1: Guest scaling — compute "need" for each category
  const needs = new Map<string, number>();
  let totalNeed = 0;

  for (const cat of categories) {
    if (cat.locked) {
      needs.set(cat.id, cat.amountInr);
      totalNeed += cat.amountInr;
    } else {
      const need = cat.amountInr * (1 + cat.elasticity * (guestRatio - 1));
      needs.set(cat.id, need);
      totalNeed += need;
    }
  }

  // Step 2: Floors
  const floors = new Map<string, number>();
  for (const cat of categories) {
    if (cat.locked) {
      floors.set(cat.id, cat.amountInr);
      continue;
    }
    const need = needs.get(cat.id)!;
    const minBound = (cat.minPct / 100) * B1;
    const effectiveMaxCut = (cat.protected || cat.id === 'contingency')
      ? cat.maxCut / 2
      : cat.maxCut;
    const cutFloor = need * (1 - effectiveMaxCut);
    const floor = Math.min(need, Math.max(minBound, cutFloor));
    floors.set(cat.id, floor);
  }

  // Determine outcome
  const allIds = categories.map(c => c.id);

  let result: Map<string, number>;
  let outcome: RebalanceOutcome;
  let shortfall = 0;

  if (totalNeed <= B1) {
    // Surplus case: distribute B1 using weighted water-filling
    // Lower bounds = need, upper bounds = max(need, maxPct * B1)
    outcome = 'surplus';
    result = distributeSurplus(categories, needs, B1);
  } else {
    // Shortfall case: need trimming
    const deficit = totalNeed - B1;

    // Compute reducible amounts
    const unprotectedIds = categories
      .filter(c => !c.locked && !c.protected && c.id !== 'contingency')
      .map(c => c.id);
    const protectedIds = categories
      .filter(c => !c.locked && (c.protected || c.id === 'contingency'))
      .map(c => c.id);

    // Start from needs
    const allocations = new Map<string, number>(needs);

    // Stage 1: Trim unprotected
    const unprotectedReducible = unprotectedIds.reduce((s, id) => {
      return s + Math.max(0, (allocations.get(id)! - floors.get(id)!));
    }, 0);

    const stage1Cut = Math.min(deficit, unprotectedReducible);
    if (stage1Cut > 0 && unprotectedReducible > 0) {
      for (const id of unprotectedIds) {
        const alloc = allocations.get(id)!;
        const floor = floors.get(id)!;
        const reducible = Math.max(0, alloc - floor);
        const cut = (reducible / unprotectedReducible) * stage1Cut;
        allocations.set(id, alloc - cut);
      }
    }

    let remainingDeficit = deficit - stage1Cut;

    // Stage 2: Trim protected + contingency
    if (remainingDeficit > 0) {
      const protectedReducible = protectedIds.reduce((s, id) => {
        return s + Math.max(0, (allocations.get(id)! - floors.get(id)!));
      }, 0);

      const stage2Cut = Math.min(remainingDeficit, protectedReducible);
      if (stage2Cut > 0 && protectedReducible > 0) {
        for (const id of protectedIds) {
          const alloc = allocations.get(id)!;
          const floor = floors.get(id)!;
          const reducible = Math.max(0, alloc - floor);
          const cut = (reducible / protectedReducible) * stage2Cut;
          allocations.set(id, alloc - cut);
        }
      }
      remainingDeficit -= stage2Cut;
    }

    if (remainingDeficit > 1) {
      // Infeasible: keep everything at floor
      outcome = 'shortfall';
      shortfall = remainingDeficit;
      result = new Map(floors);
    } else {
      outcome = 'fits_after_trims';
      result = allocations;
    }
  }

  // Round with largest-remainder
  const rounded = largestRemainderRound(result, B1, allIds);

  // Build result categories with reason codes
  const resultCategories: RebalancedCategory[] = categories.map(cat => {
    const before = cat.amountInr;
    const need = needs.get(cat.id)!;
    const floor = floors.get(cat.id)!;
    const after = rounded.get(cat.id) ?? roundToHundred(result.get(cat.id) ?? 0);
    const change = after - before;
    const perHead = newGuests > 0 ? Math.round(after / newGuests) : 0;

    let reason: ReasonCode;
    if (cat.locked) {
      reason = 'locked';
    } else if (change === 0) {
      reason = 'no_change';
    } else if (outcome === 'surplus') {
      reason = 'surplus_increase';
    } else if (after <= roundToHundred(floor) + 100) {
      reason = 'at_floor';
    } else if (cat.protected || cat.id === 'contingency') {
      reason = change < 0 ? 'trimmed_protected' : 'guest_scaled_up';
    } else {
      reason = change < 0 ? 'trimmed_unprotected' : 'guest_scaled_up';
    }

    return {
      id: cat.id,
      label: cat.label,
      before,
      need: roundToHundred(need),
      floor: roundToHundred(floor),
      after,
      change,
      perHead,
      reason,
    };
  });

  // Compute guest limits
  const comfortableGuests = findGuestLimit(categories, newBudget, oldGuests, false);
  const hardCeiling = findGuestLimit(categories, newBudget, oldGuests, true);

  // Compute levers if infeasible
  const levers: Lever[] = [];
  if (outcome === 'shortfall' && shortfall > 0) {
    const roundedShortfall = Math.ceil(shortfall / 100) * 100;

    // Lever: reduce guests
    levers.push({
      type: 'reduce_guests',
      closesPercent: 100,
      description: `Reduce guests to at most ${hardCeiling} (hard ceiling with every category at its minimum)`,
    });

    // Lever: raise budget
    const raiseTo = B1 + roundedShortfall;
    levers.push({
      type: 'raise_budget',
      closesPercent: 100,
      description: `Raise the budget by about Rs ${roundedShortfall} (to Rs ${raiseTo})`,
    });

    // Lever: drop optional (maxCut >= 0.8)
    const optionalCats = categories
      .filter(c => !c.locked && c.maxCut >= 0.8)
      .sort((a, b) => {
        const aFloor = floors.get(a.id)!;
        const bFloor = floors.get(b.id)!;
        return aFloor - bFloor;
      });

    if (optionalCats.length > 0) {
      let freed = 0;
      const dropped: string[] = [];
      for (const cat of optionalCats) {
        freed += floors.get(cat.id)!;
        dropped.push(cat.label.toLowerCase());
      }
      const closesPercent = Math.round((freed / shortfall) * 100);
      levers.push({
        type: 'drop_optional',
        closesPercent: Math.min(closesPercent, 100),
        description: `Drop ${dropped.join(', ')} (frees about Rs ${roundToHundred(freed)})`,
      });
    }

    // Sort: 100% closers first, then by disruption order
    levers.sort((a, b) => {
      if (a.closesPercent >= 100 && b.closesPercent < 100) return -1;
      if (a.closesPercent < 100 && b.closesPercent >= 100) return 1;
      const order: Record<string, number> = { drop_optional: 0, reduce_guests: 1, raise_budget: 2 };
      return (order[a.type] ?? 99) - (order[b.type] ?? 99);
    });
  }

  return {
    outcome,
    categories: resultCategories,
    totalBefore: categories.reduce((s, c) => s + c.amountInr, 0),
    totalAfter: B1,
    shortfallInr: roundToHundred(shortfall),
    comfortableGuests,
    hardCeiling,
    levers,
  };
}

/* ── Surplus distribution ──────────────────────────────────── */

function distributeSurplus(
  categories: RebalanceCategory[],
  needs: Map<string, number>,
  B1: number
): Map<string, number> {
  const result = new Map<string, number>();
  let free = categories.filter(c => !c.locked);
  const locked = categories.filter(c => c.locked);

  // Start from locked amounts
  let pool = B1;
  for (const c of locked) {
    result.set(c.id, c.amountInr);
    pool -= c.amountInr;
  }

  // Iterative water-filling: lower bound = need, upper bound = max(need, maxPct * B1)
  for (let iter = 0; iter < 20 && free.length > 0; iter++) {
    const totalWeight = free.reduce((s, c) => s + c.weight, 0);
    if (totalWeight === 0) break;

    let anyViolation = false;

    for (const c of free) {
      const need = needs.get(c.id)!;
      const proposed = (pool * c.weight) / totalWeight;
      const lower = need;
      const upper = Math.max(need, (c.maxPct / 100) * B1);

      if (proposed < lower) {
        result.set(c.id, lower);
        pool -= lower;
        free = free.filter(f => f.id !== c.id);
        anyViolation = true;
        break;
      }
      if (proposed > upper) {
        result.set(c.id, upper);
        pool -= upper;
        free = free.filter(f => f.id !== c.id);
        anyViolation = true;
        break;
      }
    }

    if (!anyViolation) {
      for (const c of free) {
        result.set(c.id, (pool * c.weight) / totalWeight);
      }
      break;
    }
  }

  return result;
}

/* ── Guest limit finder (bisection) ──────────────────────── */

function findGuestLimit(
  categories: RebalanceCategory[],
  budget: number,
  oldGuests: number,
  useFloors: boolean
): number {
  let lo = 1;
  let hi = 5000;

  for (let iter = 0; iter < 30 && lo < hi; iter++) {
    const mid = Math.ceil((lo + hi) / 2);
    const fits = guestsFit(categories, budget, oldGuests, mid, useFloors);
    if (fits) {
      lo = mid;
    } else {
      hi = mid - 1;
    }
  }

  return lo;
}

function guestsFit(
  categories: RebalanceCategory[],
  budget: number,
  oldGuests: number,
  testGuests: number,
  useFloors: boolean
): boolean {
  const guestRatio = oldGuests > 0 ? testGuests / oldGuests : 1;

  let totalNeeded = 0;
  for (const cat of categories) {
    if (cat.locked) {
      totalNeeded += cat.amountInr;
      continue;
    }
    const need = cat.amountInr * (1 + cat.elasticity * (guestRatio - 1));

    if (useFloors) {
      // Use floors: every category at minimum
      const effectiveMaxCut = (cat.protected || cat.id === 'contingency')
        ? cat.maxCut / 2
        : cat.maxCut;
      const minBound = (cat.minPct / 100) * budget;
      const cutFloor = need * (1 - effectiveMaxCut);
      const floor = Math.min(need, Math.max(minBound, cutFloor));
      totalNeeded += floor;
    } else {
      // Comfortable: only trim unprotected
      if (cat.protected || cat.id === 'contingency') {
        totalNeeded += need;
      } else {
        const effectiveMaxCut = cat.maxCut;
        const minBound = (cat.minPct / 100) * budget;
        const cutFloor = need * (1 - effectiveMaxCut);
        const floor = Math.min(need, Math.max(minBound, cutFloor));
        totalNeeded += floor;
      }
    }
  }

  return totalNeeded <= budget;
}
