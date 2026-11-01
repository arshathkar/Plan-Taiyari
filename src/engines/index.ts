/**
 * Engines barrel export (§10.3)
 */
export { parseInr, formatInr, formatInrCompact, formatPct } from './inr';
export { todayIst, daysBetween, addDays, formatDateDisplay, isValidFutureDate, daysFromNow, formatRelativeDays } from './dates';
export { allocateBudget } from './budget-allocator';
export type { CategoryInput, Lock, AllocationResult, AllocationItem } from './budget-allocator';
export { computeTimeline } from './timeline';
export type { TaskInput, ComputedTask, TimelineResult } from './timeline';
export { compareQuotes } from './vendor-compare';
export type { RequirementInput, QuoteInput, QuoteComparison, ComparisonResult } from './vendor-compare';
export { isReadyToPlan, missingFields, nextQuestion, nextQuestionLabel, answeredCount } from './intake-gate';
export { buildIcs } from './ics';
export { rebalance } from './rebalance';
export type { RebalanceCategory, RebalanceInput, RebalanceResult, RebalancedCategory, RebalanceOutcome, ReasonCode, Lever } from './rebalance';
export { computeRippleEffects } from './ripple';
export type { RippleEffect } from './ripple';
