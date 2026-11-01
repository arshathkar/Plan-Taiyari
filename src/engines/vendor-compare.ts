/**
 * Vendor Comparison Engine (§7.4)
 * Compares vendor quotes on coverage, cost, and terms.
 */

export interface RequirementInput {
  id: string;
  label: string;
  weight: 1 | 2 | 3;
  must: boolean;
}

export interface QuoteInput {
  id: string;
  vendorName: string;
  totalInr: number;
  coverage: Record<string, 'covered' | 'partial' | 'notCovered' | 'unknown'>;
  extras: Array<{ label: string; amountInr: number | null }>;
  advancePct: number | null;
  cancellation: string | null;
  validUntil: string | null;
}

export interface QuoteComparison {
  quoteId: string;
  vendorName: string;
  coveragePct: number;
  mustHaveGaps: string[];
  knownExtras: number;
  unknownExtrasCount: number;
  allInKnown: number;
  perGuest: number;
  vsBudget: number;
  termsCompleteness: number;
  costScore: number;
  fitScore: number;
  openQuestions: string[];
}

export interface ComparisonResult {
  comparisons: QuoteComparison[];
  rankingHolds: boolean;
  sensitivityNote: string;
}

/**
 * Compare quotes for a vendor category.
 */
export function compareQuotes(
  requirements: RequirementInput[],
  quotes: QuoteInput[],
  guests: number,
  categoryBudget: number,
  fitWeights: [number, number, number] = [0.6, 0.3, 0.1]
): ComparisonResult {
  if (quotes.length < 2) {
    return { comparisons: [], rankingHolds: true, sensitivityNote: '' };
  }

  const totalWeight = requirements.reduce((s, r) => s + r.weight, 0);
  const minAllIn = Math.min(...quotes.map(q => computeAllIn(q)));

  const comparisons: QuoteComparison[] = quotes.map(quote => {
    // Coverage %
    let coverageSum = 0;
    const mustHaveGaps: string[] = [];
    const openQuestions: string[] = [];

    for (const req of requirements) {
      const v = quote.coverage[req.id] ?? 'unknown';
      const score = v === 'covered' ? 1 : v === 'partial' ? 0.5 : 0;
      coverageSum += req.weight * score;

      if (req.must && v !== 'covered') {
        mustHaveGaps.push(req.label);
      }
      if (v === 'unknown') {
        openQuestions.push(`Ask about: ${req.label}`);
      }
    }
    const coveragePct = totalWeight > 0 ? (coverageSum / totalWeight) * 100 : 0;

    // Extras
    let knownExtras = 0;
    let unknownExtrasCount = 0;
    for (const extra of quote.extras) {
      if (extra.amountInr !== null) {
        knownExtras += extra.amountInr;
      } else {
        unknownExtrasCount++;
        openQuestions.push(`Ask about charge: ${extra.label}`);
      }
    }

    // All-in cost
    const allInKnown = quote.totalInr + knownExtras;
    const perGuest = guests > 0 ? Math.round(allInKnown / guests) : 0;
    const vsBudget = allInKnown - categoryBudget;

    // Terms completeness
    const termsFields = [quote.advancePct !== null, quote.cancellation !== null, quote.validUntil !== null];
    const termsCompleteness = termsFields.filter(Boolean).length / 3;

    if (quote.advancePct === null) openQuestions.push('Ask about advance payment terms');
    if (quote.cancellation === null) openQuestions.push('Ask about cancellation policy');
    if (quote.validUntil === null) openQuestions.push('Ask about quote validity');

    // Cost score
    const costScore = minAllIn > 0 ? minAllIn / allInKnown : 1;

    // Fit score
    const fitScore = 100 * (
      fitWeights[0] * (coveragePct / 100) +
      fitWeights[1] * costScore +
      fitWeights[2] * termsCompleteness
    );

    return {
      quoteId: quote.id,
      vendorName: quote.vendorName,
      coveragePct: Math.round(coveragePct * 10) / 10,
      mustHaveGaps,
      knownExtras,
      unknownExtrasCount,
      allInKnown,
      perGuest,
      vsBudget,
      termsCompleteness: Math.round(termsCompleteness * 100) / 100,
      costScore: Math.round(costScore * 1000) / 1000,
      fitScore: Math.round(fitScore * 10) / 10,
      openQuestions,
    };
  });

  // Sort by fit score descending
  comparisons.sort((a, b) => b.fitScore - a.fitScore);

  // Sensitivity analysis
  const altWeights: [number, number, number][] = [
    [0.8, 0.1, 0.1], // coverage-heavy
    [0.4, 0.5, 0.1], // cost-heavy
    fitWeights,       // default
  ];

  const rankingHolds = checkSensitivity(comparisons, quotes, requirements, guests, altWeights);
  const sensitivityNote = rankingHolds
    ? 'Ranking holds under other weightings'
    : 'Ranking changes under different weightings — check which factors matter most to you';

  return { comparisons, rankingHolds, sensitivityNote };
}

function computeAllIn(quote: QuoteInput): number {
  const knownExtras = quote.extras.reduce((s, e) => s + (e.amountInr ?? 0), 0);
  return quote.totalInr + knownExtras;
}

function checkSensitivity(
  baseRanking: QuoteComparison[],
  quotes: QuoteInput[],
  requirements: RequirementInput[],
  guests: number,
  altWeights: [number, number, number][]
): boolean {
  const baseOrder = baseRanking.map(c => c.quoteId);

  for (const weights of altWeights) {
    const result = compareQuotes(requirements, quotes, guests, 0, weights);
    const order = result.comparisons.map(c => c.quoteId);
    if (order.join(',') !== baseOrder.join(',')) {
      return false;
    }
  }
  return true;
}
